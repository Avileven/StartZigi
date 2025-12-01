import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, BookOpen } from 'lucide-react';
import { GUIDANCE_DATA } from './StaticGuidance';

export default function StaticGuidanceViewer({ isOpen, onClose, sectionId }) {
  const guidance = GUIDANCE_DATA[sectionId];

  if (!guidance) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent 
          className="max-w-3xl h-[80vh] flex flex-col p-0 [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-0 border-b">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {guidance.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {guidance.content}
              </div>
              
              {guidance.examples && guidance.examples.length > 0 && (
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">Examples:</h4>
                  <div className="space-y-3">
                    {guidance.examples.map((example, index) => (
                      <div key={index} className="text-sm text-green-800 italic">
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}