// 120326 updated model
"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button";
import { Investor } from "@/api/entities.js";
import { Venture } from "@/api/entities.js";
import { User } from "@/api/entities.js";
import { InvestorMeeting } from "@/api/entities.js";
import PitchModal from "@/components/angels/PitchModal";
import ScheduleMeetingModal from "@/components/angels/ScheduleMeetingModal";
import {
  Users, Loader2, X, Clock, CheckCircle2, UserCircle,
  Send, Rocket, CheckCircle, CalendarClock,
} from "lucide-react";

const STATUSES = {
  AVAILABLE: { color: 'bg-green-500', label: 'Available Now', icon: CheckCircle2, ringColor: 'ring-green-400' },
  BUSY: { color: 'bg-red-500', label: 'Busy', icon: Clock, ringColor: 'ring-red-400' },
  IN_MEETING: { color: 'bg-yellow-500', label: 'In Meeting', icon: Clock, ringColor: 'ring-yellow-400' },
};

// [CHANGED] Investor card color is now determined by meeting status, not random gradient
const getMeetingColor = (mStatus, meetingScheduledAt) => {
  if (!mStatus) return 'bg-green-500';                                               // no contact yet — green
  if (mStatus === 'pending_screening') return 'bg-yellow-400';                       // awaiting — yellow
  if (mStatus === 'screening_rejected') return 'bg-red-500';                         // rejected — red
  if (mStatus === 'screening_passed' && !meetingScheduledAt) return 'bg-purple-300'; // interested, no meeting yet — light purple
  if (mStatus === 'screening_passed' && meetingScheduledAt) return 'bg-purple-600';  // meeting scheduled — purple
  return 'bg-green-500';
};

// Returns the status of this investor for this venture based on existing meetings
const getInvestorMeetingStatus = (investorId, meetings) => {
  const meeting = meetings.find(m => m.investor_id === investorId);
  if (!meeting) return null;
  return meeting.status; // 'pending_screening' | 'screening_passed' | 'screening_rejected'
};

