import React, { useState, useEffect, useRef } from 'react';
import { loadState, saveState, exportStateAsFile, getInitialState } from './utils/storage';
import { 
  auth, 
  isFirebaseConfigured, 
  saveTrackerToCloud, 
  loadTrackerFromCloud, 
  fetchFriendsProgress 
} from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import PeerInspectorModal from './components/PeerInspectorModal';

import DashboardView from './components/DashboardView';
import TimelineView from './components/TimelineView';
import DailyTrackerView from './components/DailyTrackerView';
import MockTrackerView from './components/MockTrackerView';
import ErrorLogView from './components/ErrorLogView';
import ProfileView from './components/ProfileView';

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(state.settings?.theme || 'dark');
  
  // Daily tracker active selectors
  const [activeMonth, setActiveMonth] = useState('Month 1');
  const [activeWeek, setActiveWeek] = useState('Week 1');

  // User state
  const [user, setUser] = useState(null);

  // Selected friend inspect state
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriendTracker, setSelectedFriendTracker] = useState(null);
  const [loadingFriendTracker, setLoadingFriendTracker] = useState(false);

  // Inspect a study peer's detailed metrics
  const handleInspectFriend = async (friendProfile) => {
    setSelectedFriend(friendProfile);
    setSelectedFriendTracker(null);
    setLoadingFriendTracker(true);

    try {
      const data = await loadTrackerFromCloud(friendProfile.id);
      setSelectedFriendTracker(data);
    } catch (err) {
      console.error("Failed to load friend tracker details:", err);
    } finally {
      setLoadingFriendTracker(false);
    }
  };

  // Friends peer-sync state
  const [friends, setFriends] = useState([
    { id: 1, name: "Rahul S.", avatar: "R", streak: 5, lastActive: "10 mins ago", message: "Solved 18 Quant Questions (Averages)" },
    { id: 2, name: "Sneha M.", avatar: "S", streak: 12, lastActive: "2 hours ago", message: "Completed Month 2 Week 6 Logical Venn Diagrams" },
    { id: 3, name: "Amit K.", avatar: "A", streak: 3, lastActive: "Just now", message: "Logged Mock Test #4: Score 112 (98.6 percentile!)" }
  ]);

  const fileInputRef = useRef(null);

  // Global Progress metrics calculation
  let totalQuantSolved = 0;
  let totalLrdidSolved = 0;
  let totalVarcSolved = 0;
  let completedDaysCount = 0;

  for (const [month, weeks] of Object.entries(state.tracker)) {
    weeks.forEach(week => {
      week.days.forEach(day => {
        totalQuantSolved += Number(day.quantCount) || 0;
        totalLrdidSolved += Number(day.lrdiCount) || 0;
        totalVarcSolved += Number(day.varcCount) || 0;

        if (day.quantCompleted || day.lrdiCompleted || day.varcCompleted) {
          completedDaysCount++;
        }
      });
    });
  }

  const grandTargets = { quant: 3160, lrdi: 650, varc: 620 };
  const totalSolved = totalQuantSolved + totalLrdidSolved + totalVarcSolved;
  const grandTargetTotal = grandTargets.quant + grandTargets.lrdi + grandTargets.varc;
  const globalPercent = Math.min(100, Math.round((totalSolved / grandTargetTotal) * 100));

  // Determine active streak (simplified check)
  const allDaysChronological = [];
  for (const [month, weeks] of Object.entries(state.tracker)) {
    weeks.forEach(week => {
      week.days.forEach(day => {
        allDaysChronological.push(day.quantCompleted || day.lrdiCompleted || day.varcCompleted);
      });
    });
  }
  let activeStreak = 0;
  for (let i = allDaysChronological.length - 1; i >= 0; i--) {
    if (allDaysChronological[i]) {
      activeStreak++;
    } else {
      if (activeStreak > 0) break;
    }
  }

  // Sync theme changes to HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync state changes to local storage
  useEffect(() => {
    saveState({
      ...state,
      settings: {
        ...state.settings,
        theme
      }
    });
  }, [state, theme]);

  // Request browser notification permissions
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Periodic checker for push notifications (reminders)
  useEffect(() => {
    const checkDailyReminders = () => {
      const now = new Date();
      const hours = now.getHours();
      
      // Fire reminder after 9:00 PM (21:00)
      if (hours >= 21) {
        const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = weekdayNames[now.getDay()];
        
        const monthData = state.tracker[activeMonth];
        const weekData = monthData?.find(w => w.week === activeWeek);
        const todayData = weekData?.days.find(d => d.day === todayName);
        
        if (todayData && (!todayData.quantCompleted || !todayData.lrdiCompleted || !todayData.varcCompleted)) {
          const lastSent = localStorage.getItem('last_drill_notification_date');
          const dateStr = now.toDateString();
          
          if (lastSent !== dateStr) {
            if (Notification.permission === 'granted') {
              new Notification("Aspirant Tracker Reminder", {
                body: "You haven't completed your daily exam prep checklist for today! Keep the momentum up.",
                icon: "/favicon.svg"
              });
              localStorage.setItem('last_drill_notification_date', dateStr);
            }
          }
        }
      }
    };

    checkDailyReminders();
    const interval = setInterval(checkDailyReminders, 30000);
    return () => clearInterval(interval);
  }, [state, activeMonth, activeWeek]);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch Cloud tracker data
          const cloudData = await loadTrackerFromCloud(firebaseUser.uid);
          if (cloudData) {
            setState({
              tracker: cloudData.tracker,
              studyPlan: cloudData.studyPlan,
              mocks: cloudData.mocks,
              settings: cloudData.settings || state.settings
            });
          }
        } else {
          setUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Sync changes to Cloud in real-time when authenticated
  useEffect(() => {
    if (isFirebaseConfigured && user) {
      saveTrackerToCloud(
        user.uid, 
        state.tracker, 
        state.studyPlan, 
        state.mocks, 
        activeStreak, 
        totalSolved
      );
    }
  }, [state, user, activeStreak, totalSolved]);

  // Refresh friends progress from Cloud
  const refreshFriendsList = async () => {
    if (isFirebaseConfigured && user) {
      const liveFriends = await fetchFriendsProgress(user.uid);
      if (liveFriends && liveFriends.length > 0) {
        setFriends(liveFriends);
      }
    }
  };

  useEffect(() => {
    if (user) {
      refreshFriendsList();
      const interval = setInterval(refreshFriendsList, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Simulate real-time peer server updates (only if NOT logged in / Firebase offline)
  useEffect(() => {
    if (user) return; // Skip simulation if logged in
    
    const simulateFriendsSync = () => {
      const messages = [
        "Logged Mock Test #5: Score 118 (99.1 percentile!)",
        "Completed Monday's daily drills!",
        "Solved 20 Quant Questions (Profit & Loss)",
        "Added revision notes in Error Log",
        "Streak count increased!",
        "Took sectional practice on VARC grammar"
      ];
      
      setFriends(prev => prev.map(f => {
        if (Math.random() > 0.6) {
          const randMsg = messages[Math.floor(Math.random() * messages.length)];
          return {
            ...f,
            lastActive: "Just now",
            message: randMsg,
            streak: Math.random() > 0.8 ? f.streak + 1 : f.streak
          };
        }
        return f;
      }));
    };

    const interval = setInterval(simulateFriendsSync, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // Manual notification trigger for demo
  const triggerDemoNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification("Aspirant Tracker Simulator", {
        body: "Daily prep reminder! Practice makes progress. Check off your Quant, LRDI, or VARC targets today.",
        icon: "/favicon.svg"
      });
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification("Notifications Enabled!", {
            body: "Great! You will now receive reminders when tasks are left incomplete."
          });
        } else {
          alert("Please enable notification permissions in your browser site settings first.");
        }
      });
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // 1. Update week status in overall Study Plan
  const updateWeekStatus = (weekTitle, status) => {
    setState(prev => {
      const updatedPlan = prev.studyPlan.map(w => {
        if (w.week === weekTitle) {
          return { ...w, status };
        }
        return w;
      });
      return { ...prev, studyPlan: updatedPlan };
    });
  };

  // 2. Update Quantities and Completion status in Daily Tracker
  const updateDayMetric = (month, weekName, dayName, subject, isCompleted, qty) => {
    setState(prev => {
      const updatedTracker = { ...prev.tracker };
      const monthWeeks = updatedTracker[month] || [];
      
      updatedTracker[month] = monthWeeks.map(week => {
        if (week.week === weekName) {
          const updatedDays = week.days.map(day => {
            if (day.day === dayName) {
              return {
                ...day,
                [`${subject}Completed`]: isCompleted,
                [`${subject}Count`]: qty
              };
            }
            return day;
          });
          return { ...week, days: updatedDays };
        }
        return week;
      });

      return { ...prev, tracker: updatedTracker };
    });
  };

  // 3. Update Day Notes
  const updateDayNotes = (month, weekName, dayName, notes) => {
    setState(prev => {
      const updatedTracker = { ...prev.tracker };
      const monthWeeks = updatedTracker[month] || [];

      updatedTracker[month] = monthWeeks.map(week => {
        if (week.week === weekName) {
          const updatedDays = week.days.map(day => {
            if (day.day === dayName) {
              return { ...day, notes };
            }
            return day;
          });
          return { ...week, days: updatedDays };
        }
        return week;
      });

      return { ...prev, tracker: updatedTracker };
    });
  };

  // 4. Update Mock Row details
  const updateMockRow = (mockId, field, value) => {
    setState(prev => {
      const updatedMocks = prev.mocks.map(mock => {
        if (mock.id === mockId) {
          const updated = { ...mock, [field]: value };
          if (['quantScore', 'lrdiScore', 'varcScore'].includes(field)) {
            const q = parseFloat(field === 'quantScore' ? value : mock.quantScore) || 0;
            const l = parseFloat(field === 'lrdiScore' ? value : mock.lrdiScore) || 0;
            const v = parseFloat(field === 'varcScore' ? value : mock.varcScore) || 0;
            updated.totalScore = q + l + v;
          }
          return updated;
        }
        return mock;
      });
      return { ...prev, mocks: updatedMocks };
    });
  };

  // Helper to jump to a specific month/week drill from other tabs
  const handleJumpToWeek = (timelineWeekTitle) => {
    const match = timelineWeekTitle.match(/Month (\d+):\s+Week (\d+)/i);
    if (match) {
      const monthNum = parseInt(match[1]);
      const weekNum = parseInt(match[2]);
      
      const monthKey = `Month ${monthNum}`;
      const relativeWeekNum = ((weekNum - 1) % 4) + 1;
      const weekKey = `Week ${relativeWeekNum}`;

      setActiveMonth(monthKey);
      setActiveWeek(weekKey);
      setActiveTab('daily');
    }
  };

  // Edit specific day from error logs
  const handleJumpToDay = (monthKey, weekKey) => {
    setActiveMonth(monthKey);
    setActiveWeek(weekKey);
    setActiveTab('daily');
  };

  // Export progress data
  const handleExport = () => {
    exportStateAsFile(state);
  };

  // Import backup data
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.tracker && imported.studyPlan && imported.mocks) {
          setState(imported);
          if (imported.settings?.theme) {
            setTheme(imported.settings.theme);
          }
          alert("Backup data imported successfully!");
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse the backup file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset all state to defaults
  const handleReset = () => {
    if (window.confirm("Are you sure you want to RESET all your progress? This cannot be undone.")) {
      const defaultState = getInitialState();
      setState(defaultState);
      alert("All progress reset to default.");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation (Hidden on mobile) */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">C</div>
          <span className="brand-name">Aspirant Tracker</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Study Plan
          </button>
          <button 
            className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Drills
          </button>
          <button 
            className={`nav-link ${activeTab === 'mocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('mocks')}
          >
            Mock Tests
          </button>
          <button 
            className={`nav-link ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            Error Log
          </button>
          <button 
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Cloud Sync
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" style={{ fontSize: '11px' }} onClick={triggerDemoNotification}>
            🔔 Test Reminder
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '11px' }} onClick={handleExport}>
              Export
            </button>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, padding: '6px', fontSize: '11px' }} 
              onClick={() => fileInputRef.current?.click()}
            >
              Import
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json" 
            onChange={handleImport} 
          />

          <button 
            className="btn-secondary" 
            style={{ color: '#ff4444', borderColor: '#ff444422', fontSize: '11px', padding: '6px' }} 
            onClick={handleReset}
          >
            Reset All Data
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Global Header Progress Bar */}
        <header className="global-header">
          <div className="header-progress-container">
            <span className="header-progress-label">Prep Progress: {globalPercent}%</span>
            <div className="header-progress-bar" title="Overall completed percentage of prep questions">
              <div className="header-progress-fill" style={{ width: `${globalPercent}%` }}></div>
            </div>
          </div>

          <div className="header-stats">
            <div className="header-stat-item" title="Consecutive active days">
              <span>⚡</span>
              <span>{activeStreak} Days</span>
            </div>
            <div className="header-stat-item" title="Practice questions solved">
              <span>📚</span>
              <span>{totalSolved.toLocaleString()} / {grandTargetTotal.toLocaleString()}</span>
            </div>
            
            {/* Minimal Circular Theme Toggle in Header */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              style={{ padding: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Main Content Render */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardView 
              state={state} 
              setActiveTab={setActiveTab} 
              friends={friends}
              onInspectFriend={handleInspectFriend}
            />
          )}
          {activeTab === 'timeline' && (
            <TimelineView 
              state={state} 
              updateWeekStatus={updateWeekStatus} 
              onWeekClick={handleJumpToWeek} 
            />
          )}
          {activeTab === 'daily' && (
            <DailyTrackerView 
              state={state}
              activeMonth={activeMonth}
              setActiveMonth={setActiveMonth}
              activeWeek={activeWeek}
              setActiveWeek={setActiveWeek}
              updateDayMetric={updateDayMetric}
              updateDayNotes={updateDayNotes}
            />
          )}
          {activeTab === 'mocks' && (
            <MockTrackerView 
              state={state} 
              updateMockRow={updateMockRow} 
            />
          )}
          {activeTab === 'errors' && (
            <ErrorLogView 
              state={state} 
              onDayClick={handleJumpToDay} 
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              onAuthSuccess={setUser}
              friends={friends}
              onAddFriendSuccess={refreshFriendsList}
              onInspectFriend={handleInspectFriend}
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Menu */}
      <nav className="mobile-bottom-nav">
        <button className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span className="mobile-nav-icon">📊</span>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
          <span className="mobile-nav-icon">📅</span>
          <span>Plan</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
          <span className="mobile-nav-icon">✏️</span>
          <span>Drills</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'mocks' ? 'active' : ''}`} onClick={() => setActiveTab('mocks')}>
          <span className="mobile-nav-icon">📝</span>
          <span>Mocks</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('errors')}>
          <span className="mobile-nav-icon">🔍</span>
          <span>Errors</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="mobile-nav-icon">☁️</span>
          <span>Cloud</span>
        </button>
      </nav>

      {/* Peer Progress Modal Overlay */}
      <PeerInspectorModal
        friend={selectedFriend}
        trackerData={selectedFriendTracker}
        loading={loadingFriendTracker}
        onClose={() => setSelectedFriend(null)}
      />
    </div>
  );
}
