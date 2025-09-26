import React from "react";
import { WashingMachine, Timer, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function MachineCard({ machine, currentReservation, onReserve, isLoading }: any) {
  const isWasher = machine.type === 'washer';
  const isAvailable = !currentReservation && machine.status === 'ACTIVE';
  
  return (
    <Card className="p-4 bg-white/70 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            isWasher 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-emerald-100 text-emerald-600'
          }`}>
            <WashingMachine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{machine.name}</h3>
            <p className="text-sm text-slate-500">{machine.location}</p>
          </div>
        </div>
        
        <Badge 
          variant={isAvailable ? "default" : "secondary"}
          className={`${
            isAvailable 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isAvailable ? 'Available' : 'Occupied'}
        </Badge>
      </div>

      {currentReservation ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span>{currentReservation.resident_name} - Apt {currentReservation.apartment_number}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Timer className="w-4 h-4" />
            <span>
              {format(new Date(currentReservation.startTime), 'h:mm a')} - 
              {format(new Date(currentReservation.endTime), 'h:mm a')}
            </span>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => onReserve(machine)}
          disabled={!isAvailable || isLoading}
          className="w-full mt-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white border-0"
        >
          {isLoading ? 'Booking...' : 'Reserve Now'}
        </Button>
      )}
    </Card>
  );
}