import React, { useState, useMemo } from 'react';
import { Icons } from './AspirantIcons';
import { 
  isDayPriorToStartDate, 
  getCalculatedDateForTrackerDay, 
  formatDateMonthDay 
} from '../utils/dateUtils';

function StudyContributionHeatmap({ tracker = {}, startDateStr = '', compact = false }) {
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' | 'Month 1' | 'Month 2' | 'Month 3' | 'Month 4'
  const [hoveredCell, setHoveredCell] = useState(null);

  // 7 Days: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const FULL_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MONTHS = ['Month 1', 'Month 2', 'Month 3', 'Month 4'];

  // Flatten weeks from all 4 months with stable memoization
  const { allWeeksByMonth, totalActiveDays, totalTasksDone } = useMemo(() => {
    const weeksMap = {};
    let activeDays = 0;
    let tasksCount = 0;

    MONTHS.forEach(monthKey => {
      const weeks = tracker[monthKey] || [];
      const monthWeeksList = [];

      weeks.forEach((weekObj, wIdx) => {
        const days = weekObj.days || [];
        const cellData = [];

        days.forEach((dayObj, dIdx) => {
          const wName = weekObj.week || `Week ${wIdx + 1}`;
          const dName = dayObj.day || FULL_DAY_NAMES[dIdx] || DAY_NAMES[dIdx];
          const isPrior = startDateStr ? isDayPriorToStartDate(monthKey, wName, dName, startDateStr) : false;

          let tasksDone = 0;
          if (dayObj.quantCompleted) tasksDone++;
          if (dayObj.lrdiCompleted) tasksDone++;
          if (dayObj.varcCompleted) tasksDone++;
          if (dayObj.customCompleted) tasksDone++;

          const qCount = Number(dayObj.quantCount) || 0;
          const lrdiCount = Number(dayObj.lrdiCount) || 0;
          const varcCount = Number(dayObj.varcCount) || 0;
          const customCount = Number(dayObj.customCount) || 0;
          const totalQs = qCount + lrdiCount + varcCount + customCount;
          const studyHours = Number(dayObj.studyHours) || 0;

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

            if (tasksDone > 0 || totalQs > 0 || studyHours > 0) {
              activeDays++;
              tasksCount += tasksDone;
            }
          }

          cellData.push({
            month: monthKey,
            weekName: wName,
            dayName: DAY_NAMES[dIdx] || `Day ${dIdx + 1}`,
            dayNumber: dayObj.day || `Day ${dIdx + 1}`,
            tasksDone,
            totalQs,
            studyHours,
            level,
            isPrior,
            quantCompleted: dayObj.quantCompleted,
            lrdiCompleted: dayObj.lrdiCompleted,
            varcCompleted: dayObj.varcCompleted
          });
        });

        while (cellData.length < 7) {
          cellData.push({
            month: monthKey,
            weekName: weekObj.week || `Week ${wIdx + 1}`,
            dayName: DAY_NAMES[cellData.length],
            tasksDone: 0,
            totalQs: 0,
            level: 0
          });
        }

        monthWeeksList.push({
          month: monthKey,
          weekName: weekObj.week || `Week ${wIdx + 1}`,
          days: cellData
        });
      });

      weeksMap[monthKey] = monthWeeksList;
    });

    return { allWeeksByMonth: weeksMap, totalActiveDays: activeDays, totalTasksDone: tasksCount };
  }, [tracker]);

  // Filter weeks to display based on selectedMonth
  const displayedWeeks = useMemo(() => {
    return selectedMonth === 'ALL'
      ? Object.values(allWeeksByMonth).flat()
      : (allWeeksByMonth[selectedMonth] || []);
  }, [selectedMonth, allWeeksByMonth]);

  const isSingleMonth = selectedMonth !== 'ALL';

  return (
    <div className={`activity-heatmap-wrapper ${compact ? 'is-compact' : ''}`}>
      {/* Top Header & Month Switcher Navigation */}
      <div className="heatmap-header-row">
        <div className="heatmap-month-tabs">
          <button
            type="button"
            className={`month-tab-btn ${selectedMonth === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedMonth('ALL')}
          >
            All 16 Weeks
          </button>
          {MONTHS.map((m, idx) => (
            <button
              key={m}
              type="button"
              className={`month-tab-btn ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => setSelectedMonth(m)}
            >
              M{idx + 1}
            </button>
          ))}
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

      {/* Centered Matrix Grid Container (0 Overlap, Even Boxes) */}
      <div className="heatmap-scroll-area">
        <div className={`heatmap-grid-table ${isSingleMonth ? 'single-month-mode' : ''}`}>
          
          {/* Top Month / Week Header Labels */}
          <div className="heatmap-week-labels-row">
            <div className="heatmap-day-label-placeholder" />
            <div className="heatmap-labels-track">
              {isSingleMonth ? (
                displayedWeeks.map((w, idx) => (
                  <div key={idx} className="heatmap-month-span-label single-week-label">
                    W{idx + 1}
                  </div>
                ))
              ) : (
                MONTHS.map((m, mIdx) => (
                  <div key={mIdx} className="heatmap-month-span-label four-weeks-span">
                    Month {mIdx + 1}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Matrix Body: Aligned Day Row Labels on Left + Even Square Columns on Right */}
          <div className="heatmap-matrix-body">
            {/* Left Day Labels Column */}
            <div className="heatmap-day-labels-col">
              <div className="day-label-cell">Mon</div>
              <div className="day-label-cell empty-day-label" />
              <div className="day-label-cell">Wed</div>
              <div className="day-label-cell empty-day-label" />
              <div className="day-label-cell">Fri</div>
              <div className="day-label-cell empty-day-label" />
              <div className="day-label-cell">Sun</div>
            </div>

            {/* Week Columns Track */}
            <div className="heatmap-weeks-track">
              {displayedWeeks.map((week, wIdx) => (
                <div key={wIdx} className="heatmap-week-column">
                  {week.days.map((cell, dIdx) => (
                    <div
                      key={dIdx}
                      className={`heatmap-square level-${cell.level} ${cell.isPrior ? 'is-prior-day' : ''} ${isSingleMonth ? 'single-month-square' : ''}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Hover Tooltip Readout Bar */}
      <div className="heatmap-cell-tooltip-status">
        {hoveredCell ? (
          <span className="tooltip-active-text">
            {hoveredCell.isPrior ? (
              <strong>Prior to prep start date ({hoveredCell.dayName}, {hoveredCell.month} {hoveredCell.weekName})</strong>
            ) : (
              <>
                <strong>{hoveredCell.tasksDone}/3 tasks done</strong> ({hoveredCell.totalQs} Qs{hoveredCell.studyHours > 0 ? ` • ${hoveredCell.studyHours}h` : ''}) • {hoveredCell.dayName}, {hoveredCell.month} ({hoveredCell.weekName})
              </>
            )}
          </span>
        ) : (
          <span className="tooltip-hint-text">
            {totalActiveDays} active study days logged • Hover over any box to view details
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(StudyContributionHeatmap);
