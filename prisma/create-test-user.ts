/**
 * Kreira test korisnika na Neon bazi.
 * Pokretanje: npx tsx prisma/create-test-user.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL nije postavljen')

  const adapter = new PrismaNeon({ connectionString: dbUrl })
  const prisma = new PrismaClient({ adapter } as never)

  const email = 'test@test.com'
  const password = 'test1234'
  const cafeName = 'Test Kafić'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`✓ Korisnik ${email} već postoji (id: ${existing.id})`)
    await prisma.$disconnect()
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, cafeName, passwordHash, emailVerified: true },
  })

  console.log(`✅ Korisnik kreiran:`)
  console.log(`   Email:    ${email}`)
  console.log(`   Lozinka:  ${password}`)
  console.log(`   ID:       ${user.id}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
