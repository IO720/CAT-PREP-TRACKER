import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from './AspirantIcons';
import RoadmapTimelineGraph from './RoadmapTimelineGraph';
import { 
  CAT_PHASES, 
  CAT_MILESTONES, 
  WEEKLY_SYLLABUS_DETAILS 
} from '../data/catSyllabusRoadmap';
import { playGamingAchievementSound } from '../utils/audioUtils';

export default function TimelineView({ 
  state, 
  updateWeekStatus, 
  updateWeekPlan,
  onWeekClick 
}) {
  const { studyPlan = [] } = state;

  // View Mode: 'cards' | 'roadmap' | 'table'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('aspiranto_study_plan_view') || 'cards';
  });

  // Active filters
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspect drawer/modal for a specific week
  const [inspectedWeekIdx, setInspectedWeekIdx] = useState(null);

  // Save view preference
  useEffect(() => {
    try {
      localStorage.setItem('aspiranto_study_plan_view', viewMode);
    } catch (e) {}
  }, [viewMode]);

  // Overall metrics
  const totalWeeks = studyPlan.length || 16;
  const completedWeeks = studyPlan.filter((w) => w.status === 'Completed').length;
  const inProgressWeeks = studyPlan.filter((w) => w.status === 'In Progress').length;
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);

  // Active or next week
  const activeWeekNum = useMemo(() => {
    const inProgIdx = studyPlan.findIndex(w => w.status === 'In Progress');
    if (inProgIdx !== -1) return inProgIdx + 1;
    const notStartedIdx = studyPlan.findIndex(w => w.status === 'Not Started');
    if (notStartedIdx !== -1) return notStartedIdx + 1;
    return 1;
  }, [studyPlan]);

  // CAT Countdown calculation
  const catCountdownDays = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), 10, 29); // Last Sunday of November
    if (today > targetDate) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
    const diffTime = targetDate - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, []);

  // Handle status update
  const handleStatusToggle = (weekTitle, currentStatus, e) => {
    e.stopPropagation();
    let nextStatus = 'In Progress';
    if (currentStatus === 'Not Started') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';
    else nextStatus = 'Not Started';

    if (nextStatus === 'Completed') {
      try {
        playGamingAchievementSound(0.035);
      } catch (err) {}
    }

    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { status: nextStatus });
    } else if (updateWeekStatus) {
      updateWeekStatus(weekTitle, nextStatus);
    }
  };

  const handleStatusSelect = (weekTitle, newStatus) => {
    if (newStatus === 'Completed') {
      try {
        playGamingAchievementSound(0.035);
      } catch (err) {}
    }
    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { status: newStatus });
    } else if (updateWeekStatus) {
      updateWeekStatus(weekTitle, newStatus);
    }
  };

  // Toggle subtopic checklist item
  const handleSubtopicToggle = (weekTitle, subtopicText) => {
    const currentWeek = studyPlan.find((w) => w.week === weekTitle);
    if (!currentWeek) return;

    const currentCompleted = currentWeek.completedSubtopics || [];
    const isCompleted = currentCompleted.includes(subtopicText);

    const updatedSubtopics = isCompleted
      ? currentCompleted.filter((t) => t !== subtopicText)
      : [...currentCompleted, subtopicText];

    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { completedSubtopics: updatedSubtopics });
    }
  };

  // Save personal week note
  const handleNoteChange = (weekTitle, notes) => {
    if (updateWeekPlan) {
      updateWeekPlan(weekTitle, { notes });
    }
  };

  // Filter study plan
  const filteredWeeks = useMemo(() => {
    return studyPlan.filter((w, idx) => {
      const weekNum = idx + 1;

      // Phase filter
      if (selectedPhase !== 'ALL') {
        if (selectedPhase === 'PHASE 1' && (weekNum < 1 || weekNum > 8)) return false;
        if (selectedPhase === 'PHASE 2' && (weekNum < 9 || weekNum > 12)) return false;
        if (selectedPhase === 'PHASE 3' && (weekNum < 13 || weekNum > 16)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];
        const allText = [
          w.week,
          w.phase,
          w.quantFocus,
          w.lrdiFocus,
          w.varcFocus,
          ...(syllabus?.quantSubtopics || []),
          ...(syllabus?.lrdiSubtopics || []),
          ...(syllabus?.varcSubtopics || []),
          syllabus?.strategyTip || ''
        ]
          .join(' ')
          .toLowerCase();

        if (!allText.includes(query)) return false;
      }

      return true;
    });
  }, [studyPlan, selectedPhase, searchQuery]);

  const inspectedWeekData = inspectedWeekIdx !== null ? studyPlan[inspectedWeekIdx] : null;
  const inspectedWeekNum = inspectedWeekIdx !== null ? inspectedWeekIdx + 1 : null;
  const inspectedSyllabus = inspectedWeekNum ? WEEKLY_SYLLABUS_DETAILS[inspectedWeekNum] : null;
  const inspectedMilestone = inspectedWeekNum ? CAT_MILESTONES[inspectedWeekNum] : null;

  return (
    <div className="plan-expedition-container fade-in">
      {/* 1. Unique Expedition Command Header */}
      <div className="plan-expedition-hero">
        <div className="expedition-hero-left">
          <div className="expedition-protocol-tag">
            <span>// STRATEGIC BLUEPRINT • 16-WEEK CURRICULUM</span>
          </div>
          <h1 className="expedition-headline">
            THE 16-WEEK <span className="expedition-headline-serif">Roadmap.</span>
          </h1>
          <p className="expedition-lead-manifesto">
            Tactical syllabus progression from core foundation to sectional peak. 
            Target: <strong>2,000+ Quant</strong> • <strong>400+ LRDI Sets</strong> • <strong>400+ RCs</strong>.
          </p>
        </div>

        {/* Tactical Dial & Quick Progress HUD */}
        <div className="expedition-hud-cluster">
          <div className="expedition-hud-card">
            <div className="hud-metric-row">
              <span className="hud-metric-label">CURRENT MILESTONE</span>
              <span className="hud-metric-badge">WEEK {activeWeekNum}</span>
            </div>
            <div className="hud-main-val">
              {completedWeeks} <span className="hud-sub">/ {totalWeeks} Weeks Conquered</span>
            </div>
            <div className="hud-track-bar">
              <div 
                className="hud-track-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="hud-footer-meta">
              <span>{progressPercent}% Mastered</span>
              <span>{catCountdownDays} Days to CAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tactical Navigation Bar (Phase Filter Chips + Search + View Switcher) */}
      <div className="expedition-nav-bar">
        <div className="expedition-phase-segmented">
          {CAT_PHASES.map((p) => {
            const isActive = selectedPhase === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`expedition-phase-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedPhase(p.id)}
              >
                <span>{p.shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="expedition-tools-right">
          <div className="expedition-search-box">
            <Icons.Search size={13} className="expedition-search-icon" />
            <input
              type="text"
              placeholder="Search concepts or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="expedition-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="expedition-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <Icons.Close size={11} />
              </button>
            )}
          </div>

          <div className="expedition-view-segmented">
            <button
              type="button"
              className={`expedition-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Cards Dossier View"
            >
              <Icons.Grid size={13} />
              <span>Dossier</span>
            </button>
            <button
              type="button"
              className={`expedition-view-btn ${viewMode === 'roadmap' ? 'active' : ''}`}
              onClick={() => setViewMode('roadmap')}
              title="Roadmap Path View"
            >
              <Icons.TrendingUp size={13} />
              <span>Roadmap</span>
            </button>
            <button
              type="button"
              className={`expedition-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Compact Matrix View"
            >
              <Icons.Clock size={13} />
              <span>Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      {viewMode === 'roadmap' ? (
        /* Visual Roadmap View */
        <div className="timeline-view-body">
          <RoadmapTimelineGraph
            studyPlan={studyPlan}
            onSelectWeek={(weekIdx) => setInspectedWeekIdx(weekIdx)}
            selectedWeekIndex={inspectedWeekIdx}
            onWeekClick={onWeekClick}
          />
        </div>
      ) : viewMode === 'table' ? (
        /* Minimal Table View */
        <div className="timeline-view-body">
          <div className="blueprint-table-container">
            <table className="blueprint-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Week</th>
                  <th>Quantitative Aptitude</th>
                  <th>LRDI Sectionals</th>
                  <th>VARC Focus</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWeeks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="blueprint-table-empty">
                      No matching weeks found
                    </td>
                  </tr>
                ) : (
                  filteredWeeks.map((week) => {
                    const globalIdx = studyPlan.findIndex((w) => w.week === week.week);
                    const weekNum = globalIdx + 1;
                    const milestone = CAT_MILESTONES[weekNum];

                    return (
                      <tr key={week.week} className="blueprint-table-row">
                        <td className="blueprint-table-cell">
                          <div className="table-week-col">
                            <span className="table-week-name">W{weekNum}</span>
                            {milestone && (
                              <Icons.Award size={12} className="table-milestone-ico" title={milestone.title} />
                            )}
                          </div>
                        </td>
                        <td className="blueprint-table-cell">
                          <span className="table-topic-text">{week.quantFocus || "-"}</span>
                        </td>
                        <td className="blueprint-table-cell">
                          <span className="table-topic-text">{week.lrdiFocus || "-"}</span>
                        </td>
                        <td className="blueprint-table-cell">
                          <span className="table-topic-text">{week.varcFocus || "-"}</span>
                        </td>
                        <td className="blueprint-table-cell">
                          <select
                            value={week.status}
                            onChange={(e) => handleStatusSelect(week.week, e.target.value)}
                            className={`blueprint-table-status ${
                              week.status === 'Completed'
                                ? 'completed'
                                : week.status === 'In Progress'
                                ? 'in-progress'
                                : 'not-started'
                            }`}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="blueprint-table-cell" style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-inspect-btn"
                              onClick={() => setInspectedWeekIdx(globalIdx)}
                              title="Inspect subtopics"
                            >
                              Checklist
                            </button>
                            <button
                              type="button"
                              className="table-drills-btn"
                              onClick={() => onWeekClick(week.week)}
                              title="Go to drills"
                            >
                              <Icons.ArrowRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tactical Dossier Cards Grid */
        <div className="timeline-view-body">
          {filteredWeeks.length === 0 ? (
            <div className="blueprint-empty-card">
              <Icons.Search size={28} className="empty-search-icon" />
              <h3>No Blueprint Weeks Found</h3>
              <p>Try clearing your search query or switching phase filters.</p>
              <button
                type="button"
                className="expedition-phase-btn active"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPhase('ALL');
                }}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="expedition-dossier-grid">
              {filteredWeeks.map((week) => {
                const globalIdx = studyPlan.findIndex((w) => w.week === week.week);
                const weekNum = globalIdx + 1;
                const syllabus = WEEKLY_SYLLABUS_DETAILS[weekNum];
                const milestone = CAT_MILESTONES[weekNum];
                const completedSubtopics = week.completedSubtopics || [];
                const allSubtopicsCount =
                  (syllabus?.quantSubtopics?.length || 0) +
                  (syllabus?.lrdiSubtopics?.length || 0) +
                  (syllabus?.varcSubtopics?.length || 0);

                const isCompleted = week.status === 'Completed';
                const isInProgress = week.status === 'In Progress';
                const phaseNum = weekNum <= 8 ? '1' : weekNum <= 12 ? '2' : '3';

                return (
                  <div
                    key={week.week}
                    className={`dossier-card phase-${phaseNum} ${isCompleted ? 'is-completed' : ''} ${isInProgress ? 'is-in-progress' : ''}`}
                    onClick={() => setInspectedWeekIdx(globalIdx)}
                  >
                    {/* Top Phase Accent Border Pip */}
                    <div className={`dossier-phase-accent phase-${phaseNum}`} />

                    {/* Card Top Row: Week, Month & Status */}
                    <div className="dossier-header-row">
                      <div className="dossier-id-block">
                        <span className="dossier-week-tag">W{weekNum < 10 ? `0${weekNum}` : weekNum}</span>
                        <span className="dossier-month-tag">{week.week.split(':')[0]}</span>
                      </div>

                      <div className="dossier-status-block">
                        {milestone && (
                          <span className="dossier-milestone-flag" title={milestone.title}>
                            <Icons.Award size={11} />
                            <span>Milestone</span>
                          </span>
                        )}
                        <button
                          type="button"
                          className={`dossier-status-pill ${
                            isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'not-started'
                          }`}
                          onClick={(e) => handleStatusToggle(week.week, week.status, e)}
                          title="Toggle week status"
                        >
                          <span className="dossier-status-pip" />
                          <span>{week.status}</span>
                        </button>
                      </div>
                    </div>

                    {/* Phase Banner */}
                    <div className="dossier-phase-label">
                      Phase {phaseNum} • {weekNum <= 8 ? 'Foundation' : weekNum <= 12 ? 'Syllabus Completion' : 'Mock Marathon'}
                    </div>

                    {/* Subject Roadmap Items */}
                    <div className="dossier-subjects-stack">
                      <div className="dossier-subject-item quant">
                        <span className="dossier-sub-dot quant" />
                        <span className="dossier-sub-code">QA</span>
                        <span className="dossier-sub-topic">{week.quantFocus}</span>
                      </div>
                      <div className="dossier-subject-item lrdi">
                        <span className="dossier-sub-dot lrdi" />
                        <span className="dossier-sub-code">LR</span>
                        <span className="dossier-sub-topic">{week.lrdiFocus}</span>
                      </div>
                      <div className="dossier-subject-item varc">
                        <span className="dossier-sub-dot varc" />
                        <span className="dossier-sub-code">VA</span>
                        <span className="dossier-sub-topic">{week.varcFocus}</span>
                      </div>
                    </div>

                    {/* Card Footer: Checklist trigger & jump link */}
                    <div className="dossier-card-footer">
                      <span className="dossier-checklist-hint">
                        {completedSubtopics.length > 0 ? (
                          <strong className="dossier-active-topics">{completedSubtopics.length}/{allSubtopicsCount} done</strong>
                        ) : (
                          `${allSubtopicsCount} concepts`
                        )}
                      </span>

                      <div className="dossier-footer-links">
                        <span className="dossier-checklist-btn">Checklist</span>
                        <button
                          type="button"
                          className="dossier-drills-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWeekClick(week.week);
                          }}
                          title={`Go to Daily Drills for ${week.week}`}
                        >
                          <span>Drills</span>
                          <span className="dossier-arrow">↗</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Detailed Syllabus Inspector Drawer */}
      {inspectedWeekData && (
        <div className="blueprint-inspector-overlay" onClick={() => setInspectedWeekIdx(null)}>
          <div
            className="blueprint-inspector-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-header-left">
                <span className="drawer-week-number">WEEK {inspectedWeekNum}</span>
                <h2 className="drawer-title">{inspectedWeekData.week}</h2>
                <span className="drawer-phase-pill">{inspectedWeekData.phase}</span>
              </div>

              <div className="drawer-header-right">
                <select
                  value={inspectedWeekData.status}
                  onChange={(e) => handleStatusSelect(inspectedWeekData.week, e.target.value)}
                  className={`drawer-status-select ${
                    inspectedWeekData.status === 'Completed'
                      ? 'completed'
                      : inspectedWeekData.status === 'In Progress'
                      ? 'in-progress'
                      : 'not-started'
                  }`}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setInspectedWeekIdx(null)}
                  title="Close Inspector"
                >
                  <Icons.Close size={18} />
                </button>
              </div>
            </div>

            {/* Milestone Banner inside Drawer */}
            {inspectedMilestone && (
              <div className="drawer-milestone-callout">
                <div className="callout-icon-box">
                  <Icons.Trophy size={18} />
                </div>
                <div className="callout-text">
                  <h4>{inspectedMilestone.title}</h4>
                  <p>{inspectedMilestone.desc}</p>
                </div>
              </div>
            )}

            <div className="drawer-scroll-body">
              {/* Targets Summary */}
              {inspectedSyllabus && (
                <div className="drawer-targets-banner">
                  <div className="target-stat-item">
                    <span className="target-stat-label">WEEKLY TARGET</span>
                    <span className="target-stat-val">{inspectedSyllabus.drillTargets}</span>
                  </div>
                  <div className="target-stat-item">
                    <span className="target-stat-label">SUGGESTED HOURS</span>
                    <span className="target-stat-val">{inspectedSyllabus.targetWeeklyHours}</span>
                  </div>
                </div>
              )}

              {/* Granular Subtopics Checklist */}
              {inspectedSyllabus && (
                <div className="drawer-checklist-section">
                  <h3 className="section-sub-heading">Concept Checklist</h3>
                  <p className="section-sub-desc">
                    Check off each core concept as you complete theory lectures and practice problems.
                  </p>

                  {/* Quant Checklist */}
                  <div className="checklist-subject-group">
                    <div className="subject-group-header quant">
                      <Icons.Calculator size={14} />
                      <h4>Quantitative Aptitude</h4>
                    </div>
                    <div className="checklist-items-stack">
                      {inspectedSyllabus.quantSubtopics?.map((subtopic, sIdx) => {
                        const isDone = (inspectedWeekData.completedSubtopics || []).includes(subtopic);
                        return (
                          <label key={sIdx} className={`checklist-item-row ${isDone ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleSubtopicToggle(inspectedWeekData.week, subtopic)}
                            />
                            <span className="checklist-text">{subtopic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* LRDI Checklist */}
                  <div className="checklist-subject-group">
                    <div className="subject-group-header lrdi">
                      <Icons.Puzzle size={14} />
                      <h4>DILR Caselets & Puzzles</h4>
                    </div>
                    <div className="checklist-items-stack">
                      {inspectedSyllabus.lrdiSubtopics?.map((subtopic, sIdx) => {
                        const isDone = (inspectedWeekData.completedSubtopics || []).includes(subtopic);
                        return (
                          <label key={sIdx} className={`checklist-item-row ${isDone ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleSubtopicToggle(inspectedWeekData.week, subtopic)}
                            />
                            <span className="checklist-text">{subtopic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* VARC Checklist */}
                  <div className="checklist-subject-group">
                    <div className="subject-group-header varc">
                      <Icons.BookOpen size={14} />
                      <h4>VARC & Reading Drills</h4>
                    </div>
                    <div className="checklist-items-stack">
                      {inspectedSyllabus.varcSubtopics?.map((subtopic, sIdx) => {
                        const isDone = (inspectedWeekData.completedSubtopics || []).includes(subtopic);
                        return (
                          <label key={sIdx} className={`checklist-item-row ${isDone ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleSubtopicToggle(inspectedWeekData.week, subtopic)}
                            />
                            <span className="checklist-text">{subtopic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy & Formula Anchors */}
              {inspectedSyllabus?.strategyTip && (
                <div className="drawer-strategy-box">
                  <div className="drawer-strategy-header">
                    <Icons.Zap size={15} />
                    <h4>Exam Strategy Tip</h4>
                  </div>
                  <p>{inspectedSyllabus.strategyTip}</p>
                </div>
              )}

              {/* Personal Aspirant Week Notes */}
              <div className="drawer-notes-section">
                <h3 className="section-sub-heading">Personal Notes & Formulas</h3>
                <textarea
                  className="drawer-notes-textarea"
                  placeholder="Record key formulas or thoughts for this week..."
                  rows={3}
                  value={inspectedWeekData.notes || ''}
                  onChange={(e) => handleNoteChange(inspectedWeekData.week, e.target.value)}
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="drawer-footer">
              <button
                type="button"
                className="drawer-secondary-btn"
                onClick={() => setInspectedWeekIdx(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="drawer-primary-jump-btn"
                onClick={() => {
                  setInspectedWeekIdx(null);
                  onWeekClick(inspectedWeekData.week);
                }}
              >
                <span>Daily Drills for {inspectedWeekData.week}</span>
                <Icons.ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
