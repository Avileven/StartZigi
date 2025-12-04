
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils/index.js';
import { Trophy, ArrowRight, X } from 'lucide-react';

export default function WelcomeOverlay({ ventureName, onClose }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 7000); // Auto-close after 7 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onClose]);

  const handleContinue = () => {
    onClose();
    router.push(createPageUrl("Dashboard"));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full shadow-2xl relative animate-in fade-in-0 zoom-in-95">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </Button>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            Congratulations!
          </CardTitle>
          <p className="text-lg text-gray-600">
            You've successfully launched <span className="font-bold text-purple-600">{ventureName}</span>!
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">What's Next?</h3>
          <p className="text-gray-600 mb-6">
            You're now ready to start building your business plan. This is where you'll define your strategy, 
            analyze your market, and create a roadmap for success.
          </p>
          <Button 
            onClick={handleContinue}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
