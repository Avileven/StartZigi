"use client";
// ============================================================
// FILE DESTINATION: app/notifications/page.jsx
// This file creates the route /notifications (the Bell icon's page).
// ============================================================

// [ADDED 020826] Mobile Companion project — full page for the Notifications
// icon in ClientLayout's mobile icon row. Per this session's explicit
// decision: not a one-at-a-time popover, shows a real list, 3 at a time
// with a "Load more" button, so nothing is lost even with many messages.
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { VentureMessage } from '@/api/entities';
import { X } from 'lucide-react';

const PAGE_SIZE = 3;

export default function NotificationsPage() {
  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrowth, setIsGrowth] = useState(false); // ZigPulse ventures: no "Updates" heading, per-message delete

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) { setIsLoading(false); return; }
      const { data: ventures } = await supabase
        .from('ventures')
        .select('id, phase')
        .eq('created_by', email)
        .order('created_date', { ascending: false })
        .limit(1);
      if (ventures?.[0]) {
        setIsGrowth(ventures[0].phase === 'growth');
        const { data: msgs } = await supabase
          .from('venture_messages')
          .select('*')
          .eq('venture_id', ventures[0].id)
          .eq('is_dismissed', false)
          .order('created_date', { ascending: false });
        setMessages(msgs || []);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // [ZigPulse] Same action as the desktop dashboard's dismissMessage.
  const dismiss = async (msg) => {
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    try { await VentureMessage.update(msg.id, { is_dismissed: true }); }
    catch (e) { console.error('Could not dismiss message:', e); setMessages(prev => [msg, ...prev]); }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-400 text-sm">Loading updates…</div>;
  }

  return (
    <div className="p-4">
      {/* [ZigPulse] The tab bar already shows "Notifications", so no second heading. */}
      {!isGrowth && <h1 className="font-bold text-xl text-gray-900 mb-4">Updates</h1>}

      {messages.length === 0 ? (
        <p className="text-sm text-gray-400 text-center mt-8">No updates yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.slice(0, visibleCount).map((msg) => (
            <div key={msg.id} className="relative bg-white border border-gray-200 rounded-xl p-4">
              {isGrowth && (
                <button type="button" aria-label="Delete message" onClick={() => dismiss(msg)}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className={`flex items-center gap-2 mb-1 ${isGrowth ? 'pr-8' : ''}`}>
                {msg.message_type === 'example_project' && (
                  <img src="/icons/startzig-lightbulb-icon.svg" alt="" className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="font-semibold text-gray-900">{msg.title}</p>
              </div>
              <p className="text-sm text-gray-600">{msg.content}</p>
              {/* [ADDED 020826] Example Projects — the desktop dashboard has
                  an "Explore Project" button for this message type; this
                  page was fully generic (no action buttons for any message
                  type at all), so this needed adding here too. */}
              {msg.message_type === 'example_project' && msg.from_venture_landing_page_url && (
                <a
                  href={msg.from_venture_landing_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm font-medium text-amber-600"
                >
                  Take me to {msg.from_venture_name || 'the venture'} →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {visibleCount < messages.length && (
        <button
          onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
          className="w-full mt-4 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-indigo-600"
        >
          Load more
        </button>
      )}
    </div>
  );
}
