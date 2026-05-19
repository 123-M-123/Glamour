import { NextResponse } from 'next/server';
import { getCategoriesFromSheets } from '@/lib/googleSheets';

export const revalidate = 0; // Para que sea instantáneo el cambio

export async function GET() {
  try {
    const categories = await getCategoriesFromSheets();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}