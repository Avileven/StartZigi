"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Investor } from "@/api/entities.js";
import { Venture } from "@/api/entities.js";
import { User } from "@/api/entities.js";
import PitchModal from "@/components/angels/PitchModal";
import {
  Users,
  DollarSign,
  Target,
  Briefcase,
  Rocket,
  Loader2,
  X,
  Clock,
  CheckCircle2,
} from "lucide-react";

const STATUSES = {
  AVAILABLE: { color: 'bg-green-500', label: 'Available Now', icon: CheckCircle2, ringColor: 'ring-green-400' },
  BUSY: { color: 'bg-red-500', label: 'Busy', icon: Clock, ringColor: 'ring-red-400' },
  IN_MEETING: { color: 'bg-yellow-500', label: 'In Meeting', icon: Clock, ringColor: 'ring-yellow-400' },
};

const GRADIENTS = [
  'bg-gradient-to-br from-purple-500 to-indigo-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-green-500 to-emerald-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-indigo-500 to-purple-700',
  'bg-gradient-to-br from-teal-500 to-green-600',
  'bg-gradient-to-br from-fuchsia-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
];

// Generate consistent gradient from investor name
const getGradientForInvestor = (name) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
};

export default function AngelArena() {
  const [investors, setInvestors] = useState([]);
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [angelInvestors, user] = await Promise.all([
          Investor.list(),
          User.me(),
        ]);

        // Assign random status to each investor
        const investorsWithStatus = (angelInvestors || []).map(investor => ({
          ...investor,
          status: Math.random() > 0.3 ? 'AVAILABLE' : (Math.random() > 0.5 ? 'BUSY' : 'IN_MEETING')
        }));

        setInvestors(investorsWithStatus);

        if (!user?.id) {
          setVenture(null);
          setIsLoading(false);
          return;
        }

        let userVentures = [];
        try {
          userVentures = await Venture.filter(
            { founder_user_id: user.id },
            "-created_date"
          );
        } catch (e) {
          userVentures = [];
        }

        if (!userVentures || userVentures.length === 0) {
          userVentures = await Venture.filter(
            { created_by: user.email },
            "-created_date"
          );
        }

        if (userVentures.length > 0) {
          setVenture(userVentures[0]);
        } else {
          setVenture(null);
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
    if (!venture) {
      alert("Please create a venture first.");
      return;
    }
    setSelectedInvestor(investor);
  };

  const handleCloseDetails = () => {
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

  return (
    <>
      <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-2">
              Angel Arena
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Connect with experienced angel investors
            </p>

            {/* Legend */}
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

          {/* Investor Circles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {investors.map((investor, index) => {
              const statusConfig = STATUSES[investor.status];
              const isAvailable = investor.status === 'AVAILABLE';
              const gradientClass = getGradientForInvestor(investor.name);
              
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
                      ${isAvailable 
                        ? 'cursor-pointer hover:scale-110 hover:shadow-2xl' 
                        : 'cursor-not-allowed opacity-60'
                      }
                      ${gradientClass}
                    `}
                  >
                    {/* Full Name with shadow for readability */}
                    <span 
                      className="text-base font-bold text-white relative z-10 text-center px-3 leading-tight"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                    >
                      {investor.name}
                    </span>

                    {/* Status Icon */}
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                      {React.createElement(statusConfig.icon, {
                        className: `w-5 h-5 ${statusConfig.color.replace('bg-', 'text-')}`
                      })}
                    </div>
                  </button>

                  {/* Status Only */}
                  <p className="mt-3 text-xs font-medium text-gray-600">
                    {statusConfig.label}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Details Modal */}
      {selectedInvestor && !showPitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500 shadow-2xl bg-white border-0">
            
            {/* Header */}
            <CardHeader className="relative pb-4 border-b">
              <button
                onClick={handleCloseDetails}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${STATUSES[selectedInvestor.status].color}`}>
                  {selectedInvestor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold mb-1">
                    {selectedInvestor.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
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
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Background
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedInvestor.background}
                </p>
              </div>

              {/* Investment Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Typical Investment</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatMoney(selectedInvestor.typical_check_min)} - {formatMoney(selectedInvestor.typical_check_max)}
                  </p>
                </div>

                {selectedInvestor.preferred_valuation_max && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Preferred Valuation</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatMoney(selectedInvestor.preferred_valuation_min)} - {formatMoney(selectedInvestor.preferred_valuation_max)}
                    </p>
                  </div>
                )}
              </div>

              {/* Focus Areas */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Focus Areas
                  </h3>
                </div>
                {selectedInvestor.focus_sectors && selectedInvestor.focus_sectors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedInvestor.focus_sectors.map((sector) => (
                      <Badge
                        key={sector}
                        variant="outline"
                        className="text-sm px-4 py-1"
                      >
                        {sector.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-sm">No Preference</Badge>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 text-lg shadow-lg"
                  onClick={handleOpenPitch}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Meet with {selectedInvestor.name.split(' ')[0]}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
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
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
