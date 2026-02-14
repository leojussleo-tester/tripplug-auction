import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seller = await prisma.user.upsert({
    where: { email: "demo-seller@tripplug.dev" },
    update: { name: "Demo Seller" },
    create: {
      email: "demo-seller@tripplug.dev",
      name: "Demo Seller",
    },
  });

  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();

  await prisma.auction.createMany({
    data: [
      {
        title: "MacBook Pro 14\" M3",
        description: "Lightly used, 16GB RAM, 512GB SSD.",
        startingBid: 1200,
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        sellerId: seller.id,
      },
      {
        title: "Sony A7 IV Mirrorless Camera",
        description: "Body only, includes two batteries and charger.",
        startingBid: 1800,
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 36),
        sellerId: seller.id,
      },
      {
        title: "Herman Miller Aeron Chair",
        description: "Size B, excellent condition, graphite finish.",
        startingBid: 650,
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
        sellerId: seller.id,
      },
    ],
  });

  console.log("Seed complete: 3 demo auctions created.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
