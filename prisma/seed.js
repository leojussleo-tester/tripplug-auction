const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.user.deleteMany();

  const [alice, bob, charlie] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice'
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob'
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie'
      }
    })
  ]);

  const auctions = await Promise.all([
    prisma.auction.create({
      data: {
        title: 'GoPro HERO 12 Black',
        description: 'Brand new action camera with extra battery pack.',
        startingPrice: '250.00',
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        sellerId: alice.id
      }
    }),
    prisma.auction.create({
      data: {
        title: 'MacBook Air M2 (13-inch)',
        description: 'Lightly used laptop with 16GB RAM and 512GB SSD.',
        startingPrice: '700.00',
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
        sellerId: bob.id
      }
    }),
    prisma.auction.create({
      data: {
        title: 'DJI Mini 4 Pro Drone',
        description: 'Excellent condition drone with RC 2 controller.',
        startingPrice: '600.00',
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        sellerId: charlie.id
      }
    })
  ]);

  await Promise.all([
    prisma.bid.create({
      data: {
        amount: '275.00',
        auctionId: auctions[0].id,
        bidderId: bob.id
      }
    }),
    prisma.bid.create({
      data: {
        amount: '730.00',
        auctionId: auctions[1].id,
        bidderId: charlie.id
      }
    }),
    prisma.bid.create({
      data: {
        amount: '640.00',
        auctionId: auctions[2].id,
        bidderId: alice.id
      }
    })
  ]);

  console.log('Database seeded with 3 auctions.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
