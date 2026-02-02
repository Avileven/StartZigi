"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { Menu, X, Rocket, Users, MessageSquare, Briefcase, ChevronRight, Award } from 'lucide-react';

const projectUpdates = [
  {
    name: 'AquaChain',
    type: 'MVP',
    description: 'מערכת מבוססת AI לניהול חכם של צריכת מים ביתית.',
    callToAction: 'מזמינים משתמשים ראשונים לבדיקת ה-MVP ומתן פידבק ראשוני.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    name: 'EduPath',
    type: 'MLP',
    description: 'פלטפורמת למידה מותאמת אישית שמתמקדת בחוויית המשתמש (Minimum Lovable Product).',
    callToAction: 'מחפשים פאונדרים שרוצים לנסות את ה-MLP ולעזור לנו לדייק את ה-Vibe.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    name: 'GreenTrack',
    type: 'BETA',
    description: 'אפליקציה למעקב אחר טביעת רגל פחמנית של מוצרי צריכה.',
    callToAction: 'נפתחה ההרשמה לגרסת ה-BETA הסגורה. מקומות מוגבלים.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  }
];

export default function Community() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans rtl">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <Link href="/"><span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">StartZig</span></Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 p-2">
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link href="/why-startzig" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Why StartZig</Link>
              <Link href="/community" className="text-white bg-white/10 px-3 py-2 rounded-md text-sm font-medium">Community</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium mr-4">Login</Link>
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">Sign Up</Link>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-white/10 px-4 py-6 space-y-4 text-right">
            <Link href="/why-startzig" className="block text-gray-300 text-lg">Why StartZig</Link>
            <Link href="/community" className="block text-white text-lg font-bold">Community</Link>
            <Link href="/pricing" className="block text-gray-300 text-lg">Pricing</Link>
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
              <Link href="/login" className="text-center text-white py-3 rounded-xl border border-white/10 font-bold">Login</Link>
              <Link href="/register" className="text-center bg-indigo-600 text-white py-3 rounded-xl font-bold">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Startup <span className="text-indigo-500">Feed</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            מה קורה עכשיו ב-StartZig: מיזמים חדשים, עדכוני פיתוח והזדמנויות להשקעה.
          </p>
        </div>
      </section>

      {/* VC Announcement - הודעה על הקרן החדשה */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-500 p-4 rounded-2xl shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold">חדש במערכת: Nexus Capital</h3>
              <p className="text-indigo-200 opacity-80 mt-1">קרן הון סיכון המתמחה ב-Early Stage הצטרפה כשותפה רשמית.</p>
            </div>
          </div>
          <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-indigo-100 transition-colors">
            לצפייה בפרופיל הקרן
          </button>
        </div>
      </section>

      {/* Projects Feed - הלוח עם המיזמים שביקשת */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <h2 className="text-2xl font-bold mb-8 text-right flex items-center gap-2 justify-end">
          <Rocket className="w-6 h-6 text-indigo-400" />
          עדכוני מיזמים חמים
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {projectUpdates.map((project) => (
            <div key={project.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-right">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 justify-end">
                  <span className={`text-xs font-black px-2 py-1 rounded-md ${project.bg} ${project.color}`}>
                    {project.type}
                  </span>
                  <h3 className="text-xl font-bold">{project.name}</h3>
                </div>
                <p className="text-slate-400 text-sm max-w-xl">{project.description}</p>
                <p className="text-indigo-300 text-sm font-medium mt-1">{project.callToAction}</p>
              </div>
              <button className="flex items-center gap-2 text-white bg-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
                צרו קשר
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Paul Graham Quote - השארנו בשביל האמינות */}
      <section className="py-20 px-6 bg-indigo-600/5 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl italic text-slate-300 leading-relaxed mb-6">
            "הדרך היחידה לעשות עבודה מצוינת היא לאהוב את מה שאתה עושה. בסטארטאפים, זה אומר לאהוב את ה-Zig."
          </p>
          <p className="font-bold text-white">— פול גרהם, Y Combinator</p>
        </div>
      </section>
    </div>
  );
}