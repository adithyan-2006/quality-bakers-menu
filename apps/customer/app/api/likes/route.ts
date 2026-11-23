import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@qbm/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing JSON payload' },
      { status: 400 },
    );
  }

  try {
    const { productId, anonymousUserId, action } = body || {};

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid productId is required' },
        { status: 400 },
      );
    }

    if (!anonymousUserId || typeof anonymousUserId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid anonymousUserId is required' },
        { status: 400 },
      );
    }

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json(
        { success: false, error: 'Action must be "like" or "unlike"' },
        { status: 400 },
      );
    }

    // Atomic transaction for data integrity and concurrency protection
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Verify product exists
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        if (action === 'like') {
          // Idempotent like creation using PostgreSQL ON CONFLICT DO NOTHING (skipDuplicates)
          await tx.productLike.createMany({
            data: [{ productId, anonymousUserId }],
            skipDuplicates: true,
          });
        } else {
          // Remove like for this device if present
          await tx.productLike.deleteMany({
            where: {
              productId,
              anonymousUserId,
            },
          });
        }

        // Read trigger-updated cached count from ProductLikeCount
        const counterRow = await tx.productLikeCount.findUnique({
          where: { productId },
          select: { count: true },
        });

        return {
          isLiked: action === 'like',
          globalLikeCount: counterRow?.count ?? 0,
        };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    return NextResponse.json({
      success: true,
      isLiked: result.isLiked,
      globalLikeCount: result.globalLikeCount,
    });
  } catch (error: unknown) {
    console.error('[API /api/likes POST Error]:', error);
    const message = error instanceof Error ? error.message : '';
    if (message === 'Product not found') {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const productIdsParam = searchParams.get('productIds');
    const anonymousUserId = searchParams.get('userId') || searchParams.get('anonymousUserId');

    // Single product query
    if (productId) {
      const [counterRow, isLikedRows] = await Promise.all([
        prisma.productLikeCount.findUnique({
          where: { productId },
          select: { count: true },
        }),
        anonymousUserId
          ? prisma.$queryRaw<{ is_liked: boolean }[]>`
              SELECT public.is_product_liked(${productId}, ${anonymousUserId}) AS is_liked
            `
          : Promise.resolve([]),
      ]);

      const isLiked = isLikedRows[0]?.is_liked ?? false;

      return NextResponse.json({
        success: true,
        productId,
        isLiked,
        globalLikeCount: counterRow?.count ?? 0,
      });
    }

    // Batch product query (e.g. ?productIds=id1,id2,id3)
    if (productIdsParam) {
      const productIds = productIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const [counterRows, likedProductRows] = await Promise.all([
        prisma.productLikeCount.findMany({
          where: { productId: { in: productIds } },
          select: { productId: true, count: true },
        }),
        anonymousUserId
          ? prisma.$queryRaw<{ product_id: string }[]>`
              SELECT product_id FROM public.get_user_liked_products(${productIds}::text[], ${anonymousUserId})
            `
          : Promise.resolve([]),
      ]);

      const countMap = new Map(counterRows.map((c) => [c.productId, c.count]));
      const userLikedSet = new Set(likedProductRows.map((r) => r.product_id));

      const result: Record<string, { isLiked: boolean; globalLikeCount: number }> = {};
      for (const id of productIds) {
        result[id] = {
          isLiked: userLikedSet.has(id),
          globalLikeCount: countMap.get(id) ?? 0,
        };
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'productId or productIds query parameter is required' },
      { status: 400 },
    );
  } catch (error) {
    console.error('[API /api/likes GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
