import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WashingMachine, Clock, MapPin, User, X } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export default function ReservationCard({ reservation, machine, onCancel, showUser = false, canCancel = false }: any) {
  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.endTime);
  const isExpired = isPast(endDate);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const getStatusColor = () => {
    if (isExpired) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (reservation.status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getStatusLabel = () => {
    if (isExpired) return 'Completed';
    if (reservation.status === 'cancelled') return 'Cancelled';
    return 'Active';
  };

  return (
    <Card className="p-4 bg-white/70 backdrop-blur-sm border-slate-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            machine?.type.toLocaleLowerCase() === 'washer' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-emerald-100 text-emerald-600'
          }`}>
            <WashingMachine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{machine?.name}</h3>
        {machine.location && (
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {machine?.location}
            </p>
        )}

          </div>
        </div>
        
        <Badge className={getStatusColor()}>
          {getStatusLabel()}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        {showUser && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span>{reservation.residentName} - Apt {reservation.apartmentNumber}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          <span>
            {getDateLabel(startDate)} • {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
          </span>
        </div>
      </div>

      {canCancel && reservation.status === 'ACTIVE' && !isExpired && (
        <Button 
          onClick={() => onCancel(reservation)}
          variant="outline"
          size="sm"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel Reservation
        </Button>
      )}
    </Card>
  );
}