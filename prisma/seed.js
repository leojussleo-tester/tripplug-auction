const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.auction.createMany({
    data: [
      {
        title: 'Vintage Camera Collection',
        description: 'Set of three restored film cameras from the 1970s.',
        startingPrice: 250,
        currentPrice: 250,
        bidIncrement: 25,
        startAt: new Date('2026-03-01T09:00:00.000Z'),
        endAt: new Date('2026-03-05T09:00:00.000Z'),
        status: 'UPCOMING'
      },
      {
        title: 'Gaming Laptop Pro 17',
        description: 'High-performance laptop with RTX graphics and 32GB RAM.',
        startingPrice: 1200,
        currentPrice: 1350,
        bidIncrement: 50,
        startAt: new Date('2026-02-10T12:00:00.000Z'),
        endAt: new Date('2026-02-20T12:00:00.000Z'),
        status: 'LIVE'
      },
      {
        title: 'Signed Football Jersey',
        description: 'Official jersey signed by a championship-winning team.',
        startingPrice: 500,
        currentPrice: 820,
        bidIncrement: 20,
        startAt: new Date('2026-01-01T10:00:00.000Z'),
        endAt: new Date('2026-01-10T10:00:00.000Z'),
        status: 'ENDED'
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
