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
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">16-Week Study Plan</h1>
          <p className="page-subtitle">Manage your overall curriculum phase focus and mark completions.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {Object.entries(phases).map(([phaseName, weeks]) => (
          <div key={phaseName} className="phase-group">
            <h2 className="phase-header">{phaseName}</h2>
            <div style={{ overflowX: 'auto' }}>
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
                            color: week.status === 'Completed' ? 'var(--bg-primary)' : 'var(--text-primary)',
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
          </div>
        ))}
      </div>
    </div>
  );
}
