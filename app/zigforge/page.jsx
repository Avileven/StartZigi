// zigforge 260226 with credits
"use client";
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';


const defaultFeatureTemplates = [
  { id: 'home', name: 'Home', icon: '🏠', description: 'Application welcome screen.', isActive: true, isDefault: true },
  { id: 'posts', name: 'Community Feed', icon: '🗣', description: 'A scrollable feed for sharing updates and engaging with others.', isActive: true },
  { id: 'messages', name: 'Direct Messaging', icon: '✉️', description: 'Real-time 1:1 communication between users.', isActive: true },
  { id: 'counter', name: 'Simple Counter', icon: '🔢', description: 'A basic utility for tracking scores, counts, or goals.', isActive: false },
  { id: 'business', name: 'Business Model', icon: '💼', description: 'Subscription tiers and pricing plans for your app.', isActive: true },
  { id: 'settings', name: 'User Settings', icon: '⚙️', description: 'Manage preferences, notifications, and profile details.', isActive: true },
  { id: 'metrics', name: 'Performance Metrics', icon: '📊', description: 'Dashboard showing usage statistics and achievements.', isActive: false },
];


const getInitialState = () => ({
  features: defaultFeatureTemplates,
  mockPosts: [
    { user: 'Alice', content: 'Excited about launching this feature!', timestamp: Date.now() - 50000 },
    { user: 'Bob', content: 'Just finished integrating the new icons. Looks great!', timestamp: Date.now() - 15000 },
  ],
  mockMessages: [
    { sender: 'Admin', content: 'Welcome to the prototype chat!' },
    { sender: 'User1', content: 'What a cool app concept.' },
  ],
  appTitle: 'startzig studio',
  appDescription: 'Customize this text to pitch your app idea!',
  appOverview: '',
  premiumPrice: '9.99',
});


const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};



// ============================================
// Template Builder - outside component to avoid JSX issues
// ============================================
// Template builder - clean JS, no JSX issues
// ============================================
// TEMPLATES V2 - by venture type
// ============================================

