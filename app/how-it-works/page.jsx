"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  {
    title: "Unique tools for defining your venture idea, business plan, and business model",
    image: "/slides/startzig1.png"
  },
  {
    title: "Plan your revenue model and financial assumptions",
    image: "/slides/revenue2.png"
  },
  {
    title: "Interactive format and guide for planning BETA, MVP, MLP and uploading mockups",
    image: "/slides/startzig3.png"
  },
  {
    title: "Invite friends to your landing page to provide feedback",
    image: "/slides/startzig13.png"
  },
  {
    title: "Get help from an AI-powered smart mentor at every step",
    image: "/slides/startzig6.png"
  },
  {
    title: "Reach out to virtual angel investors and VCs",
    image: "/slides/startzig7.png"
  },
  {
    title: "Pitch your venture to investors",
    image: "/slides/startzig8.png"
  },
  {
    title: "Secure funding and grow your startup",
    image: "/slides/startzig9.png"
  }
];

export default function HowItWorks() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl">
        
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 px-4 min-h-[100px] flex items-center justify-center">
          {slides[currentSlide].title}
        </h2>
        
        {/* Screenshot Container - FIXED HEIGHT */}
        <div className="relative bg-slate-800 rounded-[20px] shadow-[0_0_80px_rgba(99,102,241,0.3),0_40px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden max-w-[1000px] mx-auto">
          {/* Browser Header */}
          <div className="bg-slate-950 h-10 flex items-center px-4 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Screenshot - FIXED HEIGHT CONTAINER */}
          <div className="relative w-full h-[600px] bg-slate-900 flex items-center justify-center">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              width={1200}
              height={600}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-indigo-500 w-8' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="text-center text-white/60 text-sm mt-4">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
}
