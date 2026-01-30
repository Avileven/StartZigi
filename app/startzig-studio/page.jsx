// startzig studio ENHANCED - 10 Features Including AI Mentor! 🚀🤖
"use client";
import React, { useState, useCallback, useMemo, useEffect } from 'react';


// 📦 1. TEMPLATES - Pre-built app templates
const APP_TEMPLATES = {
  blank: {
    name: 'Blank Canvas',
    appTitle: 'My App',
    appDescription: 'Start from scratch',
    features: [
      { id: 'home', name: 'Dashboard', icon: '🏠', description: 'Application welcome screen.', isActive: true, isDefault: true }
    ],
    theme: { primary: '#667eea', secondary: '#764ba2', accent: '#f59e0b' }
  },
  social: {
    name: 'Social Network',
    appTitle: 'Social Connect',
    appDescription: 'Connect with friends and share moments',
    features: [
      { id: 'home', name: 'Dashboard', icon: '🏠', description: 'Application welcome screen.', isActive: true, isDefault: true },
      { id: 'posts', name: 'Feed', icon: '📱', description: 'Social feed with posts', isActive: true },
      { id: 'messages', name: 'Messages', icon: '💬', description: 'Direct messaging', isActive: true },
      { id: 'profile', name: 'Profile', icon: '👤', description: 'User profile', isActive: true },
      { id: 'settings', name: 'Settings', icon: '⚙️', description: 'App settings', isActive: true }
    ],
    theme: { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#ec4899' }
  },
  ecommerce: {
    name: 'E-Commerce',
    appTitle: 'Shop Now',
    appDescription: 'Your online store',
    features: [
      { id: 'home', name: 'Home', icon: '🏠', description: 'Store homepage', isActive: true, isDefault: true },
      { id: 'products', name: 'Products', icon: '🛍️', description: 'Product catalog', isActive: true },
      { id: 'cart', name: 'Cart', icon: '🛒', description: 'Shopping cart', isActive: true },
      { id: 'orders', name: 'Orders', icon: '📦', description: 'Order history', isActive: true },
      { id: 'settings', name: 'Account', icon: '⚙️', description: 'User account', isActive: true }
    ],
    theme: { primary: '#f59e0b', secondary: '#ef4444', accent: '#10b981' }
  },
  saas: {
    name: 'SaaS Dashboard',
    appTitle: 'Dashboard Pro',
    appDescription: 'Your business analytics platform',
    features: [
      { id: 'home', name: 'Dashboard', icon: '📊', description: 'Main dashboard', isActive: true, isDefault: true },
      { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Data analytics', isActive: true },
      { id: 'reports', name: 'Reports', icon: '📄', description: 'Generate reports', isActive: true },
      { id: 'team', name: 'Team', icon: '👥', description: 'Team management', isActive: true },
      { id: 'settings', name: 'Settings', icon: '⚙️', description: 'App settings', isActive: true }
    ],
    theme: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' }
  },
  fitness: {
    name: 'Fitness Tracker',
    appTitle: 'FitLife',
    appDescription: 'Track your fitness journey',
    features: [
      { id: 'home', name: 'Home', icon: '🏋️', description: 'Fitness dashboard', isActive: true, isDefault: true },
      { id: 'workouts', name: 'Workouts', icon: '💪', description: 'Workout plans', isActive: true },
      { id: 'nutrition', name: 'Nutrition', icon: '🥗', description: 'Meal tracking', isActive: true },
      { id: 'progress', name: 'Progress', icon: '📈', description: 'Track progress', isActive: true },
      { id: 'settings', name: 'Profile', icon: '⚙️', description: 'User profile', isActive: true }
    ],
    theme: { primary: '#10b981', secondary: '#059669', accent: '#f59e0b' }
  }
};


// 🎨 5. THEME BUILDER - Predefined themes
const THEME_PRESETS = {
  default: { name: 'Purple Dream', primary: '#667eea', secondary: '#764ba2', accent: '#f59e0b' },
  ocean: { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#3b82f6' },
  sunset: { name: 'Sunset', primary: '#f97316', secondary: '#ef4444', accent: '#fbbf24' },
  forest: { name: 'Forest Green', primary: '#10b981', secondary: '#059669', accent: '#34d399' },
  royal: { name: 'Royal Purple', primary: '#8b5cf6', secondary: '#6366f1', accent: '#a855f7' },
  midnight: { name: 'Midnight', primary: '#1e293b', secondary: '#334155', accent: '#64748b' }
};


// 📱 6. COMPONENTS LIBRARY
const COMPONENT_TEMPLATES = {
  button: {
    name: 'Button',
    icon: '🔘',
    html: '<button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">Click Me</button>'
  },
  card: {
    name: 'Card',
    icon: '🃏',
    html: '<div class="bg-white p-4 rounded-xl shadow-md"><h3 class="font-bold text-lg mb-2">Card Title</h3><p class="text-gray-600">Card content goes here</p></div>'
  },
  input: {
    name: 'Input Field',
    icon: '📝',
    html: '<input type="text" placeholder="Enter text..." class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">'
  },
  badge: {
    name: 'Badge',
    icon: '🏷️',
    html: '<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">New</span>'
  }
};


const defaultFeatureTemplates = [
  { id: 'home', name: 'Dashboard', icon: '🏠', description: 'Application welcome screen.', isActive: true, isDefault: true },
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
  premiumPrice: '9.99',
  theme: THEME_PRESETS.default,
  viewMode: 'mobile' // mobile, tablet, desktop
});


const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};


// 💾 1. localStorage helpers
const saveToLocalStorage = (state) => {
  try {
    localStorage.setItem('startzig_studio_project', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};


const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('startzig_studio_project');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
};


// 🤖 9. AI SUGGESTIONS
const getAISuggestions = (appState) => {
  const suggestions = [];
 
  // Check if too many features are active
  const activeCount = appState.features.filter(f => f.isActive).length;
  if (activeCount > 7) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Too many features',
      message: 'Consider reducing to 5-6 core features for better UX'
    });
  }
 
  // Check if missing critical features
  const hasSettings = appState.features.some(f => f.id === 'settings' && f.isActive);
  if (!hasSettings) {
    suggestions.push({
      type: 'tip',
      icon: '💡',
      title: 'Add Settings',
      message: 'Most apps need a settings/profile section'
    });
  }
 
  // Check app description length
  if (appState.appDescription.length < 20) {
    suggestions.push({
      type: 'tip',
      icon: '✍️',
      title: 'Expand description',
      message: 'A detailed description helps users understand your app better'
    });
  }
 
  // Suggest adding business model if missing
  const hasBusiness = appState.features.some(f => f.id === 'business' && f.isActive);
  if (!hasBusiness && activeCount > 3) {
    suggestions.push({
      type: 'idea',
      icon: '💰',
      title: 'Monetization',
      message: 'Consider adding a business model or pricing section'
    });
  }
 
  return suggestions;
};


