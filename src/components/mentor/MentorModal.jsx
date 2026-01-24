// MentorModal 240126
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


  // טעינת תיאור המיזם מהדאטאבייס ברקע (ללא הצגה למשתמש)
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


        if (data) {
          setVentureDesc(data.description);
        }
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
        1. Start with the text "Mentor Feedback" exactly.
        2. On the very next line, provide a 10-star scale using "★" for active and "☆" for empty (e.g., ★★★★☆☆☆☆☆☆).
        3. Provide sections: "Analysis:", "Strategic Hints:", and "Challenge Question:".
        4. CRITICAL: Do NOT use any markdown formatting like bolding (**), bullet points (*), or hashtags (#). Use plain text only.
        5. DO NOT provide the rewritten text for the user. Focus on hints.


        Language: English.
      `;


      const data = await InvokeLLM({ prompt });
      setFeedback(data?.response || "No response from AI.");
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
         
          {/* Header נקי ללא Context Box */}
          <DialogHeader className="p-6 border-b bg-slate-50">
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <DialogTitle className="text-2xl font-bold text-indigo-900">
                  Mentor: {sectionTitle}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  AI-driven strategic guidance for your venture.
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl font-light">✕</button>
            </div>
          </DialogHeader>


          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <label className="text-sm font-semibold text-gray-700 block text-left">Your Draft:</label>
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="min-h-[180px] text-base border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Describe your strategy..."
              />


              <Button
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || isLoadingContext || !currentText.trim()}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold transition-all shadow-md"
              >
                {isGettingFeedback ? <Loader2 className="animate-spin mr-2" /> : 'Get Mentor Feedback'}
              </Button>


              {/* אזור הפידבק המעוצב */}
              {feedback && (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-4 text-left">
                    {feedback.split('\n').map((line, index) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;


                      // 1. צביעת הכוכבים בכחול
                      if (trimmedLine.includes('★') || trimmedLine.includes('☆')) {
                        return (
                          <div key={index} className="text-2xl tracking-[0.3em] text-blue-600 font-mono my-2">
                            {trimmedLine}
                          </div>
                        );
                      }


                      // 2. עיצוב הכותרת הראשית בתוך הפידבק
                      if (trimmedLine === "Mentor Feedback") {
                        return (
                          <h3 key={index} className="text-xl font-bold text-indigo-900">
                            {trimmedLine}
                          </h3>
                        );
                      }


                      // 3. עיצוב כותרות משניות (Analysis, Hints, etc)
                      const subHeaders = ['Analysis:', 'Strategic Hints:', 'Challenge Question:'];
                      const isSubHeader = subHeaders.some(h => trimmedLine.startsWith(h));


                      if (isSubHeader) {
                        return (
                          <h4 key={index} className="text-lg font-bold text-indigo-900 mt-6 mb-1">
                            {trimmedLine.replace(':', '')}
                          </h4>
                        );
                      }


                      // 4. טקסט רגיל (נקי מכוכביות)
                      return (
                        <p key={index} className="text-gray-700 leading-relaxed text-base">
                          {trimmedLine}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>


          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
            <Button
              onClick={() => { onUpdateField(currentText); onClose(); }}
              className="bg-green-600 hover:bg-green-700 text-white px-10 shadow-sm"
            >
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

