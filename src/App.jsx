import React, { useState, useEffect, useRef } from 'react';
import { loadState, saveState, exportStateAsFile, getInitialState } from './utils/storage';
import { 
  auth, 
  isFirebaseConfigured, 
  saveTrackerToCloud, 
  loadTrackerFromCloud, 
  fetchFriendsProgress,
  updateUserPresence,
  setUserOffline,
  subscribeToStudyLounge,
  subscribeToFriendRequests,
  updateUserProfile,
  getUserProfile
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
import StudyTimerView from './components/StudyTimerView';
import StudyLounge from './components/StudyLounge';
import DownloadAppView from './components/DownloadAppView';
import MobileOnboardingAuth from './components/MobileOnboardingAuth';
import FloatingTimerWidget from './components/FloatingTimerWidget';
import ThemeSelectorDropdown from './components/ThemeSelectorDropdown';
import ThemeSwitchToast from './components/ThemeSwitchToast';
import UpdateNotificationToast from './components/UpdateNotificationToast';
import { checkForAppUpdate } from './utils/versionCheck';
import { audioEngine } from './utils/audioUtils';
import { Capacitor } from '@capacitor/core';
import SettingsView from './components/SettingsView';
import AchievementsView from './components/AchievementsView';
import { calculateUserBadges } from './utils/badgeUtils';

const isNativeApp = Capacitor.isNativePlatform();

const Icons = {
  Logo: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block', margin: 'auto' }}>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#brandGradA)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M16 6.5L24 23.5H19.5L16 16L12.5 23.5H8L16 6.5Z" fill="#ffffff" />
      <path d="M13.5 19.5H18.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="11.5" r="1.5" fill="#fbbf24" />
      <defs>
        <linearGradient id="brandGradA" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Award: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  ),
  Trophy: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  ),
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
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
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
  ),
  Timer: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Menu: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  )
};

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(state.settings?.theme || 'dark');
  const [showThemeToast, setShowThemeToast] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriendTracker, setSelectedFriendTracker] = useState(null);
  const [loadingFriendTracker, setLoadingFriendTracker] = useState(false);
  const [isEditProfileDirectOpen, setIsEditProfileDirectOpen] = useState(false);
  const [mobileWebBypass, setMobileWebBypass] = useState(() => {
    return localStorage.getItem('aspiranto_mobile_web_bypass') === 'true';
  });
  const [guestMode, setGuestMode] = useState(() => {
    return localStorage.getItem('aspiranto_guest_mode') === 'true';
  });
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? (window.innerWidth <= 768 || Capacitor.isNativePlatform()) : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768 || Capacitor.isNativePlatform());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [availableUpdate, setAvailableUpdate] = useState(null);

  // Auto-check for over-the-air updates on mount and periodically
  useEffect(() => {
    const runUpdateCheck = async () => {
      const update = await checkForAppUpdate();
      if (update) {
        setAvailableUpdate(update);
      }
    };
    runUpdateCheck();
    const interval = setInterval(runUpdateCheck, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Focus Timer State
  const [timerState, setTimerState] = useState({
    secondsLeft: 25 * 60,
    totalSeconds: 25 * 60,
    isRunning: false,
    isPaused: false,
    mode: 'pomodoro',
    visualTheme: 'forest',
    subject: 'Quant',
    startTimeStr: null,
    startTimeMs: null,
    sessionNotes: ''
  });

  // Calculate Today's sessions and total hours
  const todayPositionNow = getTodayTrackerPosition(state.settings?.startDate);
  const todayMonthObj = state.tracker[todayPositionNow.activeMonth];
  const todayWeekObj = todayMonthObj?.find(w => w.week === todayPositionNow.activeWeek);
  const todayDayObj = todayWeekObj?.days?.find(d => d.day === todayPositionNow.dayName);
  const todaySessions = todayDayObj?.sessions || [];
  const todayTotalHours = todayDayObj?.studyHours || (todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0) / 60, 0));

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

  const totalMocksCount = (state?.mocks || []).filter(m => m.status === 'Taken').length;

  const userBadges = calculateUserBadges({
    streak: activeStreak,
    solvedQs: totalSolved,
    mocksCount: totalMocksCount
  });

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

  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            // Fetch Profile Data
            const prof = await getUserProfile(firebaseUser.uid);
            if (prof) {
              setUserProfile(prof);
            }

            // Fetch Cloud tracker data
            const cloudData = await loadTrackerFromCloud(firebaseUser.uid);
            if (cloudData && cloudData.tracker) {
              setState(prev => ({
                tracker: cloudData.tracker,
                studyPlan: cloudData.studyPlan || prev.studyPlan,
                mocks: cloudData.mocks || prev.mocks,
                settings: cloudData.settings || prev.settings
              }));
            } else {
              // Initial cloud state for new user
              await saveTrackerToCloud(
                firebaseUser.uid, 
                state.tracker, 
                state.studyPlan, 
                state.mocks, 
                activeStreak, 
                totalSolved
              );
            }
          } catch (err) {
            console.error("Error loading initial cloud data:", err);
          } finally {
            setIsCloudLoaded(true);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setIsCloudLoaded(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Update Profile details and broadcast live
  const handleUpdateProfile = async (profileData) => {
    if (!user) return;
    await updateUserProfile(user.uid, profileData);
    setUserProfile(prev => ({ ...prev, ...profileData }));
    updateUserPresence(user, timerState, activeStreak, totalSolved, profileData);
  };

  // Sync changes to Cloud in real-time when authenticated (only after initial cloud load)
  useEffect(() => {
    if (isFirebaseConfigured && user && isCloudLoaded) {
      saveTrackerToCloud(
        user.uid, 
        state.tracker, 
        state.studyPlan, 
        state.mocks, 
        activeStreak, 
        totalSolved
      );
    }
  }, [state, user, isCloudLoaded, activeStreak, totalSolved]);

  // Refresh friends progress from Cloud
  const refreshFriendsList = async () => {
    if (isFirebaseConfigured && user) {
      const liveFriends = await fetchFriendsProgress(user.uid);
      if (liveFriends) {
        setFriends(liveFriends);
      }
    }
  };

  // Real-time Live Study Lounge Listener across all peers & friends
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToStudyLounge(user?.uid, (livePeers) => {
      setFriends(livePeers || []);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid]);

  // Friend requests count state for notification badge
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured || !user?.uid) {
      setPendingRequestsCount(0);
      return;
    }

    const unsubscribe = subscribeToFriendRequests(user.uid, (requests) => {
      setPendingRequestsCount(requests.length);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid]);

  // Sync user's live presence & timer state to Firestore
  useEffect(() => {
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, timerState, activeStreak, totalSolved, userProfile);
    }
  }, [user, userProfile, timerState.isRunning, timerState.isPaused, timerState.subject, timerState.mode, activeStreak, totalSolved]);

  // Periodic heartbeat (every 25s) & cleanup on browser close
  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    
    const heartbeatInterval = setInterval(() => {
      updateUserPresence(user, timerState, activeStreak, totalSolved, userProfile);
    }, 25000);

    const handleBeforeUnload = () => {
      setUserOffline(user.uid);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, userProfile, timerState, activeStreak, totalSolved]);



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

  // Reset all tracker data to defaults
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all tracker data to defaults? This action cannot be undone.")) {
      const initial = getInitialState();
      setState(initial);
      saveState(initial);
    }
  };

  // Inspect peer or self study profile modal
  const handleInspectFriend = async (friendProfile) => {
    if (!friendProfile) return;
    
    // Check if user is inspecting their own profile
    if (friendProfile.isSelf || friendProfile.id === 'self' || friendProfile.id === 'self_user' || (user && (friendProfile.id === user.uid || friendProfile.uid === user.uid))) {
      setSelectedFriend({
        isSelf: true,
        displayName: userProfile?.displayName || user?.displayName || 'You',
        username: userProfile?.username || (user?.email ? user.email.split('@')[0] : 'aspirant'),
        avatar: userProfile?.avatar || (user?.displayName ? user.displayName[0] : 'rocket'),
        avatarBg: userProfile?.avatarBg || '#3b82f6',
        bannerBg: userProfile?.bannerBg || '#18191c',
        bio: userProfile?.bio || '',
        target: userProfile?.target || 'CAT 2025 Aspirant',
        location: userProfile?.location || '',
        aspirantId: userProfile?.aspirantId || '',
        streak: activeStreak,
        solvedQs: totalSolved,
        mocksCount: totalMocksCount,
        status: timerState.isRunning ? 'studying' : 'online',
        activity: timerState.isRunning ? {
          title: `${timerState.subject} Focus Session`,
          subject: timerState.subject
        } : null
      });
      setSelectedFriendTracker({
        tracker: state.tracker,
        studyPlan: state.studyPlan,
        mocks: state.mocks
      });
      setLoadingFriendTracker(false);
      return;
    }

    setSelectedFriend(friendProfile);
    setSelectedFriendTracker(null);
    setLoadingFriendTracker(true);

    try {
      if (isFirebaseConfigured && friendProfile.id && friendProfile.id !== 'self') {
        const cloudData = await loadTrackerFromCloud(friendProfile.id);
        if (cloudData) {
          setSelectedFriendTracker(cloudData);
        } else {
          setSelectedFriendTracker({ tracker: null, studyPlan: null, mocks: null });
        }
      } else {
        setSelectedFriendTracker({ tracker: null, studyPlan: null, mocks: null });
      }
    } catch (err) {
      console.error("Error inspecting friend tracker:", err);
      setSelectedFriendTracker({ tracker: null, studyPlan: null, mocks: null });
    } finally {
      setLoadingFriendTracker(false);
    }
  };

  // Handle Selecting a new theme
  const handleSelectTheme = (newTheme) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      setShowThemeToast(true);
    }
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

  // Add recorded study session to today's tracker day
  const addStudySession = (session) => {
    setState(prev => {
      const todayPosition = getTodayTrackerPosition(prev.settings?.startDate);
      const updatedTracker = { ...prev.tracker };
      const monthWeeks = updatedTracker[todayPosition.activeMonth] || [];

      updatedTracker[todayPosition.activeMonth] = monthWeeks.map(week => {
        if (week.week === todayPosition.activeWeek) {
          const updatedDays = week.days.map(day => {
            if (day.day === todayPosition.dayName) {
              const prevSessions = day.sessions || [];
              const newSessions = [session, ...prevSessions];
              const prevHours = day.studyHours || 0;
              const addedHours = (session.durationMinutes || 0) / 60;
              return {
                ...day,
                studyHours: Math.round((prevHours + addedHours) * 10) / 10,
                sessions: newSessions
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

  // Delete a recorded session
  const handleDeleteSession = (sessionId) => {
    setState(prev => {
      const todayPosition = getTodayTrackerPosition(prev.settings?.startDate);
      const updatedTracker = { ...prev.tracker };
      const monthWeeks = updatedTracker[todayPosition.activeMonth] || [];

      updatedTracker[todayPosition.activeMonth] = monthWeeks.map(week => {
        if (week.week === todayPosition.activeWeek) {
          const updatedDays = week.days.map(day => {
            if (day.day === todayPosition.dayName) {
              const targetSess = (day.sessions || []).find(s => s.id === sessionId);
              const removedMins = targetSess ? targetSess.durationMinutes : 0;
              const newSessions = (day.sessions || []).filter(s => s.id !== sessionId);
              const newHours = Math.max(0, (day.studyHours || 0) - (removedMins / 60));
              return {
                ...day,
                studyHours: Math.round(newHours * 10) / 10,
                sessions: newSessions
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

  // Timer Handlers
  const handleStartTimer = ({ durationMinutes, mode, visualTheme, subject, notes }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetSecs = durationMinutes * 60;

    const nextTimerState = {
      secondsLeft: targetSecs > 0 ? targetSecs : 0,
      totalSeconds: targetSecs > 0 ? targetSecs : 1,
      isRunning: true,
      isPaused: false,
      mode,
      visualTheme,
      subject,
      startTimeStr: timeStr,
      startTimeMs: now.getTime(),
      lastTickMs: now.getTime(),
      sessionNotes: notes || ''
    };

    setTimerState(nextTimerState);
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, nextTimerState, activeStreak, totalSolved);
    }
  };

  const handlePauseTimer = () => {
    const nextTimerState = { ...timerState, isRunning: false, isPaused: true, lastTickMs: null };
    setTimerState(nextTimerState);
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, nextTimerState, activeStreak, totalSolved);
    }
  };

  const handleResumeTimer = () => {
    const nextTimerState = { ...timerState, isRunning: true, isPaused: false, lastTickMs: Date.now() };
    setTimerState(nextTimerState);
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, nextTimerState, activeStreak, totalSolved);
    }
  };

  const handleResetTimer = () => {
    const nextTimerState = {
      ...timerState,
      secondsLeft: timerState.totalSeconds,
      isRunning: false,
      isPaused: false,
      startTimeStr: null,
      startTimeMs: null,
      lastTickMs: null
    };
    setTimerState(nextTimerState);
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, nextTimerState, activeStreak, totalSolved);
    }
  };

  const handleFinishTimer = () => {
    const now = new Date();
    const endTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const startMs = timerState.startTimeMs || (now.getTime() - (timerState.totalSeconds - timerState.secondsLeft) * 1000);
    const startObj = new Date(startMs);
    const startTimeStr = timerState.startTimeStr || startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let elapsedMins;
    if (timerState.mode === 'stopwatch') {
      elapsedMins = Math.max(1, Math.round(timerState.secondsLeft / 60));
    } else {
      const activeSecondsElapsed = Math.max(0, timerState.totalSeconds - timerState.secondsLeft);
      const countdownMins = Math.round(activeSecondsElapsed / 60);
      const wallClockMins = Math.max(1, Math.round((now.getTime() - startMs) / 60000));
      elapsedMins = countdownMins > 0 ? countdownMins : wallClockMins;
      if (timerState.secondsLeft <= 0) {
        elapsedMins = Math.max(1, Math.round(timerState.totalSeconds / 60));
      }
    }

    const sessionObj = {
      id: 'sess_' + Date.now(),
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMinutes: elapsedMins,
      subject: timerState.subject,
      mode: timerState.mode,
      visualTheme: timerState.visualTheme,
      notes: timerState.sessionNotes,
      timestamp: Date.now()
    };

    addStudySession(sessionObj);

    const resetTimer = {
      ...timerState,
      secondsLeft: timerState.totalSeconds,
      isRunning: false,
      isPaused: false,
      startTimeStr: null,
      startTimeMs: null,
      lastTickMs: null
    };
    setTimerState(resetTimer);
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, resetTimer, activeStreak, totalSolved);
    }
  };

  // Timer Tick Effect with Background Tab Drift & Throttle Recovery
  useEffect(() => {
    let interval = null;
    if (timerState.isRunning) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev.isRunning) return prev;
          const nowMs = Date.now();
          const lastMs = prev.lastTickMs || nowMs;
          const deltaSecs = Math.max(1, Math.floor((nowMs - lastMs) / 1000));
          if (deltaSecs < 1) return prev;

          if (prev.mode === 'stopwatch') {
            return {
              ...prev,
              secondsLeft: prev.secondsLeft + deltaSecs,
              lastTickMs: nowMs
            };
          }

          if (prev.secondsLeft <= deltaSecs) {
            // Finished naturally
            const now = new Date();
            const endTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const startMs = prev.startTimeMs || (now.getTime() - prev.totalSeconds * 1000);
            const startObj = new Date(startMs);
            const startTimeStr = prev.startTimeStr || startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const elapsedMins = Math.max(1, Math.round(prev.totalSeconds / 60));

            const sessionObj = {
              id: 'sess_' + Date.now(),
              startTime: startTimeStr,
              endTime: endTimeStr,
              durationMinutes: elapsedMins,
              subject: prev.subject,
              mode: prev.mode,
              visualTheme: prev.visualTheme,
              notes: prev.sessionNotes,
              timestamp: Date.now()
            };

            addStudySession(sessionObj);

            if (Notification.permission === 'granted') {
              new Notification("Focus Session Complete!", {
                body: `Awesome! You studied ${prev.subject} for ${elapsedMins} mins. Time auto-recorded.`,
                icon: "/favicon.svg"
              });
            }

            return {
              ...prev,
              secondsLeft: 0,
              isRunning: false,
              isPaused: false,
              startTimeStr: null,
              startTimeMs: null,
              lastTickMs: null
            };
          }

          return {
            ...prev,
            secondsLeft: prev.secondsLeft - deltaSecs,
            lastTickMs: nowMs
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning]);

  if (appLoading) {
    return (
      <div className="minimal-loader-screen">
        <div className="brand-logo-badge" style={{ width: '56px', height: '56px', fontSize: '24px', marginBottom: '24px' }}>
          <Icons.Logo size={32} />
        </div>
        <div className="loader-bar-container">
          <div className="loader-bar-fill"></div>
        </div>
        <span className="loader-text">Loading Aspiranto...</span>
      </div>
    );
  }

  // Scenario 1: Mobile Web Browser (user opened website on phone browser - show APK download landing)
  if (!isNativeApp && isMobileScreen && !mobileWebBypass) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'block', padding: 0 }}>
        <DownloadAppView 
          onContinueToWeb={() => {
            localStorage.setItem('aspiranto_mobile_web_bypass', 'true');
            setMobileWebBypass(true);
          }}
          isMobileLanding={true}
        />
      </div>
    );
  }

  // Scenario 2: Inside Native APK, but user has not created account / logged in yet
  if (isNativeApp && !user && !guestMode) {
    return (
      <MobileOnboardingAuth
        onAuthSuccess={(u) => {
          setUser(u);
          refreshFriendsList();
        }}
        onContinueOffline={() => {
          localStorage.setItem('aspiranto_guest_mode', 'true');
          setGuestMode(true);
        }}
      />
    );
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation (Hidden on mobile) */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-section">
          <div className="brand-emblem-badge" title="Aspiranto Prep OS">
            <Icons.Logo size={22} />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-title-bold">Aspiranto</span>
            <span className="brand-tagline-pill">CORE PREP OS</span>
          </div>
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
            className={`nav-link ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
            title="Focus & Study Timer"
          >
            <span className="nav-icon"><Icons.Timer /></span>
            <span className="nav-link-text">Study Timer</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'lounge' ? 'active' : ''}`}
            onClick={() => setActiveTab('lounge')}
            title="Live Peer Study Lounge & Discord Chat"
          >
            <span className="nav-icon"><Icons.Chat /></span>
            <span className="nav-link-text">Study Lounge</span>
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
            className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
            title="Prestige Achievement Badges & Perks"
          >
            <span className="nav-icon"><Icons.Award /></span>
            <span className="nav-link-text">Achievements</span>
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
            title="Profile & Study Buddies"
            style={{ position: 'relative' }}
          >
            <span className="nav-icon"><Icons.Cloud /></span>
            <span className="nav-link-text">Profile & Buddies</span>
            {pendingRequestsCount > 0 && (
              <span className="sidebar-nav-badge-pill" title={`${pendingRequestsCount} new friend request(s)`}>
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Application Settings & Cloud Management"
          >
            <span className="nav-icon"><Icons.Settings /></span>
            <span className="nav-link-text">Settings</span>
          </button>
          {!isNativeApp && (
            <button 
              className={`nav-link ${activeTab === 'download' ? 'active' : ''}`}
              onClick={() => setActiveTab('download')}
              title="Download Android App"
            >
              <span className="nav-icon"><Icons.Download /></span>
              <span className="nav-link-text">Get App</span>
            </button>
          )}
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
        {/* Clean Global Header (Hidden when inside Focus Timer) */}
        {activeTab !== 'timer' && (
          <header 
            className="global-header"
            style={isMobileScreen ? { 
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '100px',
              minHeight: '100px',
              padding: '0 16px 14px 16px',
              background: 'var(--bg-secondary)',
              boxSizing: 'border-box'
            } : undefined}
          >
            <div className="header-brand-title">
              <span className="brand-dot"></span>
              <span className="header-page-name">{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'lounge' ? 'Live Study Lounge & Community' : activeTab === 'timeline' ? 'Study Plan' : activeTab === 'daily' ? 'Daily Drills' : activeTab === 'mocks' ? 'Mock Tests' : activeTab === 'achievements' ? 'Prestige Achievements & Badges' : activeTab === 'errors' ? 'Error Log' : activeTab === 'profile' ? 'Profile & Study Buddies' : activeTab === 'settings' ? 'Settings & Cloud Management' : activeTab === 'download' ? 'Download Mobile App' : 'Dashboard'}</span>
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
              
              {/* APK Download Shortcut for Mobile Web users only */}
              {isMobileScreen && !isNativeApp && (
                <button 
                  className="header-stat-item download-header-pill" 
                  onClick={() => setActiveTab('download')}
                  title="Download Android APK"
                  style={{ cursor: 'pointer', border: '1px solid var(--accent-color)', fontWeight: '700' }}
                >
                  <Icons.Download size={14} />
                  <span>APK</span>
                </button>
              )}

              {/* Custom Animated Theme Popover Dropdown */}
              <ThemeSelectorDropdown 
                currentTheme={theme} 
                onSelectTheme={handleSelectTheme} 
              />
            </div>
          </header>
        )}

        {/* Main Content Render */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardView 
              state={state} 
              setActiveTab={setActiveTab} 
              friends={friends}
              onInspectFriend={handleInspectFriend}
              currentUser={user}
              userProfile={userProfile}
              timerState={timerState}
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
          {activeTab === 'timer' && (
            <StudyTimerView
              timerState={timerState}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onResumeTimer={handleResumeTimer}
              onResetTimer={handleResetTimer}
              onFinishTimer={handleFinishTimer}
              todaySessions={todaySessions}
              todayTotalHours={todayTotalHours}
              onDeleteSession={handleDeleteSession}
              theme={theme}
              onSetTheme={handleSelectTheme}
              friends={friends}
              onInspectFriend={handleInspectFriend}
              currentUser={user}
            />
          )}
          {activeTab === 'lounge' && (
            <StudyLounge
              friends={friends}
              onInspectFriend={handleInspectFriend}
              currentUser={user}
              userProfile={userProfile}
              timerState={timerState}
              fullPage={true}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              userProfile={userProfile}
              tracker={state.tracker}
              mocks={state.mocks}
              onAuthSuccess={setUser}
              onUpdateProfile={handleUpdateProfile}
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
              setActiveTab={setActiveTab}
              isEditOpen={isEditProfileDirectOpen}
              onResetEditOpen={() => setIsEditProfileDirectOpen(false)}
            />
          )}
          {activeTab === 'achievements' && (
            <AchievementsView
              userProfile={userProfile}
              stats={{
                streak: activeStreak,
                solvedQs: totalSolved,
                mocksCount: totalMocksCount
              }}
              badges={userBadges}
              onNavigateToTab={setActiveTab}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              userProfile={userProfile}
              onAuthSuccess={setUser}
              startDate={state.settings?.startDate}
              onUpdateStartDate={handleUpdateStartDate}
              onExport={handleExport}
              onImport={() => fileInputRef.current?.click()}
              onReset={handleReset}
              onTriggerNotification={triggerDemoNotification}
              fileInputRef={fileInputRef}
              currentTheme={theme}
              onSelectTheme={handleSelectTheme}
            />
          )}
          {activeTab === 'download' && (
            <DownloadAppView />
          )}
        </main>
      </div>

      {/* Streamlined Native Mobile Bottom Navigation (5 Core Tabs) */}
      <nav 
        className="mobile-bottom-nav"
        style={{
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          height: 'calc(56px + max(24px, env(safe-area-inset-bottom, 24px)))',
          boxSizing: 'border-box'
        }}
      >
        <button className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span className="mobile-nav-icon"><Icons.Home size={20} /></span>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
          <span className="mobile-nav-icon"><Icons.Drills size={20} /></span>
          <span>Drills</span>
        </button>
        <button className={`mobile-nav-btn timer-tab-btn ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
          <span className="mobile-nav-icon timer-icon-bubble"><Icons.Timer size={22} /></span>
          <span>Timer</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'mocks' ? 'active' : ''}`} onClick={() => setActiveTab('mocks')}>
          <span className="mobile-nav-icon"><Icons.Mocks size={20} /></span>
          <span>Mocks</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'profile' || activeTab === 'timeline' || activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="mobile-nav-icon"><Icons.Menu size={20} /></span>
          <span>More</span>
        </button>
      </nav>

      {/* Floating Timer Mini Widget */}
      {activeTab !== 'timer' && (
        <FloatingTimerWidget
          timerState={timerState}
          onPause={handlePauseTimer}
          onResume={handleResumeTimer}
          onFinish={handleFinishTimer}
          onOpenTimer={() => setActiveTab('timer')}
        />
      )}

      {/* Animated Theme Switch Toast Banner */}
      {showThemeToast && (
        <ThemeSwitchToast 
          activeTheme={theme} 
          onClose={() => setShowThemeToast(false)} 
        />
      )}

      {/* Peer Progress Modal Overlay */}
      <PeerInspectorModal
        friend={selectedFriend}
        trackerData={selectedFriendTracker}
        loading={loadingFriendTracker}
        onClose={() => setSelectedFriend(null)}
        onEditProfile={() => {
          setSelectedFriend(null);
          setIsEditProfileDirectOpen(true);
          setActiveTab('profile');
        }}
        currentUser={user}
      />

      {/* Live Over-The-Air Update Toast */}
      {availableUpdate && (
        <UpdateNotificationToast
          updateData={availableUpdate}
          onDismiss={() => setAvailableUpdate(null)}
        />
      )}
    </div>
  );
}
