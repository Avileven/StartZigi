"use client";

import React, { useState, useEffect, useRef } from "react";
import { Home, UserCircle, Bell, MessageSquare, Activity, Megaphone, Globe, ChevronRight, ChevronLeft, FileText, BarChart3, ClipboardList } from "lucide-react";

// [NEW — ZigPulse mobile] Scrollable icon bar for Growth (ZigPulse) ventures.
// Lives in its own component so its scroll state/refs stay out of ClientLayout.
export default function GrowthMobileBar({ pathname, router, unreadCount, landingUrl, isIdeaStage, activeKey }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [isIdeaStage]);

  // On the public page, bring the active icon into view.
  useEffect(() => {
    if (!activeKey || !scrollRef.current) return;
    const el = scrollRef.current.querySelector('[data-key="' + activeKey + '"]');
    if (el) scrollRef.current.scrollLeft = Math.max(0, el.offsetLeft - 16);
    updateArrows();
  }, [activeKey]);

  const items = [
    { key: 'home', label: 'Home', Icon: Home, path: '/dashboard', go: () => router.push('/dashboard') },
    { key: 'profile', label: 'My Profile', Icon: Activity, path: '/growth-development', go: () => router.push('/growth-development') },
    { key: 'insights', label: 'Insights', Icon: ClipboardList, path: '/growth-development/feedback', go: () => router.push('/growth-development/feedback') },
    { key: 'promo', label: 'Promotion Center', Icon: Megaphone, path: '/promotion-center', go: () => router.push('/promotion-center') },
    { key: 'feedback', label: 'Product Feedback', Icon: MessageSquare, path: '/product-feedback', go: () => router.push('/product-feedback') },
    { key: 'public', label: 'Public page', Icon: Globe, disabled: !landingUrl || landingUrl === '#', go: () => window.open(landingUrl, '_blank', 'noopener') },
    { key: 'account', label: 'My account', Icon: UserCircle, path: '/my-account', go: () => router.push('/my-account') },
    { key: 'notifications', label: 'Notifications', Icon: Bell, path: '/notifications', go: () => router.push('/notifications'), badge: unreadCount },
    ...(isIdeaStage ? [{ key: 'analysis', label: 'Idea Analysis', Icon: FileText, path: '/plan', alt: ['/businessplan'], go: () => router.push('/plan') }] : []),
    { key: 'revenue', label: 'Revenue Model', Icon: BarChart3, path: '/business-model', go: () => router.push('/business-model') },
  ];

  const current = (pathname || '').replace(/\/+$/, '').replace(/^\/(promotioncenter|promotion)$/, '/promotion-center');
  const isActive = (it) => (activeKey ? it.key === activeKey : false) || !!it.path && (current === it.path || (it.alt || []).includes(current));

  return (
    <div className="md:hidden relative bg-white shadow-sm">
      <div ref={scrollRef} onScroll={updateArrows}
        className="flex gap-1 overflow-x-auto px-3 pt-3 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        {items.map(({ key, label, Icon, disabled, go, badge, ...rest }) => {
          const active = isActive({ key, ...rest });
          return (
            <button key={key} data-key={key} aria-label={label} disabled={disabled} onClick={go}
              className="relative flex-none w-[76px] flex flex-col items-center gap-1.5 disabled:opacity-40">
              <span className={`w-14 h-14 rounded-full flex items-center justify-center bg-indigo-600 text-white transition-shadow ${active ? 'ring-4 ring-indigo-200' : ''}`}>
                <Icon className="w-6 h-6" />
              </span>
              <span className={`text-xs leading-tight text-center ${active ? 'font-semibold text-indigo-700' : 'text-gray-800'}`}>{label}</span>
              {badge > 0 && !active && (
                <span className="absolute top-0 right-3 bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">{badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {canRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-white to-transparent" />
          <button aria-label="Scroll right" onClick={() => scrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
            className="absolute right-1 top-5 w-11 h-11 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-indigo-600">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      {canLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-white to-transparent" />
          <button aria-label="Scroll left" onClick={() => scrollRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
            className="absolute left-1 top-5 w-11 h-11 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-indigo-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
