"use client";
import React, { useEffect } from 'react';

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white text-gray-900 py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto mb-5 md:mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            From Feedback to Insight
          </span>
        </h1>
      </div>
      <div className="max-w-4xl mx-auto md:hidden">
        <video
          className="w-full rounded-2xl shadow-lg border border-gray-200 bg-black aspect-[19/18]"
          src="/feedback-example-square.mp4"
          poster="/feedback-example-square-poster.jpg"
          controls
          playsInline
          preload="metadata"
        />
      </div>
      <div className="max-w-4xl mx-auto hidden md:block">
        <video
          className="w-full rounded-2xl shadow-lg border border-gray-200 bg-black aspect-video"
          src="/feedback-example.mp4"
          poster="/feedback-example-poster.jpg"
          controls
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
}
