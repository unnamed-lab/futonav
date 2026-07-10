"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Map, List, Upload, LogOut, Menu, X, Shield, ChevronRight } from "lucide-react";
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
    { href: "/", label: "Dashboard", icon: Map, description: "Overview & Telemetry" },
    { href: "/pois", label: "POIs Directory", icon: List, description: "Manage FUTO coordinates" },
    { href: "/pois/import", label: "CSV Import", icon: Upload, description: "Bulk survey sync" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/85 p-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-8 border-b border-slate-200/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-md shadow-teal-600/10">
            <Map className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 block">FutoNav Admin</span>
            <span className="text-[10px] font-bold text-teal-600 tracking-widest uppercase flex items-center gap-1 mt-0.5">
              <Shield className="h-2.5 w-2.5" /> Telemetry Control
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-2 mt-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-start gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-teal-50/70 text-teal-600 border-teal-200/60 shadow-[0_4px_12px_rgba(20,184,166,0.04)]"
                    : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200/60"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 transition-colors ${isActive ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600"}`} />
                <div className="flex-1">
                  <span className="block text-sm font-bold tracking-wide">{link.label}</span>
                  <span className="block text-[10px] font-medium text-slate-400 group-hover:text-slate-500 mt-0.5 transition-colors">
                    {link.description}
                  </span>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-all ${
                  isActive 
                    ? "text-teal-600 translate-x-0" 
                    : "text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                }`} />
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-200/65">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100/60 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500" />
            <span className="font-bold">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
            <Map className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">FutoNav Admin</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline-none transition-colors cursor-pointer"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 p-6 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
              <Map className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">FutoNav</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2 mt-6">
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
                    ? "bg-teal-50 text-teal-600 border-teal-100"
                    : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                <span className="font-bold">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-200/60">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            <span className="font-bold">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Spacing for mobile headers */}
      <div className="h-16 md:hidden w-full shrink-0" />
    </>
  );
}
