"use client";
import React, { useState, useEffect } from "react";
import { Machine, Reservation } from "@/entities/all";
import { MachineAPI, ReservationAPI } from "@/entities/all"
import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import ReservationCard from "@/components/ReservationCard";

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  const localData = JSON.parse(localStorage.getItem("myReservations") || "[]");
  setReservations(localData);
}, []);

  const loadData = async () => {
      setIsLoading(true);
      const [machinesData] = await Promise.all([
        MachineAPI.list(),
      ]);
      setMachines(machinesData);
      setIsLoading(false);
    };

  const handleCancelReservation = async (reservation: Reservation) => {
  try {
    await ReservationAPI.delete(reservation.id);
    // Remove from localStorage
    const existing = JSON.parse(localStorage.getItem("myReservations") || "[]");
    const updated = existing.filter((r: Reservation) => r.id !== reservation.id);
    localStorage.setItem("myReservations", JSON.stringify(updated));
    setReservations(updated);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
  }
};

  const getMachine = (machineId: string) => {
    return machines.find(m => m.id === machineId);
  };

  const activeReservations = reservations.filter(r => r.status === 'ACTIVE');
  const pastReservations = reservations.filter(r => r.status !== 'ACTIVE');

  return (
    <div className="px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-600">Manage your laundry reservations</p>
          </div>
          <Button 
            onClick={loadData}
            variant="outline"
            size="icon"
            className="bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Reservations */}
            {activeReservations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Upcoming Bookings
                </h2>
                <div className="space-y-3">
                  {activeReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      machine={getMachine(reservation.machineId)}
                      onCancel={handleCancelReservation}
                      canCancel={true}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Past Reservations */}
            {pastReservations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Past Bookings
                </h2>
                <div className="space-y-3">
                  {pastReservations.slice(0, 5).map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      machine={getMachine(reservation.machineId)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {reservations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No reservations yet</p>
                <p className="text-sm text-slate-500">Go to Dashboard to book your first time slot</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}