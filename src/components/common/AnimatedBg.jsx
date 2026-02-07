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
            /* רקע הוסר - שקוף */
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
            top: 50%; /* מתחילים מאמצע המסך */
            opacity: 0;
        }

        /* אנימציה למצליחים - עולים עד הסוף וגדלים */
        .winner {
            animation: reach-top var(--duration) ease-in-out forwards;
        }

        /* אנימציה לנופלים - עולים קצת, קטנים וצונחים */
        .fail {
            animation: crash-down var(--duration) ease-in-out forwards;
        }

        @keyframes reach-top {
            0% { 
                transform: translateY(0) translateX(0) scale(1); 
                opacity: 0; 
            }
            10% { 
                opacity: 1; 
            }
            30% { 
                transform: translateY(-200px) translateX(40px) scale(1.2); 
            }
            60% { 
                transform: translateY(-400px) translateX(-30px) scale(1.4); 
            }
            100% { 
                transform: translateY(-700px) translateX(20px) scale(1.8); 
                opacity: 0; 
            }
        }

        @keyframes crash-down {
            0% { 
                transform: translateY(0) translateX(0) scale(1); 
                opacity: 0; 
            }
            15% { 
                opacity: 1; 
            }
            35% { 
                transform: translateY(-150px) translateX(-40px) scale(0.95); 
            }
            50% { 
                transform: translateY(-130px) translateX(-50px) rotate(10deg) scale(0.85); 
            }
            100% { 
                transform: translateY(300px) translateX(-80px) rotate(45deg) scale(0.5); 
                opacity: 0; 
            }
        }

        /* פיזור אקראי על המסך */
        ${ventures.map((v, i) => `
          .bg-animation li:nth-child(${i + 1}) { 
            left: ${Math.random() * 80 + 5}%; 
            --duration: ${v.speed}s;
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