const App = () => {
  // 💾 1. Load from localStorage on mount
  const [appState, setAppState] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved || getInitialState();
  });
 
  const [jsonParseError, setJsonParseError] = useState(null);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureContent, setNewFeatureContent] = useState('');
  const [draggedFeature, setDraggedFeature] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [showComponentsLib, setShowComponentsLib] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAIMentor, setShowAIMentor] = useState(false);
  const [aiMentorFeedback, setAiMentorFeedback] = useState(null);
  const [aiMentorLoading, setAiMentorLoading] = useState(false);


  // 💾 1. Auto-save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage(appState);
  }, [appState]);
 
  // 🤖 9. Update AI suggestions when state changes
  useEffect(() => {
    setAiSuggestions(getAISuggestions(appState));
  }, [appState]);


  const handleSimpleContentChange = useCallback((key, value) => {
    setAppState(prev => ({ ...prev, [key]: value }));
  }, []);


  const handleContentJsonChange = useCallback((key, jsonString) => {
    setJsonParseError(null);
    try {
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData)) {
        setAppState(prev => ({ ...prev, [key]: parsedData }));
      } else {
        setJsonParseError(`Input for ${key} must be a valid JSON array.`);
      }
    } catch (e) {
      setJsonParseError(`Invalid JSON format for ${key}. Please check syntax.`);
    }
  }, []);


  const handleFeatureToggle = useCallback((id) => {
    if (id === 'home') return;
    setAppState(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.id === id ? { ...f, isActive: !f.isActive } : f
      )
    }));
  }, []);


  const handleFeatureIconChange = useCallback((id, newIcon) => {
    if (id === 'home') return;
    setAppState(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.id === id ? { ...f, icon: newIcon.trim().slice(0, 2) } : f
      )
    }));
  }, []);


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
    setAppState(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    setNewFeatureName('');
    setNewFeatureContent('');
  }, [newFeatureName, newFeatureContent]);
 
  // 🎨 2. Template loader
  const handleLoadTemplate = useCallback((templateKey) => {
    const template = APP_TEMPLATES[templateKey];
    if (!template) return;
   
    setAppState({
      ...getInitialState(),
      appTitle: template.appTitle,
      appDescription: template.appDescription,
      features: template.features,
      theme: template.theme
    });
    setShowTemplates(false);
  }, []);
 
  // 🔄 4. Drag & Drop handlers
  const handleDragStart = useCallback((e, index) => {
    setDraggedFeature(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);
 
  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (draggedFeature === null || draggedFeature === index) return;
   
    setAppState(prev => {
      const features = [...prev.features];
      const draggedItem = features[draggedFeature];
      features.splice(draggedFeature, 1);
      features.splice(index, 0, draggedItem);
      return { ...prev, features };
    });
    setDraggedFeature(index);
  }, [draggedFeature]);
 
  const handleDragEnd = useCallback(() => {
    setDraggedFeature(null);
  }, []);
 
  // 🎨 5. Theme customization
  const handleThemeChange = useCallback((themeKey) => {
    setAppState(prev => ({
      ...prev,
      theme: THEME_PRESETS[themeKey]
    }));
  }, []);
 
  const handleCustomThemeChange = useCallback((colorKey, value) => {
    setAppState(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorKey]: value
      }
    }));
  }, []);
 
  // 📱 8. Responsive preview
  const handleViewModeChange = useCallback((mode) => {
    setAppState(prev => ({ ...prev, viewMode: mode }));
  }, []);
 
  // 🤖 AI MENTOR - Get feedback from AI
  const handleAIMentorAnalysis = useCallback(async () => {
    setAiMentorLoading(true);
    setShowAIMentor(true);
    setAiMentorFeedback(null);
   
    try {
      // Prepare the mockup data for AI analysis
      const mockupData = {
        appTitle: appState.appTitle,
        appDescription: appState.appDescription,
        features: appState.features.filter(f => f.isActive).map(f => ({
          name: f.name,
          icon: f.icon,
          description: f.description
        })),
        theme: appState.theme,
        totalFeatures: appState.features.filter(f => f.isActive).length
      };
     
      const prompt = `You are a UX/UI mentor reviewing a mobile app mockup. Analyze this app design and provide constructive feedback.


App Details:
- Title: ${mockupData.appTitle}
- Description: ${mockupData.appDescription}
- Number of Features: ${mockupData.totalFeatures}
- Features: ${mockupData.features.map(f => `${f.icon} ${f.name}: ${f.description}`).join(', ')}
- Theme Colors: Primary ${mockupData.theme.primary}, Secondary ${mockupData.theme.secondary}


Please provide feedback in the following categories:
1. **User Experience**: Is the app intuitive? Too many/few features?
2. **Visual Design**: Do the colors work well? Are icons appropriate?
3. **Feature Organization**: Is the feature set coherent? Any missing essentials?
4. **Naming & Clarity**: Are the app title and descriptions clear?
5. **Recommendations**: 2-3 specific actionable improvements


Keep feedback constructive, specific, and actionable. Format in clear sections.`;


      // Call your AI API endpoint
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: prompt }
          ],
        })
      });
     
      const data = await response.json();
     
      // Extract text response
      const feedbackText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
     
      setAiMentorFeedback(feedbackText);
    } catch (error) {
      console.error('AI Mentor error:', error);
      setAiMentorFeedback('⚠️ Failed to get AI feedback. Please try again.');
    } finally {
      setAiMentorLoading(false);
    }
  }, [appState]);


  const previewHtml = useMemo(() => {
    const activeFeatures = appState.features.filter(f => f.isActive);
    const theme = appState.theme || THEME_PRESETS.default;


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
          <div class="text-6xl mb-4" style="color: ${theme.primary}">${feature.icon}</div>
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
          <div id="counter-display" class="text-8xl font-mono mb-8" style="color: ${theme.primary}">0</div>
          <div class="flex space-x-4">
            <button id="decrement-btn" class="bg-red-500 text-white p-4 text-3xl rounded-full shadow-lg hover:bg-red-600 transition">-</button>
            <button id="increment-btn" class="bg-green-500 text-white p-4 text-3xl rounded-full shadow-lg hover:bg-green-600 transition">+</button>
          </div>
        </div>`;
      } else if (feature.id === 'business') {
        content = `<div class="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl">
          <h3 class="text-2xl font-bold mb-6 text-gray-800 text-center">Choose Your Plan</h3>
          <div class="space-y-4">
            <div class="border-2 border-gray-200 p-5 rounded-xl hover:border-gray-400 transition cursor-pointer">
              <div class="text-lg font-bold text-gray-700 mb-2">Free Plan</div>
              <div class="text-3xl font-extrabold mb-3">$0<span class="text-base font-normal text-gray-500">/month</span></div>
              <ul class="text-gray-600 space-y-2 text-sm">
                <li>✓ Basic features</li>
                <li>✓ Limited usage</li>
                <li>✓ Community support</li>
              </ul>
            </div>
            <div class="border-2 p-5 rounded-xl transition cursor-pointer shadow-lg" style="border-color: ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)">
              <div class="text-lg font-bold mb-2" style="color: ${theme.primary}">Premium Plan ⭐</div>
              <div class="text-3xl font-extrabold mb-3" style="color: ${theme.primary}">$${appState.premiumPrice}<span class="text-base font-normal text-gray-500">/month</span></div>
              <ul class="text-gray-700 space-y-2 text-sm font-medium">
                <li>✓ All features unlocked</li>
                <li>✓ Unlimited usage</li>
                <li>✓ Priority support</li>
                <li>✓ Advanced analytics</li>
              </ul>
            </div>
          </div>
        </div>`;
      } else if (feature.id === 'settings') {
        content = `<div class="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl">
          <h3 class="text-xl font-bold mb-4 text-gray-800">Settings</h3>
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
          <button class="text-white p-3 rounded-xl mt-4 shadow-md hover:opacity-90 transition duration-150" style="background-color: ${theme.primary}">Interact Here</button>
        </div>`;
      }


      return `<div id="${feature.id}" class="screen ${feature.isActive ? '' : 'hidden-screen'} ${isFullHeightScreen ? 'full-height' : ''}">${content}</div>`;
    }).join('');


    return `<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; height: 100vh; overflow: hidden; background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%); display: flex; align-items: center; justify-content: center; }
    #app-container { transition: all 0.3s ease; position: relative; max-width: 375px; height: 667px; border: 12px solid #333; border-radius: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; position: relative; }
    .app-content { width: 100%; height: 100%; position: relative; overflow: hidden; }
    .screen { display: none; height: 100%; overflow-y: auto; padding: 16px; padding-top: 95px; box-sizing: border-box; }
    .screen.active { display: block; }
    .screen.full-height { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 16px; }
    .screen.full-height.active { display: flex; }
    .header { background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%); color: white; padding: 12px 16px; position: absolute; top: 0; width: 100%; z-index: 10; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.15); box-sizing: border-box; }
    .header-top { display: flex; align-items: center; margin-bottom: 8px; }
    .header-title { text-align: center; font-size: 14px; font-weight: 600; opacity: 0.95; }
    .nav-bar { background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 50%, ${theme.primary}40 100%); display: flex; flex-direction: column; position: absolute; top: 0; left: 0; height: 100%; width: 75%; max-width: 280px; z-index: 50; padding: 20px; transform: translateX(-100%); transition: transform 0.3s; box-shadow: 4px 0 20px rgba(0,0,0,0.3); overflow-y: auto; }
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
      ${allScreens}
    </div>
  </div>
  <script>
    let currentScreen = 'home';
    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) {
        target.classList.add('active');
        currentScreen = screenId;
      }
    }
    function toggleNav(forceClose = null) {
      const nav = document.getElementById('nav-bar');
      const overlay = document.getElementById('overlay');
      const isOpen = nav.classList.contains('open');
      if (forceClose === false || isOpen) {
        nav.classList.remove('open');
        overlay.classList.remove('active');
      } else if (forceClose === true || !isOpen) {
        nav.classList.add('open');
        overlay.classList.add('active');
      }
    }
    showScreen('home');
    ${counterLogic}
  </script>
