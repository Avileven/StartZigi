"use client";
import React, { useEffect } from 'react';
import JourneyPreview from "@/components/utils/JourneyPreview";

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 text-white min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            The StartZig Journey
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-3xl">
          From your first idea to a funded, growing venture — watch how StartZig guides you through every phase of the startup journey, with real milestones, tools, and challenges along the way.
        </p>
      </div>
      <JourneyPreview />
    </div>
  );
}
