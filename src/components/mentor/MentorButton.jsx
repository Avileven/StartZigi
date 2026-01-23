// MentorButton
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function MentorButton({ onClick, className = "" }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      Mentor
    </Button>
  );
}