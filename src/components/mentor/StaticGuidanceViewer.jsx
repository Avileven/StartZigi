import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { GUIDANCE_DATA } from "./StaticGuidance";

export default function StaticGuidanceViewer({ isOpen, onClose, sectionId }) {
  const guidance = GUIDANCE_DATA[sectionId];

  if (!isOpen || !guidance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        {/* שינוי: רקע כהה מאוד ואטום יותר כדי להבליט את המודאל */}
        <DialogOverlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />

        <DialogContent
          /* שינוי קריטי: הוספת !bg-white ו-!text-black כדי לעקוף Dark Mode */
          className="fixed left-[50%] top-[50%] z-[101] w-full max-w-3xl h-[80vh] translate-x-[-50%] translate-y-[-50%] flex flex-col p-0 !bg-white !text-slate-900 border border-slate-200 shadow-2xl rounded-xl overflow-hidden [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          style={{ backgroundColor: 'white' }} // אבטחה כפולה
        >
          {/* Header אטום */}
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <DialogTitle className="text-xl font-bold text-slate-900">
                {guidance.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* גוף המודאל - רקע לבן מוחלט */}
          <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-800">
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-base leading-relaxed font-normal">
                {guidance.content}
              </div>

              {guidance.examples && guidance.examples.length > 0 && (
                <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Practical Examples:
                  </h4>
                  <div className="space-y-3">
                    {guidance.examples.map((example, index) => (
                      <div
                        key={index}
                        className="text-sm text-emerald-800 italic bg-white/50 p-2 rounded"
                      >
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer אטום */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <Button 
              onClick={onClose} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}