"use client";
import React, { useState, useEffect } from "react";
import { Machine, Reservation } from "@/entities/all";
import { MachineAPI, ReservationAPI } from "@/entities/all"
import { format, startOfToday, addDays, isSameDay } from "date-fns";
import { RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import ReservationCard from "@/components/ReservationCard";

export default function BuildingSchedule() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('today');

  interface GroupedReservations {
  [date: string]: {
    date: Date;
    reservations: Reservation[];
  }
}

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      setIsLoading(true);
      const [machinesData, reservationsData] = await Promise.all([
        MachineAPI.list(),
        ReservationAPI.filter({ status: 'active' })
      ]);
      setMachines(machinesData);
      setReservations(reservationsData);
      setIsLoading(false);
    };

  const getMachine = (machineId: string) => {
    return machines.find(m => m.id === machineId);
  };

  // For today/tomorrow view
const getFilteredReservationsForDay = (dayOffset = 0): Reservation[] => {
  const today = startOfToday();
  const targetDay = addDays(today, dayOffset);

  return reservations.filter(r =>
    isSameDay(new Date(r.startTime), targetDay)
  );
}


 // For week view
const getGroupedReservationsForWeek = (): GroupedReservations => {
  const today = startOfToday();
  const grouped: GroupedReservations = {};

  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const dateKey = format(date, "yyyy-MM-dd");

    grouped[dateKey] = {
      date,
      reservations: reservations.filter(r =>
        isSameDay(new Date(r.startTime), date)
      )
    };
  }

  return grouped;
}


  const renderWeekView = (groupedData: GroupedReservations) => {
    return Object.entries(groupedData).map(([dateKey, { date, reservations }]) => (
      <div key={dateKey} className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          {format(date, 'EEEE')} - {format(date, 'd MMMM')}
        </h3>
        {reservations.length > 0 ? (
          <div className="space-y-3 pl-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                machine={getMachine(reservation.machineId)}
                showUser={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm pl-4">No bookings scheduled</p>
        )}
      </div>
    ));
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Building Schedule</h1>
            <p className="text-slate-600">View all community bookings</p>
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

        {/* Date Filter */}
        <Tabs value={selectedDate} onValueChange={setSelectedDate} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
                >
                {selectedDate === 'week' ? (
                    renderWeekView(getGroupedReservationsForWeek())
                ) : (
                    (() => {
                    const dayReservations = getFilteredReservationsForDay(selectedDate === 'tomorrow' ? 1 : 0);
                    if (dayReservations.length > 0) {
                        return dayReservations.map(reservation => (
                        <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            machine={getMachine(reservation.machineId)}
                            showUser={true}
                        />
                        ));
                    } else {
                        return (
                        <div className="text-center py-12">
                            <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-2">No bookings for this period</p>
                            <p className="text-sm text-slate-500">
                            {selectedDate === 'today' ? 'All machines are available today!' :
                            selectedDate === 'tomorrow' ? 'No bookings scheduled for tomorrow yet' :
                            'No bookings scheduled for this week'}
                            </p>
                        </div>
                        );
                    }
                    })()
                )}
                </motion.div>

        )}
      </div>
    </div>
  );
}