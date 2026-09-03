import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { useAuth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("Navbar", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("renders nothing when not authorized", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      role: null,
      status: "signed-out",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    const { container } = render(<Navbar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not show an Admin link for players", () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "player@example.com" } as never,
      role: "player",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: /admin/i })).not.toBeInTheDocument();
  });

  it("shows an Admin link for the keeper", () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "keeper@example.com" } as never,
      role: "keeper",
      status: "authorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<Navbar />);
    const link = screen.getByRole("link", { name: /admin/i });
    expect(link).toHaveAttribute("href", "/admin");
  });
});
