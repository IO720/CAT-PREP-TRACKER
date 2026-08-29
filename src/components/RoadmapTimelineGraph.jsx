import React from 'react';
import { Icons } from './AspirantIcons';
import { CAT_MILESTONES, WEEKLY_SYLLABUS_DETAILS } from '../data/catSyllabusRoadmap';

export default function RoadmapTimelineGraph({
  studyPlan = [],
  onSelectWeek,
  selectedWeekIndex,
  onWeekClick
}) {
  // Extract week number (1-16) from "Month X: Week Y"
  const getWeekNumber = (weekStr, idx) => {
    const match = weekStr?.match(/Week\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : idx + 1;
  };

  const getWeekStatus = (week) => week?.status || 'Not Started';

  // Group weeks by Phase
  const phase1Weeks = studyPlan.slice(0, 8);
  const phase2Weeks = studyPlan.slice(8, 12);
  const phase3Weeks = studyPlan.slice(12, 16);

  const phases = [
    {
      id: 'p1',
      name: 'Phase 1: Foundation & Core Concepts',
      weeks: phase1Weeks,
      color: '#38bdf8',
      milestoneIndex: 8,
      milestone: CAT_MILESTONES[8],
      subtitle: 'Arithmetic Mastery • Seating Arrangements • Core Reading Habits'
    },
    {
      id: 'p2',
      name: 'Phase 2: Syllabus Completion & Sectionals',
      weeks: phase2Weeks,
      color: '#a855f7',
      milestoneIndex: 12,
      milestone: CAT_MILESTONES[12],
      subtitle: 'Modern Math • Advanced Tournaments • Time-Bound Sectionals'
    },
    {
      id: 'p3',
      name: 'Phase 3: The Mock Marathon',
      weeks: phase3Weeks,
      color: '#f59e0b',
      milestoneIndex: 16,
      milestone: CAT_MILESTONES[16],
      subtitle: '30 Full Mocks • Rigorous Error Diagnostics • 99%ile Peak Readiness'
    }
  ];

  return (
    <div className="roadmap-canvas-container">
      <div className="roadmap-header-legend">
        <div className="roadmap-legend-items">
          <span className="roadmap-legend-tag completed">
            <span className="legend-dot done"></span> Completed
          </span>
          <span className="roadmap-legend-tag in-progress">
            <span className="legend-dot active"></span> In Progress
          </span>
          <span className="roadmap-legend-tag not-started">
            <span className="legend-dot idle"></span> Up Next
          </span>
          <span className="roadmap-legend-tag milestone">
            <Icons.Trophy size={13} className="legend-milestone-svg" />
            <span>Major Milestone</span>
          </span>
        </div>
        <div className="roadmap-hint">
          <span>Click any node to reveal syllabus checklist & drill-downs</span>
        </div>
      </div>

      <div className="roadmap-track-phases">
        {phases.map((phase) => {
          const completedCount = phase.weeks.filter((w) => w.status === 'Completed').length;
          const phasePercent = Math.round((completedCount / (phase.weeks.length || 1)) * 100);

          return (
            <div key={phase.id} className="roadmap-phase-cluster">
              {/* Phase Banner */}
              <div className="roadmap-phase-banner" style={{ borderLeftColor: phase.color }}>
                <div className="phase-banner-info">
                  <div className="phase-badge-pill" style={{ color: phase.color, borderColor: `${phase.color}40`, backgroundColor: `${phase.color}15` }}>
                    {phase.name.split(':')[0]}
                  </div>
                  <h3 className="phase-title-text">{phase.name}</h3>
                  <p className="phase-subtitle-text">{phase.subtitle}</p>
                </div>
                <div className="phase-meter-box">
                  <div className="phase-meter-header">
                    <span className="phase-meter-ratio">{completedCount}/{phase.weeks.length} Weeks</span>
                    <span className="phase-meter-pct">{phasePercent}%</span>
                  </div>
                  <div className="phase-mini-track">
                    <div
                      className="phase-mini-fill"
                      style={{
                        width: `${phasePercent}%`,
                        backgroundColor: phase.color
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Node Sequence */}
              <div className="roadmap-nodes-row">
                {phase.weeks.map((week) => {
                  const globalIdx = studyPlan.findIndex((w) => w.week === week.week);
                  const weekNum = globalIdx + 1;
                  const status = getWeekStatus(week);
                  const isSelected = selectedWeekIndex === globalIdx;
                  const milestone = CAT_MILESTONES[weekNum];
                  const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];

                  const statusClass =
                    status === 'Completed'
                      ? 'node-status-completed'
                      : status === 'In Progress'
                      ? 'node-status-inprogress'
                      : 'node-status-pending';

                  return (
                    <div
                      key={week.week}
                      className={`roadmap-node-cell ${isSelected ? 'is-selected' : ''} ${statusClass}`}
                      onClick={() => onSelectWeek(globalIdx)}
                    >
                      {/* Connecting line */}
                      <div className="roadmap-node-connector" />

                      {/* Milestone badge top anchor */}
                      {milestone && (
                        <div
                          className="roadmap-milestone-flag"
                          title={`${milestone.title}: ${milestone.desc}`}
                        >
                          <Icons.Award size={10} className="milestone-star-icon" />
                          <span className="milestone-text-label">Checkpoint</span>
                        </div>
                      )}

                      {/* Node Circle */}
                      <div className="roadmap-node-disc">
                        <span className="node-week-label">W{weekNum}</span>
                        {status === 'Completed' && (
                          <span className="node-status-icon done">
                            <Icons.Check size={12} />
                          </span>
                        )}
                        {status === 'In Progress' && (
                          <span className="node-pulsing-halo" />
                        )}
                      </div>

                      {/* Node Card Details */}
                      <div className="roadmap-node-preview">
                        <span className="node-preview-week">{week.week}</span>
                        <div className="node-focus-tags">
                          <span className="focus-pill q" title={week.quantFocus}>
                            <strong>Q:</strong> {week.quantFocus?.split(',')[0]}
                          </span>
                          <span className="focus-pill lr" title={week.lrdiFocus}>
                            <strong>LR:</strong> {week.lrdiFocus?.split('&')[0]}
                          </span>
                          <span className="focus-pill v" title={week.varcFocus}>
                            <strong>V:</strong> {week.varcFocus?.split('/')[0]}
                          </span>
                        </div>
                        <div className="node-action-links">
                          <button
                            type="button"
                            className="node-drills-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onWeekClick(week.week);
                            }}
                            title={`Open daily tracker drills for ${week.week}`}
                          >
                            <span>Daily Drills</span>
                            <Icons.ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Checkpoint Card if present for this phase */}
              {phase.milestone && (
                <div
                  className="roadmap-milestone-highlight-card"
                  style={{ borderColor: `${phase.color}35` }}
                >
                  <div className="milestone-highlight-icon-box" style={{ background: `${phase.color}20`, color: phase.color }}>
                    <Icons.Trophy size={20} />
                  </div>
                  <div className="milestone-highlight-content">
                    <div className="milestone-tag-row">
                      <span className="milestone-phase-badge" style={{ color: phase.color }}>
                        WEEK {phase.milestoneIndex} CHECKPOINT
                      </span>
                      <h4 className="milestone-hero-title">{phase.milestone.title}</h4>
                    </div>
                    <p className="milestone-hero-desc">{phase.milestone.desc}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
