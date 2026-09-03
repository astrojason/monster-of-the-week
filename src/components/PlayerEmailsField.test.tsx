import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerEmailsField } from "./PlayerEmailsField";
import type { Grant } from "@/lib/types";

function makeGrant(overrides: Partial<Grant> = {}): Grant {
  return {
    email: "steve@example.com",
    role: "player",
    addedAt: 0,
    addedBy: "keeper@example.com",
    ...overrides,
  };
}

describe("PlayerEmailsField name display", () => {
  it("shows the assigned player's name instead of their email when known", () => {
    render(
      <PlayerEmailsField
        emails={["steve@example.com"]}
        onChange={vi.fn()}
        playerGrants={[makeGrant({ email: "steve@example.com", name: "Steve Smith" })]}
      />
    );
    expect(screen.getByText("Steve Smith")).toBeInTheDocument();
    expect(screen.queryByText("steve@example.com")).not.toBeInTheDocument();
  });

  it("falls back to the email when no name is known", () => {
    render(
      <PlayerEmailsField
        emails={["amy@example.com"]}
        onChange={vi.fn()}
        playerGrants={[makeGrant({ email: "amy@example.com" })]}
      />
    );
    expect(screen.getByText("amy@example.com")).toBeInTheDocument();
  });

  it("falls back to the email for a typed-in address with no matching grant at all", () => {
    render(
      <PlayerEmailsField
        emails={["nobody-yet@example.com"]}
        onChange={vi.fn()}
        playerGrants={[]}
      />
    );
    expect(screen.getByText("nobody-yet@example.com")).toBeInTheDocument();
  });

  it("shows the name on quick-add suggestion buttons too", () => {
    render(
      <PlayerEmailsField
        emails={[]}
        onChange={vi.fn()}
        playerGrants={[makeGrant({ email: "amy@example.com", name: "Amy Lee" })]}
      />
    );
    expect(screen.getByRole("button", { name: "Amy Lee" })).toBeInTheDocument();
  });
});
