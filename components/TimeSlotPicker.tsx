import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reservation, ReservationAPI } from "@/entities/all";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, addHours, startOfToday, addDays, isWithinInterval, parseISO } from "date-fns";

// ✅ Updated props type to match Prisma schema
interface TimeSlotPickerProps {
  machine: { id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservationData: {
    machineId: string;      // Changed from machine_id
    startTime: string;      // Changed from start_time
    endTime: string;        // Changed from end_time
    residentName: string;   // Changed from resident_name
    apartmentNumber: string; // Changed from apartment_number
  }) => void;
  isLoading: boolean;
}

export default function TimeSlotPicker({
  machine,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [duration, setDuration] = useState(2);
  const [residentName, setResidentName] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
  const [conflictError, setConflictError] = useState("");

  const timeSlots = [
    "06:00","07:00","08:00","09:00","10:00","11:00",
    "12:00","13:00","14:00","15:00","16:00","17:00",
    "18:00","19:00","20:00","21:00","22:00",
  ];

  const loadExistingReservations = useCallback(async () => {
    if (!machine) return;

    try {
      // ✅ Updated to use machineId filter
      const reservations = await ReservationAPI.filter({
        status: "ACTIVE",
        machineId: machine.id,
      });
      setExistingReservations(reservations);
    } catch (error) {
      console.error("Error loading reservations:", error);
    }


  }, [machine]);

  const checkForConflicts = useCallback(() => {
    setConflictError("");

    if (!selectedDate || !selectedTime || !duration) return;

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = addHours(startDateTime, duration);

    const hasConflict = existingReservations.some((reservation) => {
      // ✅ Updated field names
      const existingStart = parseISO(reservation.startTime);
      const existingEnd = parseISO(reservation.endTime);

      return (
        (startDateTime >= existingStart && startDateTime < existingEnd) ||
        (endDateTime > existingStart && endDateTime <= existingEnd) ||
        (startDateTime <= existingStart && endDateTime >= existingEnd)
      );
    });

    if (hasConflict) {
      setConflictError("This time slot conflicts with an existing reservation. Please choose a different time.");
    }
  }, [selectedDate, selectedTime, duration, existingReservations]);

  useEffect(() => {
    if (machine && isOpen) {
      loadExistingReservations();
    }
  }, [machine, isOpen, selectedDate, loadExistingReservations]);

  useEffect(() => {
    checkForConflicts();
  }, [checkForConflicts]);

  const getTimeSlotStatus = (time: string) => {
    if (!selectedDate) return "available";

    const checkTime = new Date(`${selectedDate}T${time}`);

    const isOccupied = existingReservations.some((reservation) => {
      // ✅ Updated field names
      const existingStart = parseISO(reservation.startTime);
      const existingEnd = parseISO(reservation.endTime);
      return checkTime >= existingStart && checkTime < existingEnd;
    });

    return isOccupied ? "occupied" : "available";
  };

  const getExistingReservationsForDate = () => {
    if (!selectedDate) return [];

    const selectedDateStart = new Date(`${selectedDate}T00:00:00`);
    const selectedDateEnd = new Date(`${selectedDate}T23:59:59`);

    return existingReservations
      .filter((reservation) => {
        // ✅ Updated field name
        const reservationStart = parseISO(reservation.startTime);
        return isWithinInterval(reservationStart, {
          start: selectedDateStart,
          end: selectedDateEnd,
        });
      })
      // ✅ Updated field name
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
  };

  const handleConfirm = async () => {
    if (conflictError || !machine) return;

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = addHours(startDateTime, duration);

    // ✅ Updated API call
    const lastMinuteCheck = await ReservationAPI.filter({
      machineId: machine.id,
      status: "ACTIVE",
    });

    const hasConflict = lastMinuteCheck.some((reservation) => {
      // ✅ Updated field names
      const existingStart = parseISO(reservation.startTime);
      const existingEnd = parseISO(reservation.endTime);

      return (
        (startDateTime >= existingStart && startDateTime < existingEnd) ||
        (endDateTime > existingStart && endDateTime <= existingEnd) ||
        (startDateTime <= existingStart && endDateTime >= existingEnd)
      );
    });

    if (hasConflict) {
      setConflictError("This time slot was just booked by someone else. Please choose a different time.");
      return;
    }

    // ✅ Updated field names in onConfirm call
    onConfirm({
      machineId: machine.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      residentName: residentName,
      apartmentNumber: apartmentNumber,
    });
  };

  const canConfirm = residentName.trim() && apartmentNumber.trim() && !conflictError;
  const todaysReservations = getExistingReservationsForDate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Reserve {machine?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Your Name</Label>
              <Input 
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label>Apartment #</Label>
              <Input 
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                placeholder="e.g., 4B"
              />
            </div>
          </div>

          <div>
            <Label>Date</Label>
            <Input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(startOfToday(), 'yyyy-MM-dd')}
              max={format(addDays(startOfToday(), 7), 'yyyy-MM-dd')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <select 
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {timeSlots.map(time => {
                  const status = getTimeSlotStatus(time);
                  return (
                    <option 
                      key={time} 
                      value={time}
                      disabled={status === 'occupied'}
                      style={{
                        color: status === 'occupied' ? '#ef4444' : 'inherit',
                        fontWeight: status === 'occupied' ? 'bold' : 'normal'
                      }}
                    >
                      {format(new Date(`2000-01-01T${time}`), 'h:mm a')} 
                      {status === 'occupied' ? ' - OCCUPIED' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <Label>Duration (hours)</Label>
              <select 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
              </select>
            </div>
          </div>

          {conflictError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{conflictError}</span>
              </div>
            </div>
          )}

          <div className={`p-3 rounded-lg ${conflictError ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(`${selectedDate}T${selectedTime}`), 'EEE, MMM d at h:mm a')} - 
                {format(addHours(new Date(`${selectedDate}T${selectedTime}`), duration), 'h:mm a')}
              </span>
            </div>
          </div>

          {todaysReservations.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Existing bookings for this date:
              </h4>
              <div className="space-y-1">
                {todaysReservations.map((res, index) => (
                  <div key={index} className="text-xs text-blue-700">
                    {/* ✅ Updated field names */}
                    {format(parseISO(res.startTime), 'h:mm a')} - 
                    {format(parseISO(res.endTime), 'h:mm a')} 
                    ({res.residentName})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!canConfirm || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              {isLoading ? 'Booking...' : 'Confirm Reservation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}