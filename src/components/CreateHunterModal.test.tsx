import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateHunterModal } from "./CreateHunterModal";

const addDocMock = vi.fn();
const getDocsMock = vi.fn();

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, ...segments) => segments.join("/")),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
  orderBy: vi.fn(),
  query: vi.fn((...args: unknown[]) => args),
}));

function grantsSnap(rows: { email: string; role: string }[]) {
  return { docs: rows.map((r) => ({ data: () => r })) };
}

describe("CreateHunterModal account assignment", () => {
  beforeEach(() => {
    addDocMock.mockReset();
    getDocsMock.mockReset();
    addDocMock.mockResolvedValue({ id: "new-hunter" });
    getDocsMock.mockResolvedValue(
      grantsSnap([
        { email: "steve@example.com", role: "player" },
        { email: "amy@example.com", role: "player" },
        { email: "keeper@example.com", role: "keeper" },
      ])
    );
  });

  it("offers granted players as quick-add suggestions but not the keeper", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());
    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    expect(within(group).getByRole("button", { name: "steve@example.com" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "amy@example.com" })).toBeInTheDocument();
    expect(within(group).queryByRole("button", { name: "keeper@example.com" })).not.toBeInTheDocument();
  });

  it("lets you type an email that hasn't been granted access yet", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    await userEvent.type(within(group).getByLabelText(/add player email/i), "new-player@example.com");
    await userEvent.click(within(group).getByRole("button", { name: /^add$/i }));

    expect(within(group).getByText("new-player@example.com")).toBeInTheDocument();
  });

  it("creates the hunter with a typed email plus a quick-added one", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/^name/i), "New Hunter");
    await userEvent.type(screen.getByLabelText(/played by \*/i), "Steve & Amy");

    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    await userEvent.type(within(group).getByLabelText(/add player email/i), "New-Player@Example.com");
    await userEvent.click(within(group).getByRole("button", { name: /^add$/i }));
    await userEvent.click(within(group).getByRole("button", { name: "steve@example.com" }));

    await userEvent.click(screen.getByRole("button", { name: /create hunter/i }));

    await waitFor(() => expect(addDocMock).toHaveBeenCalled());
    expect(addDocMock).toHaveBeenCalledWith(
      "hunters",
      expect.objectContaining({
        playerEmails: ["new-player@example.com", "steve@example.com"],
      })
    );
  });

  it("lets you remove an assigned email", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    await userEvent.click(within(group).getByRole("button", { name: "steve@example.com" }));
    expect(
      within(group).getByRole("button", { name: /remove steve@example.com/i })
    ).toBeInTheDocument();

    await userEvent.click(within(group).getByRole("button", { name: /remove steve@example.com/i }));
    expect(
      within(group).queryByRole("button", { name: /remove steve@example.com/i })
    ).not.toBeInTheDocument();
    // removing it makes it available again as a quick-add suggestion
    expect(within(group).getByRole("button", { name: "steve@example.com" })).toBeInTheDocument();
  });
});
