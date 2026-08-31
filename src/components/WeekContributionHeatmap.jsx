import React, { useState, useMemo } from 'react';
import { 
  getTodayTrackerPosition, 
  getCalculatedDateForTrackerDay, 
  formatDateMonthDay, 
  isToday 
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
      let tasksDone = 0;
      if (dayObj.quantCompleted) tasksDone++;
      if (dayObj.lrdiCompleted) tasksDone++;
      if (dayObj.varcCompleted) tasksDone++;

      const qCount = Number(dayObj.quantCount) || 0;
      const lrdiCount = Number(dayObj.lrdiCount) || 0;
      const varcCount = Number(dayObj.varcCount) || 0;
      const totalQs = qCount + lrdiCount + varcCount;
      const studyHours = Number(dayObj.studyHours) || 0;

      let level = 0;
      if (tasksDone === 1 || studyHours > 0) level = 1;
      if (tasksDone === 2 || studyHours >= 1.5) level = 2;
      if (tasksDone >= 3 || totalQs >= 25 || studyHours >= 3) level = 3;
      if (tasksDone >= 3 && (totalQs >= 35 || studyHours >= 4)) level = 4;

      const calcDate = getCalculatedDateForTrackerDay(activeMonth, activeWeek, dayObj.day, startDateStr);
      const isDayToday = isToday(activeMonth, activeWeek, dayObj.day, startDateStr);
      const dateFormatted = formatDateMonthDay(calcDate);

      return {
        ...dayObj,
        tasksDone,
        totalQs,
        studyHours,
        level,
        isToday: isDayToday,
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
            className={`week-matrix-col ${day.isToday ? 'is-today' : ''}`}
            onClick={() => onNavigateToDay && onNavigateToDay(activeMonth, activeWeek, day.day)}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            role="button"
            tabIndex={0}
            title={`${day.day}: ${day.tasksDone}/3 quotas cleared • ${day.studyHours}h studied`}
          >
            <span className="week-matrix-day-lbl">{day.shortDay}</span>
            <div 
              className={`heatmap-square week-heatmap-square level-${day.level} ${day.isToday ? 'today-pulse-tile' : ''}`} 
            />
            <span className={`week-matrix-sub-lbl font-mono ${day.tasksDone === 3 ? 'all-clear' : ''}`}>
              {day.tasksDone}/3
            </span>
          </div>
        ))}
      </div>

      {/* Hover Telemetry Footer matching normal heatmap */}
      <div className="heatmap-footer-note">
        {hoveredDay ? (
          <span>
            <strong>{hoveredDay.day} ({hoveredDay.dateFormatted})</strong>: {hoveredDay.tasksDone}/3 quotas cleared • {hoveredDay.studyHours}h focus • {hoveredDay.totalQs} questions
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
