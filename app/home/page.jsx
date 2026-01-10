
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="bg-gray-900">
      <div className="relative isolate overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        >
          <defs>
            <pattern
              id="1d4240dd-898f-445f-932d-e2872fd12de3"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-800/20">
            <path
              d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-200 400h201v201h-201Z M600 400h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)"
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-15rem)] xl:left-[calc(50%-24rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            {/* 🔒 לא נוגע בסלוגן */}
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Build your next big idea — like a game.
            </h1>

            {/* ✅ עודכן תוכן בלבד */}
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Read about big tech exits and thought “I wish I could try that”? StartZig lets you build a startup from
              idea → pitch → funding → growth in a safe, gamified simulation.
            </p>

            <div className="mt-10 flex items-center gap-x-6">
              <Button
                onClick={handleLogin}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg"
              >
                Start Your Journey
              </Button>

              <Link href="/venture-landing" className="text-sm font-semibold leading-6 text-white">
                Explore a public venture <span aria-hidden="true">→</span>
              </Link>
            </div>

            <dl className="mt-10 max-w-xl space-y-6 text-base leading-7 text-gray-300 lg:max-w-none">
              <div className="relative pl-9">
                <dt className="inline font-semibold text-white">Idea</dt>{" "}
                <dd className="inline">
                  Name it, describe it, and publish a landing page to see if your story clicks with people.
                </dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-white">Business Plan</dt>{" "}
                <dd className="inline">
                  Turn the idea into a plan: market, customers, pricing, and a roadmap you can defend.
                </dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-white">MVP</dt>{" "}
                <dd className="inline">
                  Design your MVP and collect structured feedback from mentors, testers, and your community.
                </dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-white">MLP / Beta / Growth</dt>{" "}
                <dd className="inline">
                  Refine into MLP/Beta, prepare for fundraising, and push toward growth milestones.
                </dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="rounded-md bg-white/5 p-8 ring-1 ring-white/10">
                <h2 className="text-2xl font-bold text-white">Who is StartZig for?</h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                    <h3 className="text-lg font-semibold text-white">1) Simulation Players</h3>
                    <p className="mt-2 text-base leading-7 text-gray-400">
                      Play a full startup journey as a simulation—make decisions, unlock phases, and chase your own
                      virtual exit.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                    <h3 className="text-lg font-semibold text-white">2) Founders with an Idea</h3>
                    <p className="mt-2 text-base leading-7 text-gray-400">
                      Test your idea before you spend real time or money: get structured feedback, sharpen your pitch,
                      and build confidence with investors.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                    <h3 className="text-lg font-semibold text-white">3) Students & Learning Programs</h3>
                    <p className="mt-2 text-base leading-7 text-gray-400">
                      Learn entrepreneurship by doing: guided templates, real-world skills, and team-style
                      collaboration—perfect for classes, bootcamps, and self-study.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                    <h3 className="text-lg font-semibold text-white">4) Mentors & Communities</h3>
                    <p className="mt-2 text-base leading-7 text-gray-400">
                      Discover promising ventures early, give focused feedback, and help founders level up with clear,
                      structured guidance.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-indigo-500/10 p-6 ring-1 ring-indigo-400/20">
                  <h3 className="text-lg font-semibold text-white">Example ventures you can build</h3>
                  <ul className="mt-3 space-y-2 text-gray-300">
                    <li>• QuitFlow — a habit-change app with a coached MVP and tester feedback loop</li>
                    <li>• EcoWaste AI — a B2B tool that reduces waste and forecasts demand</li>
                    <li>• UrbanConnect — a marketplace that helps cities coordinate services efficiently</li>
                    <li>• CareCompanion — a lightweight health support platform for families & caregivers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