const UNSPLASH = {
  social: {
    hero: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    avatar1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    avatar3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    cover: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  },
  saas: {
    hero: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    team1: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80',
    team2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
  marketplace: {
    product1: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    product2: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80',
    product3: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
    product4: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',
    seller: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
  },
  service: {
    hero: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
    provider1: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80',
    provider2: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&q=80',
    provider3: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&q=80',
    location: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
  }
};

function getTemplateColors(colorScheme, style) {
  const presets = {
    colorful_modern:   { h: 'linear-gradient(135deg,#667eea,#764ba2)', s: 'linear-gradient(180deg,#667eea,#764ba2)', a: '#667eea', bg: '#f3f4f6', card: '#fff' },
    colorful_playful:  { h: 'linear-gradient(135deg,#f97316,#ec4899)', s: 'linear-gradient(180deg,#f97316,#ec4899)', a: '#f97316', bg: '#fff7ed', card: '#fff' },
    colorful_business: { h: 'linear-gradient(135deg,#1e3a5f,#2d6a9f)', s: 'linear-gradient(180deg,#1e3a5f,#2d6a9f)', a: '#2d6a9f', bg: '#f0f4f8', card: '#fff' },
    colorful_elegant:  { h: 'linear-gradient(135deg,#1c1c2e,#6b21a8)', s: 'linear-gradient(180deg,#1c1c2e,#6b21a8)', a: '#6b21a8', bg: '#faf5ff', card: '#fff' },
    dark_modern:       { h: 'linear-gradient(135deg,#1a1a2e,#16213e)', s: 'linear-gradient(180deg,#0f0f23,#1a1a3e)', a: '#6366f1', bg: '#0f0f1a', card: '#1a1a2e' },
    dark_playful:      { h: 'linear-gradient(135deg,#1a0a0a,#3d0c0c)', s: 'linear-gradient(180deg,#1a0a0a,#3d0c0c)', a: '#ef4444', bg: '#0f0a0a', card: '#1a0a0a' },
    dark_business:     { h: 'linear-gradient(135deg,#0a0a14,#0d1b2a)', s: 'linear-gradient(180deg,#0a0a14,#0d1b2a)', a: '#3b82f6', bg: '#070710', card: '#0d1120' },
    dark_elegant:      { h: 'linear-gradient(135deg,#0a0a0a,#1a0a2e)', s: 'linear-gradient(180deg,#0a0a0a,#1a0a2e)', a: '#a855f7', bg: '#050508', card: '#0f0f1a' },
    light_modern:      { h: '#4f46e5', s: '#4f46e5', a: '#4f46e5', bg: '#f8fafc', card: '#fff' },
    light_playful:     { h: '#f97316', s: '#f97316', a: '#f97316', bg: '#fff7ed', card: '#fff' },
    light_business:    { h: '#1e40af', s: '#1e40af', a: '#1e40af', bg: '#eff6ff', card: '#fff' },
    light_elegant:     { h: '#7c3aed', s: '#7c3aed', a: '#7c3aed', bg: '#faf5ff', card: '#fff' },
    minimal_modern:    { h: '#374151', s: '#374151', a: '#374151', bg: '#f9fafb', card: '#fff' },
    minimal_business:  { h: '#1f2937', s: '#1f2937', a: '#1f2937', bg: '#f3f4f6', card: '#fff' },
  };
  const key = colorScheme + '_' + style;
  return presets[key] || presets['colorful_modern'];
}

function buildResponsiveTemplate(features, appTitle, designPrefs, ventureType) {
  const c = getTemplateColors(designPrefs.colorScheme, designPrefs.style);
  const imgs = UNSPLASH[ventureType] || UNSPLASH.social;
  const isDark = designPrefs.colorScheme === 'dark';
  const textColor = isDark ? '#e8e8f0' : '#1f2937';
  const mutedColor = isDark ? '#9090a8' : '#6b7280';

  const screensHtml = features.map(function(f, i) {
    return '<div id="screen-' + f.id + '" class="screen' + (i === 0 ? ' active' : '') + '">\n{{CONTENT_' + f.id.toUpperCase() + '}}\n</div>';
  }).join('\n');

  const JS = ''
    + 'function showScreen(id){'
    + 'document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});'
    + 'document.getElementById(id).classList.add("active");'
    + 'document.querySelectorAll(".nav-link,.bb").forEach(function(l){l.classList.remove("active")});'
    + 'var els=document.querySelectorAll("[data-screen=\\""+id+"\\"]");'
    + 'els.forEach(function(el){el.classList.add("active")});'
    + 'var sb=document.getElementById("sidebar");if(sb)sb.classList.remove("open");'
    + 'var ov=document.getElementById("overlay");if(ov)ov.classList.remove("show");'
    + 'window.scrollTo(0,0);'
    + '}'
    + 'function openNav(){document.getElementById("sidebar").classList.add("open");document.getElementById("overlay").classList.add("show")}'
    + 'function closeNav(){document.getElementById("sidebar").classList.remove("open");document.getElementById("overlay").classList.remove("show")}'
    + 'document.addEventListener("DOMContentLoaded",function(){'
    + 'var first=document.querySelector(".screen");if(first)first.classList.add("active");'
    + 'var firstBtn=document.querySelector(".nav-link,.bb");if(firstBtn)firstBtn.classList.add("active");'
    + '});';

  // For AI template: exclude 'home' from nav (logo click goes to home instead)
  const navFeatures = features.filter(function(f) { return f.id !== 'home'; });

  const mobileNavLinks = navFeatures.map(function(f) {
    return '<button class="nav-link" data-screen="screen-' + f.id + '" onclick="showScreen(&quot;screen-' + f.id + '&quot;)">' + f.name + '</button>';
  }).join('\n');

  const desktopNavLinks = navFeatures.map(function(f) {
    return '<button class="nav-link desktop-nav-link" data-screen="screen-' + f.id + '" onclick="showScreen(&quot;screen-' + f.id + '&quot;)">' + f.name + '</button>';
  }).join('\n');

  return '<!DOCTYPE html><html lang="en"><head>'
    + '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
    + '<title>' + appTitle + '</title>'
    + '<script src="https://cdn.tailwindcss.com"><\/script>'
    + '<style>'
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:Inter,sans-serif;background:' + c.bg + ';color:' + textColor + ';min-height:100vh}'
    + '.screen{display:none;padding:68px 16px 80px;min-height:100vh;overflow-y:auto}'
    + '.screen.active{display:block}'
    // Mobile header
    + 'header{position:fixed;top:0;left:0;width:100%;height:56px;background:' + c.h + ';display:flex;align-items:center;justify-content:space-between;padding:0 16px;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,0.2)}'
    + '.hamburger{background:none;border:none;color:white;font-size:24px;cursor:pointer;display:block}'
    + '.logo{color:white;font-weight:700;font-size:17px}'
    // Sidebar
    + '#sidebar{position:fixed;top:0;left:-280px;width:280px;height:100vh;background:' + c.s + ';z-index:100;transition:left 0.3s;padding:24px 16px;overflow-y:auto}'
    + '#sidebar.open{left:0}'
    + '#overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99}'
    + '#overlay.show{display:block}'
    + '.sidebar-title{color:white;font-size:18px;font-weight:700;padding:0 4px 20px}'
    + '.nav-link{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;color:rgba(255,255,255,0.85);cursor:pointer;margin-bottom:4px;font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left}'
    + '.nav-link:hover,.nav-link.active{background:rgba(255,255,255,0.2);color:white}'
    // Bottom nav mobile
    + '#bottom-nav{position:fixed;bottom:0;left:0;width:100%;height:62px;background:' + c.card + ';border-top:1px solid #e5e7eb;display:flex;z-index:50;box-shadow:0 -2px 8px rgba(0,0,0,0.08)}'
    + '.bb{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;color:' + mutedColor + ';font-size:10px;font-weight:500;border:none;background:none}'
    + '.bb.active{color:' + c.a + '}'
    // Desktop overrides
    + '@media(min-width:768px){'
    + '.hamburger{display:none}'
    + '#sidebar{display:none}'
    + '#bottom-nav{display:none}'
    + 'header{justify-content:flex-start;gap:8px;padding:0 32px}'
    + '.desktop-nav-links{display:flex!important;gap:4px}'
    + '.screen{padding:72px 40px 40px}'
    + '.screen-inner{max-width:1100px;margin:0 auto}'
    + '}'
    + '.desktop-nav-links{display:none}'
    + '.desktop-nav-link{white-space:nowrap}'
    + '</style></head><body>'
    + '<div id="overlay" onclick="closeNav()"></div>'
    + '<div id="sidebar"><div class="sidebar-title">' + appTitle + '</div>' + mobileNavLinks + '</div>'
    + '<header>'
    + '<button class="hamburger" onclick="openNav()">&#9776;</button>'
    + '<span class="logo" onclick="showScreen(&quot;screen-home&quot;)" style="cursor:pointer">' + appTitle + '</span>'
    + '<div class="desktop-nav-links">' + desktopNavLinks + '</div>'
    + '<div class="hamburger" style="visibility:hidden">&#9776;</div>'
    + '</header>'
    + screensHtml
    + '<nav id="bottom-nav">'
    + navFeatures.slice(0, 5).map(function(f) {
        return '<button class="bb" data-screen="screen-' + f.id + '" onclick="showScreen(&quot;screen-' + f.id + '&quot;)"><span>' + f.name + '</span></button>';
      }).join('')
    + '</nav>'
    + '<script>' + JS + '<\/script>'
    + '</body></html>';
}

