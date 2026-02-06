import React from 'react';

export default function AnimatedBg() {
  const ventures = [
    "FinFlow", "NeuralLogic", "EcoGrid", "AI-Core", 
    "HealthLink", "SecureNet", "CloudWise", "BioMatch", 
    "SmartLog", "Nexus"
  ];

  return (
    <>
      <style>{`
        .bg-animation {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            margin: 0;
            padding: 0;
        }

        .bg-animation li {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            list-style: none;
            
            /* עיצוב תגית יוקרתי */
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.6);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            white-space: nowrap;

            /* אנימציה נקייה ללא סיבוב */
            animation: animate-float 25s linear infinite;
            bottom: -150px;
        }

        /* פיזור אקראי של המיזמים */
        .bg-animation li:nth-child(1) { left: 10%; animation-duration: 20s; }
        .bg-animation li:nth-child(2) { left: 25%; animation-duration: 25s; animation-delay: 2s; }
        .bg-animation li:nth-child(3) { left: 45%; animation-duration: 22s; animation-delay: 4s; }
        .bg-animation li:nth-child(4) { left: 70%; animation-duration: 28s; }
        .bg-animation li:nth-child(5) { left: 85%; animation-duration: 18s; animation-delay: 1s; }
        .bg-animation li:nth-child(6) { left: 15%; animation-duration: 30s; animation-delay: 5s; }
        .bg-animation li:nth-child(7) { left: 55%; animation-duration: 24s; animation-delay: 8s; }
        .bg-animation li:nth-child(8) { left: 35%; animation-duration: 26s; animation-delay: 12s; }
        .bg-animation li:nth-child(9) { left: 80%; animation-duration: 21s; animation-delay: 3s; }
        .bg-animation li:nth-child(10) { left: 65%; animation-duration: 29s; }

        @keyframes animate-float {
            0% {
                transform: translateY(0);
                opacity: 0;
            }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% {
                transform: translateY(-1200px);
                opacity: 0;
            }
        }
      `}</style>
      
      <ul className="bg-animation">
        {ventures.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </>
  );
}