'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-cyan-500/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-blue-300 transition-all duration-300"
        >
          Deploy Hub
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8">
          <Link href="/" className="text-gray-300 hover:text-cyan-400 transition-colors">Home</Link>
          <Link href="/portfolio" className="text-gray-300 hover:text-cyan-400 transition-colors">Portfolio</Link>
          <Link href="/pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</Link>
          <Link href="/audit" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Deploy Check</Link>
          <Link href="/contact" className="text-gray-300 hover:text-cyan-400 transition-colors">Contact</Link>
        </div>

        {/* Hamburger button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-gray-300 transition-transform duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-300 transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-300 transition-transform duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cyan-500/10 bg-slate-900/95 px-4 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setOpen(false)} className="text-gray-300 hover:text-cyan-400 transition-colors py-2">Home</Link>
          <Link href="/portfolio" onClick={() => setOpen(false)} className="text-gray-300 hover:text-cyan-400 transition-colors py-2">Portfolio</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="text-gray-300 hover:text-cyan-400 transition-colors py-2">Pricing</Link>
          <Link href="/audit" onClick={() => setOpen(false)} className="text-cyan-400 hover:text-cyan-300 transition-colors py-2 font-medium">Deploy Check</Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="text-gray-300 hover:text-cyan-400 transition-colors py-2">Contact</Link>
        </div>
      )}
    </header>
  );
}
