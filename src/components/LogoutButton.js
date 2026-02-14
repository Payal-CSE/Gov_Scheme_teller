"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({
  variant = "default",
  className = "",
  redirectTo = "/sign-in",
}) {
  async function handleLogout() {
    await signOut({ callbackUrl: redirectTo });
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer ${className}`}
        title="Sign Out"
        aria-label="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer ${className}`}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    );
  }

  if (variant === "destructive") {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer ${className}`}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer ${className}`}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
