"use client"
import React from 'react';
import Link from 'next/link';

export default function JourneyPreview() {
  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Experience the Full Entrepreneurial Journey
      </h2>
      
      <Link href="/journey" className="block relative group cursor-pointer">
        {/* MVP Complete Preview - Static Image */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-200 group-hover:border-purple-400 transition-all duration-300 group-hover:shadow-purple-200/50 group-hover:scale-[1.02]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-1 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xl">×</span>
            </div>
          </div>

          {/* Dashboard */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-2">
            
            <div className="grid grid-cols-4 gap-8 items-start">
              
              {/* Left 3 columns: Title + 3 Indicators */}
              <div className="col-span-3">
                {/* Title */}
                <div className="text-center mb-2">
                  <h1 className="text-lg font-bold text-orange-400">
                    MVP Phase Complete!
                  </h1>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* EQUITY */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">Equity</div>
                    <div className="text-4xl font-black text-gray-100">
                      90%
                    </div>
                  </div>

                  {/* VALUATION */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-yellow-300 mb-1 uppercase tracking-wider">Valuation</div>
                    <div className="text-4xl font-black text-yellow-400">
                      $1M
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-green-300 mb-1 uppercase tracking-wider">Progress</div>
                    <div className="text-4xl font-black text-green-400">
                      60%
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: CLOCK */}
              <div className="flex justify-center items-center">
                <svg viewBox="0 0 200 200" className="w-36 h-36">
                  <circle cx="100" cy="100" r="90" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                  <circle 
                    cx="100" cy="100" r="90" 
                    fill="none" 
                    stroke="#fb923c"
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="565"
                    strokeDashoffset={565 * (1 - 60 / 100)}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '100px 100px'
                    }}
                  />
                  <circle cx="100" cy="100" r="70" fill="rgba(147,51,234,0.3)" />
                  <text x="100" y="30" className="text-xs font-bold" fill="rgba(255,255,255,0.5)" textAnchor="middle">IDEA</text>
                  <text x="160" y="80" className="text-xs font-bold" fill="rgba(255,255,255,0.5)" textAnchor="middle">PLAN</text>
                  <text x="140" y="155" className="text-xs font-bold" fill="#f97316" textAnchor="middle">MVP</text>
                  <text x="60" y="155" className="text-xs font-bold" fill="rgba(255,255,255,0.5)" textAnchor="middle">MLP</text>
                  <text x="40" y="80" className="text-xs font-bold" fill="rgba(255,255,255,0.5)" textAnchor="middle">BETA</text>
                  <path 
                    fill="rgba(156, 163, 175, 0.6)"
                    d="M98 100 L102 100 L102 35 L98 35 Z"
                    style={{
                      transform: 'rotate(144deg)',
                      transformOrigin: '100px 100px'
                    }}
                  />
                  <circle cx="100" cy="100" r="4" fill="rgba(156, 163, 175, 0.8)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content Preview - Blurred */}
          <div className="grid grid-cols-2 gap-6 px-8 py-3 blur-sm">
            
            {/* Left: Challenges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-500"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded-r-lg">
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded-r-lg">
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>

            {/* Right: Achievements */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
                <div className="h-4 bg-gray-300 rounded w-40"></div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r-lg">
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r-lg">
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-purple-600 group-hover:bg-purple-700 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
            <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
          </div>
        </div>

        {/* Text Below */}
        <div className="text-center mt-6">
          <p className="text-xl font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
            Watch the Complete StartZig Journey
          </p>
          <p className="text-sm text-gray-500 mt-2">
            From IDEA to BETA - See how entrepreneurs progress through each phase
          </p>
        </div>
      </Link>
    </div>
  );
}