// Venture type configs - what the AI gets as instructions per screen
const VENTURE_CONFIGS = {
  social: {
    name: 'Social / Community',
    icon: '🗣',
    desc: 'אפליקציה חברתית עם פיד, הודעות ופרופיל',
    screenHints: {
      home: 'Welcome screen with hero image and app value proposition. Use image: ' + UNSPLASH.social.hero,
      posts: 'Social feed with posts. Each post has avatar, name, content, likes, comments. Avatars: ' + UNSPLASH.social.avatar1 + ', ' + UNSPLASH.social.avatar2 + ', ' + UNSPLASH.social.avatar3,
      messages: 'Direct messaging screen with chat bubbles',
      business: 'Premium/subscription plans with pricing cards',
      settings: 'User profile settings with avatar and form fields. Avatar: ' + UNSPLASH.social.avatar1,
    }
  },
  saas: {
    name: 'SaaS / Home',
    icon: '📊',
    desc: 'דשבורד לניהול עם מטריקות ונתונים',
    screenHints: {
      home: 'Home overview with KPI cards (users, revenue, growth). Hero: ' + UNSPLASH.saas.hero,
      posts: 'Activity feed / notifications log',
      messages: 'Team messaging or support tickets',
      business: 'Pricing plans and upgrade options',
      settings: 'Account and team settings. Team avatars: ' + UNSPLASH.saas.team1 + ', ' + UNSPLASH.saas.team2,
      metrics: 'Analytics charts and performance metrics',
    }
  },
  marketplace: {
    name: 'Marketplace',
    icon: '🛍',
    desc: 'מארקטפלייס עם מוצרים, קניה ומוכרים',
    screenHints: {
      home: 'Homepage with featured products grid. Products: ' + UNSPLASH.marketplace.product1 + ', ' + UNSPLASH.marketplace.product2,
      posts: 'Product listings / category browse. More products: ' + UNSPLASH.marketplace.product3 + ', ' + UNSPLASH.marketplace.product4,
      messages: 'Buyer-seller messaging',
      business: 'Seller plans / commission pricing',
      settings: 'Seller profile and store settings. Seller: ' + UNSPLASH.marketplace.seller,
    }
  },
  service: {
    name: 'Service / Booking',
    icon: '📅',
    desc: 'אפליקציית שירותים עם הזמנות ולוח זמנים',
    screenHints: {
      home: 'Service discovery with hero and categories. Hero: ' + UNSPLASH.service.hero,
      posts: 'Service providers list with ratings. Providers: ' + UNSPLASH.service.provider1 + ', ' + UNSPLASH.service.provider2 + ', ' + UNSPLASH.service.provider3,
      messages: 'Client-provider messaging',
      business: 'Service pricing tiers',
      settings: 'Profile and availability settings. Avatar: ' + UNSPLASH.service.provider1,
    }
  }
};


