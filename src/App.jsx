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
import { 
  getTodayTrackerPosition, 
  fetchWebOrOsDate, 
  formatDateShort 
} from './utils/dateUtils';
import PeerInspectorModal from './components/PeerInspectorModal';

import DashboardView from './components/DashboardView';
import TimelineView from './components/TimelineView';
import DailyTrackerView from './components/DailyTrackerView';
import MockTrackerView from './components/MockTrackerView';
import ErrorLogView from './components/ErrorLogView';
import ProfileView from './components/ProfileView';

const Icons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  Plan: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Drills: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
  ),
  Mocks: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Errors: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="11" y1="8" x2="11" y2="14"></line>
      <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
  ),
  Cloud: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
      <line x1="8" y1="16" x2="8.01" y2="16"></line>
      <line x1="8" y1="20" x2="8.01" y2="20"></line>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
      <line x1="12" y1="22" x2="12.01" y2="22"></line>
      <line x1="16" y1="16" x2="16.01" y2="16"></line>
      <line x1="16" y1="20" x2="16.01" y2="20"></line>
    </svg>
  ),
  Calendar: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Zap: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  Target: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  Sun: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
  Moon: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  ChevronLeft: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
};

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(state.settings?.theme || 'dark');
  const [appLoading, setAppLoading] = useState(true);

  // Collapsible sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  // Live OS / Web Date state
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Compute today's position based on start date
  const todayPos = getTodayTrackerPosition(state.settings?.startDate);

  // Daily tracker active selectors - initialized to TODAY's month & week
  const [activeMonth, setActiveMonth] = useState(todayPos.activeMonth);
  const [activeWeek, setActiveWeek] = useState(todayPos.activeWeek);

  // Sync web network date on mount and set live clock tick
  useEffect(() => {
    let mounted = true;
    fetchWebOrOsDate().then(date => {
      if (mounted) setCurrentDate(date);
    });

    const clockInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(clockInterval);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

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

  // Update Prep Schedule Start Date setting
  const handleUpdateStartDate = (newStartDate) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        startDate: newStartDate
      }
    }));
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

  if (appLoading) {
    return (
      <div className="minimal-loader-screen">
        <div className="brand-logo-badge" style={{ width: '56px', height: '56px', fontSize: '24px', marginBottom: '24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <div className="loader-bar-container">
          <div className="loader-bar-fill"></div>
        </div>
        <span className="loader-text">Loading Aspirant Tracker...</span>
      </div>
    );
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation (Hidden on mobile) */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-section">
          <div className="brand-logo-badge" title="Aspirant Tracker Logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span className="brand-name">Aspirant Tracker</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
          >
            <span className="nav-icon"><Icons.Home /></span>
            <span className="nav-link-text">Dashboard</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            title="Study Plan"
          >
            <span className="nav-icon"><Icons.Plan /></span>
            <span className="nav-link-text">Study Plan</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
            title="Daily Drills"
          >
            <span className="nav-icon"><Icons.Drills /></span>
            <span className="nav-link-text">Daily Drills</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'mocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('mocks')}
            title="Mock Tests"
          >
            <span className="nav-icon"><Icons.Mocks /></span>
            <span className="nav-link-text">Mock Tests</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
            title="Error Log"
          >
            <span className="nav-icon"><Icons.Errors /></span>
            <span className="nav-link-text">Error Log</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="Cloud Sync & Maintenance"
          >
            <span className="nav-icon"><Icons.Cloud /></span>
            <span className="nav-link-text">Cloud Sync</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <Icons.ChevronRight size={16} /> : <Icons.ChevronLeft size={16} />}
            <span className="sidebar-toggle-text">{isSidebarCollapsed ? "Expand" : "Collapse Bar"}</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json" 
            onChange={handleImport} 
          />
        </div>
      </aside>

      {/* Main Layout Wrapper (Dynamically fills space on PC) */}
      <div className="app-main-wrapper">
        {/* Global Header Progress Bar */}
        <header className="global-header">
          <div className="header-progress-container">
            <div className="header-progress-label-group">
              <span className="header-progress-label">Prep Progress</span>
              <span className="header-progress-val">{globalPercent}%</span>
            </div>
            <div className="header-progress-bar" title="Overall completed percentage of prep questions">
              <div className="header-progress-fill" style={{ width: `${globalPercent}%` }}></div>
            </div>
          </div>

          <div className="header-stats">
            <div className="header-stat-item date-header-item" title="Current Live Date (OS/Web synced)">
              <Icons.Calendar size={14} />
              <span>{formatDateShort(currentDate)}</span>
            </div>
            <div className="header-stat-item" title="Consecutive active days">
              <Icons.Zap size={14} />
              <span>{activeStreak}<span className="desktop-inline"> Days</span><span className="mobile-inline">d</span></span>
            </div>
            <div className="header-stat-item" title="Practice questions solved">
              <Icons.Target size={14} />
              <span>{totalSolved.toLocaleString()}<span className="desktop-inline"> / {grandTargetTotal.toLocaleString()}</span></span>
            </div>
            
            {/* Minimal Circular Theme Toggle in Header */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              style={{ padding: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Icons.Moon size={15} /> : <Icons.Sun size={15} />}
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
              startDate={state.settings?.startDate}
              onUpdateStartDate={handleUpdateStartDate}
              onExport={handleExport}
              onImport={() => fileInputRef.current?.click()}
              onReset={handleReset}
              onTriggerNotification={triggerDemoNotification}
              fileInputRef={fileInputRef}
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Menu */}
      <nav className="mobile-bottom-nav">
        <button className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span className="mobile-nav-icon"><Icons.Home /></span>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
          <span className="mobile-nav-icon"><Icons.Plan /></span>
          <span>Plan</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
          <span className="mobile-nav-icon"><Icons.Drills /></span>
          <span>Drills</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'mocks' ? 'active' : ''}`} onClick={() => setActiveTab('mocks')}>
          <span className="mobile-nav-icon"><Icons.Mocks /></span>
          <span>Mocks</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('errors')}>
          <span className="mobile-nav-icon"><Icons.Errors /></span>
          <span>Errors</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="mobile-nav-icon"><Icons.Cloud /></span>
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
