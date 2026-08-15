import React from 'react';

export default function TimelineView({ state, updateWeekStatus, onWeekClick }) {
  const { studyPlan } = state;

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

  return (
    <div className="timeline-view-wrapper">
      <div className="header-row">
        <div>
          <h1 className="page-title">16-Week Study Plan</h1>
          <p className="page-subtitle">Manage your overall curriculum phase focus and mark completions.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {Object.entries(phases).map(([phaseName, weeks]) => (
          <div key={phaseName} className="phase-group">
            <div className="phase-header-badge-row">
              <h2 className="phase-header">{phaseName}</h2>
              <span className="phase-count-pill">{weeks.length} Weeks</span>
            </div>

            {/* Desktop Table View */}
            <div className="timeline-desktop-wrapper">
              <table className="timeline-table">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)' }}>Week</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)' }}>Quant Focus (125 Qs/wk)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)' }}>LRDI Focus (25 Sets/wk)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)' }}>VARC Focus (25 RCs/wk)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', width: '130px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, idx) => (
                    <tr key={idx} className="timeline-row">
                      <td 
                        className="timeline-cell timeline-week-title"
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => onWeekClick(week.week)}
                        title="Click to jump to Daily Tracker for this week"
                      >
                        {week.week}
                      </td>
                      <td className="timeline-cell">{week.quantFocus || "-"}</td>
                      <td className="timeline-cell">{week.lrdiFocus || "-"}</td>
                      <td className="timeline-cell">{week.varcFocus || "-"}</td>
                      <td className="timeline-cell">
                        <select
                          value={week.status}
                          onChange={(e) => handleStatusChange(week.week, e)}
                          className="mock-cell-select"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            backgroundColor: week.status === 'Completed' ? 'var(--accent-color)' : week.status === 'In Progress' ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                            color: week.status === 'Completed' ? 'var(--accent-text, #000)' : 'var(--text-primary)',
                            borderColor: week.status === 'In Progress' ? 'var(--accent-color)' : 'var(--border-color)',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
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
                      <span>{week.week}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>

                    <select
                      value={week.status}
                      onChange={(e) => handleStatusChange(week.week, e)}
                      className="week-card-select"
                      style={{
                        backgroundColor: week.status === 'Completed' ? 'var(--accent-color)' : week.status === 'In Progress' ? 'var(--bg-tertiary)' : 'transparent',
                        color: week.status === 'Completed' ? 'var(--accent-text, #000)' : 'var(--text-primary)',
                        borderColor: week.status === 'In Progress' ? 'var(--accent-color)' : 'var(--border-color)',
                      }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
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
                    Open Daily Drills for {week.week} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
