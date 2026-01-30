"use client";
import React, { useState, useCallback, useMemo } from 'react';

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
});

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const App = () => {
  const [appState, setAppState] = useState(getInitialState);
  const [jsonParseError, setJsonParseError] = useState(null);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureContent, setNewFeatureContent] = useState('');

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

  const previewHtml = useMemo(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 font-sans antialiased">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-white mb-2">🚀 Startzig Studio</h1>
        <p className="text-purple-100">Configure your app in real-time!</p>
      </header>

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
            <span className="text-sm font-semibold text-gray-700">App Description</span>
            <textarea
              rows="3"
              className="mt-2 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 text-gray-800"
              value={appState.appDescription}
              onChange={(e) => handleSimpleContentChange('appDescription', e.target.value)}
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center mb-4">
            <span className="text-2xl mr-2">📱</span>
            Live Preview
          </h2>
          <p className="text-center text-gray-600 mb-4">Watch your changes in real-time!</p>
          
          <div className="flex justify-center">
            <iframe
              title="MVP Prototype Preview"
              srcDoc={previewHtml}
              className="mx-auto drop-shadow-2xl"
              style={{
                maxWidth: '375px',
                height: '667px',
                border: '12px solid #333',
                borderRadius: '40px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>

        <div className="p-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl text-center">
          <button
            onClick={handleDownloadHtml}
            className="w-full py-4 px-6 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>📥 Download Prototype HTML</span>
          </button>
          <p className="text-sm text-gray-600 mt-3">Download and open the HTML file to preview on mobile & desktop!</p>
        </div>
      </div>
    </div>
  );
};

export default App;
