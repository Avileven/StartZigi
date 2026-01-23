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
import { Loader2 } from 'lucide-react';

export default function MentorModal({ 
  isOpen, 
  onClose, 
  sectionId, 
  sectionTitle, 
  fieldValue, 
  onUpdateField,
  ventureDescription 
}) {
  const [currentText, setCurrentText] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentText(fieldValue || '');
      setFeedback(null);
    }
  }, [isOpen, fieldValue]);

  const handleGetFeedback = async () => {
    if (!currentText.trim()) {
      alert('Please write some content first.');
      return;
    }

    setIsGettingFeedback(true);
    setFeedback(null);
    try {
      // הפרומפט החדש והמבני
      const prompt = `
        You are a world-class startup mentor. 
        STARTUP CONTEXT: "${ventureDescription || "A startup venture"}"
        SECTION BEING WRITTEN: "${sectionTitle}"
        ENTREPRENEUR'S DRAFT: "${currentText}"

        STRICT INSTRUCTIONS:
        1. CRITIQUE: Analyze the draft specifically for the context of ${ventureDescription}. What is missing to make it investor-ready?
        2. REAL-WORLD EXAMPLE: Briefly mention how a famous company (like Noom, Airbnb, or Tesla) handled their "${sectionTitle}".
        3. GUIDING QUESTION: Ask one tough question to help the user refine their thinking.
        
        Note: Do not rewrite the draft for them. Keep it professional and direct.
      `;

      const data = await InvokeLLM({ prompt });
      
      // בדיקה שהתגובה חזרה כטקסט ולא כאובייקט
      if (data && data.response) {
        setFeedback(data.response);
      } else {
        setFeedback("Mentor is thinking... but no response came back. Please try again.");
      }
      
    } catch (error) {
      console.error('Mentor Error:', error);
      setFeedback('Sorry, I ran into an error. Please check your API key or connection.');
    }
    setIsGettingFeedback(false);
  };

  const handleUpdateAndClose = () => {
    onUpdateField(currentText);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
        <DialogContent 
          className="fixed left-[50%] top-[50%] z-[10000] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-0 shadow-2xl h-[90vh] flex flex-col text-gray-900" 
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50 rounded-t-xl">
            <div className="flex justify-between items-center w-full text-left" dir="ltr">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  AI Mentor: {sectionTitle}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Strategic guidance for: {ventureDescription || "Your startup"}
                </DialogDescription>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl p-2">✕</button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="max-w-2xl mx-auto space-y-4">
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={`Describe your ${sectionTitle.toLowerCase()}...`}
                className="min-h-[200px] bg-white text-gray-900 border-gray-300"
              />

              <Button
                type="button"
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || !currentText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12"
              >
                {isGettingFeedback ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Consulting with Mentor...
                  </>
                ) : (
                  'Get Mentor Feedback'
                )}
              </Button>
              
              {feedback && (
                <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in duration-500">
                  <h4 className="font-bold text-indigo-900 mb-2">Mentor Feedback:</h4>
                  <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
             <Button variant="outline" onClick={onClose} className="text-gray-700">Cancel</Button>
             <Button onClick={handleUpdateAndClose} className="bg-green-600 hover:bg-green-700 text-white px-8">
               Save & Close
             </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}