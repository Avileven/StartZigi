// StaticGuidance 300126
import React from 'react';

export const GUIDANCE_DATA = {
  // Idea Phase (CreateVenture) sections
  venture_name: {
    title: "Choosing Your Venture Name",
    content: `Your venture name is your first impression. A great name is memorable, hints at what you do, and is available to use.

**Key Principles:**
• **Memorable**: Easy to remember and spell.
• **Relevant**: Hints at your service (but doesn't have to be literal).
• **Available**: Check for domain name and social media handle availability.
• **Scalable**: Won't limit you if your business pivots or expands.

**What to Avoid:**
• Names that are too long, complex, or hard to spell.
• Names that are too similar to existing competitors.
• Trendy names that might quickly become dated.`,
    examples: [
      "Slack (suggests less work, simple communication)",
      "Stripe (suggests smooth, clean lines, like a payment swipe)",
      "Notion (suggests an idea or concept, an all-in-one workspace)"
    ]
  },
  brief_description: {
    title: "Crafting Your Brief Description",
    content: `This is your elevator pitch in one sentence. It should clearly and concisely communicate what you do and for whom.

**Structure Formula:**
"[Your Company] helps [Target Customer] [Achieve Goal/Solve Problem] by [Your Unique Method/Solution]."

**Key Elements:**
• **Target Customer**: Be specific (e.g., "small business owners," not "people").
• **Core Value**: What is the main benefit you provide?
• **Clarity**: Avoid jargon. Anyone should be able to understand it.

**Common Mistakes:**
• Being too vague ("a platform for innovation").
• Focusing on features instead of benefits.
• Making it too long or complex.`,
    examples: [
      "Airbnb helps travelers find unique, affordable accommodations by connecting them directly with local hosts around theworld.",
      "Canva helps non-designers create professional graphics by providing intuitive drag-and-drop design tools and templates."
    ]
  },
  problem_statement: {
    title: "Defining Your Problem Statement",
    content: `A clear problem statement is the foundation of your venture. If you can't articulate the problem, you can't solve it.

**Characteristics of a Strong Problem Statement:**
• **User-centered**: Describes the problem from the customer's perspective.
• **Specific**: Focuses on a particular, well-defined issue.
• **Urgent**: Explains why this problem needs to be solved now. What is the cost of not solving it?

**Validation Questions:**
• Are people currently trying to solve this problem? How?
• Are they paying for a solution? If so, how much?
• What happens if this problem isn't solved?`,
    examples: [
      "Small business owners spend 10+ hours per week on manual bookkeeping because existing accounting software is too complex and expensive, leading to errors and time taken away from growing their business.",
      "Remote team members struggle to build meaningful relationships because current communication tools focus on formal meetings, not the casual social interactions that build trust and culture."
    ]
  },
  proposed_solution: {
    title: "Developing Your Proposed Solution",
    content: `Your solution should directly address the problem you've identified. It should be feasible to build and offer a clear advantage over existing alternatives.

**Solution Framework:**
• **Core Functionality**: What does your solution *do* at its most basic level?
• **Key Features**: What are the 3-5 most important features of your initial product?
• **Unique Value Proposition**: What makes your solution better? Is it faster, cheaper, easier to use, or more effective?

**Avoid These Pitfalls:**
• "Feature Creep": Trying to build too many features at once.
• "Solution in search of a problem": Building something cool that nobody actually needs.
• Ignoring the competition or the "status quo" (how people solve the problem now).`,
    examples: [
      "We are building an AI-powered accounting assistant that connects to a business's bank account, automatically categorizes transactions, and generates tax-ready reports. It's designed for setup in under 10 minutes, saving owners 8+ hours per week.",
      "Our platform creates virtual 'coffee breaks' by randomly pairing remote team members for 15-minute, non-work-related video chats, complete with AI-powered conversation starters to break the ice."
    ]
  },

  // Business Plan sections
  mission_statement: {
    title: "Writing Your Mission Statement",
    content: `Your mission statement defines your company's purpose and core values. It should inspire both your team and your customers while clearly communicating what you stand for.

**Key Components:**
• **Purpose**: Why does your company exist?
• **Values**: What principles guide your decisions?
• **Impact**: What change do you want to create?
• **Audience**: Who do you serve?

**Structure Formula:**
"We exist to [purpose] for [target audience] by [method/approach] because we believe [core value/vision]."

**Writing Guidelines:**
• Keep it concise (1-2 sentences maximum)
• Make it memorable and inspiring
• Avoid generic business jargon
• Focus on the 'why' not just the 'what'
• Ensure it's authentic to your values`,
    examples: [
      "We exist to democratize financial services for small businesses by providing simple, transparent banking solutions because we believe every entrepreneur deserves access to the tools that help them succeed.",
      "We help remote teams build stronger connections through meaningful virtual experiences because we believe distance shouldn't limit human collaboration.",
    ]
  },
  solution_overview: {
    title: "Detailing Your Solution Overview",
    content: `This section is where you dive deep into your product or service. Go beyond the high-level description and explain the "what" and "how".

**Key Components:**
• **Core Features**: List the 3-5 most important features that directly solve the user's problem.
• **Key Benefits**: For each feature, explain the primary benefit to the user. Use the "so that" framework: "We have [feature] so that our users can [benefit]."
• **Technology Stack**: Briefly mention the core technologies you're using (e.g., React, Python, AWS). This builds credibility.
• **Unique Selling Proposition (USP)**: What makes your solution fundamentally different and better than alternatives?

**Writing Guidelines:**
• Be specific and avoid vague marketing language.
• Focus on user value, not just technical specifications.
• If you have a prototype or mockups, describe the user journey.`,
    examples: [
      "Our B2B SaaS platform offers real-time inventory tracking (feature) so that e-commerce businesses can prevent stockouts and reduce carrying costs (benefit). It integrates directly with Shopify and WooCommerce APIs and uses a predictive AI model to forecast demand, a feature our competitors lack (USP).",
      "Our mobile app connects local farmers directly with consumers (feature) so that users get access to fresher produce at a lower price while supporting their local economy (benefit). We use a geolocation-based matching algorithm and secure in-app payments (technology)."
    ]
  },
  market_analysis: {
    title: "Conducting Your Market Analysis",
    content: `Investors need to see that you're targeting a large and growing market. This section demonstrates you've done your homework.

**Key Concepts (TAM, SAM, SOM):**
• **Total Addressable Market (TAM)**: The total market demand for a product or service.
• **Serviceable Addressable Market (SAM)**: The segment of the TAM targeted by your products and services which is within your geographical reach.
• **Serviceable Obtainable Market (SOM)**: The portion of SAM that you can realistically capture in the next 3-5 years.

**Writing Guidelines:**
• **Cite your sources**: Where did you get your market size data?
• **Show growth**: Is the market growing? A 15% CAGR is more attractive than a flat market.
• **Identify trends**: What major trends are creating opportunities in this market?`,
    examples: [
      "The global market for corporate e-learning (TAM) is projected to reach $375 billion by 2026. Our target segment is small-to-medium businesses in North America (SAM), which accounts for approximately $40 billion of that market. We aim to capture 0.5% of this segment within three years (SOM), representing a $200 million revenue opportunity."
    ]
  },
  target_customers: {
    title: "Defining Your Target Customers",
    content: `You can't sell to everyone. This section proves you know exactly who your ideal customer is.

**Create a User Persona:**
A user persona is a semi-fictional character based on your ideal customer. Give them a name and a story.

**Key Components of a Persona:**
• **Demographics**: Age, location, job title, income level.
• **Psychographics**: Goals, values, challenges, pain points.
• **Watering Holes**: Where do they spend their time online and offline?
• **Quote**: A short quote that summarizes their primary motivation or frustration.

**Writing Guidelines:**
• **Be specific**: "Marketing managers at B2B tech startups with 50-200 employees" is better than "marketers".
• **Focus on the 'why'**: Why would this persona choose your product over others?
• **Create 1-2 primary personas**: Don't try to target too many different groups at first.`,
    examples: [
      "**Persona: 'Startup Sarah'**\n• **Role**: Marketing Manager at a 75-person B2B SaaS company.\n• **Demographics**: 32 years old, lives in Austin, TX, earns $90k/year.\n• **Challenges**: Overwhelmed with managing multiple marketing channels, struggles to prove ROI of her campaigns to leadership.\n• **Quote**: 'I need a tool that simplifies my workflow and gives me clear, actionable data without a steep learning curve.'"
    ]
  },
  competitive_landscape: {
    title: "Analyzing the Competitive Landscape",
    content: `Every idea has competition, even if it's just the "status quo". Acknowledging this shows you are realistic and prepared.

**Identify Your Competitors:**
• **Direct Competitors**: Companies offering a very similar solution to the same target market.
• **Indirect Competitors**: Companies offering a different solution that solves the same core problem.
• **Status Quo**: The user's current workaround. Often, your biggest competitor is a simple spreadsheet.

**Create a Competitive Matrix:**
Create a table comparing your venture to 2-3 top competitors across key features or value propositions.

**Define Your Unique Value Proposition (UVP):**
Based on your analysis, what is the single, clear reason a customer should choose you?`,
    examples: [
      "Our main direct competitors are Mailchimp and ConvertKit. While they are powerful, they are also complex and expensive for our target market of solo creators. Our UVP is: 'The simplest platform for creators to build and monetize their audience, with predictable pricing and zero technical skills required.'"
    ]
  },
  revenue_model: {
    title: "Building Your Revenue Model",
    content: `This section explains how you will make money. Be clear and specific about your strategy.

**Common Revenue Models for Startups:**
• **SaaS**: A recurring subscription fee for access to your software.
• **Transactional**: A fee charged for each transaction that occurs on your platform.
• **Marketplace**: Taking a percentage of sales made by sellers on your platform.
• **Advertising**: Offering free services to users and charging advertisers to reach them.
• **Freemium**: Offering a basic version for free, then upselling to a paid premium version.

**Key Metrics to Consider:**
• **Pricing Strategy**: How did you arrive at your price?
• **Customer Lifetime Value (LTV)**: The total revenue you expect to generate from a single customer.
• **Customer Acquisition Cost (CAC)**: How much it costs to acquire a new customer.`,
    examples: [
      "We will use a tiered SaaS model. Our 'Starter' plan will be $29/month for individuals, and our 'Growth' plan will be $99/month for teams up to 5. We project an LTV of $1,200 and a target CAC of $350."
    ]
  },
  team_background: {
    title: "Highlighting Your Team's Background",
    content: `Early-stage investors often say they "invest in the team, not the idea." This section shows why you and your co-founders are the right people to build this venture.

**What to Include for Each Founder:**
• **Relevant Experience**: Focus on past roles, projects, or accomplishments that directly relate to the problem you're solving.
• **Domain Expertise**: Do you have deep knowledge of this industry?
• **Technical Skills**: If it's a tech startup, who has the engineering, design, and product skills to build the MVP?
• **Past Successes**: Have you built a company before? Grown a team? Launched a successful product?

**Writing Guidelines:**
• **Be a storyteller**: Weave a narrative about why this team came together to solve this specific problem.
• **Be quantitative**: "Grew a previous startup's user base from 10k to 500k" is stronger than "experienced in marketing."
• **Address key gaps**: If you have gaps, acknowledge them and explain your plan to fill them.`,
    examples: [
      "Jane Doe (CEO) is a former product manager at FinTechCorp, where she led the development of a payment processing system used by over 10,000 merchants. John Smith (CTO) is a full-stack engineer with 8 years of experience at BigTech Inc., specializing in data visualization and scalable cloud infrastructure."
    ]
  },
  funding_requirements: {
    title: "Defining Your Funding Requirements",
    content: `This is your "ask." Be specific, confident, and justify your numbers.

**Key Components:**
• **The Ask**: How much money are you raising?
• **Use of Funds**: Provide a simple breakdown of how you will spend the capital over the next 12-18 months.
• **Runway**: How many months of operation will this funding provide?
• **Key Milestones**: What specific, measurable goals will you achieve with this funding?

**Writing Guidelines:**
• **Be realistic**: Don't ask for $5M if you're just two people with an idea.
• **Align with your budget**: The numbers here should directly correspond to the detailed budget you create.`,
    examples: [
      "We are seeking $750,000 in seed funding to provide us with 18 months of runway. The funds will be allocated as follows: 50% for hiring two senior engineers, 30% for marketing and customer acquisition, and 20% for operational overhead."
    ]
  },

  // MVP Phase sections
  mvp_definition: {
    title: "Defining Your MVP (Minimum Viable Product)",
    content: `An MVP is the simplest version of your product that can still provide value to early users and validate your core assumptions. It is NOT a buggy or incomplete product; it's a focused one.

**MVP Principles:**
• **Minimum**: Include only the essential features needed to solve the #1 core problem for your target user.
• **Viable**: It must provide real value. Users should be able to complete a task and feel successful.
• **Product**: It should be a complete, polished experience, even if the scope is very small.

**What NOT to Include:**
• Nice-to-have features that don't directly solve the primary problem.
• Complex edge cases or "what if" scenarios.
• Advanced customization options.

**Success Criteria:**
• Can a new user understand what it does in 30 seconds?
• Would users be disappointed if it went away?
• Are you learning something important from every user?`,
    examples: [
      "Dropbox's MVP was a simple video showing files syncing between computers. Before building anything, they validated that people *wanted* the solution.",
      "Buffer's MVP was a simple landing page that let users *pretend* to schedule posts. It collected emails to gauge interest before any code was written for the actual scheduling.",
    ]
  },
  technical_approach: {
    title: "Planning Your Technical Approach",
    content: `Your technical approach for an MVP should balance speed, cost, and future scalability. The goal is to learn as fast as possible.

**MVP Technical Principles:**
• **Keep it Simple**: Use technologies your team is already familiar with to move faster.
• **Use Existing Services (Buy vs. Build)**: Don't build your own payment processing, authentication, or email service. Use Stripe, Firebase Auth, SendGrid, etc.
• **Plan for Data**: Build in simple analytics from day one to track user behavior. What is the one key action you want users to take? Track that.

**Key Decisions:**
• **Platform**: Web app, mobile app, or both? (Hint: Start with one).
• **Frontend/Backend**: React, Vue, Node.js, Python, etc.
• **Database**: SQL or NoSQL?
• **Hosting**: Where will it live? (e.g., Vercel, AWS, Heroku).`,
    examples: [
      "We'll build a React web app with a Firebase backend. This allows for rapid development, as Firebase handles authentication, database, and hosting, letting us focus on the core user experience.",
      "Our MVP will be a simple no-code app built on Bubble.io. This allows us to validate the user workflow and demand before investing in custom software development."
    ]
  },
  user_testing: {
    title: "Planning User Testing & Validation",
    content: `User testing is about turning your assumptions into facts by watching real people use your product.

**Testing Methods for MVP:**
• **Moderated "Think Aloud" Sessions**: Sit with a user (in person or screen-share) and ask them to use your product while narrating their thoughts. This is the most valuable feedback you can get.
• **Unmoderated Testing**: Use services like Maze or UserTesting.com to give users tasks to complete on their own.
• **Surveys**: Good for quantitative data, but less insightful for "why" users do things.

**Key Metrics to Track:**
• **Task Completion Rate**: Can users actually do what you want them to do?
• **Time to Value**: How long does it take for a user to experience the "aha!" moment?
• **User Satisfaction**: A simple "How would you feel if you could no longer use this product?" can be very revealing.

**Recruiting Testers:**
• Start with people who have the problem you're solving, but who are NOT your friends and family (they will be too nice).
• Use social media (LinkedIn, Reddit, Facebook Groups) and online communities.`,
    examples: [
      "We'll recruit 10 small business owners through LinkedIn. We will run 30-minute moderated Zoom sessions where we ask them to set up an account and categorize 10 transactions. We will not guide them, only observe.",
      "We will post our MVP to BetaList and relevant subreddits, offering a 3-month free trial to the first 100 users who provide detailed feedback via an embedded form."
    ]
  },
  feature_evaluation_matrix: {
    title: "Creating Your Feature Evaluation Matrix",
    content: `A feature evaluation matrix helps you systematically prioritize which features to include in your MVP by scoring them across multiple dimensions.

**The Matrix Components:**
• **User Criticality (1-10)**: How essential is this feature for the core user journey? Can users achieve their goal without it?
• **Implementation Ease (1-10)**: How easy/quick is it to build? Consider technical complexity, team skills, and dependencies.
• **Priority Score**: Multiply Criticality × Ease to get a priority score. Higher scores = higher priority.

**Evaluation Guidelines:**
• **Be ruthless**: Most features aren't as critical as you think. Focus on the user's #1 problem.
• **Consider learning**: Sometimes a lower-scored feature teaches you more about users than a higher-scored one.
• **Budget constraints**: High scores don't always mean best investment decisions if implementation costs vary widely.`,
    examples: [
      "Feature: User Authentication. Criticality: 9 (essential for personalized experience). Ease: 7 (straightforward with Firebase). Score: 63.",
      "Feature: Advanced Analytics Dashboard. Criticality: 4 (nice to have). Ease: 3 (complex to build). Score: 12. (Lower priority for MVP.)"
    ]
  },
  mvp_feature_selection: {
    title: "Selecting Your MVP Features",
    content: `Your selected features are the core of your MVP. These should work together to deliver a complete, valuable experience for your target user.

**Selection Criteria:**
• **User Journey Completeness**: Can a user accomplish their main goal with these features?
• **Resource Constraints**: Do you have the time, skills, and budget to build these features well?
• **Learning Objectives**: Will these features help you validate your key assumptions about users and market demand?

**Common Mistakes:**
• **Feature Creep**: Adding "just one more" feature that seems important but dilutes focus.
• **Ignoring Dependencies**: Choosing features that require other features to be useful.
• **Perfectionism**: Waiting to include features until they can be "perfect" rather than "good enough" for learning.

**Success Metrics:**
Define 1-2 key metrics for your selected features (e.g., "Users complete onboarding in under 2 minutes" or "70% of users perform the core action within their first session").`,
    examples: [
      "Selected: User Registration, Create Project, Invite Team Member, Basic Dashboard. This creates a complete workflow for our target user (project managers) to experience the core value.",
      "Excluded: Advanced Reporting, Mobile App, Third-party Integrations. These can wait until we validate the core assumptions."
    ]
  },
  mvp_files_demos: {
    title: "MVP Files & Demos",
    content: `Visual prototypes and demos are powerful tools for communicating your MVP vision and gathering early feedback before you build.

**Types of Useful Files:**
• **Wireframes/Mockups**: Show the user interface and flow. Tools: Figma, Sketch, or even hand-drawn sketches.
• **Interactive Prototypes**: Clickable demos that simulate the user experience. Tools: Figma, InVision, or coded HTML prototypes.
• **Demo Videos**: Screen recordings showing the user journey. Great for stakeholders and early user research.
• **Technical Specifications**: Architecture diagrams, API documentation, database schemas.

**Best Practices:**
• **Focus on User Flow**: Show how a user accomplishes their main goal, step by step.
• **Keep it Simple**: Don't over-design. The goal is to communicate the concept and validate assumptions.
• **Make it Testable**: If possible, create something users can interact with to give you feedback.`,
    examples: [
      "Upload a Figma prototype showing the complete user onboarding flow, from account creation to completing their first key task.",
      "Include a 2-minute demo video walking through how a new user would use your MVP to solve their core problem."
    ]
  },

  // MLP Phase sections
  mlp_feedback_analysis: {
    title: "Analyze Your MVP Feedback",
    content: `Quick Tips:
• Look for patterns: Which features got consistently low ratings? Which got high praise?
• Pay attention to feature requests that appear multiple times
• Identify pain points users mentioned repeatedly
• Note which features users barely used—those might need removal`,
    examples: []
  },
  mlp_enhancement_strategy: {
    title: "Define MLP Enhancement Strategy",
    content: `Quick Tips:
• FIXED: Critical bugs, broken flows, performance issues
• POLISHED: Better copy, clearer CTAs, improved visuals
• ADDED: Small delighters like progress indicators, confirmations, smart defaults
• Prioritize fixes over new features`,
    examples: []
  },
  mlp_wow_moments: {
    title: "Identify 'Wow' Moments",
    content: `Quick Tips:
• Think small but memorable: keyboard shortcuts, undo, auto-save
• Personalization: greet users by name, remember preferences
• Celebrations: confetti on first achievement, milestone badges
• Smart defaults: pre-fill forms intelligently, suggest next actions`,
    examples: []
  },
  mlp_user_journey: {
    title: "User Journey Map",
    content: `Quick Tips:
• Awareness: How do they discover you? Clear value prop
• Onboarding: First 5 minutes matter most—make it smooth
• First Use: Guide them to one "aha!" moment quickly
• Regular Use: Make the core action effortless
• Advocacy: Give them something worth sharing`,
    examples: []
  },
  mlp_ui_ux: {
    title: "UI/UX Requirements",
    content: `Quick Tips:
• Consistency: Use the same colors, fonts, button styles throughout
• Responsive: Test on mobile, tablet, desktop
• Accessibility: High contrast, keyboard navigation, screen reader support
• Micro-interactions: Button hover states, loading animations, smooth transitions`,
    examples: []
  },
  mlp_technical: {
    title: "Technical Excellence",
    content: `Quick Tips:
• Speed: Aim for <3 second load time
• Zero critical bugs: Test core flows thoroughly
• Security: Encrypt data, validate inputs, follow best practices
• Error handling: Show helpful error messages, never crash silently`,
    examples: []
  },
  mlp_visual_mockups: {
    title: "Visual Mockups",
    content: `Quick Tips:
• Cover all key screens: landing page, signup, onboarding, main dashboard, settings
• Show states: empty state, loading state, error state, success state
• Use real (or realistic) data—no "lorem ipsum"
• Include mobile views if applicable`,
    examples: []
  },
  mlp_prototype: {
    title: "Interactive Prototype",
    content: `Quick Tips:
• Make it clickable: Users should be able to navigate through key flows
• Use realistic data: Actual names, numbers, content
• Include branding: Logo, colors, fonts should match your vision
• Test it yourself: Click through like a real user would`,
    examples: []
  },
  mlp_user_love_metrics: {
    title: "Defining User Love Metrics",
    content: `"Lovable" products create emotional connections with users. These metrics help you measure delight, not just functionality.

**Types of Love Metrics:**
• **Net Promoter Score (NPS)**: "How likely are you to recommend this product?" Scores of 9-10 are promoters.
• **Product-Market Fit Survey**: "How would you feel if you could no longer use this product?" 40%+ saying "very disappointed" indicates strong PMF.
• **Retention Rates**: Do users come back? Daily, weekly, and monthly active users show engagement.
• **Feature Adoption**: Are users discovering and using the features that provide the most value?

**Qualitative Indicators:**
• **Unsolicited Feedback**: Users reaching out to share positive experiences or thank you.
• **Social Sharing**: Users posting about your product on social media without prompting.
• **Word of Mouth**: New users mentioning they heard about you from existing users.

**Setting Targets:**
Don't just measure—set specific targets. "Achieve NPS of 50+" is better than "improve NPS."`,
    examples: [
      "Target: Achieve a Net Promoter Score (NPS) of 50+ within 6 months. Current NPS is 23, so we need to focus on reducing friction and adding delight.",
      "Target: Increase week-1 user retention from 45% to 70% by improving the onboarding experience and adding a progress indicator."
    ]
  },

  // Beta Phase sections
  beta_page_setup: {
    title: "Setting Up Your Beta Testing Page",
    content: `Your beta testing page is a landing page specifically designed to attract and convert early adopters into testers.

**Essential Page Elements:**
• **Compelling Headline**: Focus on the core benefit and the exclusivity of the beta. (e.g., "Be the First to Experience [Benefit]. Join Our Private Beta.").
• **Clear Value Proposition**: What problem does your product solve? Show, don't just tell, with visuals or a short demo video.
• **Benefits of Joining**: What's in it for the tester? (e.g., "Free lifetime account," "Direct influence on product development," "Exclusive access").
• **Simple Sign-up Form**: Ask for the minimum information needed (usually just an email).
• **Social Proof**: If you have any, show it (e.g., "Join 500+ other innovators on our waitlist").`,
    examples: [
      "Headline: 'Stop Wasting Time on Bookkeeping. Get Early Access to AI-Powered Accounting.'",
      "Benefit: 'Beta testers receive a free Pro account for one year and a direct line to our founding team to shape the future of the product.'"
    ]
  },
  beta_benefits: {
    title: "Defining Beta Program Benefits",
    content: `Beta program benefits are incentives that motivate users to test your unfinished product and provide feedback.

**Types of Benefits:**
• **Financial**: Free access, lifetime discounts, credits, or cash rewards for feedback.
• **Social**: Exclusive community access, direct contact with founders, beta tester badge/status.
• **Influence**: Early access to new features, ability to influence product roadmap, named recognition.
• **Educational**: Behind-the-scenes content, product development insights, industry reports.

**Structuring Benefits:**
• **Immediate**: What do they get right when they sign up? (e.g., instant access, welcome bonus)
• **Ongoing**: What keeps them engaged? (e.g., monthly founder updates, priority support)
• **Completion**: What do they get for completing the beta? (e.g., permanent discount, premium features)

**Writing Effective Benefits:**
• **Be specific**: "50% off for life" is better than "big discount."
• **Focus on value**: What's truly valuable to your specific audience?
• **Create urgency**: Limited spots, time-limited offers, early bird specials.`,
    examples: [
      "🚀 Exclusive Access: Be among the first 100 users to test our revolutionary productivity platform.",
      "💰 Lifetime Value: Beta testers receive 50% off our Pro plan for life (a $600/year value).",
      "🎯 Shape the Product: Your feedback directly influences our roadmap—see your ideas become features."
    ]
  },
  beta_featured_demo: {
    title: "Creating Your Featured Demo",
    content: `A featured demo gives potential beta testers a taste of your product without requiring them to sign up first.

**Demo Format Options:**
• **Screenshot/Image**: Static image showing your product's key interface or a key moment in the user journey.
• **Interactive Prototype**: An HTML prototype users can click through to experience the core workflow.
• **Video Walkthrough**: Screen recording showing the product in action, narrated by a founder or key team member.
• **Live Demo**: Embedded version of your actual product with sample data.

**Demo Best Practices:**
• **Show, Don't Tell**: Focus on the user experience, not feature lists.
• **Keep it Short**: 30 seconds to 2 minutes maximum. People have short attention spans.
• **Highlight the "Aha!" Moment**: Show the exact moment when users realize the value.
• **Include a Call-to-Action**: End with a clear next step ("Join the Beta," "Get Early Access").

**What to Avoid:**
• **Technical Jargon**: Focus on benefits, not technical specifications.
• **Perfect Polish**: Beta demos can be slightly rough—it shows authenticity.
• **Feature Overload**: Show one core workflow, not every possible feature.`,
    examples: [
      "Interactive HTML prototype: Let users click through creating their first project, adding team members, and seeing the dashboard update in real-time.",
      "2-minute video demo: Show a small business owner setting up automated bookkeeping in under 60 seconds, emphasizing the time savings."
    ]
  },
  user_acquisition_strategy: {
    title: "Developing Your Beta User Acquisition Strategy",
    content: `This is about finding and attracting your first 50-100 users. You don't need to boil the ocean; you need to find where your specific target users congregate.

**Go Where Your Users Are (The "Watering Holes"):**
• **Online Communities**: Are your users in specific subreddits, Slack groups, Facebook groups, or Discords?
• **Niche Content**: Do they read specific blogs, listen to certain podcasts, or follow particular influencers?
• **Direct Outreach**: Can you find them on LinkedIn and send a personalized message?

**Strategy for Early Users:**
• **Do Things That Don't Scale**: Manually recruit your first users. Send personal emails. Offer free one-on-one onboarding.
• **Focus on a Single Channel First**: Don't try to be everywhere. Master one channel where you know your users are.
• **Craft a Compelling Offer**: Why should they try your buggy, incomplete product? Make the incentive worth their while.`,
    examples: [
      "Our target users are freelance graphic designers. We will focus on three channels: 1) Posting in the r/graphic_design subreddit, 2) Directly messaging 10 designers per day on Behance, and 3) Partnering with a design newsletter for a sponsored post.",
      "Our users are startup founders. We will acquire them by being active in Indie Hackers and Hacker News, and by offering free, hands-on help to set up their accounts."
    ]
  },
  feedback_collection: {
    title: "Building Your Feedback Collection System",
    content: `Systematic feedback collection is what makes a beta test valuable. You need a process to gather, organize, and act on user input.

**Feedback Collection Methods:**
• **In-App Feedback Widget**: A simple button (e.g., Hotjar, Userback) that lets users report a bug or share an idea without leaving the app.
• **Scheduled Interviews**: Schedule 15-30 minute calls with your most active beta testers. Ask open-ended questions like "Tell me about the last time you used the product."
• **Private Community**: Create a private Slack or Discord channel for your beta testers to share feedback and interact with each other and the team.
• **Surveys**: Use for targeted questions, but don't rely on them as your only source.

**Organizing Feedback:**
• Use a simple tool like Trello, Airtable, or a spreadsheet.
• Tag feedback with categories (e.g., 'Bug', 'Feature Request', 'UX/UI') and priority.
• **Close the loop**: When you ship a feature or fix a bug based on a user's feedback, email them personally to let them know. This creates a loyal advocate.`,
    examples: [
      "We use a combination of Hotjar for in-app bug reporting and a private Discord server for general discussion. We schedule a 30-minute call with any user who has logged in more than 5 times in their first week.",
      "All feedback is funneled into an Airtable base. Each month, we review the top 5 most-requested features and plan our next development sprint around them."
    ]
  }
};
