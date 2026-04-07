/**
 * Kreira placeholder korisnika sa id=1 ako ne postoji.
 * Pokreni jednom: npx ts-node --skip-project prisma/init-user.ts
 */
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const existing = await sql`SELECT id FROM "User" WHERE id = 1`
  if (existing.length > 0) {
    console.log('User id=1 već postoji.')
    return
  }

  await sql`
    INSERT INTO "User" (id, email, "cafeName", "passwordHash", "createdAt")
    VALUES (1, 'placeholder@smenaapp.local', 'Placeholder', 'PLACEHOLDER', NOW())
  `
  console.log('Kreiran placeholder User id=1.')
}

main().catch(console.error)
