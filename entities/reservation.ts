// Updated to match Prisma schema
export interface Reservation {
  id: string
  machineId: string  // Changed from machine_id to match Prisma
  startTime: string  // Changed from start_time to match Prisma
  endTime: string    // Changed from end_time to match Prisma
  residentName: string      // Changed from resident_name to match Prisma
  apartmentNumber: string   // Changed from apartment_number to match Prisma
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"  // Updated to match Prisma enum values
}

export const ReservationAPI = {
  async filter(params: { 
    status?: string; 
    machineId?: string;  // Added machineId filter
  } = {}): Promise<Reservation[]> {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set('status', params.status)
    if (params.machineId) searchParams.set('machineId', params.machineId)
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
    const res = await fetch(`/api/reservations${query}`)
    if (!res.ok) throw new Error("Failed to fetch reservations")
    return res.json()
  },

  async create(data: Omit<Reservation, "id" | "status">): Promise<Reservation> {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create reservation")
    return res.json()
  },
  async update(id: string, data: Partial<Pick<Reservation, "status">>): Promise<Reservation> {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update reservation")
    return res.json()
  },
  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete reservation")
  },
}