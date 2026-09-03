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

  it("lets the keeper edit any hunter regardless of playerEmail", () => {
    authAs("keeper", "keeper@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmail: "someone-else@example.com" })} onUpdate={vi.fn()} />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit player notes")).toBeInTheDocument();
  });

  it("lets a player edit their own assigned hunter", () => {
    authAs("player", "steve@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmail: "steve@example.com" })} onUpdate={vi.fn()} />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit player notes")).toBeInTheDocument();
  });

  it("matches the assigned email case-insensitively", () => {
    authAs("player", "Steve@Example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmail: "steve@example.com" })} onUpdate={vi.fn()} />
    );
    expect(screen.getByTitle("Edit hunter")).toBeInTheDocument();
  });

  it("blocks a player from editing a hunter assigned to someone else", () => {
    authAs("player", "steve@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmail: "other@example.com" })} onUpdate={vi.fn()} />
    );
    expect(screen.queryByTitle("Edit hunter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("image-upload")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Edit player notes")).not.toBeInTheDocument();
  });

  it("blocks a player from editing an unassigned hunter", () => {
    authAs("player", "steve@example.com");
    render(<HunterCard hunter={makeHunter({ playerEmail: "" })} onUpdate={vi.fn()} />);
    expect(screen.queryByTitle("Edit hunter")).not.toBeInTheDocument();
    expect(screen.queryByTestId("image-upload")).not.toBeInTheDocument();
  });

  it("disables trackers for a player on a hunter that isn't theirs", () => {
    authAs("player", "steve@example.com");
    render(
      <HunterCard hunter={makeHunter({ playerEmail: "other@example.com", luck: 2 })} onUpdate={vi.fn()} />
    );
    const luckButtons = screen.getAllByRole("button").filter((b) => b.hasAttribute("disabled"));
    expect(luckButtons.length).toBeGreaterThan(0);
  });
});
