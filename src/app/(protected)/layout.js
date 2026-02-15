import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/UserNavbar";

export default async function ProtectedLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      {children}
    </div>
  );
}
