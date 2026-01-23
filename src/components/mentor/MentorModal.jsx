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
import { supabase } from '@/lib/supabase'; // חיבור לדאטאבייס
import { Loader2 } from 'lucide-react';

export default function MentorModal({ 
  isOpen, 
  onClose, 
  sectionId, 
  sectionTitle, 
  fieldValue, 
  onUpdateField,
  ventureId // אנחנו חייבים את ה-ID כדי למשוך את התיאור
}) {
  const [currentText, setCurrentText] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [ventureDesc, setVentureDesc] = useState(''); // אחסון התיאור מהדאטאבייס

  // שליפת נתוני המיזם ברגע שהמודאל נפתח
  useEffect(() => {
    const fetchVentureContext = async () => {
      if (!ventureId) return;
      
      try {
        const { data, error } = await supabase
          .from('ventures')
          .select('description')
          .eq('id', ventureId)
          .single();

        if (data) {
          setVentureDesc(data.description);
        }
      } catch (err) {
        console.error('Error fetching venture context:', err);
      }
    };

    if (isOpen) {
      setCurrentText(fieldValue || '');
      setFeedback(null);
      fetchVentureContext();
    }
  }, [isOpen, fieldValue, ventureId]);

  const handleGetFeedback = async () => {
    if (!currentText.trim()) {
      alert('Please write some content first.');
      return;
    }

    setIsGettingFeedback(true);
    setFeedback(null);
    try {
      // הפרומפט שמשתמש בנתון שמשכנו מהדאטאבייס
      const prompt = `
        You are an elite startup mentor. 
        CONTEXT: The startup you are mentoring is: "${ventureDesc || 'A new venture'}".
        TASK: Provide feedback on the "${sectionTitle}" section.
        USER DRAFT: "${currentText}"

        STRUCTURE YOUR RESPONSE:
        1. **Critique:** How does this draft align with a ${ventureDesc || 'startup'} model? What's missing?
        2. **Industry Example:** Mention how a successful company (like Noom or Airbnb) approached this.
        3. **Guiding Question:** Ask one question to help the user think deeper.
        
        Keep it concise and do NOT rewrite the text for them.
      `;

      const data = await InvokeLLM({ prompt });
      
      if (data && data.response) {
        setFeedback(data.response);
      } else {
        setFeedback("I couldn't get a response. Please try again.");
      }
      
    } catch (error) {
      console.error('Mentor Error:', error);
      setFeedback('Error connecting to AI mentor.');
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
        >
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50">
            <div className="flex justify-between items-center w-full">
              <div>
                <DialogTitle className="text-xl font-bold">
                  AI Mentor: {sectionTitle}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 italic">
                  Context: {ventureDesc || "Loading startup details..."}
                </DialogDescription>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">✕</button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="max-w-2xl mx-auto space-y-4">
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Write here..."
                className="min-h-[200px] border-gray-300"
              />

              <Button
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || !currentText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12"
              >
                {isGettingFeedback ? <Loader2 className="animate-spin mr-2" /> : 'Get Mentor Feedback'}
              </Button>
              
              {feedback && (
                <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 mt-4">
                  <h4 className="font-bold text-indigo-900 mb-2">💡 Mentor Insight:</h4>
                  <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
             <Button variant="outline" onClick={onClose}>Cancel</Button>
             <Button onClick={handleUpdateAndClose} className="bg-green-600 hover:bg-green-700 text-white px-8">
               Save & Close
             </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}