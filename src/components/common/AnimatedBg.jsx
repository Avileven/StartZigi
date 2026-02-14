import React from 'react';

export default function StartupDramaBg() {
  const ventures = [
    { name: "FinFlow", status: "fail", speed: 12 },
    { name: "NeuralLogic", status: "winner", speed: 15 }, 
    { name: "EcoGrid", status: "fail", speed: 10 },
    { name: "AI-Core", status: "fail", speed: 13 },
    { name: "HealthLink", status: "fail", speed: 11 },
    { name: "SecureNet", status: "winner", speed: 18 }, 
    { name: "CloudWise", status: "fail", speed: 14 },
    { name: "BioMatch", status: "fail", speed: 9 },
    { name: "SmartLog", status: "fail", speed: 12 },
    { name: "Nexus", status: "winner", speed: 16 }
  ];

  return (
    <>
      <style>{`
        .bg-animation {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        }

        .bg-animation li {
            position: absolute;
            list-style: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 800;
            top: 60%;
            opacity: 0;
            white-space: nowrap;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* Winners - הופכים לצבעוניים וברורים ככל שהם עולים */
        .winner {
            border: 1px solid rgba(52, 211, 153, 0.2);
            animation: emerge-and-rise var(--duration) linear infinite;
        }

        /* Fails - נשארים עמומים ומתרסקים */
        .fail {
            border: 1px solid rgba(255, 255, 255, 0.05);
            animation: crash-down var(--duration) linear infinite;
        }

        @keyframes emerge-and-rise {
            0% { 
                transform: translateY(0) scale(0.9); 
                opacity: 0; 
                color: rgba(255, 255, 255, 0.1);
                background: transparent;
            }
            20% { 
                opacity: 0.4; 
                color: rgba(255, 255, 255, 0.3);
            }
            50% { 
                opacity: 1; 
                color: #34d399; /* ירוק ברור */
                background: rgba(52, 211, 153, 0.1);
                border-color: rgba(52, 211, 153, 0.5);
                transform: translateY(-250px) translateX(20px) scale(1.1);
            }
            100% { 
                transform: translateY(-700px) translateX(-10px) scale(1.3); 
                opacity: 0; 
                color: #34d399;
            }
        }

        @keyframes crash-down {
            0% { transform: translateY(0) opacity: 0; }
            10% { opacity: 0.2; color: rgba(255, 255, 255, 0.2); }
            30% { transform: translateY(-50px); opacity: 0.3; }
            100% { transform: translateY(400px) rotate(15deg); opacity: 0; }
        }

        ${ventures.map((v, i) => `
          .bg-animation li:nth-child(${i + 1}) { 
            left: ${Math.random() * 85 + 5}%; 
            --duration: ${v.speed}s;
            animation-delay: ${i * 2}s; 
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