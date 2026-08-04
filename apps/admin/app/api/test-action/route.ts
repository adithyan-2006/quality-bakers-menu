import { NextResponse } from 'next/server';
import { updateBusinessAction } from '@/features/business/actions/business-actions';
import { PrismaBusinessRepository } from '@/features/business/repositories/prisma-business-repo';

export async function GET() {
  try {
    const current = await PrismaBusinessRepository.getBusiness();
    const payload = {
      ...current,
      favicon: '',
      status: 'published' as any,
    };
    const result = await updateBusinessAction(payload as any);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
