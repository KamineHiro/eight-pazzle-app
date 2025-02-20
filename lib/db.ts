import { PrismaClient } from '@prisma/client'

// グローバル型の拡張
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// PrismaClientのグローバルインスタンスを作成
const prisma = global.prisma || new PrismaClient()

// 開発環境でのホットリロード時に複数のインスタンスが作成されるのを防ぐ
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export { prisma } 