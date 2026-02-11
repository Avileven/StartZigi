"use client"
// src/app/test-phase-modal/page.jsx
// דף בדיקה עצמאי - לא נוגע בכלום במערכת!

import { useState } from 'react';
import PhaseCompletionModal from '@/components/ventures/PhaseCompletionModal';
import { Button } from '@/components/ui/button';

export default function TestPhaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('idea');

  const phases = [
    { id: 'idea', name: 'IDEA → PLAN' },
    { id: 'business_plan', name: 'PLAN → MVP' },
    { id: 'mvp', name: 'MVP → MLP' },
    { id: 'mlp', name: 'MLP → BETA' },
    { id: 'beta', name: 'BETA → GROWTH' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            🎉 Phase Completion Modal Tester
          </h1>
          <p className="text-gray-600 mb-8">
            Test the phase completion modal without touching the real dashboard or database!
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Phase to Test:
              </label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => setIsOpen(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 text-lg font-bold hover:shadow-lg"
            >
              🚀 Launch Modal
            </Button>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Safe Testing:</strong> This page is completely isolated.
                It doesn't touch your dashboard, database, or any real data.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Phase Details:</h2>
            <PhaseInfo phase={selectedPhase} />
          </div>
        </div>
      </div>

      <PhaseCompletionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        completedPhase={selectedPhase}
      />
    </div>
  );
}

function PhaseInfo({ phase }) {
  const info = {
    idea: {
      achievements: ['Venture Created', 'Landing Page Live'],
      challenges: ['Business Plan', 'Funding Plan'],
      valuation: '$0 → $250K',
      capitalInjection: '$15,000'
    },
    business_plan: {
      achievements: ['Business Plan Complete', 'Budget Complete'],
      challenges: ['Build MVP', 'Enter Studio', 'Angel Arena'],
      valuation: '$250K → $500K',
      capitalInjection: 'None'
    },
    mvp: {
      achievements: ['MVP Built'],
      challenges: ['Polish UX', 'Build MLP'],
      valuation: '$500K → $1M',
      capitalInjection: 'None'
    },
    mlp: {
      achievements: ['MLP Launched'],
      challenges: ['Recruit Testers', 'Set Up Analytics'],
      valuation: '$1M → $2M',
      capitalInjection: 'None'
    },
    beta: {
      achievements: ['Beta Testing Done', '50+ Testers'],
      challenges: ['Growth Strategy', 'Marketing Channels'],
      valuation: '$2M → $5M',
      capitalInjection: 'None'
    }
  };

  const current = info[phase];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">✅ Achievements:</h3>
        <ul className="space-y-1 text-sm text-green-700">
          {current.achievements.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-bold text-orange-800 mb-2">🎯 Next Challenges:</h3>
        <ul className="space-y-1 text-sm text-orange-700">
          {current.challenges.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">💰 Valuation:</h3>
        <p className="text-sm text-yellow-700">{current.valuation}</p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-bold text-purple-800 mb-2">💵 Capital Injection:</h3>
        <p className="text-sm text-purple-700">{current.capitalInjection}</p>
      </div>
    </div>
  );
}
