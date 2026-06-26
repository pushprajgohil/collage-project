"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCollection } from "@/context/CollectionContext";

export default function Header() {
  const pathname = usePathname();
  const { collection } = useCollection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "TELEMETRY", href: "/" },
    { name: "BRANDS", href: "/brands" },
    { name: "TIMELINE", href: "/timeline" },
    { name: "ATELIER", href: "/atelier" },
    { name: "COLLECTION", href: "/collection", badge: collection.length },
  ];

  return (
    <header className="bg-black text-primary border-b border-primary/20 shadow-[0_4px_20px_rgba(227,24,55,0.15)] sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 md:px-16 py-4 max-w-[1440px] mx-auto">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="font-anybody text-2xl md:text-3xl font-black italic text-primary tracking-tighter drop-shadow-[0_0_8px_rgba(227,24,55,0.8)] hover:text-white transition-colors duration-300"
        >
          HYPERDRIVE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center font-jetbrains-mono text-sm uppercase tracking-widest">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all hover:text-primary hover:drop-shadow-[0_0_8px_rgba(227,24,55,0.8)] relative py-1 ${
                  isActive 
                    ? "text-primary font-bold border-b-2 border-primary" 
                    : "text-secondary hover:scale-105"
                }`}
              >
                {link.name}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-2 bg-primary-container text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          <button className="text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_rgba(227,24,55,0.8)] transition-all active:scale-95 hidden md:block">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="text-secondary hover:text-primary hover:drop-shadow-[0_0_8px_rgba(227,24,55,0.8)] transition-all active:scale-95">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary focus:outline-none"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-primary/20 backdrop-blur-md px-6 py-6 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-jetbrains-mono text-sm uppercase tracking-widest py-2 border-b border-outline-variant/30 flex justify-between items-center ${
                  isActive ? "text-primary font-bold" : "text-secondary"
                }`}
              >
                <span>{link.name}</span>
                {link.badge !== undefined && link.badge > 0 ? (
                  <span className="bg-primary-container text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