const App = () => {
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' or 'builder'
  const [appState, setAppState] = useState(getInitialState);
  const [jsonParseError, setJsonParseError] = useState(null);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureContent, setNewFeatureContent] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiMode, setAiMode] = useState(null); // 'BASIC' or 'BOOST'
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [improvementNotes, setImprovementNotes] = useState('');
  const [ventureType, setVentureType] = useState('social');
  const [designPrefs, setDesignPrefs] = useState({
    platform: 'mobile',
    navigation: 'hamburger',
    colorScheme: 'colorful',
    style: 'modern',
  });
  const generatedSectionRef = useRef(null);
  const [generatedHtml, setGeneratedHtml] = useState(null);
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' or 'desktop'


  const handleSimpleContentChange = useCallback((key, value) => {
    const newState = { ...appState, [key]: value };
    setAppState(newState);
  }, [appState]);


  const handleContentJsonChange = useCallback((key, jsonString) => {
    setJsonParseError(null);
    try {
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData)) {
        const newState = { ...appState, [key]: parsedData };
        setAppState(newState);
      } else {
        setJsonParseError(`Input for ${key} must be a valid JSON array.`);
      }
    } catch (e) {
      setJsonParseError(`Invalid JSON format for ${key}. Please check syntax.`);
    }
  }, [appState]);


  const handleFeatureToggle = useCallback((id) => {
    if (id === 'home') return;
    const newFeatures = appState.features.map(f =>
      f.id === id ? { ...f, isActive: !f.isActive } : f
    );
    const newState = { ...appState, features: newFeatures };
    setAppState(newState);
  }, [appState]);


  const handleFeatureIconChange = useCallback((id, newIcon) => {
    if (id === 'home') return;
    const newFeatures = appState.features.map(f =>
      f.id === id ? { ...f, icon: newIcon.trim().slice(0, 2) } : f
    );
    const newState = { ...appState, features: newFeatures };
    setAppState(newState);
  }, [appState]);


  const handleAddNewFeature = useCallback(() => {
    if (!newFeatureName.trim()) return;
    const newId = newFeatureName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15) + Date.now().toString().slice(-4);
    const newFeature = {
      id: newId,
      name: newFeatureName.trim(),
      icon: '✨',
      description: newFeatureContent.trim() || 'A custom feature added by the user.',
      isActive: true,
      customContent: newFeatureContent.trim(),
    };
    const newFeatures = [...appState.features, newFeature];
    const newState = { ...appState, features: newFeatures };
    setAppState(newState);
    setNewFeatureName('');
    setNewFeatureContent('');
  }, [appState, newFeatureName, newFeatureContent]);



  // AI Generation Handler - per-screen JSON approach
  const handleGenerateWithAI = useCallback(async (mode) => {
    setIsGenerating(true);
    setGeneratedHtml(null);

    const allActiveFeatures = appState.features.filter(f => f.isActive);
    const screenLimit = mode === 'BASIC' ? 4 : 8;
    const activeFeatures = allActiveFeatures.slice(0, screenLimit);
    const config = typeof VENTURE_CONFIGS !== 'undefined' ? VENTURE_CONFIGS[ventureType] : null;
    const creditType = mode === 'BASIC' ? 'studio_basic' : 'studio_boost';
    const isBoost = mode === 'BOOST';

    let timerInterval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);

    try {
      setGeneratingStatus('📡 Connecting to AI...');
      setElapsedSeconds(0);

      // Build content for each screen one by one
      const screenContents = {};

      for (let i = 0; i < activeFeatures.length; i++) {
        const f = activeFeatures[i];
        setGeneratingStatus('🎨 Building screen ' + (i + 1) + ' of ' + activeFeatures.length + ': ' + f.name + '...');

        const hint = config && config.screenHints ? (config.screenHints[f.id] || '') : '';
        let dataHint = '';
        if (f.id === 'posts') dataHint = ' Posts: ' + appState.mockPosts.map(p => p.user + ': "' + p.content + '"').join(', ');
        if (f.id === 'messages') dataHint = ' Messages: ' + appState.mockMessages.map(m => m.sender + ': "' + m.content + '"').join(', ');
        if (f.id === 'business') dataHint = ' Premium price: $' + appState.premiumPrice;

        const colorInfo = 'Color scheme: ' + designPrefs.colorScheme + ', Style: ' + designPrefs.style;
        const modeInfo = isBoost
          ? 'Rich professional content with animations, interactive elements, real data.'
          : 'Clean simple content with cards and text.';
        const imageNote = hint.includes('unsplash') ? 'Use this image URL in an <img> tag: ' + hint.split('Use image: ').pop().split(',')[0].split('\n')[0] : '';

        const prompt = 'Generate HTML content for one app screen using Tailwind CSS.'
          + '\nApp: ' + appState.appTitle + ' — ' + appState.appDescription
          + (appState.appOverview ? '\nApp Overview: ' + appState.appOverview : '')
          + '\nScreen: ' + f.name + ' — ' + f.description
          + (f.id === 'home' ? '\nThis is the landing/home page. Use the App title, tagline and overview above to create rich, relevant content.' : '')
          + '\n' + colorInfo
          + '\n' + modeInfo
          + (dataHint ? '\n' + dataHint : '')
          + (imageNote ? '\n' + imageNote : '')
          + (improvementNotes ? '\nImprovements: ' + improvementNotes : '')
          + '\n\nReturn ONLY a JSON object: {"html": "...tailwind html content for this screen..."}'
          + '\nThe html value is inner content only — NO <html>, <head>, <body>, <header>, <nav> tags.'
          + '\nDO NOT use position:fixed, position:sticky, or large padding-top — the template already has a fixed header.'
          + '\nStart content directly with a div. Use Tailwind classes only.'
          + '\nDO NOT use any emoji icons in navigation menus or next to section titles. Clean text only.'
          + '\nNo placeholder images unless you have a real Unsplash URL.'
          + '\nFor every <img> tag, always add: onerror="this.style.display=\'none\'" to hide broken images gracefully.';

        const data = await Promise.race([
          InvokeLLM({ prompt, max_tokens: isBoost ? 2000 : 1200, creditType }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 90000))
        ]);

        let html = '';
        try {
          const raw = (data?.response || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          const parsed = JSON.parse(raw);
          html = parsed.html || '';
        } catch(e) {
          // fallback: try to extract html directly
          const match = (data?.response || '').match(/"html"\s*:\s*"([\s\S]*?)(?:"\s*}|"\s*$)/);
          html = match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '<p class="p-4 text-gray-500">Content unavailable</p>';
        }

        screenContents[f.id] = html;
      }

      // Inject all content into template
      setGeneratingStatus('⚙️ Assembling prototype...');
      let finalHtml = buildResponsiveTemplate(activeFeatures, appState.appTitle, designPrefs, ventureType);
      activeFeatures.forEach(f => {
        finalHtml = finalHtml.replace('{{CONTENT_' + f.id.toUpperCase() + '}}', screenContents[f.id] || '');
      });

      setGeneratedHtml(finalHtml);
      setShowAIModal(false);

    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.message === 'NO_CREDITS') {
        alert('⚠️ You\'ve used all your credits this month. Upgrade your plan to get more.');
      } else if (error.message === 'TIMEOUT') {
        alert('⏱️ AI did not respond in time. Please try again.');
      } else {
        alert('❌ Error: ' + (error.message || 'Unknown error'));
      }
    } finally {
      clearInterval(timerInterval);
      setIsGenerating(false);
      setGeneratingStatus('');
      setElapsedSeconds(0);
    }
  }, [appState, designPrefs, ventureType, improvementNotes]);
 
  // Download generated HTML
  const handleDownloadGeneratedHtml = useCallback(() => {
    if (!generatedHtml) return;
   
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.appTitle.toLowerCase().replace(/\s+/g, '_')}_${aiMode.toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedHtml, appState.appTitle, aiMode]);


  // גלילה אוטומטית לתוצאה כשהיא מופיעה
  useEffect(() => {
    if (generatedHtml && generatedSectionRef.current) {
      generatedSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedHtml]);

  const buildPreviewHtml = useCallback(() => {
    const activeFeatures = appState.features.filter(f => f.isActive);


    const navItems = activeFeatures.map((feature) => {
      return `<div onclick="showScreen('${feature.id}'); toggleNav(false);" style="display: flex; align-items: center; padding: 16px; cursor: pointer; transition: background 0.2s; border-radius: 8px; margin-bottom: 8px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
        <span style="font-size: 28px; margin-right: 16px;">${feature.icon}</span>
        <span style="font-size: 16px; color: white; font-weight: 500;">${feature.name}</span>
      </div>`;
    }).join('');


    const postFeed = appState.features.some(f => f.id === 'posts') ? appState.mockPosts.map(post => `
      <div class="bg-white p-4 mb-3 border border-gray-100 rounded-xl shadow-sm">
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-sm font-bold text-indigo-800">${(post.user && post.user[0]) || 'U'}</div>
          <span class="font-semibold text-gray-800">${post.user || 'Unknown User'}</span>
          <span class="text-xs text-gray-400 ml-auto">${formatTime(post.timestamp || Date.now())}</span>
        </div>
        <p class="text-gray-600 text-sm">${post.content || ''}</p>
      </div>
    `).join('') : '';


    const messageList = appState.features.some(f => f.id === 'messages') ? appState.mockMessages.map(msg => `
      <div class="flex ${msg.sender === 'Admin' ? 'justify-start' : 'justify-end'} mb-3">
        <div class="max-w-xs px-4 py-2 rounded-xl ${msg.sender === 'Admin' ? 'bg-indigo-500 text-white rounded-bl-none' : 'bg-gray-200 text-gray-800 rounded-br-none'} shadow-md">
          <p class="font-semibold text-xs mb-1 ${msg.sender === 'Admin' ? 'text-indigo-100' : 'text-gray-600'}">${msg.sender || 'Unknown Sender'}</p>
          <p class="text-sm">${msg.content || ''}</p>
        </div>
      </div>
    `).join('') : '';


    const counterLogic = activeFeatures.find(f => f.id === 'counter') ? `
      let count = 0;
      const counterDisplay = document.getElementById('counter-display');
      if(counterDisplay) {
        counterDisplay.textContent = count;
        document.getElementById('increment-btn').onclick = () => { count++; counterDisplay.textContent = count; };
        document.getElementById('decrement-btn').onclick = () => { count--; counterDisplay.textContent = count; };
      }
    ` : '';


    const allScreens = appState.features.map(feature => {
      let content = '';
      let isFullHeightScreen = false;


      if (feature.id === 'home') {
        isFullHeightScreen = true;
        content = `<div class="flex flex-col items-center justify-center h-full text-center p-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl">
          <div class="text-6xl mb-4 text-indigo-600">${feature.icon}</div>
          <h2 class="text-xl font-bold mb-3 text-gray-800">${appState.appTitle}</h2>
          <p class="text-gray-500 max-w-sm mb-6">${appState.appDescription}</p>
        </div>`;
      } else if (feature.id === 'posts') {
        content = `<div class="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl">${postFeed}</div>`;
      } else if (feature.id === 'messages') {
        content = `<div class="flex flex-col h-full bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl">${messageList}</div>`;
      } else if (feature.id === 'counter') {
        isFullHeightScreen = true;
        content = `<div class="flex flex-col items-center justify-center h-full text-center p-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl">
          <h3 class="text-xl font-semibold mb-6">Simple Counter</h3>
          <div id="counter-display" class="text-8xl font-mono mb-8 text-indigo-600">0</div>
          <div class="flex space-x-4">
            <button id="decrement-btn" class="bg-red-500 text-white p-4 text-3xl rounded-full shadow-lg hover:bg-red-600 transition">-</button>
            <button id="increment-btn" class="bg-green-500 text-white p-4 text-3xl rounded-full shadow-lg hover:bg-green-600 transition">+</button>
          </div>
        </div>`;
      } else if (feature.id === 'business') {
        isFullHeightScreen = true;
        content = `<div class="flex flex-col items-center justify-center h-full text-center p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl overflow-y-auto">
          <div class="text-5xl mb-4 text-green-600">💼</div>
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Choose Your Plan</h2>
          <div class="w-full max-w-md mx-auto space-y-4">
            <div class="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-800">Free Plan</h3>
                <span class="text-2xl font-bold text-blue-600">$0</span>
              </div>
              <ul class="text-sm text-gray-600 space-y-1 text-left">
                <li>✓ Basic features</li>
                <li>✓ Limited usage</li>
                <li>✓ Community support</li>
                <li>✓ Basic analytics</li>
              </ul>
              <button class="w-full mt-3 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">Current Plan</button>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-lg border-2 border-purple-300 hover:border-purple-400 transition-colors relative">
              <div class="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">POPULAR</div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-800">Premium Plan</h3>
                <span class="text-2xl font-bold text-purple-600">$${appState.premiumPrice}</span>
              </div>
              <ul class="text-sm text-gray-600 space-y-1 text-left">
                <li>✓ All free features</li>
                <li>✓ Unlimited usage</li>
                <li>✓ Priority support</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Custom branding</li>
                <li>✓ API access</li>
              </ul>
              <button class="w-full mt-3 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold">Upgrade Now</button>
            </div>
          </div>
        </div>`;
      } else if (feature.id === 'settings') {
        content = `<div class="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-sm space-y-3">
          <div class="text-gray-700 font-bold mb-3">User Preferences</div>
          <div class="text-gray-700">Profile Management</div>
          <div class="text-gray-700">Notification Preferences</div>
          <div class="text-red-500 font-medium pt-2 border-t mt-3">Log Out (Mock)</div>
        </div>`;
      } else {
        const displayContent = feature.customContent ? `<p class="text-gray-600 max-w-xs whitespace-pre-wrap">${feature.customContent}</p>` : `<p class="text-gray-500 max-w-xs">This is a custom module you created! Functionality to be added.</p>`;
        isFullHeightScreen = true;
        content = `<div class="flex flex-col items-center justify-center h-full text-center p-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl">
          <div class="text-5xl mb-4 text-gray-600">${feature.icon}</div>
          <h2 class="text-2xl font-bold mb-4 text-gray-800">${feature.name}</h2>
          ${displayContent}
          <button class="bg-indigo-600 text-white p-3 rounded-xl mt-4 shadow-md hover:bg-indigo-700 transition duration-150">Interact Here</button>
        </div>`;
      }


      return `<div id="${feature.id}" class="screen ${feature.isActive ? '' : 'hidden-screen'} ${isFullHeightScreen ? 'full-height' : ''}">${content}</div>`;
    }).join('');


    return `<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; height: 100vh; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; }
    #app-container { transition: all 0.3s ease; position: relative; max-width: 375px; height: 667px; border: 12px solid #333; border-radius: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; position: relative; }
    .app-content { width: 100%; height: 100%; position: relative; overflow: hidden; }
    .screen { display: none; height: 100%; overflow-y: auto; padding: 16px; padding-top: 95px; box-sizing: border-box; }
    .screen.active { display: block; }
    .screen.full-height { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 16px; }
    .screen.full-height.active { display: flex; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; position: absolute; top: 0; width: 100%; z-index: 10; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.15); box-sizing: border-box; }
    .header-top { display: flex; align-items: center; margin-bottom: 8px; }
    .header-title { text-align: center; font-size: 14px; font-weight: 600; opacity: 0.95; }
    .nav-bar { background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%); display: flex; flex-direction: column; position: absolute; top: 0; left: 0; height: 100%; width: 75%; max-width: 280px; z-index: 50; padding: 20px; transform: translateX(-100%); transition: transform 0.3s; box-shadow: 4px 0 20px rgba(0,0,0,0.3); overflow-y: auto; }
    .nav-bar.open { transform: translateX(0); }
    .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 40; display: none; }
    .overlay.active { display: block; }
  </style>
</head>
<body id="app-body">
  <div id="app-container">
    <div class="app-content">
      <div id="overlay" class="overlay" onclick="toggleNav(false);"></div>
      <div class="header">
        <div class="header-top">
          <button onclick="toggleNav()" class="hamburger p-2 text-2xl text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all">☰</button>
        </div>
        <div class="header-title">${appState.appTitle}</div>
      </div>
      <div id="nav-bar" class="nav-bar pt-20">
        <div class="text-sm font-bold text-white mb-6 text-center">🚀 Navigation</div>
        ${navItems}
      </div>
      <div class="h-full">${allScreens}</div>
    </div>
  </div>
  <script>
    const navBar = document.getElementById('nav-bar');
    const overlay = document.getElementById('overlay');
    const body = document.getElementById('app-body');


    function toggleNav(force) {
      const isOpen = navBar.classList.contains('open');
      const shouldOpen = (typeof force === 'boolean') ? force : !isOpen;
      if (shouldOpen) { navBar.classList.add('open'); overlay.classList.add('active'); }
      else { navBar.classList.remove('open'); overlay.classList.remove('active'); }
    }


    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
      const target = document.getElementById(screenId);
      if (target) {
        target.style.display = target.classList.contains('full-height') ? 'flex' : 'block';
        target.classList.add('active');
      }
    }


    document.addEventListener('DOMContentLoaded', () => {
      const first = document.querySelector('.screen:not(.hidden-screen)');
      if (first) { showScreen(first.id); ${counterLogic} }
    });
  </script>
</body>
</html>`;
  }, [appState]);

  const previewHtml = useMemo(() => buildPreviewHtml(), [buildPreviewHtml]);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mvp_prototype.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [previewHtml]);


  return (
    <div className="min-h-screen font-sans antialiased">

      {/* ── TABS ── */}
      <div style={{ background: 'rgba(26,26,62,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 4 }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 20, marginRight: 24, letterSpacing: '-0.02em', padding: '16px 0', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ZigForge</span>
          <button
            onClick={() => setActiveTab('guide')}
            style={{ padding: '18px 20px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'guide' ? '2px solid white' : '2px solid transparent', color: activeTab === 'guide' ? 'white' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
          >
            How it works
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            style={{ padding: '18px 20px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'builder' ? '2px solid white' : '2px solid transparent', color: activeTab === 'builder' ? 'white' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
          >
            Builder
          </button>
        </div>
      </div>

      {/* ── GUIDE TAB ── */}
      {activeTab === 'guide' && (
        <div style={{ background: '#1a1a3e', color: '#e8e8f0', minHeight: '100vh' }}>

          {/* HERO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 70%)' }}>
            <h1 style={{ fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 12, color: 'white' }}>
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ZigForge</span>
            </h1>
            <div style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 600, color: 'rgba(232,232,240,0.5)', marginBottom: 24 }}>Zig it. Then build it.</div>
            <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.55)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>
              A prototype builder designed for early-stage founders — visualize your app idea at every stage of development, from first sketch to investor-ready mockup, before writing a single line of code.
            </p>
            <button onClick={() => setActiveTab('builder')} style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontSize: 16, fontWeight: 700, padding: '16px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
              Start Building
            </button>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

          {/* PHILOSOPHY */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
              You don't need to know<br />what you want{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>yet</span>
            </h2>
            <div style={{ maxWidth: 720 }}>
              <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.6)', lineHeight: 1.8, marginBottom: 16 }}>A prototype is a visual, interactive mockup of your app — not the real product, but a realistic representation of how it will look and feel. ZigForge lets you build prototypes at any stage: to clarify your own thinking, to test with real users, or to present to investors.</p>
              <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.6)', lineHeight: 1.8, marginBottom: 16 }}>Many founders come with an idea but without a clear picture of what their product should look like. That's completely normal. <strong style={{ color: '#c4b5fd' }}>The path to building the right product often goes through seeing it first.</strong></p>
              <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.6)', lineHeight: 1.8 }}>Start for free — no credits, no commitment. Build skeleton versions, try different screens, download and compare. Only when you have a clear direction does it make sense to bring in AI. And even then — <strong style={{ color: '#c4b5fd' }}>start with BASIC, iterate, then upgrade to BOOST</strong> only when you know exactly what you want.</p>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

          {/* THREE STAGES */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16, color: 'white' }}>
              Three stages,{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>your pace</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(232,232,240,0.5)', marginBottom: 48, lineHeight: 1.7 }}>Each stage builds on the previous one. There's no rush — and no wrong order.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { badge: 'Free', bc: '#4ade80', bb: 'rgba(34,197,94,0.12)', bbr: 'rgba(34,197,94,0.25)', title: 'Explore & understand', sub: 'No credits needed — build as many versions as you want', cr: '0', cl: 'credits', steps: ['Describe your app — Enter your App Title, a short Tagline, and an Overview: who is it for, what problem does it solve, what makes it different.', 'Choose your screens — Activate the features you want. Each feature becomes one screen. You can also add custom screens with your own name and description.', 'Preview in real time — See a functional prototype instantly. No AI yet — just your structure, your content, your navigation.', 'Download and compare — Build several versions, share them, gather feedback. Repeat until you have a clear direction.'], note: "This stage is about clarity. Don't rush to AI until you have a good sense of your screens, your flow, and your content direction." },
                { badge: 'BASIC · MVP', bc: '#a78bfa', bb: 'rgba(124,58,237,0.12)', bbr: 'rgba(124,58,237,0.25)', title: 'Validate with AI', sub: 'Professional prototype — up to 4 screens, real design', cr: '5', cl: 'credits / run', steps: ['Choose your visual direction — Select a venture type (Social, SaaS, Marketplace, Service) and a design style. This guides the AI on layout, imagery, and tone.', 'AI builds each screen individually — The AI uses your structure, content and design preferences to generate a professional mockup. Takes 1–3 minutes.', 'Download and test — Share with users, mentors, or your team. Get real feedback on a real-looking prototype.', 'Improve as many times as needed — Write short feedback and re-generate. Each improvement costs 5 credits and rebuilds all screens from scratch.'], note: "Iterate here as much as you need. BASIC is designed for affordable, fast cycles until you're confident in the result." },
                { badge: 'BOOST · MLP', bc: '#f472b6', bb: 'rgba(236,72,153,0.12)', bbr: 'rgba(236,72,153,0.25)', title: 'Present with confidence', sub: 'Investor-ready — up to 8 screens, rich design, full polish', cr: '10', cl: 'credits / run', steps: ["Only when you're ready — Use BOOST after you've validated your direction with BASIC. Don't spend 10 credits on a first draft.", 'Up to 8 screens — A more complete product story. Richer content, more sophisticated layout, stronger visual impact.', 'Built for high-stakes moments — Investor meetings, demo days, team alignment, or any moment where first impressions matter.'], note: "Our recommendation: reach BOOST only after at least one solid BASIC iteration. The result will be dramatically better when you already know what you want." },
              ].map((p, pi) => (
                <div key={pi} style={{ background: '#1a1a3e' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                    <span style={{ flexShrink: 0, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: p.bb, border: `1px solid ${p.bbr}`, color: p.bc }}>{p.badge}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 2 }}>{p.title}</div><div style={{ fontSize: 13, color: 'rgba(232,232,240,0.4)' }}>{p.sub}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{p.cr}</div><div style={{ fontSize: 12, color: 'rgba(232,232,240,0.4)' }}>{p.cl}</div></div>
                  </div>
                  <div style={{ padding: '24px 28px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
                      {p.steps.map((s, si) => (
                        <div key={si} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(232,232,240,0.4)', flexShrink: 0, marginTop: 1 }}>{si + 1}</div>
                          <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.55)', lineHeight: 1.6 }}>{s}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, fontSize: 13, color: 'rgba(232,232,240,0.5)', lineHeight: 1.6 }}>{p.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

          {/* WHAT AI CAN DO */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16, color: 'white' }}>
              What the AI can <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>and cannot do</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(232,232,240,0.5)', marginBottom: 32, lineHeight: 1.7 }}>Every re-run rebuilds all screens from scratch. The AI starts fresh each time — it has no memory of previous versions.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { yes: true,  t: '"Make the colors darker and more corporate"' },
                { yes: true,  t: '"Add more detail to the pricing screen" or "Make the home page feel more premium"' },
                { yes: true,  t: '"Change the tone — more startup energy, less corporate"' },
                { yes: true,  t: '"Focus more on the community angle, less on features"' },
                { yes: false, t: '"Add a new screen" — go back to the feature list, activate it, then re-run. BASIC = 4 screens max, BOOST = 8.' },
                { yes: false, t: '"Keep what you did last time but change X" — the AI has no memory between runs.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 7, background: item.yes ? '#4ade80' : '#f472b6' }} />
                  <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.55)', lineHeight: 1.6 }}><strong style={{ color: 'rgba(232,232,240,0.9)' }}>{item.yes ? 'Works:' : "Won't work:"}</strong> {item.t}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', maxWidth: 960, margin: '0 auto' }} />

          {/* STARTZIG CONNECTION */}
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '48px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16, color: 'white' }}>
                From prototype to <span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>real traction</span>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(232,232,240,0.55)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
                ZigForge is where your idea takes shape. StartZig is where it takes off. Upload your prototype to your venture page, invite early users and fellow founders to explore it, and start collecting real feedback — before you write a single line of code.
              </p>
              <button onClick={() => setActiveTab('builder')} style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 0 30px rgba(124,58,237,0.25)' }}>
                Start Building
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── BUILDER TAB ── */}
      {activeTab === 'builder' && (
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
     
      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-800">✨ Generate Prototype</h2>
              <button onClick={() => { setShowAIModal(false); setIsGenerating(false); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-600 text-lg font-bold transition">✕</button>
            </div>
            <div className="p-6 pt-4">

            {!isGenerating && (<>
              {/* Venture Type */}
              <div className="mb-5">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Venture Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['social', '🗣', 'Social / Community', 'Feed, messages, profile'],
                    ['saas', '📊', 'SaaS / Home', 'Metrics, management, data'],
                    ['marketplace', '🛍', 'Marketplace', 'Products, shopping, sellers'],
                    ['service', '📅', 'Service / Booking', 'Services, bookings, schedule'],
                  ].map(([val, icon, label, desc]) => (
                    <button key={val} onClick={() => setVentureType(val)}
                      className={`p-3 rounded-xl border-2 text-left transition ${ventureType === val ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="font-semibold text-sm text-gray-800">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Preferences */}
              <div className="mb-5 space-y-4">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Design</h3>

                {/* Color Scheme */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">🎨 Color Scheme</p>
                  <div className="flex gap-2 flex-wrap">
                    {[['colorful','🌈 Colorful'],['dark','🌑 Dark'],['light','☀️ Light'],['minimal','⬜ Minimal']].map(([val, label]) => (
                      <button key={val} onClick={() => setDesignPrefs(p => ({...p, colorScheme: val}))}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border-2 transition ${designPrefs.colorScheme === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">✏️ Design Style</p>
                  <div className="flex gap-2 flex-wrap">
                    {[['modern','🔷 Modern'],['business','💼 Business'],['playful','🎮 Playful'],['elegant','💎 Elegant']].map(([val, label]) => (
                      <button key={val} onClick={() => setDesignPrefs(p => ({...p, style: val}))}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border-2 transition ${designPrefs.style === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Generation Mode</h3>
              <div className="space-y-3 mb-4">
                <button onClick={() => { setAiMode('BASIC'); handleGenerateWithAI('BASIC'); }}
                  className="w-full p-4 border-2 border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800">⚡ BASIC</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">5 credits</span>
                  </div>
                  <p className="text-sm text-gray-600">Clean, functional prototype with working navigation</p>
                  <p className="text-xs text-blue-500 mt-1 font-medium">Up to 4 screens</p>
                </button>
                <button onClick={() => { setAiMode('BOOST'); handleGenerateWithAI('BOOST'); }}
                  className="w-full p-4 border-2 border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800">🚀 BOOST</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">10 credits</span>
                  </div>
                  <p className="text-sm text-gray-600">Professional prototype with animations and rich content</p>
                  <p className="text-xs text-purple-500 mt-1 font-medium">Up to 8 screens</p>
                </button>
              </div>
            </>)}

            {isGenerating && (
              <div className="py-6 text-center">
                <div className="animate-spin text-5xl mb-4">⚙️</div>
                <p className="text-base font-bold text-gray-700 mb-1">Generating your prototype...</p>
                <p className="text-sm text-orange-500 font-medium mb-3">⏳ This may take a few minutes</p>
                {generatingStatus && <p className="text-xs text-indigo-600 mb-2">{generatingStatus}</p>}
                <p className="text-3xl font-mono font-bold text-gray-400 mb-4">{elapsedSeconds}s</p>
                <button onClick={() => { setIsGenerating(false); setGeneratingStatus(''); setElapsedSeconds(0); setShowAIModal(false); }}
                  className="text-xs text-red-500 hover:text-red-700 underline">Cancel</button>
              </div>
            )}
          </div>
          </div>
        </div>
      )}
     
      {/* Generated HTML Preview & Download */}
      {generatedHtml && (
        <div ref={generatedSectionRef} className="max-w-6xl mx-auto mb-6">
          <div className="p-6 bg-green-50 border-2 border-green-300 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-xl font-bold text-gray-800">Prototype Generated!</h3>
                <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded-full">{aiMode}</span>
              </div>
              <button
                onClick={() => setGeneratedHtml(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
           
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">📱 Live Preview</h4>
                <div className="flex justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-4 rounded-xl">
                  <iframe
                    title="AI Generated Prototype Preview"
                    srcDoc={generatedHtml}
                    className="drop-shadow-2xl"
                    style={{
                      width: '375px',
                      height: '667px',
                      border: '12px solid #333',
                      borderRadius: '40px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      background: 'white'
                    }}
                  />
                </div>
              </div>
             
              {/* Actions */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="p-4 bg-white rounded-xl border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-2">✨ Your prototype is ready!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download the HTML file to view on any device or share with your team.
                  </p>
                  <button
                    onClick={handleDownloadGeneratedHtml}
                    className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg"
                  >
                    📥 Download HTML File
                  </button>
                </div>
               
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">💡 Next Steps</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Test on different devices</li>
                    <li>✓ Share with stakeholders</li>
                    <li>✓ Gather feedback</li>
                    <li>✓ Iterate and improve</li>
                  </ul>
                </div>
               
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-1">🔄 Improve this prototype</h4>
                  <p className="text-xs text-gray-500 mb-2">Short feedback only (max 200 chars)</p>
                  <textarea
                    maxLength={200}
                    rows={3}
                    placeholder="e.g. Make the colors darker, add more posts..."
                    className="w-full border border-purple-200 rounded-lg p-2 text-sm mb-2 resize-none"
                    value={improvementNotes}
                    onChange={(e) => setImprovementNotes(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 text-right mb-2">{improvementNotes.length}/200</p>
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition"
                  >
                    🔄 Generate Improved Version
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">⚙️</span>
            App Core Settings
          </h2>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">App Title</span>
            <input
              type="text"
              className="mt-2 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 text-gray-800 font-medium"
              value={appState.appTitle}
              onChange={(e) => handleSimpleContentChange('appTitle', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">App Description <span className="text-gray-400 font-normal">(Tagline)</span></span>
            <textarea
              rows="2"
              className="mt-2 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 text-gray-800"
              value={appState.appDescription}
              onChange={(e) => handleSimpleContentChange('appDescription', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">App Overview <span className="text-gray-400 font-normal">(Value Proposition)</span></span>
            <textarea
              rows="4"
              placeholder="Describe what your app does, who it's for, and what makes it different..."
              className="mt-2 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 text-gray-800"
              value={appState.appOverview}
              onChange={(e) => handleSimpleContentChange('appOverview', e.target.value)}
            />
          </label>
        </div>


        <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            App Features
          </h2>
          {appState.features.map((feature) => (
            <div key={feature.id} className="flex flex-col p-4 border-2 border-gray-100 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-purple-50 hover:to-indigo-50 transition-all">
              <div className="flex items-start space-x-3 mb-3">
                <div className="text-2xl bg-white rounded-full p-2 shadow-md">{feature.icon}</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{feature.name}</p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>


              {feature.id === 'business' && (
                <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <label className="block">
                    <span className="text-xs font-bold text-green-700">💰 Premium Plan Price ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full rounded-lg border-2 border-green-300 p-2 font-bold text-center"
                      value={appState.premiumPrice}
                      onChange={(e) => handleSimpleContentChange('premiumPrice', e.target.value)}
                    />
                  </label>
                </div>
              )}


              <div className="flex items-center space-x-3 justify-end pt-3 border-t border-gray-200">
                <input
                  type="text"
                  maxLength="2"
                  className="w-16 text-center text-xl rounded-xl border-2 border-gray-200 p-2 font-bold"
                  value={feature.icon}
                  onChange={(e) => handleFeatureIconChange(feature.id, e.target.value)}
                  disabled={feature.id === 'home'}
                />
                <button
                  onClick={() => handleFeatureToggle(feature.id)}
                  disabled={feature.id === 'home'}
                  className={`px-6 py-3 text-sm font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 ${
                    feature.isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                  } ${feature.id === 'home' ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                  >
                  {feature.id === 'home' ? 'Mandatory' : (feature.isActive ? 'Active' : 'Disabled')}
                </button>
              </div>
            </div>
          ))}
        </div>


        <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
            <span className="text-2xl mr-2">✨</span>
            Add New Feature
          </h2>
          <label className="block">
            <span className="text-sm font-bold text-indigo-700">Feature Name</span>
            <input
              type="text"
              placeholder="e.g., Rewards Program"
              className="mt-2 block w-full rounded-xl border-2 border-indigo-200 p-3 font-medium"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-indigo-700">Description</span>
            <textarea
              rows="3"
              placeholder="Describe this feature..."
              className="mt-2 block w-full rounded-xl border-2 border-indigo-200 p-3"
              value={newFeatureContent}
              onChange={(e) => setNewFeatureContent(e.target.value)}
            />
          </label>
          <button
            onClick={handleAddNewFeature}
            disabled={!newFeatureName.trim()}
            className="w-full py-3 px-6 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            Add Feature to Prototype
          </button>
        </div>


        <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Mock Posts Data
          </h2>
          <p className="text-sm text-orange-600 font-semibold">⚠️ Use valid JSON array format to prevent errors</p>
          <textarea
            className={`mt-2 block w-full h-32 rounded-xl p-4 border-2 text-sm font-mono transition-all ${
              jsonParseError && jsonParseError.includes('mockPosts') ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}
            value={JSON.stringify(appState.mockPosts, null, 2)}
            onChange={(e) => handleContentJsonChange('mockPosts', e.target.value)}
          />
          {jsonParseError && jsonParseError.includes('mockPosts') && (
            <p className="text-sm text-red-600 font-bold bg-red-100 p-3 rounded-lg">{jsonParseError}</p>
          )}
        </div>


        <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">📱</span>
              Live Preview
            </h2>
           
            {/* View Mode Selector */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                  viewMode === 'mobile'
                    ? 'bg-white text-purple-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📱 Mobile
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                  viewMode === 'desktop'
                    ? 'bg-white text-purple-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                💻 Desktop
              </button>
            </div>
          </div>
         
          <p className="text-center text-gray-600 mb-4">Watch your changes in real-time!</p>
         
          <div className="flex justify-center">
            <iframe
              title="MVP Prototype Preview"
              srcDoc={previewHtml}
              className="mx-auto drop-shadow-2xl transition-all duration-300"
              style={{
                width: viewMode === 'mobile' ? '375px' : '100%',
                maxWidth: viewMode === 'mobile' ? '375px' : '1200px',
                height: viewMode === 'mobile' ? '667px' : '800px',
                border: '12px solid #333',
                borderRadius: viewMode === 'mobile' ? '40px' : '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>


        <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Export?</h3>
         
          <div className="space-y-3">
            {/* Download Button */}
            <button
              onClick={handleDownloadHtml}
              className="w-full py-4 px-6 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📥 Download Prototype HTML
            </button>
           
            {/* AI Generate Button - only show if app title is filled */}
            {appState.appTitle && appState.appTitle.trim() && (
              <button
                onClick={() => setShowAIModal(true)}
                className="w-full py-4 px-6 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✨ Upgrade with AI
              </button>
            )}
          </div>
         
          <p className="text-sm text-gray-600 mt-3">
            {appState.appTitle && appState.appTitle.trim()
              ? "Download now or upgrade with AI for a professional prototype!"
              : "Fill in your app details above to enable AI upgrade"}
          </p>
        </div>
      </div>
      </div>
      )}

    </div>
  );
};


export default App;





