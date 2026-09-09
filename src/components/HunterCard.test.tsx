import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HunterCard } from "./HunterCard";
import { useAuth } from "@/lib/auth";
import type { Hunter } from "@/lib/types";

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock("./ImageUpload", () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}));

vi.mock("./HunterEditModal", () => ({
  HunterEditModal: () => <div data-testid="hunter-edit-modal" />,
}));

const mockedUseAuth = vi.mocked(useAuth);

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

describe("HunterCard options display", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
    mockedUseAuth.mockReturnValue({
      user: { email: "steve@example.com" } as never,
      role: "player",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("shows freeform other-options text alongside moves and gear", () => {
    render(
      <HunterCard
        hunter={makeHunter({ options: ["Homebrew perk", "Extra flavor"] })}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByText("Other Options")).toBeInTheDocument();
    expect(screen.getByText("Homebrew perk")).toBeInTheDocument();
    expect(screen.getByText("Extra flavor")).toBeInTheDocument();
  });

  it("hides the other-options section when there are none", () => {
    render(<HunterCard hunter={makeHunter({ options: [] })} onUpdate={vi.fn()} />);
    expect(screen.queryByText("Other Options")).not.toBeInTheDocument();
  });

  it("shows a readable summary of the playbook's structured picks, using the current (possibly overridden) schema", () => {
    render(
      <HunterCard
        hunter={makeHunter({
          playbook: "Chosen",
          playbookOptions: { fate: { "found-out": ["Trained from birth"] } },
        })}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByText("Character Options")).toBeInTheDocument();
    expect(screen.getByText(/Fate: How You Found Out: Trained from birth/)).toBeInTheDocument();
  });

  it("relabels a structured pick according to a keeper-supplied override schema", () => {
    render(
      <HunterCard
        hunter={makeHunter({
          playbook: "Chosen",
          playbookOptions: { fate: { "found-out": ["Trained from birth"] } },
        })}
        optionOverrides={{
          chosen: [
            {
              key: "fate",
              label: "Corrected Fate Label",
              kind: "fields",
              fields: [{ key: "found-out", label: "Corrected Field Label", kind: "text" }],
            },
          ],
        }}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByText(/Corrected Fate Label: Corrected Field Label: Trained from birth/)).toBeInTheDocument();
  });

  it("hides the character-options section when the playbook has no structured picks", () => {
    render(<HunterCard hunter={makeHunter({ playbook: "Celebrity" })} onUpdate={vi.fn()} />);
    expect(screen.queryByText("Character Options")).not.toBeInTheDocument();
  });
});

function authAs(role: "player" | "keeper", email: string) {
  mockedUseAuth.mockReturnValue({
    user: { email } as never,
    role,
    status: "authorized",
    error: "",
    signIn: vi.fn(),
    logout: vi.fn(),
  });
}

describe("HunterCard ownership permissions", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("lets the keeper edit any hunter regardless of playerEmails", () => {
    authAs("keeper", "keeper@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmails: ["someone-else@example.com"] })} onUpdate={vi.fn()} />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit player notes")).toBeInTheDocument();
  });

  it("lets a player edit a hunter they're assigned to", () => {
    authAs("player", "steve@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmails: ["steve@example.com"] })} onUpdate={vi.fn()} />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit player notes")).toBeInTheDocument();
  });

  it("lets any of several co-assigned players edit the hunter", () => {
    authAs("player", "second@example.com");
    render(
      <HunterCard
        hunter={makeHunter({ playerEmails: ["first@example.com", "second@example.com", "third@example.com"] })}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
  });

  it("matches assigned emails case-insensitively", () => {
    authAs("player", "Steve@Example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmails: ["steve@example.com"] })} onUpdate={vi.fn()} />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
  });

  it("blocks a player from editing a hunter assigned to other people only", () => {
    authAs("player", "steve@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmails: ["other@example.com"] })} onUpdate={vi.fn()} />
    );
    expect(screen.queryByTitle("Edit hunter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("image-upload")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Edit player notes")).not.toBeInTheDocument();
  });

  it("blocks a player from editing an unassigned hunter", () => {
    authAs("player", "steve@example.com");
    render(<HunterCard hunter={makeHunter({ playerEmails: [] })} onUpdate={vi.fn()} />);
    expect(screen.queryByTitle("Edit hunter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("image-upload")).not.toBeInTheDocument();
  });

  it("disables trackers for a player on a hunter that isn't theirs", () => {
    authAs("player", "steve@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmails: ["other@example.com"], luck: 2 })} onUpdate={vi.fn()} />
    );
    const luckButtons = screen.getAllByRole("button").filter((b) => b.hasAttribute("disabled"));
    expect(luckButtons.length).toBeGreaterThan(0);
  });
});
