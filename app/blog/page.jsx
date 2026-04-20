'use client';
import React, { useState } from 'react';

const allArticles = [
  {
    id: 1,
    category: 'tips',
    title: 'Building an MVP Fast',
    readTime: '5 min',
    desc: 'How to prioritize features and launch your product in record time.',
    accent: '#6366f1',
    content: `Most founders build too much before talking to users. The MVP is not a smaller version of your product — it is the smallest thing that tests your core assumption.

Start by writing down the one question your startup needs to answer. Not "will people use this?" but something specific: "Will busy professionals pay $15/month to save 30 minutes of admin work per day?" That question is your MVP brief.

Strip everything that does not directly answer that question. If your app needs a dashboard, an onboarding flow, a settings page, and a notifications system — and your core assumption is about whether people will pay — launch with just the feature that delivers the value. The rest is polish.

The fastest MVPs are built around a single workflow. One problem, one solution, one call to action. Airbnb's first version was a single page with three air mattresses listed. Dropbox's MVP was a video. Buffer's was a two-page website with a fake pricing page that measured intent.

Ship in weeks, not months. Set a hard deadline — four weeks from today — and cut everything that does not fit. You will learn more from 50 real users in four weeks than from six months of building in isolation.

Talk to users before you finish building. The conversations you have while building will change what you build. That is the point.`
  },
  {
    id: 2,
    category: 'ai',
    title: 'The Future of AI in Startups',
    readTime: '8 min',
    desc: 'How Artificial Intelligence is changing the way companies are built.',
    accent: '#8b5cf6',
    content: `Three years ago, building an AI-powered product required a machine learning team, months of training data, and significant infrastructure. Today, a solo founder can integrate GPT-level intelligence into a product in an afternoon.

This shift is not just about cost. It is about what is now possible for small teams.

AI has collapsed several startup categories that previously required scale. Customer support, content generation, data analysis, code review, legal document drafting — all of these used to require either headcount or expensive enterprise software. A two-person startup can now compete directly with established players in these areas.

But the more interesting change is in product design. The best AI-powered startups are not just adding AI as a feature. They are rethinking what the product does at the core. Instead of "a tool that helps you write" — "a collaborator that understands your voice, your audience, and your goals." The interface changes. The value changes. The relationship with the user changes.

The founders who will win in the next five years are not the ones who use AI most aggressively. They are the ones who understand what humans still do better — judgment, relationships, creativity at the edges — and build products that combine both.

The question is not whether your startup will use AI. It is whether you are using it to do what you already do faster, or to do something that was previously impossible.`
  },
  {
    id: 3,
    category: 'success',
    title: 'The Business Plan That Won the Room',
    readTime: '11 min',
    desc: 'What separates a business plan investors remember from one they forget.',
    accent: '#10b981',
    content: `Most business plans fail before they are read. Not because the business is weak — but because the document does not communicate what makes it strong.

Investors read hundreds of plans. They are looking for reasons to say no quickly and reasons to pay attention. Your job is to make the second happen in the first two pages.

The most common mistake is leading with the product. Investors do not fund products — they fund markets, teams, and momentum. Your opening should answer three questions immediately: how large is the problem, why is now the right time to solve it, and why are you the right team.

The market section is where most plans lose credibility. Founders write "the global market is $50 billion" and expect that to be compelling. It is not. What matters is the specific segment you can own, how large that segment is, and how you reach it. A $50M market you can realistically capture 10% of is more fundable than a $50B market you have no clear path into.

The financial projections section should show that you understand your unit economics, not that you can build a spreadsheet. State your CAC, your LTV, your monthly burn, and the assumptions behind your revenue forecast. Investors will challenge every number — the goal is not to be right, but to show you understand the levers.

The best business plans end with a clear ask: how much you are raising, what you will use it for, and what milestones it will get you to. Not a range. A number. Not "general growth." Specific milestones. "Reach 10,000 paying users and close 3 enterprise pilots within 18 months" is a fundable milestone. "Scale the business" is not.`
  },
  {
    id: 4,
    category: 'ai',
    title: 'No-Code + AI: The Winning Combo',
    readTime: '8 min',
    desc: 'How to build a startup without writing code using modern AI tools.',
    accent: '#f59e0b',
    content: `The barrier to building a software product has never been lower. A non-technical founder today has access to tools that would have required a full engineering team five years ago.

No-code platforms like Webflow, Bubble, and Glide handle the interface layer. Zapier and Make connect systems without API knowledge. Supabase and Airtable provide backend infrastructure. And AI tools — particularly for content, logic, and personalization — can be dropped into any of these platforms in hours.

The practical result is that the first version of almost any B2B SaaS product can be built by a single person in under a month, without a technical co-founder.

But the no-code path has limits that founders should understand early. Performance at scale, complex data relationships, and custom integrations all hit ceilings that require engineering. The question is not whether you will eventually need developers — it is whether you can validate the business before you need them.

The smartest approach is to use no-code tools to answer your core question: will people pay for this, and can you deliver the value? Once you have paying customers and a clear product definition, the rebuild becomes a known problem with known costs. You are not building in the dark.

AI accelerates this dramatically. Tasks that used to require manual work — data entry, report generation, content personalization, customer communications — can be automated inside no-code tools using AI blocks. A one-person operation can deliver a product experience that feels enterprise-grade.

The founders who use this combination well are not replacing engineering. They are compressing the time it takes to find out whether there is something worth engineering.`
  },
  {
    id: 5,
    category: 'tips',
    title: 'Essential Metrics for Founders',
    readTime: '6 min',
    desc: 'Key indicators to help you understand if your startup is on the right track.',
    accent: '#3b82f6',
    content: `Most founders measure too many things, which means they are effectively measuring nothing. The goal is to identify the three or four numbers that actually tell you whether the business is working.

In the early stage, before product-market fit, the most important metric is retention. Not acquisition, not revenue — retention. If people come back, you have something. If they do not, nothing else matters. Measure Day-7 and Day-30 retention from the first week of launch and watch those numbers every week.

Alongside retention, track your NPS — not as a vanity metric, but as an early signal of word-of-mouth potential. A score above 40 suggests people like your product enough to tell others. Below 20, something fundamental is missing.

Once you have product-market fit and are growing, the metrics shift. Customer Acquisition Cost (CAC) and Lifetime Value (LTV) become your operating compass. The ratio should be at least 3:1 — meaning every dollar you spend acquiring a customer returns at least three dollars in revenue over the relationship. If your LTV is below 3x CAC, you are spending money to lose money at scale.

Monthly Recurring Revenue (MRR) growth rate matters more than MRR itself at early stages. A $10K MRR business growing 20% month-over-month is more fundable than a $100K MRR business growing 3%.

Finally, runway. Know exactly how many months of cash you have at your current burn rate, and at what milestone you need to raise before that runway ends. Most founders underestimate how long fundraising takes. Add four months to whatever you think it will take.`
  },
  {
    id: 6,
    category: 'tips',
    title: 'How to Find the Perfect Co-Founder',
    readTime: '7 min',
    desc: 'A guide to finding a business partner who fits your vision and values.',
    accent: '#ec4899',
    content: `The co-founder relationship is the most important relationship in a startup. More startups fail because of co-founder conflict than because of market problems, competition, or running out of money.

The first mistake founders make is looking for someone who complements their skills — a technical co-founder if they are business-focused, a sales person if they are an engineer. Skills matter, but they are the least important variable. What matters more is alignment on the fundamental questions: How hard are you both willing to work? What does success look like? What happens if you do not agree on a major decision? What is each person's financial situation and risk tolerance?

These conversations are uncomfortable to have with someone you have just met. Have them anyway. The discomfort of the conversation is far smaller than the cost of a misaligned partnership two years in.

Look for co-founders in adjacent circles — former colleagues, accelerator cohorts, online communities organized around specific problems. The best co-founder relationships usually come from working together on something before formalizing the partnership. A short project, a hackathon, a consulting engagement — anything that reveals how you work together under pressure.

Equity splits are the source of more ongoing conflict than almost any other early decision. Split equity based on contributions and commitment, not on who had the original idea. An idea is worth very little. The work of building, the risk of leaving income, the months of no salary — these are the things that determine how equity should be distributed.

Get a co-founder agreement and a vesting schedule in place from day one. A four-year vest with a one-year cliff is standard. It protects both parties and aligns incentives over the long term.`
  }
];

