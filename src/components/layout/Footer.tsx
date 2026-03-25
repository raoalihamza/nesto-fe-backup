"use client";

import { Link } from "@/i18n/routing";

export function Footer() {
  return (
    <footer className="border-t bg-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand">
              <span className="text-xs font-bold text-white">N</span>
            </div>
            <span className="text-lg font-bold text-brand">Nesto</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nesto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
