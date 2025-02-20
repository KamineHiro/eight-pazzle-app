import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameType = searchParams.get('gameType')

  const rankings = await prisma.ranking.findMany({
    where: {
      gameType: gameType || 'eight'
    },
    orderBy: {
      moves: 'asc'
    },
    take: 5
  })

  return NextResponse.json(rankings)
}

export async function POST(request: Request) {
  const { moves, gameType } = await request.json()

  const ranking = await prisma.ranking.create({
    data: {
      moves,
      gameType
    }
  })

  return NextResponse.json(ranking)
} 