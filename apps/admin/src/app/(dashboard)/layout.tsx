import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/auth";
import { Map, List, Upload, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  async function handleLogout() {
    "use server";
    await logout();
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-teal-600 tracking-tight">
              <Map className="h-6 w-6" />
              <span>FutoNav Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
              >
                <Map className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/pois"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
              >
                <List className="h-4 w-4" />
                POIs Directory
              </Link>
              <Link
                href="/pois/import"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
              >
                <Upload className="h-4 w-4" />
                CSV Import
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <form action={handleLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
