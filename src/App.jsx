import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loadState, saveState, exportStateAsFile, getInitialState, mergeTrackerStates } from './utils/storage';
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
  subscribeToUserProfile,
  subscribeToFriendsLive,
  updateUserProfile,
  getUserProfile,
  signOutUser
} from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getTodayTrackerPosition, 
  fetchWebOrOsDate, 
  formatDateShort 
} from './utils/dateUtils';
import { stripEmojis } from './utils/textUtils';
import PeerInspectorModal from './components/PeerInspectorModal';
import HeaderProfileDropdown from './components/HeaderProfileDropdown';

import DashboardView from './components/DashboardView';
import TimelineView from './components/TimelineView';
import DailyTrackerView from './components/DailyTrackerView';
import MockTrackerView from './components/MockTrackerView';
import ErrorLogView from './components/ErrorLogView';
import ProfileView from './components/ProfileView';
import StudyTimerView from './components/StudyTimerView';
import StudyLounge from './components/StudyLounge';
import FloatingTimerWidget from './components/FloatingTimerWidget';
import ThemeSelectorDropdown from './components/ThemeSelectorDropdown';
import ThemeSwitchToast from './components/ThemeSwitchToast';
import ThemeRedeemModal from './components/ThemeRedeemModal';
import { getUnlockedThemes } from './utils/themeRedemption';
import UpdateNotificationToast from './components/UpdateNotificationToast';
import ActivityNotificationToast from './components/ActivityNotificationToast';
import { checkForAppUpdate } from './utils/versionCheck';
import { audioEngine } from './utils/audioUtils';
import SettingsView from './components/SettingsView';
import AchievementsView from './components/AchievementsView';
import { calculateUserBadges } from './utils/badgeUtils';
import AuthScreen from './components/AuthScreen';
import CookieConsentBanner from './components/CookieConsentBanner';
import TermsAndPrivacyModal from './components/TermsAndPrivacyModal';
import CustomCursor from './components/CustomCursor';
import DitherBackground from './components/DitherBackground';
import LiquidIntroLoader from './components/LiquidIntroLoader';
import ClickSpark from './components/ClickSpark';
import AnimatedStreakBadge from './components/AnimatedStreakBadge';
import ComicPeekingCatBuddy from './components/ComicPeekingCatBuddy';
import FocusTransitionPortal from './components/FocusTransitionPortal';
import { initSmoothScroll, scrollToTop } from './utils/smoothScroll';
import { animatePageEntrance, makeMagnetic, triggerThemeWave } from './utils/gsapAnimations';

