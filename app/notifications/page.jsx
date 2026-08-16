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

const PAGE_SIZE = 3;

export default function NotificationsPage() {
  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) { setIsLoading(false); return; }
      const { data: ventures } = await supabase
        .from('ventures')
        .select('id')
        .eq('created_by', email)
        .order('created_date', { ascending: false })
        .limit(1);
      if (ventures?.[0]) {
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

  if (isLoading) {
    return <div className="p-6 text-center text-gray-400 text-sm">Loading updates…</div>;
  }

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl text-gray-900 mb-4">Updates</h1>

      {messages.length === 0 ? (
        <p className="text-sm text-gray-400 text-center mt-8">No updates yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.slice(0, visibleCount).map((msg) => (
            <div key={msg.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-1">{msg.title}</p>
              <p className="text-sm text-gray-600">{msg.content}</p>
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
