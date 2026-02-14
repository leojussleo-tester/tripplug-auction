import { prisma } from '@/lib/prisma';

async function getAuctions() {
  return prisma.auction.findMany({
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      bids: {
        orderBy: {
          amount: 'desc'
        },
        take: 1,
        include: {
          bidder: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      endsAt: 'asc'
    }
  });
}

export default async function HomePage() {
  const auctions = await getAuctions();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-2 text-3xl font-bold">TripPlug Auctions</h1>
      <p className="mb-8 text-slate-600">Live auctions seeded with Prisma + PostgreSQL.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => {
          const topBid = auction.bids[0];
          return (
            <article key={auction.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">{auction.title}</h2>
              <p className="mb-4 min-h-16 text-sm text-slate-600">{auction.description}</p>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Start price</dt>
                  <dd>${auction.startingPrice.toString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Seller</dt>
                  <dd>{auction.seller.name ?? auction.seller.email}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Highest bid</dt>
                  <dd>
                    {topBid ? `$${topBid.amount.toString()} by ${topBid.bidder.name ?? 'Anonymous'}` : 'No bids yet'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Ends</dt>
                  <dd>{new Date(auction.endsAt).toLocaleString()}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </main>
  );
}
