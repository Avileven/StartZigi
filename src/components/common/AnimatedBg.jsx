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
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.6);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
            
            /* רץ פעם אחת בלבד למשך 10 שניות ונעצר בסוף */
            animation: startzig-once 10s ease-in-out forwards;
            bottom: -100px;
            opacity: 0;
        }

        @keyframes startzig-once {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            15% { opacity: 1; }
            30% { transform: translateY(-300px) translateX(50px); }
            50% { transform: translateY(-200px) translateX(-30px); } /* ירידה בזיגזג */
            70% { transform: translateY(-600px) translateX(40px); opacity: 1; }
            100% { transform: translateY(-1200px) translateX(0); opacity: 0; } /* נעלם למעלה */
        }

        /* פיזור התחלתי שונה לכל אחד */
        .bg-animation li:nth-child(1) { left: 10%; animation-delay: 0.1s; }
        .bg-animation li:nth-child(2) { left: 25%; animation-delay: 0.5s; }
        .bg-animation li:nth-child(3) { left: 45%; animation-delay: 0.2s; }
        .bg-animation li:nth-child(4) { left: 70%; animation-delay: 0.8s; }
        .bg-animation li:nth-child(5) { left: 85%; animation-delay: 0.3s; }
        .bg-animation li:nth-child(6) { left: 15%; animation-delay: 1.2s; }
        .bg-animation li:nth-child(7) { left: 55%; animation-delay: 0.4s; }
        .bg-animation li:nth-child(8) { left: 35%; animation-delay: 1.5s; }
        .bg-animation li:nth-child(9) { left: 80%; animation-delay: 0.6s; }
        .bg-animation li:nth-child(10) { left: 65%; animation-delay: 0.9s; }
      `}</style>
      
      <ul className="bg-animation">
        {ventures.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </>
  );
}