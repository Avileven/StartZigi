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
            
            /* אנימציית STARTZIG */
            animation: startzig 30s ease-in-out infinite;
            bottom: -100px;
        }

        /* הגדרת נקודות הציפה - עולה, יורד, זז הצידה */
        @keyframes startzig {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            25% { transform: translateY(-250px) translateX(60px); }    /* עליה וימינה */
            40% { transform: translateY(-180px) translateX(-40px); }   /* ירידה קלה ושמאלה */
            60% { transform: translateY(-500px) translateX(80px); }    /* עליה חדה וימינה */
            75% { transform: translateY(-450px) translateX(-20px); }   /* עוד ירידה קטנה */
            90% { opacity: 1; }
            100% { transform: translateY(-1100px) translateX(0); opacity: 0; } /* יציאה מלמעלה */
        }

        /* פיזור וזמנים שונים כדי שלא יזוזו כגוש אחד */
        .bg-animation li:nth-child(1) { left: 10%; animation-delay: 0s; }
        .bg-animation li:nth-child(2) { left: 25%; animation-delay: 5s; animation-duration: 35s; }
        .bg-animation li:nth-child(3) { left: 45%; animation-delay: 2s; }
        .bg-animation li:nth-child(4) { left: 70%; animation-delay: 8s; animation-duration: 40s; }
        .bg-animation li:nth-child(5) { left: 85%; animation-delay: 1s; }
        .bg-animation li:nth-child(6) { left: 15%; animation-delay: 12s; }
        .bg-animation li:nth-child(7) { left: 55%; animation-delay: 4s; animation-duration: 32s; }
        .bg-animation li:nth-child(8) { left: 35%; animation-delay: 15s; }
        .bg-animation li:nth-child(9) { left: 80%; animation-delay: 3s; }
        .bg-animation li:nth-child(10) { left: 65%; animation-delay: 9s; }
      `}</style>
      
      <ul className="bg-animation">
        {ventures.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ul>
    </>
  );
}