import React from 'react';

export default function StartupDramaBg() {
  const ventures = [
    { name: "FinFlow", status: "fail" },
    { name: "NeuralLogic", status: "winner" }, // השורד
    { name: "EcoGrid", status: "fail" },
    { name: "AI-Core", status: "fail" },
    { name: "HealthLink", status: "fail" },
    { name: "SecureNet", status: "winner" }, // השורד
    { name: "CloudWise", status: "fail" },
    { name: "BioMatch", status: "fail" },
    { name: "SmartLog", status: "fail" },
    { name: "Nexus", status: "fail" }
  ];

  return (
    <>
      <style>{`
        .bg-animation {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #0f0c29; /* רקע כהה ויוקרתי */
        }

        .bg-animation li {
            position: absolute;
            list-style: none;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.6);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
            bottom: -100px;
            opacity: 0;
        }

        /* אנימציה למצליחים - עולים עד הסוף */
        .winner {
            animation: reach-top 12s ease-in-out forwards;
        }

        /* אנימציה לנופלים - עולים וצונחים */
        .fail {
            animation: crash-down 8s ease-in-out forwards;
        }

        @keyframes reach-top {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            30% { transform: translateY(-300px) translateX(40px); }
            60% { transform: translateY(-600px) translateX(-30px); }
            100% { transform: translateY(-1200px) translateX(20px); opacity: 0; }
        }

        @keyframes crash-down {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            15% { opacity: 1; }
            40% { transform: translateY(-400px) translateX(-50px); } /* מגיע לשיא */
            55% { transform: translateY(-380px) translateX(-60px) rotate(10deg); } /* גמגום קטן */
            100% { transform: translateY(200px) translateX(-80px) rotate(45deg); opacity: 0; } /* צניחה חופשית */
        }

        /* פיזור אקראי על המסך */
        ${ventures.map((_, i) => `
          .bg-animation li:nth-child(${i + 1}) { 
            left: ${Math.random() * 80 + 5}%; 
            animation-delay: ${i * 0.8}s; 
          }
        `).join('')}
      `}</style>
      
      <ul className="bg-animation">
        {ventures.map((v, i) => (
          <li key={i} className={v.status}>{v.name}</li>
        ))}
      </ul>
    </>
  );
}