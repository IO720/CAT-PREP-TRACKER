import defaultData from '../data/unified_data.json';
import { getMondayOfWeek, formatDateISO } from './dateUtils';

const STORAGE_KEY = 'cat_prep_tracker_state_v1';

export const getInitialState = () => {
  const tracker = {};
  for (const [month, weeks] of Object.entries(defaultData.dailyTracker)) {
    tracker[month] = weeks.map(week => ({
      week: week.week, // "Week 1"
      days: week.days.map(day => ({
        day: day.day, // "Monday"
        quantTarget: day.quant || "Solve 18 Quant Questions",
        lrdiTarget: day.lrdi || "Solve 4 LRDI Sets",
        varcTarget: day.varc || "Solve 4 Reading Comprehensions",
        quantCompleted: false,
        lrdiCompleted: false,
        varcCompleted: false,
        quantCount: 0,
        lrdiCount: 0,
        varcCount: 0,
        notes: day.notes || "",
        studyHours: day.studyHours || 0,
        sessions: day.sessions || []
      }))
    }));
  }

  const studyPlan = defaultData.studyPlan.map(w => ({
    week: w.week,
    phase: w.phase,
    quantFocus: w.quant,
    lrdiFocus: w.lrdi,
    varcFocus: w.varc,
    status: w.status || "Not Started"
  }));

  const mocks = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `Mock Test ${i + 1}`,
    date: "",
    quantScore: "",
    lrdiScore: "",
    varcScore: "",
    totalScore: "",
    percentile: "",
    notes: "",
    status: "Not Started"
  }));

  const defaultStartDate = formatDateISO(getMondayOfWeek(new Date()));

  return {
    tracker,
    studyPlan,
    mocks,
    settings: {
      theme: "dark", // default to dark mode for premium minimal feel
      startDate: defaultStartDate,
      targetExam: "cat"
    }
  };
};

export const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return getInitialState();
    }
    const parsed = JSON.parse(serialized);
    if (!parsed.settings) {
      parsed.settings = {};
    }
    if (!parsed.settings.startDate) {
      parsed.settings.startDate = formatDateISO(getMondayOfWeek(new Date()));
    }
    if (!parsed.settings.targetExam) {
      parsed.settings.targetExam = (typeof window !== 'undefined' && (localStorage.getItem('catalyze_target_exam') || localStorage.getItem('aspiranto_target_exam'))) || 'cat';
    }
    if (!parsed.lastUpdated) {
      parsed.lastUpdated = Date.now();
    }
    return parsed;
  } catch (err) {
    console.error("Could not load state from localStorage:", err);
    return getInitialState();
  }
};

export const saveState = (state) => {
  try {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now()
    };
    const serialized = JSON.stringify(stateWithTimestamp);
    localStorage.setItem(STORAGE_KEY, serialized);
    return stateWithTimestamp;
  } catch (err) {
    console.error("Could not save state to localStorage:", err);
    return state;
  }
};

export const mergeTrackerStates = (localState, cloudState) => {
  if (!localState && !cloudState) return getInitialState();
  if (!localState) return cloudState;
  if (!cloudState) return localState;

  const base = getInitialState();
  const mergedTracker = {};

  const months = Object.keys({ ...(base.tracker || {}), ...(localState.tracker || {}), ...(cloudState.tracker || {}) });

  for (const month of months) {
    const localWeeks = localState.tracker?.[month] || [];
    const cloudWeeks = cloudState.tracker?.[month] || [];
    const baseWeeks = base.tracker?.[month] || [];

    const weekNames = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    mergedTracker[month] = weekNames.map((wName, wIdx) => {
      const lWeek = localWeeks.find(w => w.week === wName) || baseWeeks[wIdx] || { week: wName, days: [] };
      const cWeek = cloudWeeks.find(w => w.week === wName) || { week: wName, days: [] };

      const days = (lWeek.days || []).map((lDay) => {
        const cDay = (cWeek.days || []).find(d => d.day === lDay.day) || {};

        // Merge sessions by ID
        const sessionsMap = new Map();
        (cDay.sessions || []).forEach(s => {
          if (s && (s.id || s.startTime)) sessionsMap.set(s.id || `${s.startTime}_${s.subject}`, s);
        });
        (lDay.sessions || []).forEach(s => {
          if (s && (s.id || s.startTime)) sessionsMap.set(s.id || `${s.startTime}_${s.subject}`, s);
        });

        // Notes merge: prefer non-empty local or cloud
        let mergedNotes = lDay.notes || '';
        if (!mergedNotes && cDay.notes) {
          mergedNotes = cDay.notes;
        } else if (mergedNotes && cDay.notes && mergedNotes !== cDay.notes && !mergedNotes.includes(cDay.notes)) {
          mergedNotes = `${mergedNotes}\n${cDay.notes}`.trim();
        }

        return {
          ...lDay,
          quantCompleted: Boolean(lDay.quantCompleted || cDay.quantCompleted),
          lrdiCompleted: Boolean(lDay.lrdiCompleted || cDay.lrdiCompleted),
          varcCompleted: Boolean(lDay.varcCompleted || cDay.varcCompleted),
          quantCount: Math.max(Number(lDay.quantCount) || 0, Number(cDay.quantCount) || 0),
          lrdiCount: Math.max(Number(lDay.lrdiCount) || 0, Number(cDay.lrdiCount) || 0),
          varcCount: Math.max(Number(lDay.varcCount) || 0, Number(cDay.varcCount) || 0),
          studyHours: Math.max(Number(lDay.studyHours) || 0, Number(cDay.studyHours) || 0),
          notes: mergedNotes,
          sessions: Array.from(sessionsMap.values())
        };
      });

      return {
        week: wName,
        days
      };
    });
  }

  // Merge Study Plan
  const mergedStudyPlan = (localState.studyPlan || base.studyPlan).map((lPlan, idx) => {
    const cPlan = (cloudState.studyPlan || [])[idx] || {};
    let status = lPlan.status || "Not Started";
    if (cPlan.status === 'Completed' || status === 'Completed') {
      status = 'Completed';
    } else if (cPlan.status === 'In Progress' || status === 'In Progress') {
      status = 'In Progress';
    }
    return {
      ...lPlan,
      status
    };
  });

  // Merge Mocks
  const mergedMocks = (localState.mocks || base.mocks).map((lMock, idx) => {
    const cMock = (cloudState.mocks || [])[idx] || {};
    const hasLocal = lMock.status === 'Taken' || Boolean(lMock.totalScore);
    const hasCloud = cMock.status === 'Taken' || Boolean(cMock.totalScore);

    if (hasLocal) return lMock;
    if (hasCloud) return cMock;
    return lMock;
  });

  const mergedLastUpdated = Math.max(
    Number(localState.lastUpdated) || 0,
    Number(cloudState.lastUpdated) || Number(cloudState.updatedAtMs) || 0,
    Date.now()
  );

  return {
    tracker: mergedTracker,
    studyPlan: mergedStudyPlan,
    mocks: mergedMocks,
    settings: {
      ...(cloudState.settings || {}),
      ...(localState.settings || {}),
      startDate: localState.settings?.startDate || cloudState.settings?.startDate || base.settings.startDate
    },
    lastUpdated: mergedLastUpdated
  };
};

export const exportStateAsFile = (state) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "cat_prep_tracker_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

