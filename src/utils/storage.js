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
        notes: day.notes || ""
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
      startDate: defaultStartDate
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
    return parsed;
  } catch (err) {
    console.error("Could not load state from localStorage:", err);
    return getInitialState();
  }
};

export const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Could not save state to localStorage:", err);
  }
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
