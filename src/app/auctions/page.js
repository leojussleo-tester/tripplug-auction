const { prisma } = require('../../lib/prisma');

async function AuctionsPage() {
  const auctions = await prisma.auction.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return `
    <main style="font-family: Arial, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem;">
      <h1>Auctions</h1>
      <ul style="padding: 0; list-style: none; display: grid; gap: 1rem;">
        ${auctions
          .map(
            (auction) => `
              <li style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem;">
                <h2 style="margin-top: 0;">${auction.title}</h2>
                <p>${auction.description}</p>
                <p><strong>Status:</strong> ${auction.status}</p>
                <p><strong>Current price:</strong> $${auction.currentPrice}</p>
              </li>
            `
          )
          .join('')}
      </ul>
    </main>
  `;
}

module.exports = AuctionsPage;
