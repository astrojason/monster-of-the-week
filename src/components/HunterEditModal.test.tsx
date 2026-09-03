import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HunterEditModal } from "./HunterEditModal";
import { useAuth } from "@/lib/auth";
import type { Hunter } from "@/lib/types";

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

const updateDocMock = vi.fn();
const getDocsMock = vi.fn();

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, ...segments) => segments.join("/")),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
  collection: vi.fn((_db, ...segments) => segments.join("/")),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  orderBy: vi.fn(),
  query: vi.fn((...args: unknown[]) => args),
}));

const mockedUseAuth = vi.mocked(useAuth);

function grantsSnap(rows: { email: string; role: string }[]) {
  return { docs: rows.map((r) => ({ data: () => r })) };
}

function makeHunter(overrides: Partial<Hunter> = {}): Hunter {
  return {
    id: "h1",
    name: "Alma",
    playbook: "Spooky",
    playedBy: "Steve",
    stats: { charm: 0, cool: 0, sharp: 0, tough: 0, weird: 0 },
    moves: [],
    gear: [],
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
    playerEmail: "",
    ...overrides,
  };
}

describe("HunterEditModal account assignment", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
    updateDocMock.mockReset();
    getDocsMock.mockReset();
    updateDocMock.mockResolvedValue(undefined);
    getDocsMock.mockResolvedValue(
      grantsSnap([{ email: "steve@example.com", role: "player" }])
    );
  });

  it("lets the keeper reassign the linked account", async () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<HunterEditModal hunter={makeHunter()} onClose={vi.fn()} onSave={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    const select = screen.getByLabelText(/played by \(account\)/i);
    await userEvent.selectOptions(select, "steve@example.com");
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateDocMock).toHaveBeenCalled());
    expect(updateDocMock).toHaveBeenCalledWith(
      "hunters/h1",
      expect.objectContaining({ playerEmail: "steve@example.com" })
    );
  });

  it("does not let a player reassign the linked account", () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "steve@example.com" } as never,
      role: "player",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <HunterEditModal
        hunter={makeHunter({ playerEmail: "steve@example.com" })}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.queryByLabelText(/played by \(account\)/i)).not.toBeInTheDocument();
    expect(getDocsMock).not.toHaveBeenCalled();
  });
});
