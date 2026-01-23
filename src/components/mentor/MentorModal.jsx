import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InvokeLLM } from '@/api/integrations';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

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
      console.log("DEBUG - Venture ID received:", ventureId);
      
      setIsLoadingContext(true);
      try {
        const { data, error } = await supabase
          .from('ventures')
          .select('description')
          .eq('id', ventureId)
          .single();

        if (data) {
          setVentureDesc(data.description);
        } else if (error) {
          console.error('Supabase error:', error);
          setVentureDesc('ERROR: Could not find venture description in database.');
        }
      } catch (err) {
        setVentureDesc('ERROR: Connection failed.');
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
        You are a startup mentor. 
        Venture Description: "${ventureDesc}"
        Section: "${sectionTitle}"
        Draft: "${currentText}"

        Instruction: Give specific feedback based ONLY on the venture description above. 
        Structure: 1. Critique 2. Real-world example 3. Guiding question.
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
          
          {/* Header עם הצגת התיאור מהדאטאבייס */}
          <DialogHeader className="p-6 border-b bg-slate-50">
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <DialogTitle className="text-2xl font-bold text-indigo-900">
                  Mentor: {sectionTitle}
                </DialogTitle>
                
                {/* כאן התוספת הקריטית - מציגים מה המודאל "רואה" */}
                <div className={`mt-2 p-2 rounded border ${!ventureDesc.includes('ERROR') ? 'bg-indigo-100 border-indigo-200' : 'bg-red-100 border-red-200'}`}>
                  <p className="text-xs font-semibold uppercase text-indigo-700 mb-1">Venture Context (from Database):</p>
                  <p className="text-sm font-medium text-gray-800 italic">
                    {isLoadingContext ? "Fetching description..." : (ventureDesc || "No description found for this ID.")}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">✕</button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <label className="text-sm font-semibold text-gray-700 text-left block">Your Draft:</label>
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="min-h-[180px] text-base border-gray-300 focus:border-indigo-500"
                placeholder="Start writing..."
              />

              <Button
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || isLoadingContext || !currentText.trim()}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold"
              >
                {isGettingFeedback ? <Loader2 className="animate-spin mr-2" /> : 'Get Mentor Feedback'}
              </Button>

              {feedback && (
                <div className="p-6 bg-white border-2 border-indigo-100 rounded-xl shadow-inner animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-indigo-900 font-bold mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" /> Mentor Feedback
                  </h4>
                  <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { onUpdateField(currentText); onClose(); }} className="bg-green-600 hover:bg-green-700 text-white px-10">
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}