import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { useAuth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("LoginForm", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("shows a spinner while loading", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      role: null,
      status: "loading",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<LoginForm />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a Google sign-in button when signed out", async () => {
    const signIn = vi.fn();
    mockedUseAuth.mockReturnValue({
      user: null,
      role: null,
      status: "signed-out",
      error: "",
      signIn,
      logout: vi.fn(),
    });
    render(<LoginForm />);
    const button = screen.getByRole("button", { name: /sign in with google/i });
    await userEvent.click(button);
    expect(signIn).toHaveBeenCalled();
  });

  it("shows a copyable error block when sign-in fails", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      role: null,
      status: "signed-out",
      error: "auth/popup-closed-by-user: popup closed",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<LoginForm />);
    expect(screen.getByText("auth/popup-closed-by-user: popup closed")).toBeInTheDocument();
  });

  it("shows an access-pending message with the signed-in email when unauthorized", () => {
    mockedUseAuth.mockReturnValue({
      user: { email: "waiting@example.com" } as never,
      role: null,
      status: "unauthorized",
      error: "",
      signIn: vi.fn(),
      logout: vi.fn(),
    });
    render(<LoginForm />);
    expect(screen.getByText(/waiting@example.com/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("calls logout when signing out from the unauthorized screen", async () => {
    const logout = vi.fn();
    mockedUseAuth.mockReturnValue({
      user: { email: "waiting@example.com" } as never,
      role: null,
      status: "unauthorized",
      error: "",
      signIn: vi.fn(),
      logout,
    });
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(logout).toHaveBeenCalled();
  });
});
