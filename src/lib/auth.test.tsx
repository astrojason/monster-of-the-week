import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { useAuth, AuthProvider } from "./auth";

function Capture({ onReady }: { onReady: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth();
  useEffect(() => {
    onReady(ctx);
  });
  return null;
}

const authStateCallback = { current: null as ((user: unknown) => void) | null };

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, cb) => {
    authStateCallback.current = cb;
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

const getDocMock = vi.fn();
const updateDocMock = vi.fn();
vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, ...segments) => segments.join("/")),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
}));

vi.mock("./firebase", () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

import { signInWithPopup, signOut } from "firebase/auth";

function Probe() {
  const { status, role, user, error } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="role">{role ?? "null"}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <span data-testid="error">{error}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    authStateCallback.current = null;
    getDocMock.mockReset();
    updateDocMock.mockReset();
    updateDocMock.mockResolvedValue(undefined);
    vi.mocked(signInWithPopup).mockReset();
    vi.mocked(signOut).mockReset();
  });

  it("starts in loading status before Firebase reports auth state", () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    expect(screen.getByTestId("status").textContent).toBe("loading");
  });

  it("is signed-out with no role when there is no Firebase user", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.(null);
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));
    expect(screen.getByTestId("role").textContent).toBe("null");
  });

  it("is authorized with the keeper role when a matching grant exists", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "keeper" }),
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "keeper@example.com" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authorized"));
    expect(screen.getByTestId("role").textContent).toBe("keeper");
    expect(screen.getByTestId("email").textContent).toBe("keeper@example.com");
  });

  it("is authorized with the player role when the grant says player", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "player" }),
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "player@example.com" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authorized"));
    expect(screen.getByTestId("role").textContent).toBe("player");
  });

  it("is unauthorized when signed in but no grant document exists", async () => {
    getDocMock.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "nobody@example.com" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("unauthorized"));
    expect(screen.getByTestId("role").textContent).toBe("null");
  });

  it("surfaces the full error message when the grant lookup fails", async () => {
    getDocMock.mockRejectedValue(new Error("firestore is down"));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "nobody@example.com" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("unauthorized"));
    expect(screen.getByTestId("error").textContent).toBe("firestore is down");
  });

  it("syncs the Firebase display name into the grant doc when it differs", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "player", name: "Old Name" }),
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "steve@example.com", displayName: "Steve Smith" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authorized"));
    expect(updateDocMock).toHaveBeenCalledWith("grants/steve@example.com", { name: "Steve Smith" });
  });

  it("does not write to the grant doc when the display name already matches", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "player", name: "Steve Smith" }),
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "steve@example.com", displayName: "Steve Smith" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authorized"));
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it("does not overwrite a keeper-assigned name even if the display name differs", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "player", name: "Custom Name", nameSetByKeeper: true }),
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "steve@example.com", displayName: "Google Name" });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authorized"));
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it("does not write to the grant doc when Firebase has no display name", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "player" }),
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "steve@example.com", displayName: null });
    });
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authorized"));
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it("surfaces an error if the name sync fails, without dropping authorized status", async () => {
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "player" }),
    });
    updateDocMock.mockRejectedValue(new Error("name sync denied"));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "steve@example.com", displayName: "Steve Smith" });
    });
    await waitFor(() => expect(screen.getByTestId("error").textContent).toBe("name sync denied"));
    expect(screen.getByTestId("status").textContent).toBe("authorized");
  });

  it("lowercases the email used for the grant lookup", async () => {
    getDocMock.mockResolvedValue({ exists: () => false, data: () => undefined });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.({ email: "Mixed.Case@Example.com" });
    });
    await waitFor(() => expect(getDocMock).toHaveBeenCalled());
    const { doc } = await import("firebase/firestore");
    expect(vi.mocked(doc)).toHaveBeenCalledWith({}, "grants", "mixed.case@example.com");
  });

  it("signIn calls signInWithPopup and surfaces errors", async () => {
    vi.mocked(signInWithPopup).mockRejectedValue(new Error("popup blocked"));
    let ctx: ReturnType<typeof useAuth> | undefined;
    render(
      <AuthProvider>
        <Capture onReady={(c) => (ctx = c)} />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.(null);
    });
    await act(async () => {
      await expect(ctx!.signIn()).rejects.toThrow("popup blocked");
    });
    expect(signInWithPopup).toHaveBeenCalled();
  });

  it("logout calls Firebase signOut", async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);
    let ctx: ReturnType<typeof useAuth> | undefined;
    render(
      <AuthProvider>
        <Capture onReady={(c) => (ctx = c)} />
      </AuthProvider>
    );
    await act(async () => {
      authStateCallback.current?.(null);
    });
    await act(async () => {
      await ctx!.logout();
    });
    expect(signOut).toHaveBeenCalled();
  });
});
