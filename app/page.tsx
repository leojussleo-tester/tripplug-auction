import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Welcome to Tripplug Auction</h2>
      <p className="text-slate-300">
        Browse live auctions powered by Prisma, PostgreSQL, and Tailwind CSS.
      </p>
      <Link
        href="/auctions"
        className="inline-flex rounded-md border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800"
      >
        Go to Auctions
      </Link>
    </section>
  );
}
