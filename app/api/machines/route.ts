import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const machines = await prisma.machine.findMany()
  return NextResponse.json(machines)
}

export async function POST(req: Request) {
  const data = await req.json()
  const machine = await prisma.machine.create({ data })
  return NextResponse.json(machine)
}
