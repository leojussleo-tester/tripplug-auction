import { prisma } from "@/lib/prisma";

export default async function AuctionsPage() {
  const auctions = await prisma.auction.findMany({
    include: {
      seller: true,
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
      },
    },
    orderBy: {
      endsAt: "asc",
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Live Auctions</h2>
        <p className="text-slate-400">
          {auctions.length} active auction{auctions.length === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {auctions.map((auction) => {
          const topBid = auction.bids[0];
          return (
            <li
              key={auction.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
            >
              <h3 className="text-xl font-semibold">{auction.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{auction.description}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Seller</dt>
                  <dd>{auction.seller.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Starting bid</dt>
                  <dd>${auction.startingBid.toString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Top bid</dt>
                  <dd>{topBid ? `$${topBid.amount.toString()}` : "No bids yet"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Ends at</dt>
                  <dd>{auction.endsAt.toLocaleString()}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
