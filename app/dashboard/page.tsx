"use client";
import React, { useState, useEffect, use } from "react";
import type { Machine, Reservation } from "@/entities/all"
import { MachineAPI, ReservationAPI } from "@/entities/all"
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import MachineCard from "../../components/MachineCard";
import TimeSlotPicker from "../../components/TimeSlotPicker";

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
const [reservations, setReservations] = useState<Reservation[]>([]);
const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [machinesData, reservationsData] = await Promise.all([
      MachineAPI.list(),
      ReservationAPI.filter({ status: 'ACTIVE' })
    ]);
    console.log("Machines:", machinesData);
  console.log("Reservations:", reservationsData);
    setMachines(machinesData);
    setReservations(reservationsData);
    setIsLoading(false);
  };

  const getCurrentReservation = (machine: Machine) => {
    const now = new Date();
    return reservations.find(res => 
      res.machineId === machine.id && 
      isWithinInterval(now, {
        start: new Date(res.startTime),
        end: new Date(res.endTime)
      })
    );
  };

  const handleReserve = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowTimeSlotPicker(true);
  };

  const handleConfirmReservation = async (reservationData: any) => {
    setIsBooking(true);
    try {      
      const created = await ReservationAPI.create(reservationData);
      const existing = JSON.parse(localStorage.getItem("myReservations") || "[]");
      localStorage.setItem("myReservations", JSON.stringify([...existing, created]));
      setShowTimeSlotPicker(false);
      setSelectedMachine(null);
      await loadData();
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
    setIsBooking(false);
  };

  const washers = machines.filter(m => m.type.toLocaleLowerCase() === 'washer');
  const dryers = machines.filter(m => m.type.toLocaleLowerCase() === 'dryer');

  return (
    <div className="px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Laundry Room</h1>
            <p className="text-slate-600">Book your preferred time slots</p>
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
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Washing Machines */}
            {washers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Washing Machines
                </h2>
                <div className="space-y-3">
                  {washers.map((machine) => (
                    <MachineCard
                      key={machine.id}
                      machine={machine}
                      currentReservation={getCurrentReservation(machine)}
                      onReserve={handleReserve}
                      isLoading={isBooking}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Dryers */}
            {dryers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Dryers
                </h2>
                <div className="space-y-3">
                  {dryers.map((machine) => (
                    <MachineCard
                      key={machine.id}
                      machine={machine}
                      currentReservation={getCurrentReservation(machine)}
                      onReserve={handleReserve}
                      isLoading={isBooking}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {machines.length === 0 && (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No machines available. Please contact building management.</p>
              </div>
            )}
          </div>
        )}

        <TimeSlotPicker
          machine={selectedMachine}
          isOpen={showTimeSlotPicker}
          onClose={() => {
            setShowTimeSlotPicker(false);
            setSelectedMachine(null);
          }}
          onConfirm={handleConfirmReservation}
          isLoading={isBooking}
        />
      </div>
    </div>
  );
}