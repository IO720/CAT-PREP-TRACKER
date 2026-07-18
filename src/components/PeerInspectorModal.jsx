import React from 'react';

export default function PeerInspectorModal({ friend, trackerData, loading, onClose }) {
  if (!friend) return null;

  // Process data if available
  let totalQuant = 0;
  let totalLrdi = 0;
  let totalVarc = 0;
  let completedMocks = [];
  let activityMatrix = {}; // key: "Month X-Week Y", value: array of 7 booleans (Mon-Sun)

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (trackerData && trackerData.tracker) {
    // 1. Calculate quantities
    for (const [month, weeks] of Object.entries(trackerData.tracker)) {
      weeks.forEach(week => {
        const matrixKey = `${month}-${week.week}`;
        activityMatrix[matrixKey] = Array(7).fill(false);

        week.days.forEach((day, idx) => {
          totalQuant += Number(day.quantCount) || 0;
          totalLrdi += Number(day.lrdiCount) || 0;
          totalVarc += Number(day.varcCount) || 0;

          // Day is active if at least one subject has been checked
          const isDayActive = day.quantCompleted || day.lrdiCompleted || day.varcCompleted;
          activityMatrix[matrixKey][idx] = isDayActive;
        });
      });
    }

    // 2. Extract mock tests
    if (trackerData.mocks) {
      completedMocks = trackerData.mocks.filter(m => m.status === 'Taken');
    }
  }

  const grandTargets = { quant: 3160, lrdi: 650, varc: 620, mocks: 30 };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{friend.name}'s Prep Profile</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{friend.email || "Study Peer"}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content-scroll">
          {/* Header Stats */}
          <div className="inspector-grid">
            <div className="inspector-card">
              <div className="stat-title" style={{ fontSize: '9px' }}>Current Streak</div>
              <div className="inspector-val">⚡ {friend.streak || 0} Days</div>
            </div>
            <div className="inspector-card">
              <div className="stat-title" style={{ fontSize: '9px' }}>Solved Total</div>
              <div className="inspector-val">📚 {(totalQuant + totalLrdi + totalVarc).toLocaleString()}</div>
            </div>
            <div className="inspector-card">
              <div className="stat-title" style={{ fontSize: '9px' }}>Mocks Taken</div>
              <div className="inspector-val">📝 {completedMocks.length} / 30</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Fetching detailed peer tracker data from Cloud database...
            </div>
          ) : !trackerData ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              This friend has not synchronized their detailed checklist logs with the Cloud database yet. Once they complete their next task, their detailed charts will appear here.
            </div>
          ) : (
            <div>
              {/* Quantities Solved */}
              <h3 className="inspector-section-title">Drills Completed</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span>Quantitative Solved</span>
                    <span>{totalQuant.toLocaleString()} / {grandTargets.quant.toLocaleString()} Qs</span>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill" style={{ width: `${Math.min(100, (totalQuant / grandTargets.quant) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span>LRDI Sets Solved</span>
                    <span>{totalLrdi.toLocaleString()} / {grandTargets.lrdi.toLocaleString()} Sets</span>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill" style={{ width: `${Math.min(100, (totalLrdi / grandTargets.lrdi) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span>VARC RCs Solved</span>
                    <span>{totalVarc.toLocaleString()} / {grandTargets.varc.toLocaleString()} RCs</span>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill" style={{ width: `${Math.min(100, (totalVarc / grandTargets.varc) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Study Completion Matrix (GitHub Style Heatmap) */}
              <h3 className="inspector-section-title">Consistency Matrix</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                Shows daily active status (checked at least one drill) from Week 1 to Week 16.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-primary)' }}>
                {Object.keys(trackerData.tracker).map(monthKey => {
                  const weeksInMonth = trackerData.tracker[monthKey] || [];
                  return (
                    <div key={monthKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {monthKey}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {weeksInMonth.map((week, wIdx) => {
                          const matrixKey = `${monthKey}-${week.week}`;
                          const dayActives = activityMatrix[matrixKey] || Array(7).fill(false);
                          
                          return (
                            <div key={week.week} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '8px', width: '22px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                W{wIdx + 1}
                              </span>
                              {dayActives.map((active, dIdx) => (
                                <div
                                  key={dIdx}
                                  title={`${monthKey} ${week.week} - ${daysOfWeek[dIdx]}: ${active ? "Active" : "Inactive"}`}
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    backgroundColor: active ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    transition: 'var(--transition-fast)'
                                  }}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Peer Mock Scores */}
              <h3 className="inspector-section-title">Peer Mock Performance</h3>
              {completedMocks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px 4px' }}>Mock Name</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center' }}>Quant</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center' }}>LRDI</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center' }}>VARC</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center' }}>Percentile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedMocks.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '6px 4px', fontWeight: 600 }}>{m.title || `Mock Test ${m.id}`}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>{m.quantScore || '0'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>{m.lrdiScore || '0'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>{m.varcScore || '0'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>{m.totalScore || '0'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', color: '#00cc66', fontWeight: 600 }}>
                            {m.percentile ? `${m.percentile}%` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No completed mock tests logged by this friend yet.</p>
              )}
            </div>
          )}
        </div>

        <button 
          className="btn-secondary" 
          style={{ width: '100%', marginTop: '20px' }} 
          onClick={onClose}
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
