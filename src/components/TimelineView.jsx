import React, { useState } from 'react';
import { Icons } from './AspirantIcons';

export default function TimelineView({ state, updateWeekStatus, onWeekClick }) {
  const { studyPlan } = state;
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('ALL');

  // Metrics
  const totalWeeks = studyPlan?.length || 16;
  const completedWeeks = studyPlan?.filter(w => w.status === 'Completed').length || 0;
  const inProgressWeeks = studyPlan?.filter(w => w.status === 'In Progress').length || 0;
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);

  // Group weeks by Phase
  const phases = studyPlan.reduce((acc, week) => {
    const phaseName = week.phase || "General Timeline";
    if (!acc[phaseName]) {
      acc[phaseName] = [];
    }
    acc[phaseName].push(week);
    return acc;
  }, {});

  const handleStatusChange = (weekTitle, e) => {
    updateWeekStatus(weekTitle, e.target.value);
  };

  const filteredPhases = Object.entries(phases).filter(([phaseName]) => {
    if (selectedPhaseFilter === 'ALL') return true;
    return phaseName.toUpperCase().includes(selectedPhaseFilter);
  });

  return (
    <div className="timeline-view-wrapper fade-in">
      {/* Top Header & Curriculum Analytics Hero */}
      <div className="timeline-hero-card">
        <div className="timeline-hero-top">
          <div className="timeline-hero-title-col">
            <div className="timeline-icon-badge">
              <Icons.Calendar size={22} />
            </div>
            <div>
              <h1 className="timeline-main-title">16-Week Study Plan & Blueprint</h1>
              <p className="timeline-sub-title">
                Manage your comprehensive CAT preparation roadmap, milestones, and syllabus phases.
              </p>
            </div>
          </div>

          <div className="timeline-progress-pill">
            <span className="progress-percent-val">{progressPercent}%</span>
            <span className="progress-percent-label">Curriculum Mastered</span>
          </div>
        </div>

        {/* Global Curriculum Progress Track */}
        <div className="timeline-overall-bar-wrap">
          <div className="timeline-track-info">
            <span>Progress: <strong>{completedWeeks} of {totalWeeks} Weeks Completed</strong> ({inProgressWeeks} In Progress)</span>
            <span>Target: 2,000 Quant • 400 LRDI Sets • 400 RCs</span>
          </div>
          <div className="timeline-overall-track">
            <div 
              className="timeline-overall-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="timeline-filter-pills-row">
          <button
            type="button"
            className={`timeline-filter-btn ${selectedPhaseFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedPhaseFilter('ALL')}
          >
            <Icons.Layers size={14} />
            <span>All Weeks ({totalWeeks})</span>
          </button>
          <button
            type="button"
            className={`timeline-filter-btn ${selectedPhaseFilter === 'PHASE 1' || selectedPhaseFilter === 'FOUNDATION' ? 'active' : ''}`}
            onClick={() => setSelectedPhaseFilter('PHASE 1')}
          >
            <Icons.Zap size={14} />
            <span>Phase 1: Foundation (Weeks 1-8)</span>
          </button>
          <button
            type="button"
            className={`timeline-filter-btn ${selectedPhaseFilter === 'PHASE 2' || selectedPhaseFilter === 'ADVANCED' ? 'active' : ''}`}
            onClick={() => setSelectedPhaseFilter('PHASE 2')}
          >
            <Icons.Trophy size={14} />
            <span>Phase 2: Mocks & Mastery (Weeks 9-16)</span>
          </button>
        </div>
      </div>

      {/* Main Phase Sections & Tables */}
      <div className="timeline-phases-container">
        {filteredPhases.map(([phaseName, weeks]) => {
          const phaseCompleted = weeks.filter(w => w.status === 'Completed').length;
          return (
            <div key={phaseName} className="phase-card-wrapper animate-slide-up">
              <div className="phase-header-badge-row">
                <div className="phase-title-left">
                  <div className="phase-dot" />
                  <h2 className="phase-header">{phaseName}</h2>
                </div>
                <div className="phase-meta-right">
                  <span className="phase-count-pill">{phaseCompleted} / {weeks.length} Done</span>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="timeline-desktop-wrapper">
                <table className="timeline-table">
                  <thead>
                    <tr>
                      <th style={{ width: '160px' }}>Week & Timeline</th>
                      <th>Quantitative Aptitude (125 Qs/wk)</th>
                      <th>LRDI Sectionals (25 Sets/wk)</th>
                      <th>VARC Mastery (25 RCs/wk)</th>
                      <th style={{ width: '150px' }}>Status</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Drills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week, idx) => (
                      <tr key={idx} className="timeline-row">
                        <td className="timeline-cell timeline-week-title-cell">
                          <button
                            type="button"
                            className="week-badge-pill-btn"
                            onClick={() => onWeekClick(week.week)}
                            title="Click to jump to Daily Tracker for this week"
                          >
                            <Icons.Calendar size={13} />
                            <span>{week.week}</span>
                          </button>
                        </td>

                        <td className="timeline-cell">
                          <div className="timeline-subject-cell">
                            <span className="subject-pill-tag quant">QUANT</span>
                            <span className="subject-text-focus">{week.quantFocus || "-"}</span>
                          </div>
                        </td>

                        <td className="timeline-cell">
                          <div className="timeline-subject-cell">
                            <span className="subject-pill-tag lrdi">LRDI</span>
                            <span className="subject-text-focus">{week.lrdiFocus || "-"}</span>
                          </div>
                        </td>

                        <td className="timeline-cell">
                          <div className="timeline-subject-cell">
                            <span className="subject-pill-tag varc">VARC</span>
                            <span className="subject-text-focus">{week.varcFocus || "-"}</span>
                          </div>
                        </td>

                        <td className="timeline-cell">
                          <select
                            value={week.status}
                            onChange={(e) => handleStatusChange(week.week, e)}
                            className={`timeline-status-select ${week.status === 'Completed' ? 'completed' : week.status === 'In Progress' ? 'in-progress' : 'not-started'}`}
                          >
                            <option value="Not Started">⏳ Not Started</option>
                            <option value="In Progress">⚡ In Progress</option>
                            <option value="Completed">✓ Completed</option>
                          </select>
                        </td>

                        <td className="timeline-cell" style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="timeline-jump-action-btn"
                            onClick={() => onWeekClick(week.week)}
                            title={`Open drills for ${week.week}`}
                          >
                            <span>Open</span>
                            <Icons.ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Native Cards View */}
              <div className="timeline-mobile-cards">
                {weeks.map((week, idx) => (
                  <div key={idx} className="timeline-week-card">
                    <div className="week-card-top-row">
                      <div 
                        className="week-card-title-pill"
                        onClick={() => onWeekClick(week.week)}
                        title="Jump to daily drills"
                      >
                        <Icons.Calendar size={13} />
                        <span>{week.week}</span>
                      </div>

                      <select
                        value={week.status}
                        onChange={(e) => handleStatusChange(week.week, e)}
                        className={`week-card-select ${week.status === 'Completed' ? 'completed' : week.status === 'In Progress' ? 'in-progress' : 'not-started'}`}
                      >
                        <option value="Not Started">⏳ Not Started</option>
                        <option value="In Progress">⚡ In Progress</option>
                        <option value="Completed">✓ Completed</option>
                      </select>
                    </div>

                    <div className="week-card-subject-list">
                      <div className="week-card-subject-item">
                        <span className="subject-badge-pill quant">QUANT</span>
                        <span className="subject-focus-desc">{week.quantFocus || "Topic drills"}</span>
                      </div>
                      <div className="week-card-subject-item">
                        <span className="subject-badge-pill lrdi">LRDI</span>
                        <span className="subject-focus-desc">{week.lrdiFocus || "Caselet sets"}</span>
                      </div>
                      <div className="week-card-subject-item">
                        <span className="subject-badge-pill varc">VARC</span>
                        <span className="subject-focus-desc">{week.varcFocus || "RC passages"}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="week-card-jump-btn"
                      onClick={() => onWeekClick(week.week)}
                    >
                      <span>Open Daily Drills for {week.week}</span>
                      <Icons.ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
