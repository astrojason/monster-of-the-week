import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "./page";
import { useAuth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

const getDocsMock = vi.fn();
const setDocMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, ...segments) => segments.join("/")),
  doc: vi.fn((_db, ...segments) => segments.join("/")),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
  orderBy: vi.fn(),
  query: vi.fn((...args: unknown[]) => args),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

const mockedUseAuth = vi.mocked(useAuth);

function grantsSnap(rows: { id: string; role: string; name?: string }[]) {
  return {
    docs: rows.map((r) => ({
      id: r.id,
      data: () => ({ email: r.id, role: r.role, addedAt: 0, addedBy: "x", name: r.name }),
    })),
  };
}

describe("AdminPage", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
    getDocsMock.mockReset();
    setDocMock.mockReset();
    deleteDocMock.mockReset();
    getDocsMock.mockResolvedValue(grantsSnap([]));
    setDocMock.mockResolvedValue(undefined);
  });

  it("redirects non-authorized users to the login form", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      role: null,
      status: "signed-out",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<AdminPage />);
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("shows an access-denied message for players", () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "player@example.com" } as never,
      role: "player",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<AdminPage />);
    expect(screen.getByText(/keeper/i)).toBeInTheDocument();
  });

  it("lists existing grants for the keeper", async () => {
    getDocsMock.mockResolvedValue(
      grantsSnap([
        { id: "a@example.com", role: "keeper" },
        { id: "b@example.com", role: "player" },
      ])
    );
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("a@example.com")).toBeInTheDocument());
    expect(screen.getByText("b@example.com")).toBeInTheDocument();
  });

  it("shows a granted player's name instead of their email when known", async () => {
    getDocsMock.mockResolvedValue(
      grantsSnap([{ id: "a@example.com", role: "keeper", name: "Ada Keeper" }])
    );
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<AdminPage />);
    await waitFor(() => expect(screen.getByText("Ada Keeper")).toBeInTheDocument());
    expect(screen.queryByText("a@example.com")).not.toBeInTheDocument();
  });

  it("adds a grant with setDoc using the lowercased email as the doc id", async () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<AdminPage />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/email/i), "New.Player@Example.com");
    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => expect(setDocMock).toHaveBeenCalled());
    expect(setDocMock).toHaveBeenCalledWith(
      "grants/new.player@example.com",
      expect.objectContaining({
        email: "new.player@example.com",
        role: "player",
        addedBy: "keeper@example.com",
      })
    );
  });

  it("surfaces the full error message when loading grants fails", async () => {
    getDocsMock.mockRejectedValue(new Error("permission denied on grants"));
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<AdminPage />);
    await waitFor(() =>
      expect(screen.getByText("permission denied on grants")).toBeInTheDocument()
    );
  });
});
