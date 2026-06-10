import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "./Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
