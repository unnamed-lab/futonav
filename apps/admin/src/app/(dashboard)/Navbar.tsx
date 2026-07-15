"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Map, List, Upload, LogOut, Menu, X, Shield, ChevronRight, Compass } from "lucide-react";
import { logout } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Map, description: "System Overview" },
    { href: "/pois", label: "POIs Directory", icon: List, description: "Manage FUTO GPS catalog" },
    { href: "/pois/import", label: "CSV Import", icon: Upload, description: "Bulk survey upload" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-white/70 backdrop-blur-xl border-r border-slate-250/50 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.015)]">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/10 hover:scale-105 transition-all">
            <Compass className="h-5.5 w-5.5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">FutoNav Admin</span>
            <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase flex items-center gap-1 mt-0.5">
              <Shield className="h-2.5 w-2.5" /> Core Gateway
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col justify-between mt-8">
          <nav className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 block">
              Menu Directory
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-start gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                    isActive
                      ? "bg-teal-50/50 text-teal-700 border-teal-500/20 shadow-[0_2px_12px_rgba(20,184,166,0.03)]"
                      : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50 hover:border-slate-100"
                  }`}
                >
                  {/* Left Active Glow Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-teal-600 rounded-r-full" />
                  )}

                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 transition-colors duration-300 ${isActive ? "text-teal-600" : "text-slate-450 group-hover:text-teal-650"}`} />
                  
                  <div className="flex-1">
                    <span className="block text-sm font-bold tracking-wide leading-tight">{link.label}</span>
                    <span className="block text-[10px] font-medium text-slate-400 group-hover:text-slate-500 mt-0.5 transition-colors">
                      {link.description}
                    </span>
                  </div>
                  
                  <ChevronRight className={`h-4 w-4 shrink-0 mt-1 transition-all ${
                    isActive 
                      ? "text-teal-600 translate-x-0" 
                      : "text-slate-355 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Footer logout actions */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-650 hover:bg-red-50/50 hover:border-red-100 border border-transparent transition-all cursor-pointer group"
            >
              <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="font-bold">Logout Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-30 px-4 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">FutoNav Admin</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-55 hover:text-slate-800 focus:outline-none transition-colors cursor-pointer"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">FutoNav</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1 block">
              Menu Directory
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    isActive
                      ? "bg-teal-50/70 text-teal-600 border-teal-100"
                      : "text-slate-500 border-transparent hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                  <span className="font-bold">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-150">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-650 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            <span className="font-bold">Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
