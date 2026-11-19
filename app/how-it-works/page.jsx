"use client";
import React, { useEffect } from 'react';
import JourneyPreview from "@/components/utils/JourneyPreview";

export default function HowItWorks() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white text-gray-900 min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 pb-3 leading-relaxed">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block pb-2">
            The StartZig Journey
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          From your first idea to a funded, growing venture — watch how StartZig guides you through every phase of the startup journey, with real milestones, tools, and challenges along the way.
        </p>
      </div>
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">How feedback works</h2>
        <video
          className="w-full rounded-2xl shadow-lg border border-gray-200 bg-black aspect-video"
          src="/feedback-example.mp4"
          poster="/feedback-example-poster.jpg"
          controls
          playsInline
          preload="metadata"
        />
      </div>
      <JourneyPreview />
    </div>
  );
}
