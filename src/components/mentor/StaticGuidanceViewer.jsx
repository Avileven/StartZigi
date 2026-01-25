import React from "react";
import { BookOpen, X } from "lucide-react";
import { GUIDANCE_DATA } from "./StaticGuidance";

export default function StaticGuidanceViewer({ isOpen, onClose, sectionId }) {
  const guidance = GUIDANCE_DATA[sectionId];

  if (!isOpen || !guidance) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* רקע שחור אטום לגמרי */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(4px)'
        }} 
      />

      {/* הקופסה הלבנה - אטומה ב-100% */}
      <div style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        color: '#111827',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '85vh',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen style={{ color: '#4f46e5', width: '24px', height: '24px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{guidance.title}</h3>
          </div>
          <button onClick={onClose} style={{ cursor: 'pointer', color: '#9ca3af', background: 'none', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '16px', color: '#374151' }}>
            {guidance.content}
          </div>

          {guidance.examples && guidance.examples.length > 0 && (
            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
              <h4 style={{ color: '#065f46', fontWeight: 'bold', marginBottom: '12px', marginTop: 0 }}>Examples:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {guidance.examples.map((ex, i) => (
                  <div key={i} style={{ fontSize: '14px', color: '#065f46', fontStyle: 'italic' }}>"{ex}"</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#4f46e5',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}