const Icons = {
  Logo: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block', margin: 'auto' }}>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#brandGradA)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" />
      <path d="M16 6.5L23 24H19.6L17.9 19.2H14.1L12.4 24H9L16 6.5Z" fill="#ffffff" />
      <path d="M16 11.8L14.8 16.2H17.2L16 11.8Z" fill="#0f172a" />
      <circle cx="23" cy="8" r="1.8" fill="#38bdf8" />
      <defs>
        <linearGradient id="brandGradA" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b1329" />
          <stop offset="1" stopColor="#1e293b" />
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
  const [unlockedThemes, setUnlockedThemes] = useState(() => getUnlockedThemes());
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemPreselectTheme, setRedeemPreselectTheme] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(() => {
    return localStorage.getItem('aspiranto_guest_mode') === 'true';
  });
  const [friends, setFriends] = useState([]);
  const [peers, setPeers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriendTracker, setSelectedFriendTracker] = useState(null);
  const [loadingFriendTracker, setLoadingFriendTracker] = useState(false);
  const [isEditProfileDirectOpen, setIsEditProfileDirectOpen] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState('profile');
  const [loungeTargetFriend, setLoungeTargetFriend] = useState(null);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });

  const handleOpenDirectMessage = (friend) => {
    if (!friend) return;
    setLoungeTargetFriend(friend);
    setSelectedFriend(null);
    setActiveTab('lounge');
  };

  // Restore UI Font Scale and Font on Initial Mount
  useEffect(() => {
    const savedScale = localStorage.getItem('aspiranto_font_scale') || '100';
    const ratio = Number(savedScale) / 100;
    document.documentElement.style.setProperty('--ui-scale', ratio);
    document.documentElement.style.zoom = ratio;
    document.documentElement.style.setProperty('--ui-font-scale', ratio);
    document.documentElement.style.fontSize = `${14 * ratio}px`;

    const savedFont = localStorage.getItem('aspiranto_font_choice');
    if (savedFont) {
      document.documentElement.style.setProperty('--font-sans', `'${savedFont}', -apple-system, BlinkMacSystemFont, sans-serif`);
    }

    const boldBoost = localStorage.getItem('aspiranto_bold_boost') === 'true';
    if (boldBoost) {
      document.documentElement.classList.add('ui-bold-boost');
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
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

  // Focus Timer State with persistent local storage hydration & drift reconciliation
  const [timerState, setTimerState] = useState(() => {
    try {
      const saved = localStorage.getItem('cat_active_timer_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.isRunning || parsed.isPaused)) {
          if (parsed.isRunning && parsed.lastTickMs) {
            const nowMs = Date.now();
            const deltaSecs = Math.max(0, Math.floor((nowMs - parsed.lastTickMs) / 1000));
            if (parsed.mode === 'stopwatch') {
              return {
                ...parsed,
                secondsLeft: (parsed.secondsLeft || 0) + deltaSecs,
                lastTickMs: nowMs
              };
            } else {
              const remaining = (parsed.secondsLeft || 0) - deltaSecs;
              if (remaining > 0) {
                return {
                  ...parsed,
                  secondsLeft: remaining,
                  lastTickMs: nowMs
                };
              }
              return {
                ...parsed,
                secondsLeft: 0,
                isRunning: false,
                isPaused: true,
                lastTickMs: nowMs
              };
            }
          }
          return parsed;
        }
      }
    } catch (e) {}
    return {
      secondsLeft: 25 * 60,
      totalSeconds: 25 * 60,
      isRunning: false,
      isPaused: false,
      mode: 'pomodoro',
      visualTheme: 'forest',
      subject: 'Quant',
      startTimeStr: null,
      startTimeMs: null,
      lastTickMs: null,
      sessionNotes: ''
    };
  });

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('catalyze_intro_viewed'));
  const [isFocusTransitioning, setIsFocusTransitioning] = useState(false);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('catalyze_intro_viewed', 'true');
    setShowIntro(false);
  }, []);

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

  const handleOpenRedeemModal = (themeId = null) => {
    setRedeemPreselectTheme(themeId);
    setIsRedeemModalOpen(true);
  };

  const handleThemeUnlocked = (newUnlockedList, appliedThemeId = null, shouldApply = false) => {
    if (newUnlockedList) {
      setUnlockedThemes(newUnlockedList);
    } else {
      setUnlockedThemes(getUnlockedThemes());
    }
    if (shouldApply && appliedThemeId) {
      handleSelectTheme(appliedThemeId);
    }
  };

  // Initialize Lenis Smooth Scroll Engine synchronized with GSAP
  useEffect(() => {
    const scrollInstance = initSmoothScroll();
    return () => {
      if (scrollInstance) scrollInstance.destroy();
    };
  }, []);

  // Animate Clean Bottom Fade-In & Reset Scroll Position when activeTab changes
  useEffect(() => {
    scrollToTop({ immediate: true });
    const timer = setTimeout(() => {
      animatePageEntrance('.main-content');
    }, 20);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Attach Magnetic Damping Physics to Interactive Sidebar & Header Elements
  useEffect(() => {
    const cleanupFns = [];
    const elements = document.querySelectorAll('.sidebar-toggle-btn, .theme-dropdown-trigger');
    elements.forEach(el => {
      cleanupFns.push(makeMagnetic(el, 0.22));
    });
    return () => cleanupFns.forEach(fn => fn());
  }, [isSidebarCollapsed, activeTab]);

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
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved' | 'syncing' | 'synced' | 'error'
  const [lastSyncedTimeStr, setLastSyncedTimeStr] = useState(() => {
    return localStorage.getItem('aspiranto_last_synced_time') || '';
  });
  const [activityNotification, setActivityNotification] = useState(null);
  const [hasUnsyncedCloudChanges, setHasUnsyncedCloudChanges] = useState(false);

  // Mark unsynced changes whenever local state updates after initial cloud load
  useEffect(() => {
    if (isCloudLoaded) {
      setHasUnsyncedCloudChanges(true);
    }
  }, [state, isCloudLoaded]);

  // Listen to Firebase Auth state with Anti-Overwrite & Non-Destructive Merge
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
              // Intelligently merge local state and cloud state so no offline work is ever wiped
              setState(prev => {
                const merged = mergeTrackerStates(prev, cloudData);
                saveState(merged);
                return merged;
              });
            } else {
              // Initial cloud backup for newly authenticated user
              await saveTrackerToCloud(
                firebaseUser.uid, 
                state.tracker, 
                state.studyPlan, 
                state.mocks, 
                activeStreak, 
                totalSolved, 
                state.lastUpdated || Date.now()
              );
            }
            setHasUnsyncedCloudChanges(false);
          } catch (err) {
            console.warn("Using local cache, cloud load skipped:", err);
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
    const hasFriends = Array.isArray(userProfile?.friends) && userProfile.friends.length > 0;
    if (hasFriends || activeTab === 'study-lounge') {
      updateUserPresence(user, timerState, activeStreak, totalSolved, profileData);
    }
  };

  // Explicit End-of-Day / Daily Cloud Sync (Preserves Firestore write quota for live lounge & chat)
  const handleRecordDayProgress = async (silent = false) => {
    if (!silent) setSyncStatus('syncing');
    try {
      const nowMs = Date.now();
      const timeStr = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fullLabel = `Today ${timeStr}`;

      // 1. Save locally first
      const updatedLocal = saveState({
        ...state,
        lastUpdated: nowMs
      });
      setState(updatedLocal);

      // 2. If online and logged in, push daily progress snapshot to Firestore
      if (isFirebaseConfigured && user?.uid && navigator.onLine) {
        await saveTrackerToCloud(
          user.uid,
          updatedLocal.tracker,
          updatedLocal.studyPlan,
          updatedLocal.mocks,
          activeStreak,
          totalSolved,
          nowMs
        );
        setHasUnsyncedCloudChanges(false);
      }

      localStorage.setItem('aspiranto_last_synced_time', fullLabel);
      setLastSyncedTimeStr(fullLabel);
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('saved'), 3500);

      if (silent) {
        setActivityNotification({
          type: 'auto_saved',
          title: 'Auto-Saved to Cloud',
          message: `Your prep tracker was saved to cloud (${fullLabel}).`,
          actionLabel: null,
          onAction: null
        });
      }
    } catch (err) {
      console.warn("Sync error (saved locally):", err);
      setSyncStatus('saved');
    }
  };

  // Occasional smart auto-save every 8 minutes if changes exist (quota friendly)
  useEffect(() => {
    if (!isFirebaseConfigured || !user?.uid || !hasUnsyncedCloudChanges) return;

    const autoSaveInterval = setInterval(() => {
      if (navigator.onLine) {
        handleRecordDayProgress(true);
      }
    }, 8 * 60 * 1000);

    return () => clearInterval(autoSaveInterval);
  }, [user?.uid, hasUnsyncedCloudChanges, state]);

  // Warn user on tab exit / reload if there are unsynced changes & trigger emergency save
  useEffect(() => {
    const handleBeforeUnloadPrompt = (e) => {
      if (hasUnsyncedCloudChanges && user?.uid) {
        if (navigator.onLine) {
          saveTrackerToCloud(
            user.uid,
            state.tracker,
            state.studyPlan,
            state.mocks,
            activeStreak,
            totalSolved,
            Date.now()
          );
        }
        e.preventDefault();
        e.returnValue = 'You have unsynced study tracker progress. Please save your progress before leaving!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnloadPrompt);
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadPrompt);
  }, [hasUnsyncedCloudChanges, user?.uid, state, activeStreak, totalSolved]);

  // Real-time listener for current user's profile document (syncs friends list, display name, target, etc.)
  useEffect(() => {
    if (!isFirebaseConfigured || !user?.uid) return;

    const unsubscribe = subscribeToUserProfile(user.uid, (freshProfile) => {
      if (freshProfile) {
        setUserProfile(freshProfile);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid]);

  // Load friend profiles statically without live presence fetching (Live presence on hold / on development)
  useEffect(() => {
    if (!isFirebaseConfigured || !user?.uid) {
      setFriends([]);
      return;
    }

    const friendIds = Array.isArray(userProfile?.friends) ? userProfile.friends : [];
    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    let isMounted = true;
    const loadFriendsData = async () => {
      try {
        const loaded = await Promise.all(
          friendIds.map(async (fId) => {
            const prof = await getUserProfile(fId);
            if (!prof) return null;
            return {
              id: fId,
              uid: fId,
              displayName: prof.displayName || prof.name || 'CAT Aspirant',
              name: prof.displayName || prof.name || 'CAT Aspirant',
              avatar: prof.avatar || 'rocket',
              avatarBg: prof.avatarBg || '#3b82f6',
              target: prof.target || 'CAT 2025 Aspirant',
              aspirantId: prof.aspirantId || '',
              streak: prof.streak || 0,
              solvedQs: prof.solvedQs || 0,
              status: 'offline', // Live online presence on hold
              activity: null
            };
          })
        );
        if (isMounted) {
          setFriends(loaded.filter(Boolean));
        }
      } catch (err) {
        console.warn("Could not load friends list:", err);
      }
    };

    loadFriendsData();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, userProfile?.friends]);

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
    if (
      friendProfile.isSelf || 
      friendProfile.id === 'self' || 
      friendProfile.id === 'self_user' || 
      (user && (friendProfile.id === user.uid || friendProfile.uid === user.uid))
    ) {
      setSelectedFriend({
        isSelf: true,
        id: user?.uid || 'self_user',
        uid: user?.uid || 'self_user',
        displayName: userProfile?.displayName || user?.displayName || 'You',
        username: userProfile?.username || (user?.email ? user.email.split('@')[0] : 'you'),
        avatar: userProfile?.avatar || (user?.displayName ? user.displayName[0] : 'rocket'),
        avatarBg: userProfile?.avatarBg || '#5865f2',
        bannerBg: userProfile?.bannerBg || '#1e1f22',
        bannerUrl: userProfile?.bannerUrl || '',
        bio: userProfile?.bio || '',
        target: userProfile?.target || 'CAT 2025 Aspirant',
        location: userProfile?.location || '',
        aspirantId: userProfile?.aspirantId || '',
        streak: activeStreak,
        solvedQs: totalSolved,
        mocksCount: totalMocksCount,
        status: timerState.isRunning ? 'studying' : 'online',
        activity: timerState.isRunning ? {
          title: `${timerState.subject || 'Quant'} Focus Session`,
          subject: timerState.subject || 'Quant',
          secondsLeft: timerState.secondsLeft,
          totalSeconds: timerState.totalSeconds
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

    const peerUid = friendProfile.uid || friendProfile.id;
    setSelectedFriend({
      ...friendProfile,
      id: peerUid,
      uid: peerUid
    });
    setSelectedFriendTracker(null);
    setLoadingFriendTracker(true);

    try {
      if (isFirebaseConfigured && peerUid && peerUid !== 'self' && peerUid !== 'self_user') {
        const cloudData = await loadTrackerFromCloud(peerUid);
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
      return { ...prev, studyPlan: updatedPlan, lastUpdated: Date.now() };
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

      return { ...prev, tracker: updatedTracker, lastUpdated: Date.now() };
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

      return { ...prev, tracker: updatedTracker, lastUpdated: Date.now() };
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
      return { ...prev, mocks: updatedMocks, lastUpdated: Date.now() };
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
      },
      lastUpdated: Date.now()
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
          setState({ ...imported, lastUpdated: Date.now() });
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
    const cleanNotes = session.notes ? stripEmojis(session.notes) : '';
    const cleanSubject = stripEmojis(session.subject || 'General');
    const cleanSession = {
      ...session,
      subject: cleanSubject,
      notes: cleanNotes
    };

    setState(prev => {
      const todayPosition = getTodayTrackerPosition(prev.settings?.startDate);
      const updatedTracker = { ...prev.tracker };
      const monthWeeks = updatedTracker[todayPosition.activeMonth] || [];
      const subjKey = cleanSubject.toLowerCase().trim();

      updatedTracker[todayPosition.activeMonth] = monthWeeks.map(week => {
        if (week.week === todayPosition.activeWeek) {
          const updatedDays = week.days.map(day => {
            if (day.day === todayPosition.dayName) {
              const prevSessions = day.sessions || [];
              const newSessions = [cleanSession, ...prevSessions];
              const prevHours = day.studyHours || 0;
              const addedHours = (cleanSession.durationMinutes || 0) / 60;

              // Subject drill synchronization
              let newQuantCompleted = day.quantCompleted;
              let newQuantCount = day.quantCount;
              let newLrdiCompleted = day.lrdiCompleted;
              let newLrdiCount = day.lrdiCount;
              let newVarcCompleted = day.varcCompleted;
              let newVarcCount = day.varcCount;

              if (subjKey === 'quant') {
                newQuantCompleted = true;
                if (!newQuantCount || newQuantCount === 0) newQuantCount = 18;
              } else if (subjKey === 'lrdi') {
                newLrdiCompleted = true;
                if (!newLrdiCount || newLrdiCount === 0) newLrdiCount = 4;
              } else if (subjKey === 'varc') {
                newVarcCompleted = true;
                if (!newVarcCount || newVarcCount === 0) newVarcCount = 4;
              }

              // Append session note to day.notes without emojis
              let updatedNotes = day.notes || '';
              if (cleanNotes) {
                const noteEntry = `[${cleanSubject} Session (${cleanSession.durationMinutes}m)]: ${cleanNotes}`;
                updatedNotes = updatedNotes.trim()
                  ? `${updatedNotes.trim()}\n${noteEntry}`
                  : noteEntry;
              }

              return {
                ...day,
                studyHours: Math.round((prevHours + addedHours) * 10) / 10,
                sessions: newSessions,
                quantCompleted: newQuantCompleted,
                quantCount: newQuantCount,
                lrdiCompleted: newLrdiCompleted,
                lrdiCount: newLrdiCount,
                varcCompleted: newVarcCompleted,
                varcCount: newVarcCount,
                notes: updatedNotes
              };
            }
            return day;
          });
          return { ...week, days: updatedDays };
        }
        return week;
      });

      return { ...prev, tracker: updatedTracker, lastUpdated: Date.now() };
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

      return { ...prev, tracker: updatedTracker, lastUpdated: Date.now() };
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

  const handleUpdateTimerNotes = (notes) => {
    setTimerState(prev => ({ ...prev, sessionNotes: notes }));
  };

  const handleFinishTimer = (overrideNotes) => {
    const finalNotes = typeof overrideNotes === 'string'
      ? overrideNotes
      : (timerState.sessionNotes || '');

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
      notes: finalNotes,
      timestamp: Date.now()
    };

    addStudySession(sessionObj);

    // Notify the user visually that their study session was logged to daily drills
    setActivityNotification({
      type: 'timer_logged',
      title: 'Session Logged to Daily Drills!',
      message: `+${elapsedMins}m ${timerState.subject || 'Study'} session added to today's drills with checklist & notes updated.`,
      actionLabel: 'View Daily Drills',
      onAction: () => {
        const todayP = getTodayTrackerPosition(state.settings?.startDate);
        setActiveMonth(todayP.activeMonth);
        setActiveWeek(todayP.activeWeek);
        setActiveTab('daily');
        setActivityNotification(null);
      }
    });

    const resetTimer = {
      ...timerState,
      secondsLeft: timerState.totalSeconds,
      isRunning: false,
      isPaused: false,
      startTimeStr: null,
      startTimeMs: null,
      lastTickMs: null,
      sessionNotes: ''
    };
    setTimerState(resetTimer);
    if (isFirebaseConfigured && user) {
      updateUserPresence(user, resetTimer, activeStreak, totalSolved);
    }
  };

  // Tab visibility synchronization - immediate wall-clock reconciliation on tab refocus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerState.isRunning) {
        setTimerState(prev => {
          if (!prev.isRunning) return prev;
          const nowMs = Date.now();
          const lastMs = prev.lastTickMs || nowMs;
          const deltaSecs = Math.max(0, Math.floor((nowMs - lastMs) / 1000));
          if (deltaSecs <= 0) return prev;

          if (prev.mode === 'stopwatch') {
            return {
              ...prev,
              secondsLeft: prev.secondsLeft + deltaSecs,
              lastTickMs: nowMs
            };
          }

          if (prev.secondsLeft <= deltaSecs) {
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
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState.isRunning]);

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

  // Synchronize active timer session state into localStorage
  useEffect(() => {
    try {
      if (timerState.isRunning || timerState.isPaused) {
        localStorage.setItem('cat_active_timer_session', JSON.stringify(timerState));
      } else {
        localStorage.removeItem('cat_active_timer_session');
      }
    } catch (e) {}
  }, [timerState]);

  // Offline and Exit/Refresh auto-logger: preserves study time if user disconnects
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timerState.isRunning && timerState.startTimeMs) {
        const nowMs = Date.now();
        const activeElapsedMins = Math.max(1, Math.floor((nowMs - timerState.startTimeMs) / 60000));
        const now = new Date();
        const endTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const startObj = new Date(timerState.startTimeMs);
        const startTimeStr = timerState.startTimeStr || startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const sessionSnapshot = {
          id: 'sess_' + nowMs,
          startTime: startTimeStr,
          endTime: endTimeStr,
          durationMinutes: activeElapsedMins,
          subject: timerState.subject,
          mode: timerState.mode,
          visualTheme: timerState.visualTheme,
          notes: (timerState.sessionNotes ? timerState.sessionNotes + ' ' : '') + '(Auto-saved on exit/offline)',
          timestamp: nowMs
        };

        try {
          const localData = localStorage.getItem('cat_prep_tracker_state_v1');
          if (localData) {
            const parsed = JSON.parse(localData);
            const todayPos = getTodayTrackerPosition(parsed.settings?.startDate);
            const m = parsed.tracker?.[todayPos.activeMonth];
            const w = m?.find(week => week.week === todayPos.activeWeek);
            const d = w?.days?.find(day => day.day === todayPos.dayName);
            if (d) {
              d.sessions = d.sessions || [];
              d.sessions.push(sessionSnapshot);
              d.studyHours = (d.studyHours || 0) + (activeElapsedMins / 60);
              saveState(parsed);
            }
          }
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerState]);

  // Auth Gate: Require login or create account before accessing the main dashboard/app
  if (!user && !isGuestMode) {
    return (
      <AuthScreen
        onAuthSuccess={(u) => {
          setUser(u);
          setIsGuestMode(false);
          localStorage.removeItem('aspiranto_guest_mode');
        }}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
          localStorage.setItem('aspiranto_guest_mode', 'true');
        }}
      />
    );
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${activeTab === 'timer' ? 'in-timer-mode' : ''}`}>
      {/* Spylt-Inspired Cinematic Liquid Intro Loader */}
      {showIntro && (
        <LiquidIntroLoader 
          activeTheme={theme} 
          onComplete={handleIntroComplete} 
        />
      )}

      {/* ReactBits Dither Background WebGL Shader */}
      <DitherBackground activeTheme={theme} opacity={0.24} ditherSize={2.5} />

      {/* ReactBits ClickSpark Particle Burst Animation */}
      <ClickSpark activeTheme={theme} />

      {/* Luxury Liquid Glow Custom Cursor with GSAP Physics */}
      <CustomCursor activeTheme={theme} />

      {/* Minimalist Editorial Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${activeTab === 'timer' ? 'timer-mode-hidden' : ''}`}>
        <div className="brand-section">
          <div className="brand-emblem-badge" title="CATalyze">
            <Icons.Logo size={18} />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-title-bold">CATalyze</span>
            <span className="brand-tagline-minimal">TRACKER</span>
          </div>
        </div>

        <nav className="nav-links dock-nav-links">
          <button 
            className={`dock-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            aria-label="Dashboard"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Home /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Dashboard</span>
              <span className="tooltip-tag">SYS.OVERVIEW</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            aria-label="Study Plan"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Plan /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Study Plan</span>
              <span className="tooltip-tag">16-WK CURRICULUM</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
            aria-label="Focus & Study Timer"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Timer /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Study Timer</span>
              <span className="tooltip-tag">FOCUS SUITE</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'lounge' ? 'active' : ''}`}
            onClick={() => setActiveTab('lounge')}
            aria-label="Live Study Lounge"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Chat /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Study Lounge</span>
              <span className="tooltip-tag">LIVE ROOM</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
            aria-label="Daily Drills"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Drills /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Daily Drills</span>
              <span className="tooltip-tag">QUOTA SOLVER</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'mocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('mocks')}
            aria-label="Mock Tests"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Mocks /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Mock Tests</span>
              <span className="tooltip-tag">BENCHMARKS</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
            aria-label="Prestige Achievement Badges"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Award /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Achievements</span>
              <span className="tooltip-tag">PRESTIGE BADGES</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
            aria-label="Error Log"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Errors /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Error Log</span>
              <span className="tooltip-tag">AUDIT MISTAKES</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            aria-label="Profile & Study Buddies"
            style={{ position: 'relative' }}
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Cloud /></span>
            {pendingRequestsCount > 0 && (
              <span className="dock-badge-dot" title={`${pendingRequestsCount} new friend request(s)`}></span>
            )}
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Profile & Buddies</span>
              <span className="tooltip-tag">COMMUNITY</span>
            </div>
          </button>

          <button 
            className={`dock-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label="Application Settings"
          >
            <span className="dock-active-indicator"></span>
            <span className="dock-icon"><Icons.Settings /></span>
            <div className="dock-floating-tooltip">
              <span className="tooltip-title">Settings</span>
              <span className="tooltip-tag">PREFERENCES</span>
            </div>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
            <span className="sidebar-toggle-text">{isSidebarCollapsed ? "Expand" : "Collapse"}</span>
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
          <header className="global-header">
            <div className="header-brand-title">
              <button 
                type="button"
                className="header-replay-intro-btn" 
                onClick={() => setShowIntro(true)} 
                title="Replay Spylt Cinematic Intro"
              >
                <span className="brand-dot pulse-dot"></span>
              </button>
              <div className="header-title-badge">
                <span className="header-protocol-tag">// PROTOCOL</span>
                <span className="header-page-name" key={activeTab}>
                  {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'lounge' ? 'Study Lounge' : activeTab === 'timeline' ? 'Study Plan' : activeTab === 'daily' ? 'Daily Drills' : activeTab === 'mocks' ? 'Mock Tests' : activeTab === 'achievements' ? 'Achievements' : activeTab === 'errors' ? 'Error Log' : activeTab === 'profile' ? 'Profile & Buddies' : activeTab === 'settings' ? 'Settings' : 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="header-stats">
              {/* Unique Animated Flame & Floating Embers Streak Pill */}
              <AnimatedStreakBadge streak={activeStreak} />

              {/* Custom Animated Theme Popover Dropdown */}
              <ThemeSelectorDropdown 
                currentTheme={theme} 
                onSelectTheme={handleSelectTheme}
                unlockedThemes={unlockedThemes}
                onOpenRedeemModal={handleOpenRedeemModal}
              />

              {/* Top Right Profile Shortcut & Actions Dropdown */}
              <HeaderProfileDropdown
                user={user}
                userProfile={userProfile}
                onInspectSelf={() => handleInspectFriend({ isSelf: true, ...userProfile, id: user?.uid || 'self', uid: user?.uid || 'self' })}
                onNavigate={(tab) => setActiveTab(tab)}
                onSignOut={async () => {
                  if (window.confirm("Are you sure you want to sign out?")) {
                    await signOutUser();
                    setIsGuestMode(false);
                  }
                }}
                onSignIn={() => {
                  setIsGuestMode(false);
                }}
                timerState={timerState}
              />
            </div>
          </header>
        )}

        {/* Comic Peeking Cat Study Buddy on Right Edge */}
        {activeTab !== 'timer' && (
          <ComicPeekingCatBuddy 
            onOpenTimer={() => {
              setActiveTab('timer');
              setIsFocusTransitioning(true);
            }}
            timerState={timerState}
            activeTheme={theme}
          />
        )}

        {/* Kinetic Study Desk Transition Screen (Cat Glides into Desk Position) */}
        {isFocusTransitioning && (
          <FocusTransitionPortal
            subject={timerState?.subject || 'Quant'}
            activeTheme={theme}
            onComplete={() => {
              setIsFocusTransitioning(false);
            }}
          />
        )}

        {/* Main Content Render */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <DashboardView 
              state={state} 
              setActiveTab={setActiveTab} 
              friends={friends}
              onInspectFriend={handleInspectFriend}
              onMessagePeer={handleOpenDirectMessage}
              onManageBuddies={() => {
                setProfileSubTab('friends');
                setActiveTab('profile');
              }}
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
              syncStatus={syncStatus}
              lastSyncedTimeStr={lastSyncedTimeStr}
              hasUnsyncedCloudChanges={hasUnsyncedCloudChanges}
              onRecordDayProgress={() => handleRecordDayProgress(false)}
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
              onUpdateNotes={handleUpdateTimerNotes}
              todaySessions={todaySessions}
              todayTotalHours={todayTotalHours}
              onDeleteSession={handleDeleteSession}
              theme={theme}
              onSetTheme={handleSelectTheme}
              friends={friends}
              onInspectFriend={handleInspectFriend}
              currentUser={user}
              activeStreak={activeStreak}
              onLeaveTimer={() => setActiveTab('dashboard')}
              isFocusTransitioning={isFocusTransitioning}
            />
          )}
          {activeTab === 'lounge' && (
            <StudyLounge
              peers={peers}
              friends={friends}
              onInspectFriend={handleInspectFriend}
              currentUser={user}
              userProfile={userProfile}
              timerState={timerState}
              onNavigateToTimer={() => setActiveTab('timer')}
              onNavigateToFriends={() => {
                setProfileSubTab('friends');
                setActiveTab('profile');
              }}
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
              onAddFriendSuccess={() => {}}
              onInspectFriend={handleInspectFriend}
              onMessagePeer={handleOpenDirectMessage}
              startDate={state.settings?.startDate}
              onUpdateStartDate={handleUpdateStartDate}
              onExport={handleExport}
              onImport={() => fileInputRef.current?.click()}
              onReset={handleReset}
              onTriggerNotification={triggerDemoNotification}
              fileInputRef={fileInputRef}
              setActiveTab={setActiveTab}
              initialSubTab={profileSubTab}
              onResetSubTab={() => setProfileSubTab('profile')}
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
              unlockedThemes={unlockedThemes}
              onOpenRedeemModal={handleOpenRedeemModal}
              onThemeUnlocked={handleThemeUnlocked}
            />
          )}
        </main>
      </div>

      {/* Streamlined Native Mobile Bottom Navigation */}
      <nav 
        className={`mobile-bottom-nav ${activeTab === 'timer' ? 'timer-mode-hidden' : ''}`}
        style={{
          paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
          paddingTop: '8px',
          height: 'calc(66px + max(14px, env(safe-area-inset-bottom, 14px)))',
          boxSizing: 'border-box'
        }}
      >
        <button className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <span className="mobile-nav-icon"><Icons.Home size={22} /></span>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
          <span className="mobile-nav-icon"><Icons.Drills size={22} /></span>
          <span>Drills</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'lounge' ? 'active' : ''}`} onClick={() => setActiveTab('lounge')}>
          <span className="mobile-nav-icon"><Icons.Chat size={22} /></span>
          <span>Lounge</span>
        </button>
        <button 
          className={`mobile-nav-btn ${(timerState?.isRunning || timerState?.isPaused) ? 'timer-is-active' : ''} ${activeTab === 'timer' ? 'active' : ''}`} 
          onClick={() => setActiveTab('timer')}
        >
          <span className="mobile-nav-icon">
            <Icons.Timer size={22} />
            {(timerState?.isRunning || timerState?.isPaused) && <span className="nav-timer-live-pip"></span>}
          </span>
          <span>Timer</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'mocks' ? 'active' : ''}`} onClick={() => setActiveTab('mocks')}>
          <span className="mobile-nav-icon"><Icons.Mocks size={22} /></span>
          <span>Mocks</span>
        </button>
        <button className={`mobile-nav-btn ${activeTab === 'profile' || activeTab === 'timeline' || activeTab === 'errors' || activeTab === 'achievements' || activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="mobile-nav-icon"><Icons.Menu size={22} /></span>
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
        onMessagePeer={handleOpenDirectMessage}
        currentUser={user}
      />

      {/* Live Over-The-Air Update Toast */}
      {availableUpdate && (
        <UpdateNotificationToast
          updateData={availableUpdate}
          onDismiss={() => setAvailableUpdate(null)}
        />
      )}

      {/* Activity & Sync Notification Toast */}
      {activityNotification && (
        <ActivityNotificationToast
          notification={activityNotification}
          onDismiss={() => setActivityNotification(null)}
        />
      )}

      {/* Cookie, Local Storage & Cache Consent Banner */}
      <CookieConsentBanner onOpenTerms={() => setIsTermsModalOpen(true)} />

      {/* Terms of Service & Privacy Policy Modal */}
      <TermsAndPrivacyModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />

      {/* Premium Theme VIP Code Redemption Modal */}
      <ThemeRedeemModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        preselectedThemeId={redeemPreselectTheme}
        unlockedThemes={unlockedThemes}
        onThemeUnlocked={handleThemeUnlocked}
      />
    </div>
  );
}
