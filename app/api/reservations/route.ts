import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { ReservationStatus } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl
    const status = url.searchParams.get("status") // e.g., "active"
    const machineId = url.searchParams.get("machineId")

    const prismaStatus: ReservationStatus | undefined = status ? (status.toUpperCase() as ReservationStatus) : undefined

    const reservations = await prisma.reservation.findMany({
      where: {
        status: prismaStatus,
        machineId: machineId || undefined,
      },
      orderBy: {
        startTime: "asc"
      }
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const reservation = await prisma.reservation.create({
      data: {
        machineId: body.machineId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        residentName: body.residentName,
        apartmentNumber: body.apartmentNumber,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}

