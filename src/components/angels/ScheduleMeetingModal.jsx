"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { InvestorMeeting } from "@/api/entities.js";
import { VentureMessage } from "@/api/entities.js";
import { X, CalendarClock, Clock, Loader2, CheckCircle } from "lucide-react";

const HOURS = [10, 11, 12, 13, 14, 15, 16]; // 10:00 - 16:00 (last slot 16:00, meeting ends 17:00)

// Generate a week of dates starting from tomorrow
const getWeekDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Skip weekends
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d);
    }
  }
  // Fill to 5 weekdays if needed
  if (dates.length < 5) {
    let extra = 8;
    while (dates.length < 5) {
      const d = new Date(today);
      d.setDate(today.getDate() + extra);
      if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d);
      extra++;
    }
  }
  return dates;
};

// Randomly mark some slots as taken — seeded by investor id so it's consistent per investor
const generateBusySlots = (investorId, dates) => {
  const busy = new Set();
  // Use investor id as seed for pseudo-random but consistent results
  const seed = investorId ? investorId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
  dates.forEach((date, dIdx) => {
    HOURS.forEach((hour, hIdx) => {
      // ~35% chance of being busy
      const val = ((seed * (dIdx + 1) * (hIdx + 3)) % 100);
      if (val < 35) {
        busy.add(`${dIdx}-${hour}`);
      }
    });
  });
  return busy;
};

export default function ScheduleMeetingModal({ investor, meeting, onClose }) {
  const [selectedSlot, setSelectedSlot] = useState(null); // { date, hour }
  const [isSaving, setIsSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const weekDates = useMemo(() => getWeekDates(), []);
  const busySlots = useMemo(() => generateBusySlots(investor?.id, weekDates), [investor?.id, weekDates]);

  const formatDay = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const formatHour = (hour) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h = hour > 12 ? hour - 12 : hour;
    return `${h}:00 ${suffix}`;
  };

  const handleSelectSlot = (date, hour, dIdx) => {
    const key = `${dIdx}-${hour}`;
    if (busySlots.has(key)) return;
    setSelectedSlot({ date, hour, key });
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !meeting) return;
    setIsSaving(true);
    try {
      const meetingDate = new Date(selectedSlot.date);
      meetingDate.setHours(selectedSlot.hour, 0, 0, 0);

      const updated = await InvestorMeeting.update(meeting.id, {
        meeting_scheduled_at: meetingDate.toISOString(),
        meeting_status: 'scheduled',
      });

      // Send dashboard message with meeting details
      await VentureMessage.create({
        venture_id: meeting.venture_id,
        message_type: 'angel_meeting_scheduled',
        title: `📅 Meeting Scheduled with ${investor.name}`,
        content: `Your Zoom meeting with ${investor.name} is confirmed for ${meetingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${formatHour(selectedSlot.hour)}.\n\nMake sure you're ready — the Join button will appear on your dashboard at the scheduled time. You have a 20-minute window to join. Good luck!`,
        phase: meeting.phase || null,
        priority: 3,
        is_dismissed: false,
        investor_meeting_id: meeting.id,
      });

      setConfirmed(true);
      setTimeout(() => onClose(updated), 2000);
    } catch (err) {
      console.error("Error scheduling meeting:", err);
      alert("Something went wrong. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
              <p className="text-sm text-gray-500">with {investor?.name}</p>
            </div>
          </div>
          <button onClick={() => onClose(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Meeting Confirmed!</h3>
            <p className="text-gray-600">
              {new Date(new Date(selectedSlot.date).setHours(selectedSlot.hour)).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })} at {formatHour(selectedSlot.hour)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Check your dashboard for details.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <span className="font-semibold">Working hours:</span> 10:00 AM – 5:00 PM &nbsp;|&nbsp;
              <span className="font-semibold">Gray slots</span> are already taken.
            </p>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="w-20 text-left text-gray-500 font-medium pb-3">Time</th>
                    {weekDates.map((date, dIdx) => (
                      <th key={dIdx} className="text-center text-gray-700 font-semibold pb-3 px-1">
                        {formatDay(date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map(hour => (
                    <tr key={hour} className="border-t border-gray-100">
                      <td className="py-2 text-gray-500 text-xs font-medium">
                        {formatHour(hour)}
                      </td>
                      {weekDates.map((date, dIdx) => {
                        const key = `${dIdx}-${hour}`;
                        const isBusy = busySlots.has(key);
                        const isSelected = selectedSlot?.key === key;

                        return (
                          <td key={dIdx} className="py-1 px-1 text-center">
                            <button
                              onClick={() => handleSelectSlot(date, hour, dIdx)}
                              disabled={isBusy}
                              className={`
                                w-full py-2 rounded-lg text-xs font-medium transition-all duration-150
                                ${isBusy
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105 cursor-pointer border border-green-200'
                                }
                              `}
                            >
                              {isBusy ? '—' : isSelected ? '✓' : 'Free'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected slot summary */}
            {selectedSlot && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-indigo-900">
                    {selectedSlot.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-indigo-700">{formatHour(selectedSlot.hour)} – {formatHour(selectedSlot.hour + 1)}</p>
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={!selectedSlot || isSaving}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-5 text-base rounded-xl shadow-lg"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                : <><CalendarClock className="w-4 h-4 mr-2" /> Confirm Meeting</>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
