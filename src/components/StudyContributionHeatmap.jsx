import React, { useState } from 'react';
import { Icons } from './AspirantIcons';

export default function StudyContributionHeatmap({ tracker = {}, compact = false }) {
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' | 'Month 1' | 'Month 2' | 'Month 3' | 'Month 4'
  const [hoveredCell, setHoveredCell] = useState(null);

  // 7 Days: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MONTHS = ['Month 1', 'Month 2', 'Month 3', 'Month 4'];

  // Flatten weeks from all 4 months
  const allWeeksByMonth = {};
  let totalActiveDays = 0;
  let totalTasksDone = 0;

  MONTHS.forEach(monthKey => {
    const weeks = tracker[monthKey] || [];
    const monthWeeksList = [];

    weeks.forEach((weekObj, wIdx) => {
      const days = weekObj.days || [];
      const cellData = [];

      days.forEach((dayObj, dIdx) => {
        let tasksDone = 0;
        if (dayObj.quantCompleted) tasksDone++;
        if (dayObj.lrdiCompleted) tasksDone++;
        if (dayObj.varcCompleted) tasksDone++;

        const qCount = Number(dayObj.quantCount) || 0;
        const lrdiCount = Number(dayObj.lrdiCount) || 0;
        const varcCount = Number(dayObj.varcCount) || 0;
        const totalQs = qCount + lrdiCount + varcCount;

        let level = 0;
        if (tasksDone === 1) level = 1;
        else if (tasksDone === 2) level = 2;
        else if (tasksDone >= 3 || totalQs >= 25) level = 3;
        if (tasksDone >= 3 && totalQs >= 40) level = 4;

        if (tasksDone > 0) {
          totalActiveDays++;
          totalTasksDone += tasksDone;
        }

        cellData.push({
          month: monthKey,
          weekName: weekObj.week || `Week ${wIdx + 1}`,
          dayName: DAY_NAMES[dIdx] || `Day ${dIdx + 1}`,
          dayNumber: dayObj.day || `Day ${dIdx + 1}`,
          tasksDone,
          totalQs,
          level,
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

    allWeeksByMonth[monthKey] = monthWeeksList;
  });

  // Filter weeks to display based on selectedMonth
  const displayedWeeks = selectedMonth === 'ALL'
    ? Object.values(allWeeksByMonth).flat()
    : (allWeeksByMonth[selectedMonth] || []);

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
                      className={`heatmap-square level-${cell.level} ${isSingleMonth ? 'single-month-square' : ''}`}
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
            <strong>{hoveredCell.tasksDone} tasks done</strong> ({hoveredCell.totalQs} Qs) • {hoveredCell.dayName}, {hoveredCell.month} ({hoveredCell.weekName})
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
