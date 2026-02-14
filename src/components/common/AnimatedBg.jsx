import React from 'react';

export default function StartupDramaBg() {
  const ventures = [
    { name: "FinFlow", status: "fail", speed: 9 },
    { name: "NeuralLogic", status: "winner", speed: 14 }, 
    { name: "EcoGrid", status: "fail", speed: 7 },
    { name: "AI-Core", status: "fail", speed: 11 },
    { name: "HealthLink", status: "fail", speed: 8 },
    { name: "SecureNet", status: "winner", speed: 16 }, 
    { name: "CloudWise", status: "fail", speed: 10 },
    { name: "BioMatch", status: "fail", speed: 6 },
    { name: "SmartLog", status: "fail", speed: 9 },
    { name: "Nexus", status: "fail", speed: 12 }
  ];

  return (
    <>
      <style>{`
        .bg-animation {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .bg-animation li {
            position: absolute;
            list-style: none;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(2px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.4);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            top: 60%;
            opacity: 0;
            white-space: nowrap;
        }

        /* Winners - הילה ירוקה ותנועה למעלה */
        .winner {
            box-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
            border-color: rgba(52, 211, 153, 0.3) !important;
            color: rgba(52, 211, 153, 0.7) !important;
            animation: reach-top var(--duration) linear infinite;
        }

        /* Fails - הילה אדומה והתרסקות */
        .fail {
            box-shadow: 0 0 10px rgba(248, 113, 113, 0.1);
            border-color: rgba(248, 113, 113, 0.2) !important;
            animation: crash-down var(--duration) linear infinite;
        }

        @keyframes reach-top {
            0% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
            10% { opacity: 1; }
            25% { transform: translateY(-150px) translateX(30px) scale(1); }
            50% { transform: translateY(-300px) translateX(-20px) scale(1.2); }
            75% { transform: translateY(-450px) translateX(40px) scale(1.1); }
            100% { transform: translateY(-700px) translateX(0) scale(1.5); opacity: 0; }
        }

        @keyframes crash-down {
            0% { transform: translateY(0) translateX(0) rotate(0); opacity: 0; }
            10% { opacity: 1; }
            30% { transform: translateY(-80px) translateX(-20px) rotate(-5deg); }
            50% { transform: translateY(50px) translateX(10px) rotate(10deg) scale(0.9); }
            100% { transform: translateY(500px) translateX(-40px) rotate(90deg) scale(0.5); opacity: 0; }
        }

        ${ventures.map((v, i) => `
          .bg-animation li:nth-child(${i + 1}) { 
            left: ${Math.random() * 90}%; 
            --duration: ${v.speed}s;
            animation-delay: ${i * 1.5}s;
            filter: blur(${Math.random() * 2}px); /* אפקט עומק */
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