import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InvokeLLM } from '@/api/integrations';
import { supabase } from '@/lib/supabase';
import { Loader2, MessageSquare } from 'lucide-react';

export default function MentorModal({ 
  isOpen, 
  onClose, 
  sectionId, 
  sectionTitle, 
  fieldValue, 
  onUpdateField,
  ventureId 
}) {
  const [currentText, setCurrentText] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [ventureDesc, setVentureDesc] = useState('');
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  useEffect(() => {
    const fetchVentureContext = async () => {
      if (!ventureId || !isOpen) return;
      setIsLoadingContext(true);
      try {
        const { data } = await supabase
          .from('ventures')
          .select('description')
          .eq('id', ventureId)
          .single();
        if (data) setVentureDesc(data.description);
      } catch (err) {
        console.error('Context fetch failed:', err);
      } finally {
        setIsLoadingContext(false);
      }
    };

    if (isOpen) {
      setCurrentText(fieldValue || '');
      setFeedback(null);
      fetchVentureContext();
    }
  }, [isOpen, fieldValue, ventureId]);

  const handleGetFeedback = async () => {
    if (!currentText.trim()) return;
    setIsGettingFeedback(true);
    setFeedback(null);
    try {
      const prompt = `
        You are an expert startup mentor. 
        Venture Context: "${ventureDesc}"
        Section: "${sectionTitle}"
        User's Draft: "${currentText}"
        Instruction:
        1. Start with "Mentor Feedback" exactly.
        2. Next line: 10-star scale using "★" and "☆".
        3. Sections: "Analysis:", "Strategic Hints:", "Challenge Question:".
        4. No markdown like ** or *. Plain text only.
        Language: English.
      `;
      const data = await InvokeLLM({ prompt });
      setFeedback(data?.response || "No response.");
    } catch (error) {
      setFeedback("Error generating feedback.");
    }
    setIsGettingFeedback(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]" />
        <DialogContent className="fixed left-[50%] top-[50%] z-[10000] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl h-[90vh] flex flex-col p-0 overflow-hidden text-gray-900">
          
          <DialogHeader className="p-6 border-b bg-white">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                {/* הלוגו הממותג עם ה-i הארוכה (AI Hint) */}
                <div className="flex items-baseline italic select-none">
                  <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    z
                  </span>
                  <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent inline-block transform -translate-y-[2px] scale-y-110">
                    i
                  </span>
                  <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    gMentor
                  </span>
                </div>

                <div className="mx-4 h-5 w-[1px] bg-slate-200"></div>
                <DialogTitle className="text-lg font-medium text-slate-500">
                  {sectionTitle}
                </DialogTitle>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl font-light">✕</button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-4 text-left">
              <label className="text-sm font-semibold text-gray-700 block">Your Draft:</label>
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="min-h-[180px] text-base border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Start writing..."
              />

              <Button
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || isLoadingContext || !currentText.trim()}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-md"
              >
                {isGettingFeedback ? <Loader2 className="animate-spin mr-2" /> : 'Get zigMentor Insight'}
              </Button>

              {feedback && (
                <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-4">
                    {feedback.split('\n').map((line, index) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;

                      if (trimmed.includes('★') || trimmed.includes('☆')) {
                        return <div key={index} className="text-2xl tracking-[0.3em] text-blue-600 font-mono my-4">{trimmed}</div>;
                      }

                      if (trimmed === "Mentor Feedback") {
                        return <h3 key={index} className="text-xl font-bold text-indigo-900">Mentor Feedback</h3>;
                      }

                      const subHeaders = ['Analysis:', 'Strategic Hints:', 'Challenge Question:'];
                      if (subHeaders.some(h => trimmed.startsWith(h))) {
                        return <h4 key={index} className="text-lg font-bold text-indigo-900 mt-6">{trimmed.replace(':', '')}</h4>;
                      }

                      return <p key={index} className="text-gray-700 leading-relaxed text-base">{trimmed}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
            <Button onClick={() => { onUpdateField(currentText); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white px-10">
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}