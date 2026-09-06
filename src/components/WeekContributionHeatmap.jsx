import React, { useState, useMemo } from 'react';
import { 
  getTodayTrackerPosition, 
  getCalculatedDateForTrackerDay, 
  formatDateMonthDay, 
  isToday,
  isDayPriorToStartDate
} from '../utils/dateUtils';

/**
 * WeekContributionHeatmap
 * Minimal 7-day weekly contribution heatmap that directly references and shares
 * the visual language, typography, and CSS variables of the main StudyContributionHeatmap.
 */
function WeekContributionHeatmap({
  tracker = {},
  startDateStr = '',
  onNavigateToDay = null
}) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const todayPos = useMemo(() => {
    return getTodayTrackerPosition(startDateStr);
  }, [startDateStr]);

  const activeMonth = todayPos.activeMonth;
  const activeWeek = todayPos.activeWeek;

  const weekObj = useMemo(() => {
    const monthWeeks = tracker[activeMonth] || [];
    return monthWeeks.find(w => w.week === activeWeek) || monthWeeks[0] || { days: [] };
  }, [tracker, activeMonth, activeWeek]);

  const daysData = useMemo(() => {
    return (weekObj.days || []).map((dayObj) => {
      const calcDate = getCalculatedDateForTrackerDay(activeMonth, activeWeek, dayObj.day, startDateStr);
      const isDayToday = isToday(activeMonth, activeWeek, dayObj.day, startDateStr);
      const isPrior = startDateStr ? isDayPriorToStartDate(activeMonth, activeWeek, dayObj.day, startDateStr) : false;
      const dateFormatted = formatDateMonthDay(calcDate);

      const qCount = Number(dayObj.quantCount) || 0;
      const lrdiCount = Number(dayObj.lrdiCount) || 0;
      const varcCount = Number(dayObj.varcCount) || 0;
      const customCount = Number(dayObj.customCount) || 0;
      const totalQs = qCount + lrdiCount + varcCount + customCount;
      const studyHours = Number(dayObj.studyHours) || 0;

      let tasksDone = 0;
      if (dayObj.quantCompleted) tasksDone++;
      if (dayObj.lrdiCompleted) tasksDone++;
      if (dayObj.varcCompleted) tasksDone++;
      if (dayObj.customCompleted) tasksDone++;

      const hasCustom = Boolean(dayObj.hasCustomObjective);
      const totalQuotasNeeded = hasCustom ? 4 : 3;

      let level = 0;
      if (!isPrior) {
        if (tasksDone >= totalQuotasNeeded || (tasksDone >= 3 && totalQs >= 26) || (tasksDone >= 2 && studyHours >= 3.5)) {
          // Completed all quotas -> level 4: brightest glowing colour
          level = 4;
        } else if (tasksDone >= 2 || totalQs >= 16 || studyHours >= 2.5) {
          // 16-17 questions / 2 quotas / high focus -> level 3: lighter & bright
          level = 3;
        } else if (tasksDone >= 1 || (totalQs >= 11 && totalQs <= 15) || (studyHours >= 1.0 && studyHours < 2.5)) {
          // 11-15 questions / 1 quota / 1-2h -> level 2: a bit more lighter and brighter
          level = 2;
        } else if (totalQs >= 1 || studyHours > 0 || tasksDone > 0) {
          // 1-10 questions / partial time -> level 1: subtle dark colour
          level = 1;
        }
      }

      return {
        ...dayObj,
        tasksDone,
        totalQs,
        studyHours,
        level,
        isToday: isDayToday,
        isPrior,
        dateFormatted,
        shortDay: (dayObj.day || '').substring(0, 3)
      };
    });
  }, [weekObj, activeMonth, activeWeek, startDateStr]);

  const totalWeekClearedQuotas = useMemo(() => {
    return daysData.reduce((acc, d) => acc + d.tasksDone, 0);
  }, [daysData]);

  const totalWeekHours = useMemo(() => {
    return daysData.reduce((acc, d) => acc + d.studyHours, 0);
  }, [daysData]);

  return (
    <div className="activity-heatmap-wrapper week-heatmap-minimal">
      {/* Header matching normal heatmap */}
      <div className="heatmap-header-row">
        <div className="heatmap-month-tabs">
          <span className="month-tab-btn active font-mono">
            {activeWeek} • {activeMonth}
          </span>
          <span className="week-mini-summary-tag font-mono">
            {totalWeekClearedQuotas} / 21 Quotas • {totalWeekHours.toFixed(1)}h
          </span>
        </div>

        <div className="heatmap-legend-box">
          <span className="legend-label">Less</span>
          <span className="heatmap-square level-0"></span>
          <span className="heatmap-square level-1"></span>
          <span className="heatmap-square level-2"></span>
          <span className="heatmap-square level-3"></span>
          <span className="heatmap-square level-4"></span>
          <span className="legend-label">More</span>
        </div>
      </div>

      {/* 7-Day Clean Heatmap Matrix Row */}
      <div className="week-matrix-track">
        {daysData.map((day) => (
          <div
            key={day.day}
            className={`week-matrix-col ${day.isToday ? 'is-today' : ''} ${day.isPrior ? 'is-prior-col' : ''}`}
            onClick={() => onNavigateToDay && onNavigateToDay(activeMonth, activeWeek, day.day)}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            role="button"
            tabIndex={0}
            title={day.isPrior ? `Prior to prep start date (${day.dateFormatted})` : `${day.day}: ${day.tasksDone}/3 quotas cleared • ${day.studyHours}h studied`}
          >
            <span className="week-matrix-day-lbl">{day.shortDay}</span>
            <div 
              className={`heatmap-square week-heatmap-square level-${day.level} ${day.isPrior ? 'is-prior-day' : ''} ${day.isToday ? 'today-pulse-tile' : ''}`} 
            />
            <span className={`week-matrix-sub-lbl font-mono ${day.tasksDone === 3 ? 'all-clear' : ''}`}>
              {day.isPrior ? '-' : `${day.tasksDone}/3`}
            </span>
          </div>
        ))}
      </div>

      {/* Hover Telemetry Footer matching normal heatmap */}
      <div className="heatmap-footer-note">
        {hoveredDay ? (
          <span>
            <strong>{hoveredDay.day} ({hoveredDay.dateFormatted})</strong>: {hoveredDay.isPrior ? 'Prior to official preparation start date' : `${hoveredDay.tasksDone}/3 quotas cleared • ${hoveredDay.studyHours}h focus • ${hoveredDay.totalQs} questions`}
          </span>
        ) : (
          <span>
            {activeWeek} current sprint matrix • Click any day square to open its daily drills
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(WeekContributionHeatmap);
