import { prisma } from "@/lib/prisma"

async function main() {
  await prisma.machine.createMany({
    data: [
      { name: "Washer 1", type: "WASHER", status: "ACTIVE" },
      { name: "Washer 2", type: "WASHER", status: "ACTIVE" },
      { name: "Dryer A", type: "DRYER", status: "ACTIVE" },
      { name: "Dryer B", type: "DRYER", status: "ACTIVE" },
    ],
  })
}

main()
  .then(() => console.log("Seeded"))
  .catch(console.error)
  .finally(() => prisma.$disconnect())
