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
import { Loader2 } from 'lucide-react';

export default function MentorModal({ 
  isOpen, 
  onClose, 
  sectionId, 
  sectionTitle, 
  fieldValue, 
  onUpdateField,
  ventureDescription // מוודא שזה כאן
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
      // הפרומפט המדויק שחייב להתייחס לתיאור המיזם
      const prompt = `
        You are a strategic startup mentor. 
        CORE CONTEXT: The startup's business is: "${ventureDescription}".
        CURRENT TASK: Provide guidance on the section: "${sectionTitle}".
        USER'S DRAFT: "${currentText}"

        STRICT INSTRUCTIONS:
        1. RELEVANCE: Your feedback MUST be specific to the business described above (${ventureDescription}). 
        2. NO SOLUTIONS: Do not rewrite the text. Tell the user what is missing or weak.
        3. CASE STUDY: Mention how a successful company in a similar field (e.g., Noom for habits, Headspace for wellness) approached their "${sectionTitle}".
        4. THE "SO WHAT" TEST: Challenge the user to explain why an investor would care about this draft.

        Keep it brief, sharp, and mentor-like.
      `;

      const data = await InvokeLLM({ prompt });
      
      if (data && data.response) {
        setFeedback(data.response);
      } else {
        setFeedback("I couldn't generate feedback. Please check your connection.");
      }
      
    } catch (error) {
      console.error('Error:', error);
      setFeedback('Error getting feedback. Please try again.');
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
          className="fixed left-[50%] top-[50%] z-[10000] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-0 shadow-2xl duration-200 h-[90vh] flex flex-col text-gray-900" 
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50 rounded-t-xl">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Mentor for: {sectionTitle}
              </DialogTitle>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-xl">✕</button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                Think deeply about your '{sectionTitle}'. Your startup's core: <strong>{ventureDescription || "Loading context..."}</strong>
              </p>
              
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={`Write your ${sectionTitle.toLowerCase()} here...`}
                className="min-h-[200px] bg-white text-gray-900 border-gray-300 focus:ring-indigo-500"
              />

              <Button
                type="button"
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || !currentText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6"
              >
                {isGettingFeedback ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  'Get AI Mentor Feedback'
                )}
              </Button>
              
              {feedback && (
                <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                  <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                    <span className="mr-2">💡</span> Mentor Feedback:
                  </h4>
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 rounded-b-xl">
            <div className="flex justify-end gap-3">
               <Button variant="outline" onClick={onClose}>Cancel</Button>
               <Button
                 type="button"
                 onClick={handleUpdateAndClose}
                 className="bg-green-600 hover:bg-green-700 text-white px-8"
               >
                 Save & Close
               </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}