export default function AngelArena() {
  const [investors, setInvestors] = useState([]);
  const [venture, setVenture] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sendingInfo, setSendingInfo] = useState(false);
  const [sentAnimation, setSentAnimation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [angelInvestors, user] = await Promise.all([
          Investor.list(),
          User.me(),
        ]);

        const investorsWithStatus = (angelInvestors || []).map(investor => ({
          ...investor,
          status: Math.random() > 0.3 ? 'AVAILABLE' : (Math.random() > 0.5 ? 'BUSY' : 'IN_MEETING')
        }));
        setInvestors(investorsWithStatus);

        if (!user?.id) { setIsLoading(false); return; }

        let userVentures = [];
        try {
          userVentures = await Venture.filter({ founder_user_id: user.id }, "-created_date");
        } catch (e) { userVentures = []; }

        if (!userVentures || userVentures.length === 0) {
          userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
        }

        if (userVentures.length > 0) {
          const v = userVentures[0];
          setVenture(v);
          const existingMeetings = await InvestorMeeting.filter({ venture_id: v.id });
          setMeetings(existingMeetings || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const formatMoney = (amount) => {
    if (!amount) return "N/A";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const handleInvestorClick = (investor) => {
    if (investor.status !== 'AVAILABLE') return;
    if (!venture) { alert("Please create a venture first."); return; }
    setSelectedInvestor(investor);
  };

  // Send business plan info to investor — creates InvestorMeeting record
  const handleSendInfo = async () => {
    if (!venture || !selectedInvestor) return;
    setSendingInfo(true);
    try {
      const newMeeting = await InvestorMeeting.create({
        venture_id: venture.id,
        investor_id: selectedInvestor.id,
        status: 'pending_screening',
        screening_submitted_at: new Date().toISOString(),
        created_by: venture.created_by || '',
        created_by_id: venture.created_by_id || '',
      });
      setMeetings(prev => [...prev, newMeeting]);
      setSentAnimation(true);
    } catch (err) {
      console.error("Error sending info:", err);
      alert("Something went wrong. Please try again.");
    }
    setSendingInfo(false);
  };

  const handleCloseSentAnimation = () => {
    setSentAnimation(false);
    setSelectedInvestor(null);
  };

  const handleOpenSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleCloseSchedule = (scheduledMeeting) => {
    setShowScheduleModal(false);
    if (scheduledMeeting) {
      setMeetings(prev => prev.map(m => m.id === scheduledMeeting.id ? scheduledMeeting : m));
    }
    setSelectedInvestor(null);
  };

  const handleOpenPitch = () => {
    setShowPitchModal(true);
  };

  const handleClosePitch = () => {
    setShowPitchModal(false);
    setSelectedInvestor(null);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Find meeting for selectedInvestor
  const selectedMeeting = selectedInvestor
    ? meetings.find(m => m.investor_id === selectedInvestor.id)
    : null;

  const meetingStatus = selectedMeeting?.status || null;

  // Is Join button active? meeting_scheduled_at has passed but within 20 min window
 // const isJoinActive = () => {
    // if (!selectedMeeting?.meeting_scheduled_at) return false;
   // const now = new Date();
    // const meetingTime = new Date(selectedMeeting.meeting_scheduled_at);
    //const diff = (now - meetingTime) / 1000 / 60; // minutes
   // return diff >= 0 && diff <= 20;
 // };
 const isJoinActive = () => {
  if (!selectedMeeting?.meeting_scheduled_at) return false;
  return true; // לבדיקה בלבד — מחק אחר כך
};

  return (
    <>
      <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-2">Angel Arena</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Connect with experienced angel investors
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">In Meeting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Busy</span>
              </div>
            </div>
          </div>

          {/* Investor Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {investors.map((investor, index) => {
              const statusConfig = STATUSES[investor.status];
              const isAvailable = investor.status === 'AVAILABLE';
              const meeting = meetings.find(m => m.investor_id === investor.id);
              const mStatus = getInvestorMeetingStatus(investor.id, meetings);
              // [CHANGED] color driven by meeting status, not random gradient
              const meetingColor = getMeetingColor(mStatus, meeting?.meeting_scheduled_at);

              return (
                <div
                  key={investor.id}
                  className="flex flex-col items-center"
                  style={{
                    animation: `slideIn 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0
                  }}
                >
                  <button
                    onClick={() => handleInvestorClick(investor)}
                    disabled={!isAvailable}
                    className={`
                      relative w-32 h-32 rounded-full flex items-center justify-center
                      transition-all duration-300 shadow-lg
                      ${isAvailable ? 'cursor-pointer hover:scale-110 hover:shadow-2xl' : 'cursor-not-allowed opacity-60'}
                      ${meetingColor}
                    `}
                  >
                    <span
                      className="text-base font-bold text-white relative z-10 text-center px-3 leading-tight"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                    >
                      {investor.name}
                    </span>
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                      {React.createElement(statusConfig.icon, {
                        className: `w-5 h-5 ${statusConfig.color.replace('bg-', 'text-')}`
                      })}
                    </div>
                    {/* Meeting status badge */}
                    {mStatus === 'pending_screening' && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-semibold shadow">
                        Awaiting
                      </div>
                    )}
                    {mStatus === 'screening_passed' && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-semibold shadow">
                        Interested!
                      </div>
                    )}
                    {mStatus === 'screening_rejected' && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-400 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-semibold shadow">
                        Passed
                      </div>
                    )}
                  </button>
                  <p className="mt-3 text-xs font-medium text-gray-600">{statusConfig.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sent Animation Overlay */}
      {sentAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Information Sent!</h2>
            <p className="text-gray-600 mb-1">
              Your business plan has been shared with <span className="font-semibold">{selectedInvestor?.name}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You'll hear back within 24–48 hours. We'll notify you on your dashboard.
            </p>
            <Button onClick={handleCloseSentAnimation} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Investor Details Modal */}
      {selectedInvestor && !showPitchModal && !showScheduleModal && !sentAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500 shadow-2xl bg-white border-0">

            <CardHeader className="relative pb-4 border-b">
              <button
                onClick={() => setSelectedInvestor(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${getMeetingColor(meetings.find(m => m.investor_id === selectedInvestor.id)?.status, meetings.find(m => m.investor_id === selectedInvestor.id)?.meeting_scheduled_at)}`}>
                  <UserCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold mb-1">{selectedInvestor.name}</CardTitle>
                  <p className="text-gray-600 mb-2">Angel Investor</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${STATUSES[selectedInvestor.status].color}`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {STATUSES[selectedInvestor.status].label}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Background */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Background</h3>
                <p className="text-gray-700 leading-relaxed">{selectedInvestor.background}</p>
              </div>

              {/* Investment Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Investment Range</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMoney(selectedInvestor.typical_check_min)} - {formatMoney(selectedInvestor.typical_check_max)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Portfolio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedInvestor.portfolio_count || '—'} {selectedInvestor.portfolio_count ? 'Startups' : ''}
                  </p>
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Focus Areas</p>
                {selectedInvestor.focus_sectors?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedInvestor.focus_sectors.map((sector, idx) => {
                      const colors = ['bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700'];
                      return (
                        <span key={sector} className={`px-3 py-1 rounded-full text-sm font-medium ${colors[idx % colors.length]}`}>
                          {sector.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">No Preference</span>
                )}
              </div>

              {/* Action Button — depends on meeting status */}
              <div className="pt-4 space-y-3">

                {/* No meeting yet — show Send Info */}
                {!meetingStatus && (
                  <>
                    <p className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-3">
                      📄 Your business plan will be shared with {selectedInvestor.name.split(' ')[0]}. They will review it and get back to you within 24–48 hours.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 text-lg shadow-lg rounded-xl"
                      onClick={handleSendInfo}
                      disabled={sendingInfo}
                    >
                      {sendingInfo
                        ? <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        : <Send className="w-5 h-5 mr-2" />
                      }
                      Send Information to {selectedInvestor.name.split(' ')[0]}
                    </Button>
                  </>
                )}

                {/* Pending screening */}
                {meetingStatus === 'pending_screening' && (
                  <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-800">Awaiting Response</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      {selectedInvestor.name.split(' ')[0]} is reviewing your business plan. You'll hear back within 24–48 hours.
                    </p>
                  </div>
                )}

                {/* Screening rejected */}
                {meetingStatus === 'screening_rejected' && (
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                    <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="font-semibold text-red-800">Not a Fit This Time</p>
                    <p className="text-sm text-red-600 mt-1">
                      {selectedInvestor.name.split(' ')[0]} has decided to pass after reviewing your materials.
                    </p>
                  </div>
                )}

                {/* Screening passed — schedule meeting */}
                {meetingStatus === 'screening_passed' && !selectedMeeting?.meeting_scheduled_at && (
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold text-green-800">
                        {selectedInvestor.name.split(' ')[0]} wants to meet you!
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You passed the initial screening. Schedule your Zoom meeting below.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg rounded-xl"
                      onClick={handleOpenSchedule}
                    >
                      <CalendarClock className="w-5 h-5 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                )}

                {/* Meeting scheduled — show Join if time has come */}
                {meetingStatus === 'screening_passed' && selectedMeeting?.meeting_scheduled_at && (
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <CalendarClock className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <p className="font-semibold text-indigo-800">Meeting Scheduled</p>
                      <p className="text-sm text-indigo-600 mt-1">
                        {new Date(selectedMeeting.meeting_scheduled_at).toLocaleString('en-US', {
                          weekday: 'long', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {isJoinActive() ? (
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg shadow-lg rounded-xl"
                        onClick={handleOpenPitch}
                      >
                        <Rocket className="w-5 h-5 mr-2" />
                        Join Meeting with {selectedInvestor.name.split(' ')[0]}
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-6 text-lg rounded-xl cursor-not-allowed">
                        <Clock className="w-5 h-5 mr-2" />
                        Meeting not started yet
                      </Button>
                    )}
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Modal */}
      {selectedInvestor && showScheduleModal && (
        <ScheduleMeetingModal
          investor={selectedInvestor}
          meeting={selectedMeeting}
          onClose={handleCloseSchedule}
        />
      )}

      {/* Pitch Modal */}
      {selectedInvestor && venture && showPitchModal && (
        <PitchModal
          investor={selectedInvestor}
          venture={venture}
          isOpen={showPitchModal}
          onClose={handleClosePitch}
        />
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
