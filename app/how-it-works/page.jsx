
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 px-4">
              {slide.title}
            </h2>
            
            <div className="relative bg-slate-800 rounded-[20px] shadow-[0_0_80px_rgba(99,102,241,0.3),0_40px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden max-w-[1000px] mx-auto">
              {/* Browser Header */}
              <div className="bg-slate-950 h-10 flex items-center px-4 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              {/* Screenshot */}
              <div className="relative w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  priority={index === 0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
