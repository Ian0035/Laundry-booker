export interface Machine {
  id: string
  name: string
  type: "washer" | "dryer"
  location?: string | null
  status: "active" | "maintenance" | "out_of_order"
}


export const MachineAPI = {
  async list(): Promise<Machine[]> {
    const res = await fetch("/api/machines")
    if (!res.ok) throw new Error("Failed to fetch machines")
    return res.json()
  },
}