const bgGradients = [
  'from-indigo-950 to-slate-900',
  'from-violet-950 to-slate-900',
  'from-emerald-950 to-slate-900',
  'from-amber-950 to-slate-900',
  'from-blue-950 to-slate-900',
  'from-pink-950 to-slate-900',
];

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [openArticle, setOpenArticle] = useState(null);

  const filteredArticles = activeTab === 'all'
    ? allArticles
    : allArticles.filter(a => a.category === activeTab);

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'tips', label: 'Founder Tips' },
    { id: 'ai', label: 'AI & Tech' },
    { id: 'success', label: 'Success Stories' }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">

      <header className="pt-24 pb-12 px-[10%] bg-[radial-gradient(circle_at_50%_0%,#22325a_0%,#000000_60%)]">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">StartZig Insights</h1>
        <p className="text-gray-400 text-lg max-w-xl">The founder's guide to building, scaling, and mastering AI.</p>
      </header>

      <main className="max-w-[1400px] mx-auto px-[10%] py-12 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12">

        <aside className="sticky top-24 h-fit">
          <nav>
            <ul className="space-y-1 border-r border-zinc-800">
              {categories.map(cat => (
                <li
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`cursor-pointer py-3 px-4 transition-all duration-200 font-medium ${
                    activeTab === cat.id
                      ? 'text-indigo-400 border-r-2 border-indigo-500 bg-indigo-500/5'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                  }`}
                >
                  {cat.label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredArticles.map((article, i) => (
            <article
              key={article.id}
              onClick={() => setOpenArticle(article)}
              className="group cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Card header — text on dark gradient instead of image */}
              <div className={`relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br ${bgGradients[article.id - 1]} mb-4 flex items-end p-5`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: article.accent }}>
                    {categories.find(c => c.id === article.category)?.label}
                  </p>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-white/80 transition-colors">
                    {article.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                <span>{article.readTime} Read</span>
              </div>
              <p className="text-zinc-400 text-sm line-clamp-2">{article.desc}</p>
            </article>
          ))}
        </section>
      </main>

      {/* Modal */}
      {openArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setOpenArticle(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={`bg-gradient-to-br ${bgGradients[openArticle.id - 1]} p-8 rounded-t-2xl`}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: openArticle.accent }}>
                {categories.find(c => c.id === openArticle.category)?.label} · {openArticle.readTime} Read
              </p>
              <h2 className="text-2xl font-bold text-white leading-snug">{openArticle.title}</h2>
            </div>

            {/* Modal content */}
            <div className="p-8 space-y-5">
              {openArticle.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-zinc-300 text-base leading-relaxed">{para}</p>
              ))}
            </div>

            {/* Close */}
            <div className="px-8 pb-8">
              <button
                onClick={() => setOpenArticle(null)}
                className="text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-5 py-2 rounded-full transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
