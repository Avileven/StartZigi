// MentorButton
import React from 'react';
import { Button } from '@/components/ui/button';

export default function MentorButton({ onClick, className = "" }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center hover:bg-indigo-50 border-indigo-200 ${className}`}
    >
      <span
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 300,
          letterSpacing: '1.5px',
          color: '#E08D3C',
          display: 'flex',
          alignItems: 'flex-end',
          fontSize: '15px',
        }}
      >
        <span>zig</span>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span>ı</span>
          <svg
            style={{ position: 'absolute', top: '-11px', left: 'calc(50% - 1px)', transform: 'translateX(-50%)' }}
            width="9"
            height="9"
            viewBox="0 0 24 24"
          >
            <path d="M12 0 C12 6 14 9 20 12 C14 15 12 18 12 24 C12 18 10 15 4 12 C10 9 12 6 12 0 Z" fill="#E08D3C" />
          </svg>
        </span>
        <span>t</span>
      </span>
    </Button>
  );
}