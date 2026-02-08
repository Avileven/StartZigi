'use client';
import React, { useState } from 'react';

// ריכוז הנתונים במקום אחד כדי שיהיה קל לעדכן
const allArticles = [
  {
    id: 1,
    category: 'tips',
    title: 'Building an MVP Fast',
    readTime: '5 min',
    desc: 'How to prioritize features and launch your product in record time.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600'
  },
  {
    id: 2,
    category: 'ai',
    title: 'The Future of AI in Startups',
    readTime: '8 min',
    desc: 'How Artificial Intelligence is changing the way companies are built.',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600'
  },
  {
    id: 3,
    category: 'success',
    title: 'UrbanPulse: From Simulation to Reality',
    readTime: '11 min',
    desc: 'Moving from StartZig to the real world - $5M raised and a thriving community.',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600'
  },
  {
    id: 4,
    category: 'ai',
    title: 'No-Code + AI: The Winning Combo',
    readTime: '8 min',
    desc: 'How to build a startup without writing code using modern AI tools.',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600'
  },
  {
    id: 5,
    category: 'tips',
    title: 'Essential Metrics for Founders',
    readTime: '6 min',
    desc: 'Key indicators to help you understand if your startup is on the right track.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
  },
  {
    id: 6,
    category: 'tips',
    title: 'How to Find the Perfect Co-Founder',
    readTime: '7 min',
    desc: 'A guide to finding a business partner who fits your vision and values.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'
  }
];

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredArticles = activeTab === 'all' 
    ? allArticles 
    : allArticles.filter(article => article.category === activeTab);

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'tips', label: 'Founder Tips' },
    { id: 'ai', label: 'AI & Tech' },
    { id: 'success', label: 'Success Stories' }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Header עם הגרדיאנט שביקשת */}
      <header className="pt-24 pb-12 px-[10%] bg-[radial-gradient(circle_at_50%_0%,#22325a_0%,#000000_60%)]">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
          StartZig Insights
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          The founder's guide to building, scaling, and mastering AI.
        </p>
      </header>

      <main className="max-w-[1400px] mx-auto px-[10%] py-12 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="sticky top-24 h-fit">
          <nav>
            <ul className="space-y-1 border-r border-zinc-800">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`cursor-pointer py-3 px-4 transition-all duration-200 font-medium ${
                    activeTab === cat.id 
                    ? 'text-indigo-500 border-r-2 border-indigo-500 bg-indigo-500/5' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                  }`}
                >
                  {cat.label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Articles Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredArticles.map((article) => (
            <article 
              key={article.id} 
              className="group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900 mb-4">
                <img 
                  src={article.img} 
                  alt={article.title}
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                <span>{article.readTime} Read</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                <span>{categories.find(c => c.id === article.category)?.label}</span>
              </div>
              <h3 className="text-xl font-bold leading-tight group-hover:text-indigo-300 transition-colors">
                {article.title}
              </h3>
              <p className="text-zinc-500 text-sm mt-3 line-clamp-2">
                {article.desc}
              </p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}