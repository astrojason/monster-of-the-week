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

  it("offers only granted players as checkboxes", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());
    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    expect(within(group).getByLabelText("steve@example.com")).toBeInTheDocument();
    expect(within(group).getByLabelText("amy@example.com")).toBeInTheDocument();
    expect(within(group).queryByLabelText("keeper@example.com")).not.toBeInTheDocument();
  });

  it("creates the hunter with every checked playerEmail", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/^name/i), "New Hunter");
    await userEvent.type(screen.getByLabelText(/played by \*/i), "Steve & Amy");
    await userEvent.click(screen.getByLabelText("steve@example.com"));
    await userEvent.click(screen.getByLabelText("amy@example.com"));
    await userEvent.click(screen.getByRole("button", { name: /create hunter/i }));

    await waitFor(() => expect(addDocMock).toHaveBeenCalled());
    expect(addDocMock).toHaveBeenCalledWith(
      "hunters",
      expect.objectContaining({ playerEmails: ["steve@example.com", "amy@example.com"] })
    );
  });
});
