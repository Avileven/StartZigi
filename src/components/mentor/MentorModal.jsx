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
  onUpdateField 
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
      alert('Please write some content first to get feedback.');
      return;
    }

    setIsGettingFeedback(true);
    setFeedback(null);
    try {
      const prompt = `As an expert startup mentor, provide focused feedback on my draft for "${sectionTitle}". My draft is: "${currentText}". Keep your feedback concise and actionable. Structure your response with these two sections ONLY:
- **Areas to strengthen:** [1-2 brief, specific points on what needs improvement]
- **Dig deeper:** [One single, focused question to help me expand my thinking]

Do not include praise, examples, or comparisons.`;

      const response = await InvokeLLM({ prompt });
      setFeedback(response);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Sorry, there was an error getting feedback. Please try again.');
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
        <DialogOverlay />
        <DialogContent 
          className="max-w-4xl h-[90vh] flex flex-col p-0 [&>button]:hidden" 
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-0 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Mentor for: {sectionTitle}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                Take your time to think through and write your '{sectionTitle}' in your own words. When you're ready for feedback, click the button below.
              </p>
              
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={`Write your ${sectionTitle.toLowerCase()} here...`}
                className="min-h-[200px] resize-y"
              />

              <Button
                type="button"
                onClick={handleGetFeedback}
                disabled={isGettingFeedback || !currentText.trim()}
                className="w-full"
              >
                {isGettingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Feedback...
                  </>
                ) : (
                  'Get AI Mentor Feedback'
                )}
              </Button>
              
              {feedback && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Mentor Feedback:</h4>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleUpdateAndClose}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Update & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}