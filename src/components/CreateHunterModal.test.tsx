import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
        { email: "keeper@example.com", role: "keeper" },
      ])
    );
  });

  it("offers only granted players in the account dropdown", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());
    const select = screen.getByLabelText(/played by \(account\)/i);
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toContain("steve@example.com");
    expect(options).not.toContain("keeper@example.com");
  });

  it("creates the hunter with the selected playerEmail", async () => {
    render(<CreateHunterModal onClose={vi.fn()} onCreate={vi.fn()} />);
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/^name/i), "New Hunter");
    await userEvent.type(screen.getByLabelText(/played by \*/i), "Steve");
    await userEvent.selectOptions(screen.getByLabelText(/played by \(account\)/i), "steve@example.com");
    await userEvent.click(screen.getByRole("button", { name: /create hunter/i }));

    await waitFor(() => expect(addDocMock).toHaveBeenCalled());
    expect(addDocMock).toHaveBeenCalledWith(
      "hunters",
      expect.objectContaining({ playerEmail: "steve@example.com" })
    );
  });
});
