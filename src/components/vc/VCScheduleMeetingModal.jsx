// VCScheduleMeetingModal.jsx — mirrors angels/ScheduleMeetingModal but for VC meetings
import React, { useState, useMemo } from 'react';
import { VCMeeting } from '@/api/entities';
import { VentureMessage } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { X, Calendar, Clock } from 'lucide-react';

const SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16];

// Deterministic busy-slot generator based on firm id + day index
const getBusySlots = (firmId, dayIndex) => {
  const seed = firmId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const busy = new Set();
  const count = ((seed + dayIndex * 7) % 3) + 1; // 1–3 busy slots per day
  for (let i = 0; i < count; i++) {
    busy.add(SLOT_HOURS[(seed * (i + 1) + dayIndex * 3) % SLOT_HOURS.length]);
  }
  return busy;
};

const getDaysAhead = (n) => {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function VCScheduleMeetingModal({ vcMeeting, venture, onClose }) {
  const [selectedSlot, setSelectedSlot] = useState(null); // { day: Date, hour: number }
  const [isConfirming, setIsConfirming] = useState(false);

  const days = useMemo(() => getDaysAhead(7), []);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setIsConfirming(true);
    try {
      const meetingTime = new Date(selectedSlot.day);
      meetingTime.setHours(selectedSlot.hour, 0, 0, 0);

      await VCMeeting.update(vcMeeting.id, {
        meeting_scheduled_at: meetingTime.toISOString(),
        meeting_status: 'scheduled',
        status: 'meeting_scheduled',
      });

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'vc_meeting_scheduled',
        title: `📅 Meeting Scheduled with ${vcMeeting.vc_firm_name}`,
        content: `Your meeting with ${vcMeeting.vc_firm_name} is confirmed for ${meetingTime.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. The Join button will be active for 20 minutes starting at that time.`,
        phase: venture.phase,
        priority: 4,
        vc_firm_id: vcMeeting.vc_firm_id,
        vc_firm_name: vcMeeting.vc_firm_name,
        is_dismissed: false,
      });

      onClose();
    } catch (err) {
      console.error('Error confirming VC meeting:', err);
      alert('Failed to schedule meeting. Please try again.');
    }
    setIsConfirming(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
            <p className="text-sm text-gray-500 mt-0.5">{vcMeeting.vc_firm_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[560px]">
            {days.map((day, dayIndex) => {
              const busySlots = getBusySlots(vcMeeting.vc_firm_id, dayIndex);
              return (
                <div key={dayIndex} className="flex flex-col gap-1">
                  <div className="text-center mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {SLOT_HOURS.map((hour) => {
                    const isBusy = busySlots.has(hour);
                    const isSelected = selectedSlot?.day.toDateString() === day.toDateString() && selectedSlot?.hour === hour;
                    return (
                      <button
                        key={hour}
                        disabled={isBusy}
                        onClick={() => setSelectedSlot({ day, hour })}
                        className={`
                          text-xs py-1.5 px-1 rounded font-medium transition-all
                          ${isBusy
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : isSelected
                              ? 'bg-indigo-600 text-white shadow-md scale-105'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }
                        `}
                      >
                        {hour}:00
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 rounded inline-block" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded inline-block" /> Busy</span>
            {selectedSlot && (
              <span className="flex items-center gap-1 text-indigo-700 font-medium">
                <Clock className="w-3 h-3" />
                {selectedSlot.day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedSlot.hour}:00
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isConfirming}>Cancel</Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedSlot || isConfirming}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Meeting'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
