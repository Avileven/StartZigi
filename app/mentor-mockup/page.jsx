"use client";
import Link from "next/link";
import MentorMockup from "@/components/utils/MentorMockup";

export default function MentorMockupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950">
      <div className="fixed top-4 left-4 z-50">
        <Link href="/" className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 text-sm font-bold px-5 py-3 rounded-full shadow-lg transition-all">
          ← Back to Home
        </Link>
      </div>
      <MentorMockup autoStart={true} />
    </div>
  );
}
