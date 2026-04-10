"use client";
import Link from "next/link";
import DashboardMockup from "@/components/utils/DashboardMockup";

export default function DashboardMockupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950">
      <div className="fixed top-4 left-4 z-50">
        <Link href="/" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20 transition-all">
          ← Back
        </Link>
      </div>
      <DashboardMockup autoStart={true} />
    </div>
  );
}
