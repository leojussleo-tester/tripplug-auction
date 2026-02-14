import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripplug Auction",
  description: "Auction demo powered by Prisma and PostgreSQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <h1 className="text-lg font-semibold">Tripplug Auction</h1>
            <Link
              href="/auctions"
              className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
            >
              View Auctions
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
