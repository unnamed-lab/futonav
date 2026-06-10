"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Map, List, Upload, LogOut, Menu, X } from "lucide-react";
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
    { href: "/", label: "Dashboard", icon: Map },
    { href: "/pois", label: "POIs Directory", icon: List },
    { href: "/pois/import", label: "CSV Import", icon: Upload },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-teal-600 tracking-tight">
              <Map className="h-6 w-6" />
              <span>FutoNav Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-teal-50 text-teal-600"
                        : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none transition-colors cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2 shadow-inner">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-600"
                      : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
