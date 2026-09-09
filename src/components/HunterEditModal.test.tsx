import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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

function overridesSnap(rows: { id: string; sections: unknown }[] = []) {
  return { docs: rows.map((r) => ({ id: r.id, data: () => ({ sections: r.sections }) })) };
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
    options: [],
    playbookOptions: {},
    luck: 0,
    harm: 0,
    experience: 0,
    notes: "",
    playerNotes: "",
    keeperNotes: "",
    imageUrl: "",
    imageData: "",
    playerEmails: [],
    ...overrides,
  };
}

describe("HunterEditModal account assignment", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
    updateDocMock.mockReset();
    getDocsMock.mockReset();
    updateDocMock.mockResolvedValue(undefined);
    getDocsMock.mockImplementation((arg: unknown) => {
      if (typeof arg === "string" && arg.includes("playbookOptionOverrides")) {
        return Promise.resolve(overridesSnap());
      }
      return Promise.resolve(
        grantsSnap([
          { email: "steve@example.com", role: "player" },
          { email: "amy@example.com", role: "player" },
        ])
      );
    });
  });

  it("lets the keeper add a second co-owner to the hunter", async () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <HunterEditModal
        hunter={makeHunter({ playerEmails: ["steve@example.com"] })}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    expect(within(group).getByText("steve@example.com")).toBeInTheDocument();
    await userEvent.click(within(group).getByRole("button", { name: "amy@example.com" }));
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateDocMock).toHaveBeenCalled());
    expect(updateDocMock).toHaveBeenCalledWith(
      "hunters/h1",
      expect.objectContaining({ playerEmails: ["steve@example.com", "amy@example.com"] })
    );
  });

  it("lets the keeper type in an email that hasn't been granted yet", async () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <HunterEditModal hunter={makeHunter()} onClose={vi.fn()} onSave={vi.fn()} />
    );
    await waitFor(() => expect(getDocsMock).toHaveBeenCalled());

    const group = screen.getByRole("group", { name: /played by \(accounts\)/i });
    await userEvent.type(within(group).getByLabelText(/add player email/i), "new-player@example.com");
    await userEvent.click(within(group).getByRole("button", { name: /^add$/i }));
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateDocMock).toHaveBeenCalled());
    expect(updateDocMock).toHaveBeenCalledWith(
      "hunters/h1",
      expect.objectContaining({ playerEmails: ["new-player@example.com"] })
    );
  });

  it("saves edited freeform other-options text", async () => {
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
        hunter={makeHunter({ options: ["Homebrew perk"] })}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const optionsField = screen.getByLabelText(/other options \(comma-separated\)/i);
    await userEvent.clear(optionsField);
    await userEvent.type(optionsField, "New perk, Homebrew perk");
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateDocMock).toHaveBeenCalled());
    expect(updateDocMock).toHaveBeenCalledWith(
      "hunters/h1",
      expect.objectContaining({
        options: ["New perk", "Homebrew perk"],
      })
    );
  });

  it("expands playbook-specific fields for the hunter's playbook and saves the picks", async () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "steve@example.com" } as never,
      role: "player",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <HunterEditModal hunter={makeHunter({ playbook: "Chosen" })} onClose={vi.fn()} onSave={vi.fn()} />
    );

    await waitFor(() => expect(screen.getByText("Fate")).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByLabelText("How You Found Out"), "Trained from birth");
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateDocMock).toHaveBeenCalled());
    expect(updateDocMock).toHaveBeenCalledWith(
      "hunters/h1",
      expect.objectContaining({
        playbookOptions: expect.objectContaining({
          fate: expect.objectContaining({ "found-out": ["Trained from birth"] }),
        }),
      })
    );
  });

  it("prefills previously-saved playbook-specific picks for editing", async () => {
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
        hunter={makeHunter({
          playbook: "Chosen",
          playbookOptions: { fate: { "found-out": ["Trained from birth"] } },
        })}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    await waitFor(() => expect(screen.getByLabelText("How You Found Out")).toHaveValue("Trained from birth"));
  });

  it("does not let a player reassign the linked accounts", () => {
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
        hunter={makeHunter({ playerEmails: ["steve@example.com"] })}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(screen.queryByRole("group", { name: /played by \(accounts\)/i })).not.toBeInTheDocument();
    expect(getDocsMock.mock.calls.some((call) => Array.isArray(call[0]))).toBe(false);
  });
});
