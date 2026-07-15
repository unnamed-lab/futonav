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
    <div className="flex min-h-screen bg-[#f8fafc] text-[#0f172a] relative overflow-hidden">
      {/* Background radial overlays for premium ambient glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/8 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-500/8 rounded-full blur-[150px] animate-pulse-slow" />
      </div>

      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 md:pl-64">
        <main className="flex-1 px-4 pt-20 pb-8 sm:px-6 lg:px-8 md:pt-10 md:pb-12 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}

