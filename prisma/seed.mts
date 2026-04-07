import 'dotenv/config'

const { PrismaClient } = await import('../src/generated/prisma/client.ts')
const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const employees = [
    { firstName: 'Nemanja', lastName: 'Glišić' },
    { firstName: 'Danilo', lastName: 'Petrović' },
    { firstName: 'Mihailo', lastName: 'Jović' },
    { firstName: 'Anđela', lastName: 'Simić' },
    { firstName: 'Stefan', lastName: 'Marković' },
    { firstName: 'Milica', lastName: 'Nikolić' },
  ]

  for (const emp of employees) {
    await prisma.employee.create({ data: emp })
  }

  console.log(`Seeded ${employees.length} employees`)
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
