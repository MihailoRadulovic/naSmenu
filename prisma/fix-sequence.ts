import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  await sql`SELECT setval(pg_get_serial_sequence('"User"', 'id'), MAX(id)) FROM "User"`
  console.log('Sekvenca za User.id resetovana.')
}

main().catch(console.error)
