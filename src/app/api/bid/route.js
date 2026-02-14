const { Prisma } = require('@prisma/client');
const { NextResponse } = require('next/server');

const { prisma } = require('../../../lib/prisma');

const MAX_RETRIES = 3;

class BidConflictError extends Error {}

function parseRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body.' };
  }

  const { auctionId, userId, amount } = body;

  if (typeof auctionId !== 'string' || auctionId.trim().length === 0) {
    return { error: 'auctionId is required.' };
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return { error: 'userId is required.' };
  }

  if (amount === undefined || amount === null || amount === '') {
    return { error: 'amount is required.' };
  }

  let bidAmount;

  try {
    bidAmount = new Prisma.Decimal(amount);
  } catch {
    return { error: 'amount must be a valid decimal.' };
  }

  if (bidAmount.lte(0)) {
    return { error: 'amount must be greater than 0.' };
  }

  return {
    value: {
      auctionId: auctionId.trim(),
      userId: userId.trim(),
      amount: bidAmount
    }
  };
}

function validateBidWindow(auction, now) {
  if (auction.status !== 'LIVE') {
    return 'Auction is not live.';
  }

  if (now < auction.startAt || now > auction.endAt) {
    return 'Auction is not accepting bids at this time.';
  }

  return null;
}

async function placeBid({ auctionId, userId, amount }) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const updatedAuction = await prisma.$transaction(
        async (tx) => {
          const auction = await tx.auction.findUnique({
            where: { id: auctionId },
            select: {
              id: true,
              status: true,
              startAt: true,
              endAt: true,
              currentPrice: true,
              bidIncrement: true,
              title: true,
              description: true,
              startingPrice: true,
              createdAt: true
            }
          });

          if (!auction) {
            return { status: 404, body: { error: 'Auction not found.' } };
          }

          const now = new Date();
          const bidWindowError = validateBidWindow(auction, now);
          if (bidWindowError) {
            return { status: 400, body: { error: bidWindowError } };
          }

          const minimumBid = auction.currentPrice.plus(auction.bidIncrement);
          if (amount.lt(minimumBid)) {
            return {
              status: 400,
              body: {
                error: `Bid must be at least ${minimumBid.toFixed(2)}.`
              }
            };
          }

          const updateResult = await tx.auction.updateMany({
            where: {
              id: auction.id,
              currentPrice: auction.currentPrice
            },
            data: {
              currentPrice: amount
            }
          });

          if (updateResult.count !== 1) {
            throw new BidConflictError('Auction price changed while placing bid.');
          }

          await tx.bid.create({
            data: {
              auctionId: auction.id,
              userId,
              amount
            }
          });

          const refreshedAuction = await tx.auction.findUnique({
            where: { id: auction.id }
          });

          return { status: 200, body: refreshedAuction };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      );

      return updatedAuction;
    } catch (error) {
      if (error instanceof BidConflictError && attempt < MAX_RETRIES) {
        continue;
      }

      if (error.code === 'P2034' && attempt < MAX_RETRIES) {
        continue;
      }

      if (error.code === 'P2003') {
        return { status: 400, body: { error: 'Invalid userId.' } };
      }

      throw error;
    }
  }

  return {
    status: 409,
    body: { error: 'Could not place bid due to concurrent updates. Please retry.' }
  };
}

async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = parseRequestBody(body);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await placeBid(parsed.value);
  return NextResponse.json(result.body, { status: result.status });
}

module.exports = { POST };
