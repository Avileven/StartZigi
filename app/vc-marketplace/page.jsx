// 180326
"use client";
import React, { useState, useEffect } from 'react';
import { VCFirm } from '@/api/entities';
import { Venture } from '@/api/entities';
import { User } from '@/api/entities';
import { VCMeeting } from '@/api/entities';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Loader2, X, Mail } from 'lucide-react';

const getFirmColor = (firmId, vcMeetings) => {
  const meeting = vcMeetings?.find(m => m.vc_firm_id === firmId);
  if (!meeting) return 'bg-gradient-to-br from-blue-500 to-indigo-600';
  if (meeting.status === 'pending_screening') return 'bg-yellow-400';
  if (meeting.status === 'screening_rejected') return 'bg-red-500';
  if (meeting.status === 'screening_passed' && !meeting.meeting_scheduled_at) return 'bg-purple-300';
  if (['meeting_scheduled', 'meeting_completed', 'followup_scheduling', 'followup_evaluated'].includes(meeting.status)) return 'bg-purple-600';
  if (meeting.status === 'screening_passed' && meeting.meeting_scheduled_at) return 'bg-purple-600';
  return 'bg-gradient-to-br from-blue-500 to-indigo-600';
};

const VCFirmContactModal = ({ firm, venture, vcMeetings }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const canApply = venture && venture.pitch_created && venture.funding_plan_completed;
  const existingMeeting = vcMeetings?.find(m => m.vc_firm_id === firm.id);
  const alreadyApplied = existingMeeting && ['pending_screening', 'screening_passed', 'meeting_scheduled', 'meeting_completed', 'followup_scheduling', 'followup_evaluated', 'screening_rejected'].includes(existingMeeting.status);

  const handleApply = async () => {
    if (!venture) { alert("No active venture found."); return; }
    if (alreadyApplied) { alert("You have already submitted an application to this firm."); return; }
    setIsSending(true);
    try {
      await VCMeeting.create({
        venture_id: venture.id,
        vc_firm_id: firm.id,
        vc_firm_name: firm.name,
        status: 'pending_screening',
        screening_submitted_at: new Date().toISOString(),
      });
      router.push(createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Failed to send application:", error);
      alert("There was an error processing your application. Please try again.");
      setIsSending(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg rounded-xl" disabled={!canApply || alreadyApplied}>
          <Mail className="w-5 h-5 mr-2" />
          {alreadyApplied ? 'Application Submitted' : 'Contact Firm'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-gray-900 shadow-2xl border border-gray-200">
        <DialogHeader>
          <DialogTitle>Contact {firm.name}</DialogTitle>
          <DialogDescription>Send a brief message to introduce your venture.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Your Message</Label>
            <Textarea id="message" placeholder="e.g., We are developing a groundbreaking solution in the AI space..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px]" />
          </div>
          <p className="text-xs text-gray-500 italic">attached is an executive summary of the venture.</p>
        </div>
        <DialogFooter>
          <Button onClick={handleApply} disabled={isSending}>
            {isSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const parseFundingAmount = (fundingInfo) => {
  if (!fundingInfo) return 0;
  const match = fundingInfo.match(/\$(\d+(?:\.\d+)?)\s*(M|B|K)?/i);
  if (!match) return 0;
  const amount = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();
  if (unit === 'B') return amount * 1000;
  if (unit === 'M') return amount;
  if (unit === 'K') return amount / 1000;
  return amount;
};

const formatFunding = (fundingInfo) => {
  if (!fundingInfo) return 'N/A';
  const match = fundingInfo.match(/\$(\d+(?:\.\d+)?)\s*(M|B|K)?/i);
  if (!match) return fundingInfo;
  return `$${match[1]}${match[2] || ''}`;
};

const getCircleSize = (fundingInfo) => {
  const amount = parseFundingAmount(fundingInfo);
  if (amount >= 500) return 'w-48 h-48';
  if (amount >= 200) return 'w-40 h-40';
  if (amount >= 100) return 'w-36 h-36';
  return 'w-32 h-32';
};

export default function VCMarketplace() {
  const [firms, setFirms] = useState([]);
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [vcMeetings, setVcMeetings] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allFirms, user] = await Promise.all([VCFirm.list("-created_date"), User.me()]);
        setFirms(allFirms);
        if (user?.id) {
          let userVentures = [];
          try { userVentures = await Venture.filter({ founder_user_id: user.id }, "-created_date"); } catch (e) { userVentures = []; }
          if (!userVentures || userVentures.length === 0) {
            userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
          }
          if (userVentures.length > 0) {
            setVenture(userVentures[0]);
            try {
              const meetings = await VCMeeting.filter({ venture_id: userVentures[0].id });
              setVcMeetings(meetings);
            } catch (e) { setVcMeetings([]); }
          }
        }
      } catch (error) { console.error("Error loading data:", error); }
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) return <div className="flex h-full w-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-2">VC Marketplace</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Connect with top-tier venture capital firms</p>
          </div>

          <div className="flex justify-center gap-6 mb-8 flex-wrap text-sm text-gray-600">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 inline-block" /> Not contacted</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-yellow-400 inline-block" /> Pending review</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-purple-300 inline-block" /> Interested</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-purple-600 inline-block" /> Meeting scheduled</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500 inline-block" /> Passed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {firms.map((firm, index) => {
              const colorClass = getFirmColor(firm.id, vcMeetings);
              const sizeClass = getCircleSize(firm.funding_info);
              return (
                <div key={firm.id} className="flex flex-col items-center" style={{ animation: `slideIn 0.6s ease-out forwards`, animationDelay: `${index * 0.05}s`, opacity: 0 }}>
                  <button onClick={() => setSelectedFirm(firm)} className={`relative rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer hover:scale-110 hover:shadow-2xl ${colorClass} ${sizeClass}`}>
                    <span className="text-2xl font-black text-white relative z-10 text-center px-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {formatFunding(firm.funding_info)}
                    </span>
                  </button>
                  <p className="mt-3 text-center font-semibold text-gray-900 text-sm max-w-[150px]">{firm.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedFirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500 shadow-2xl bg-white border-0">
            <CardHeader className="relative pb-4 border-b">
              <button onClick={() => setSelectedFirm(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${getFirmColor(selectedFirm.id, vcMeetings)}`}>
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold mb-1">{selectedFirm.name}</CardTitle>
                  {selectedFirm.founded && <p className="text-sm text-gray-600">Founded in {selectedFirm.founded}</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{selectedFirm.background}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFirm.funding_info && <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-600 mb-1">Latest Fund</p><p className="text-lg font-bold text-blue-600">{selectedFirm.funding_info}</p></div>}
                {selectedFirm.typical_check && <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-600 mb-1">Check Size</p><p className="text-lg font-bold text-green-600">{selectedFirm.typical_check}</p></div>}
              </div>
              {selectedFirm.investment_stages?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Investment Stages</p>
                  <div className="flex flex-wrap gap-2">{selectedFirm.investment_stages.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                </div>
              )}
              {selectedFirm.focus_areas?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFirm.focus_areas.map((area, idx) => {
                      const colors = ['bg-green-100 text-green-700','bg-blue-100 text-blue-700','bg-orange-100 text-orange-700','bg-purple-100 text-purple-700'];
                      return <span key={area} className={`px-3 py-1 rounded-full text-sm font-medium ${colors[idx % colors.length]}`}>{area.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</span>;
                    })}
                  </div>
                </div>
              )}
              {selectedFirm.portfolio?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Select Portfolio Companies</p>
                  <div className="space-y-3">
                    {selectedFirm.portfolio.slice(0,3).map((c,i) => <div key={i} className="border-l-4 border-indigo-500 pl-3 py-1"><h4 className="font-semibold text-gray-800">{c.name}</h4><p className="text-sm text-gray-600">{c.description}</p></div>)}
                    {selectedFirm.portfolio.length > 3 && <p className="text-sm text-gray-500 italic">+{selectedFirm.portfolio.length - 3} more companies</p>}
                  </div>
                </div>
              )}
              {selectedFirm.exits?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Notable Exits</p>
                  <div className="space-y-3">
                    {selectedFirm.exits.slice(0,3).map((c,i) => <div key={i} className="border-l-4 border-green-500 pl-3 py-1"><h4 className="font-semibold text-gray-800">{c.name}</h4><p className="text-sm text-gray-600">{c.description}</p></div>)}
                    {selectedFirm.exits.length > 3 && <p className="text-sm text-gray-500 italic">+{selectedFirm.exits.length - 3} more exits</p>}
                  </div>
                </div>
              )}
              <div className="pt-4">
                <VCFirmContactModal firm={selectedFirm} venture={venture} vcMeetings={vcMeetings} />
                {venture && (!venture.pitch_created || !venture.funding_plan_completed) && (
                  <p className="mt-3 text-sm text-red-600 text-center">You must complete your Venture Pitch and Funding Plan before contacting VC firms.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <style jsx global>{`@keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}
