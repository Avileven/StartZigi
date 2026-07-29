// MentorButton
import React from 'react';
import { Button } from '@/components/ui/button';

export default function MentorButton({ onClick, className = "" }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={`w-9 h-9 rounded-full p-0 flex items-center justify-center hover:bg-indigo-50 border-indigo-200 ${className}`}
    >
      <img src="/zig-it-logo.png" alt="Zig it" style={{ height: '20px', width: 'auto' }} />
    </Button>
  );
}