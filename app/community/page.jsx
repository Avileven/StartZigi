"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { ArrowRight, MessageSquare, Rss, Users } from 'lucide-react';

const articles = [
  {
    title: 'How to Craft the Perfect One-Minute Pitch',
    author: 'By Jane Doe, Investor at Nexus Ventures',
    description: 'Nail your first impression with a pitch that is concise, compelling, and memorable. We break down the key components.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
  },
  {
    title: '5 Common Mistakes First-Time Founders Make',
    author: 'By John Smith, Serial Entrepreneur',
    description: 'Learn from the experiences of those who have been there. Avoid these common pitfalls on your entrepreneurial journey.',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    title: 'Finding Your First 100 Customers',
    author: 'By Emily White, Growth Marketer',
    description: 'Traction is everything. Discover actionable strategies to acquire your first users and validate your product-market fit.',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
];

const FounderSpotlight = {
    name: 'Sarah Chen, Founder of EcoHarvest',
    story: 'From a simple idea in her garage to securing $2.5M in simulated funding on StartZig, Sarah\'s journey with EcoHarvest, a sustainable urban farming venture, is a testament to the power of relentless iteration and community feedback. "StartZig gave me a sandbox to fail, learn, and ultimately succeed," says Sarah.',
    imageUrl: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
}

export default function Community() {
  return (
    <div className="bg-gray-900 text-white">
        <nav className="sticky top-0 bg-gray-900/80 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <Link to={createPageUrl("Home")} className="flex-shrink-0">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">StartZig</span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href={createPageUrl("Home") + "#benefits"} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Benefits</a>
                  <Link to={createPageUrl("Community")} className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium">Community</Link>
                  <Link to={createPageUrl("Pricing")} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-800 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-6 text-indigo-400" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Join the <span className="text-indigo-400">Innovation</span> Hub
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
            Connect with fellow founders, share insights, and grow together. This is where the next generation of great ideas takes shape.
          </p>
        </div>
      </div>

      {/* Articles Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">From the Blog</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Actionable Insights for Founders</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.title} className="flex flex-col items-start justify-between">
                <div className="relative w-full">
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="max-w-xl">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time dateTime="2023-10-27" className="text-gray-400">
                      Oct 27, 2023
                    </time>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-white group-hover:text-gray-300">
                      <a href="#">
                        <span className="absolute inset-0" />
                        {article.title}
                      </a>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-300">{article.description}</p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-white">
                          {article.author}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      
      {/* Founder Spotlight */}
      <div className="bg-gray-800/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-base font-semibold leading-7 text-indigo-400">Founder Spotlight</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{FounderSpotlight.name}</p>
                    <p className="mt-6 text-lg leading-8 text-gray-300">{FounderSpotlight.story}</p>
                </div>
                <img 
                    src={FounderSpotlight.imageUrl} 
                    alt={FounderSpotlight.name}
                    className="rounded-2xl shadow-xl"
                />
            </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-6 text-indigo-400"/>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Join the Conversation?</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Sign up today and start your journey with a community of innovators.
          </p>
          <div className="mt-10">
            <Button size="lg" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg">
              Get Started for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <p className="text-center text-xs leading-5 text-gray-400">&copy; 2024 StartZig. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}