</body>
</html>`;
  }, [appState]);


  // 📥 3. Export to multiple formats
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
 
  const handleExportJSON = useCallback(() => {
    const exportData = {
      appTitle: appState.appTitle,
      appDescription: appState.appDescription,
      features: appState.features,
      theme: appState.theme,
      mockPosts: appState.mockPosts,
      mockMessages: appState.mockMessages,
      premiumPrice: appState.premiumPrice
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [appState]);
 
  const handleExportReact = useCallback(() => {
    const reactCode = `// Generated React Component
import React, { useState } from 'react';


const ${appState.appTitle.replace(/[^a-zA-Z0-9]/g, '')}App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
 
  const features = ${JSON.stringify(appState.features.filter(f => f.isActive), null, 2)};
 
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>${appState.appTitle}</h1>
        <nav>
          {features.map(f => (
            <button key={f.id} onClick={() => setCurrentScreen(f.id)}>
              {f.icon} {f.name}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {currentScreen === 'home' && (
          <div className="home-screen">
            <h2>${appState.appTitle}</h2>
            <p>${appState.appDescription}</p>
          </div>
        )}
        {/* Add other screens here */}
      </main>
    </div>
  );
};


export default ${appState.appTitle.replace(/[^a-zA-Z0-9]/g, '')}App;`;
   
    const blob = new Blob([reactCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AppComponent.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [appState]);
 
  // 💾 Clear project
  const handleClearProject = useCallback(() => {
    if (window.confirm('Are you sure you want to clear this project? This cannot be undone.')) {
      localStorage.removeItem('startzig_studio_project');
      setAppState(getInitialState());
    }
  }, []);
 
  // Get preview dimensions based on view mode
  const getPreviewDimensions = () => {
    switch (appState.viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px', label: '📱 Mobile' };
      case 'tablet':
        return { width: '768px', height: '1024px', label: '📱 Tablet' };
      case 'desktop':
        return { width: '1200px', height: '800px', label: '💻 Desktop' };
      default:
        return { width: '375px', height: '667px', label: '📱 Mobile' };
    }
  };
 
  const previewDimensions = getPreviewDimensions();


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 font-sans antialiased">
      <header className="text-center mb-6">
        <h1 className="text-5xl font-extrabold text-white mb-2">
          🚀 Startzig Studio <span className="text-xl bg-yellow-400 text-purple-900 px-3 py-1 rounded-full">ENHANCED</span>
        </h1>
        <p className="text-purple-100 text-lg">10 Features: AI Mentor • Templates • Export • Themes • More!</p>
       
        {/* Quick action buttons */}
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <button
            onClick={handleAIMentorAnalysis}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            🤖 AI Mentor
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="bg-white text-purple-700 px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            📦 Templates
          </button>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            📥 Export
          </button>
          <button
            onClick={() => setShowThemeBuilder(!showThemeBuilder)}
            className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            🎨 Themes
          </button>
          <button
            onClick={() => setShowComponentsLib(!showComponentsLib)}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            🧩 Components
          </button>
          <button
            onClick={handleClearProject}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            🗑️ Clear
          </button>
        </div>
      </header>


      <div className="max-w-7xl mx-auto space-y-6">
       
        {/* 📦 2. TEMPLATES PANEL */}
        {showTemplates && (
          <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-purple-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                Choose a Template
              </h2>
              <button onClick={() => setShowTemplates(false)} className="text-2xl hover:bg-gray-100 rounded-full p-2">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(APP_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => handleLoadTemplate(key)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition cursor-pointer group"
                >
                  <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.appDescription}</p>
                  <div className="flex gap-1 flex-wrap">
                    {template.features.slice(0, 5).map(f => (
                      <span key={f.id} className="text-lg">{f.icon}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
       
        {/* 📥 3. EXPORT MENU */}
        {showExportMenu && (
          <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-green-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">📥</span>
                Export Your Project
              </h2>
              <button onClick={() => setShowExportMenu(false)} className="text-2xl hover:bg-gray-100 rounded-full p-2">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleDownloadHtml}
                className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">🌐</div>
                <div className="text-lg">HTML File</div>
                <div className="text-xs opacity-80 mt-1">Standalone prototype</div>
              </button>
              <button
                onClick={handleExportJSON}
                className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">📋</div>
                <div className="text-lg">JSON Config</div>
                <div className="text-xs opacity-80 mt-1">App configuration</div>
              </button>
              <button
                onClick={handleExportReact}
                className="p-6 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-cyan-700 transition transform hover:scale-105 shadow-lg"
              >
                <div className="text-4xl mb-2">⚛️</div>
                <div className="text-lg">React Component</div>
                <div className="text-xs opacity-80 mt-1">Starter code</div>
              </button>
            </div>
          </div>
        )}
       
        {/* 🎨 5. THEME BUILDER */}
        {showThemeBuilder && (
          <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-pink-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🎨</span>
                Theme Builder
              </h2>
              <button onClick={() => setShowThemeBuilder(false)} className="text-2xl hover:bg-gray-100 rounded-full p-2">✕</button>
            </div>
           
            {/* Theme presets */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Quick Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(THEME_PRESETS).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className="p-4 rounded-xl border-2 hover:scale-105 transition"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                      borderColor: appState.theme.name === theme.name ? '#000' : 'transparent'
                    }}
                  >
                    <div className="text-white font-bold">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
           
            {/* Custom colors */}
            <div className="space-y-3">
              <h3 className="font-bold">Custom Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-gray-700">Primary Color</span>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={appState.theme.primary}
                      onChange={(e) => handleCustomThemeChange('primary', e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={appState.theme.primary}
                      onChange={(e) => handleCustomThemeChange('primary', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-gray-700">Secondary Color</span>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={appState.theme.secondary}
                      onChange={(e) => handleCustomThemeChange('secondary', e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={appState.theme.secondary}
                      onChange={(e) => handleCustomThemeChange('secondary', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-gray-700">Accent Color</span>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={appState.theme.accent}
                      onChange={(e) => handleCustomThemeChange('accent', e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={appState.theme.accent}
                      onChange={(e) => handleCustomThemeChange('accent', e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
       
        {/* 🧩 6. COMPONENTS LIBRARY */}
        {showComponentsLib && (
          <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-blue-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🧩</span>
                Components Library
              </h2>
              <button onClick={() => setShowComponentsLib(false)} className="text-2xl hover:bg-gray-100 rounded-full p-2">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Copy these HTML snippets to use in your custom features</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(COMPONENT_TEMPLATES).map(([key, comp]) => (
                <div key={key} className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{comp.icon}</span>
                      <span className="font-bold">{comp.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(comp.html);
                        alert('Copied to clipboard!');
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <code className="text-xs text-gray-700 break-all">{comp.html}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
       
        {/* 🤖 9. AI SUGGESTIONS */}
        {aiSuggestions.length > 0 && (
          <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <span className="text-2xl mr-2">🤖</span>
              AI Suggestions
            </h2>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${
                    suggestion.type === 'warning' ? 'bg-red-50 border-red-300' :
                    suggestion.type === 'tip' ? 'bg-blue-50 border-blue-300' :
                    'bg-purple-50 border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div>
                      <div className="font-bold text-gray-800">{suggestion.title}</div>
                      <div className="text-sm text-gray-600">{suggestion.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
       
        {/* 🤖 AI MENTOR FEEDBACK PANEL */}
        {showAIMentor && (
          <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-4 border-orange-400 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                AI Mentor Feedback
              </h2>
              <button
                onClick={() => setShowAIMentor(false)}
                className="text-2xl hover:bg-gray-100 rounded-full p-2 transition"
              >
                ✕
              </button>
            </div>
           
            {aiMentorLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin text-6xl mb-4">🤖</div>
                <p className="text-lg font-semibold text-gray-700">AI Mentor is analyzing your mockup...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            ) : aiMentorFeedback ? (
              <div className="bg-white rounded-xl p-6 shadow-inner">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {aiMentorFeedback}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleAIMentorAnalysis}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                  >
                    🔄 Get Fresh Feedback
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Click the "AI Mentor" button to get feedback on your mockup!</p>
              </div>
            )}
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Configuration */}
          <div className="space-y-6">
            <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">⚙️</span>
                App Core Settings
              </h2>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">App Name</span>
                <input
                  type="text"
                  className="mt-2 block w-full rounded-xl border-2 border-gray-200 p-3 font-bold text-lg focus:border-purple-500 focus:outline-none transition"
                  value={appState.appTitle}
                  onChange={(e) => handleSimpleContentChange('appTitle', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">App Description</span>
                <textarea
                  rows="3"
                  className="mt-2 block w-full rounded-xl border-2 border-gray-200 p-3 focus:border-purple-500 focus:outline-none transition"
                  value={appState.appDescription}
                  onChange={(e) => handleSimpleContentChange('appDescription', e.target.value)}
                />
              </label>
            </div>


            {/* 🔄 4. DRAG & DROP FEATURES */}
            <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                App Features <span className="text-sm ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Drag to reorder!</span>
              </h2>
              {appState.features.map((feature, index) => (
                <div
                  key={feature.id}
                  draggable={feature.id !== 'home'}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col p-4 border-2 rounded-xl bg-gradient-to-r from-gray-50 to-white transition-all ${
                    feature.id === 'home' ? 'opacity-75 cursor-not-allowed' : 'cursor-move hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg'
                  } ${draggedFeature === index ? 'opacity-50 scale-95' : ''}`}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    {feature.id !== 'home' && <div className="text-gray-400 text-xl">⋮⋮</div>}
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
          </div>


          {/* Right column - Preview */}
          <div className="space-y-6">
            <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl sticky top-4">
              {/* 📱 8. RESPONSIVE PREVIEW CONTROLS */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">📱</span>
                  Live Preview
                </h2>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => handleViewModeChange('mobile')}
                    className={`px-3 py-1 rounded-lg font-bold text-sm transition ${
                      appState.viewMode === 'mobile' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                    }`}
                  >
                    📱
                  </button>
                  <button
                    onClick={() => handleViewModeChange('tablet')}
                    className={`px-3 py-1 rounded-lg font-bold text-sm transition ${
                      appState.viewMode === 'tablet' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                    }`}
                  >
                    📱
                  </button>
                  <button
                    onClick={() => handleViewModeChange('desktop')}
                    className={`px-3 py-1 rounded-lg font-bold text-sm transition ${
                      appState.viewMode === 'desktop' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                    }`}
                  >
                    💻
                  </button>
                </div>
              </div>
             
              <p className="text-center text-gray-600 mb-2">{previewDimensions.label} View</p>
              <p className="text-center text-xs text-gray-500 mb-4">💾 Auto-saved to browser</p>
             
              <div className="flex justify-center overflow-x-auto">
                <iframe
                  title="MVP Prototype Preview"
                  srcDoc={previewHtml}
                  className="mx-auto drop-shadow-2xl transition-all duration-300"
                  style={{
                    width: previewDimensions.width,
                    height: previewDimensions.height,
                    maxWidth: '100%',
                    border: '12px solid #333',
                    borderRadius: appState.viewMode === 'mobile' ? '40px' : '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default App;



