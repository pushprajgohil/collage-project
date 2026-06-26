import React from "react";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 py-8 px-6 md:px-16 w-full z-10 relative">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand/Copyright */}
        <div className="font-jetbrains-mono text-sm font-bold text-primary">
          HYPERDRIVE
        </div>

        {/* Status indicator */}
        <div className="text-secondary-fixed-dim text-xs font-jetbrains-mono tracking-widest text-center uppercase">
          ©2026 HYPERDRIVE_GARAGE.SYS // PERFORMANCE DATA ENCRYPTED
        </div>

        {/* Links */}
        <div className="flex gap-6 font-jetbrains-mono text-xs uppercase text-secondary">
          <a href="#" className="hover:text-primary transition-colors duration-200">
            SYSTEM STATUS
          </a>
          <a href="#" className="hover:text-primary transition-colors duration-200">
            LEGAL
          </a>
          <a href="#" className="hover:text-primary transition-colors duration-200">
            API_ACCESS
          </a>
        </div>
      </div>
    </footer>
  );
}
