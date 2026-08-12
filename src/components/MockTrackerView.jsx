import React, { useState } from 'react';

export default function MockTrackerView({ state, updateMockRow }) {
  const { mocks } = state;
  const [expandedMockId, setExpandedMockId] = useState(null);

  const handleRowChange = (mockId, field, value) => {
    updateMockRow(mockId, field, value);
  };

  const toggleExpand = (id) => {
    setExpandedMockId(expandedMockId === id ? null : id);
  };

  // Calculations
  const takenMocks = mocks.filter(m => m.status === 'Taken');
  const totalTaken = takenMocks.length;

  let avgQuant = 0;
  let avgLrdi = 0;
  let avgVarc = 0;
  let avgTotal = 0;
  let maxPercentile = 0;

  if (totalTaken > 0) {
    let qSum = 0, lSum = 0, vSum = 0, tSum = 0;
    takenMocks.forEach(m => {
      const q = parseFloat(m.quantScore) || 0;
      const l = parseFloat(m.lrdiScore) || 0;
      const v = parseFloat(m.varcScore) || 0;
      const t = parseFloat(m.totalScore) || (q + l + v);
      const p = parseFloat(m.percentile) || 0;

      qSum += q;
      lSum += l;
      vSum += v;
      tSum += t;
      if (p > 0) {
        maxPercentile = Math.max(maxPercentile, p);
      }
    });

    avgQuant = Math.round((qSum / totalTaken) * 10) / 10;
    avgLrdi = Math.round((lSum / totalTaken) * 10) / 10;
    avgVarc = Math.round((vSum / totalTaken) * 10) / 10;
    avgTotal = Math.round((tSum / totalTaken) * 10) / 10;
  }

  // Draw custom SVG chart showing performance trends
  const renderTrendChart = () => {
    const chartData = takenMocks
      .map((m, idx) => {
        const q = parseFloat(m.quantScore) || 0;
        const l = parseFloat(m.lrdiScore) || 0;
        const v = parseFloat(m.varcScore) || 0;
        const t = parseFloat(m.totalScore) || (q + l + v);
        return {
          label: m.title || `M${m.id}`,
          score: t
        };
      })
      .filter(d => d.score > 0);

    if (chartData.length < 2) {
      return (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center' }}>
          Add scores for at least 2 completed mocks to plot your performance trend.
        </div>
      );
    }

    const width = 500;
    const height = 140;
    const padding = 20;

    const scores = chartData.map(d => d.score);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = Math.max(...scores) + 10;
    const scoreRange = maxScore - minScore || 1;

    const points = chartData.map((d, idx) => {
      const x = padding + (idx / (chartData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.score - minScore) / scoreRange) * (height - padding * 2);
      return { x, y, score: d.score, label: d.label };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + ratio * (height - padding * 2);
          const val = Math.round(maxScore - ratio * scoreRange);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--border-color)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding - 5}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-tertiary)"
                fontFamily="var(--font-display)"
              >
                {val}
              </text>
            </g>
          );
        })}

        <path
          d={pathD}
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="var(--bg-primary)"
              stroke="var(--accent-color)"
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="var(--text-primary)"
              fontFamily="var(--font-display)"
            >
              {p.score}
            </text>
            <text
              x={p.x}
              y={height - 2}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-tertiary)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">Mock Tests Tracker</h1>
          <p className="page-subtitle">Track and analyze your performance on 30 full-length mocks.</p>
        </div>
      </div>

      <div className="mocks-overview-row">
        <div className="mock-analytics-card">
          <span className="stat-title">Overall Performance</span>
          <div className="mock-averages-grid">
            <div className="mock-avg-item">
              <div className="stat-title" style={{ fontSize: '10px' }}>Completed</div>
              <div className="mock-avg-num">{totalTaken} / 30</div>
            </div>
            <div className="mock-avg-item">
              <div className="stat-title" style={{ fontSize: '10px' }}>Avg Total</div>
              <div className="mock-avg-num">{avgTotal}</div>
            </div>
            <div className="mock-avg-item">
              <div className="stat-title" style={{ fontSize: '10px' }}>Max %ile</div>
              <div className="mock-avg-num">{maxPercentile > 0 ? `${maxPercentile}%` : '-'}</div>
            </div>
            <div className="mock-avg-item">
              <div className="stat-title" style={{ fontSize: '10px' }}>Sectional Avgs</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                Q: {avgQuant} | L: {avgLrdi} | V: {avgVarc}
              </div>
            </div>
          </div>
        </div>

        <div className="mock-analytics-card">
          <span className="stat-title">Score Progression</span>
          <div className="mock-chart-container">
            {renderTrendChart()}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="desktop-only mocks-list-panel">
        <table className="mocks-table">
          <thead>
            <tr>
              <th className="mocks-th" style={{ width: '60px' }}>Mock #</th>
              <th className="mocks-th" style={{ width: '130px' }}>Status</th>
              <th className="mocks-th" style={{ width: '150px' }}>Mock Name</th>
              <th className="mocks-th" style={{ width: '130px' }}>Date Taken</th>
              <th className="mocks-th" style={{ width: '80px', textAnchor: 'center' }}>Quant</th>
              <th className="mocks-th" style={{ width: '80px', textAnchor: 'center' }}>LRDI</th>
              <th className="mocks-th" style={{ width: '80px', textAnchor: 'center' }}>VARC</th>
              <th className="mocks-th" style={{ width: '80px', textAnchor: 'center' }}>Total</th>
              <th className="mocks-th" style={{ width: '90px', textAnchor: 'center' }}>Percentile</th>
              <th className="mocks-th">Analytical Notes / Review Summary</th>
            </tr>
          </thead>
          <tbody>
            {mocks.map((mock) => {
              const calculatedTotal = (parseFloat(mock.quantScore) || 0) + (parseFloat(mock.lrdiScore) || 0) + (parseFloat(mock.varcScore) || 0);
              const displayTotal = mock.status === 'Taken' ? (mock.totalScore !== "" ? mock.totalScore : calculatedTotal) : "";

              return (
                <tr key={mock.id} className="mocks-tr">
                  <td className="mocks-td" style={{ fontWeight: 'bold' }}>#{mock.id}</td>
                  <td className="mocks-td">
                    <select
                      value={mock.status}
                      onChange={(e) => handleRowChange(mock.id, 'status', e.target.value)}
                      className="mock-cell-select"
                      style={{
                        backgroundColor: mock.status === 'Taken' ? 'var(--accent-color)' : mock.status === 'Scheduled' ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                        color: mock.status === 'Taken' ? 'var(--bg-primary)' : 'var(--text-primary)',
                        borderColor: mock.status === 'Scheduled' ? 'var(--accent-color)' : 'var(--border-color)',
                      }}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Taken">Taken</option>
                    </select>
                  </td>
                  <td className="mocks-td">
                    <input
                      type="text"
                      className="mock-cell-input title"
                      placeholder="e.g. SIMCAT 1"
                      value={mock.title}
                      onChange={(e) => handleRowChange(mock.id, 'title', e.target.value)}
                    />
                  </td>
                  <td className="mocks-td">
                    <input
                      type="date"
                      className="mock-cell-input"
                      value={mock.date}
                      onChange={(e) => handleRowChange(mock.id, 'date', e.target.value)}
                    />
                  </td>
                  <td className="mocks-td">
                    <input
                      type="number"
                      className="mock-cell-input"
                      placeholder="0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.quantScore}
                      onChange={(e) => handleRowChange(mock.id, 'quantScore', e.target.value)}
                    />
                  </td>
                  <td className="mocks-td">
                    <input
                      type="number"
                      className="mock-cell-input"
                      placeholder="0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.lrdiScore}
                      onChange={(e) => handleRowChange(mock.id, 'lrdiScore', e.target.value)}
                    />
                  </td>
                  <td className="mocks-td">
                    <input
                      type="number"
                      className="mock-cell-input"
                      placeholder="0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.varcScore}
                      onChange={(e) => handleRowChange(mock.id, 'varcScore', e.target.value)}
                    />
                  </td>
                  <td className="mocks-td" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {displayTotal}
                  </td>
                  <td className="mocks-td">
                    <input
                      type="text"
                      className="mock-cell-input"
                      placeholder="e.g. 99.4"
                      disabled={mock.status !== 'Taken'}
                      value={mock.percentile}
                      onChange={(e) => handleRowChange(mock.id, 'percentile', e.target.value)}
                    />
                  </td>
                  <td className="mocks-td">
                    <input
                      type="text"
                      className="mock-cell-input title"
                      placeholder="Analysis summary notes..."
                      value={mock.notes}
                      onChange={(e) => handleRowChange(mock.id, 'notes', e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE COLLAPSIBLE CARDS VIEW */}
      <div className="mobile-only mock-cards-list">
        {mocks.map((mock) => {
          const calculatedTotal = (parseFloat(mock.quantScore) || 0) + (parseFloat(mock.lrdiScore) || 0) + (parseFloat(mock.varcScore) || 0);
          const displayTotal = mock.status === 'Taken' ? (mock.totalScore !== "" ? mock.totalScore : calculatedTotal) : "";
          const isExpanded = expandedMockId === mock.id;

          return (
            <div 
              key={mock.id} 
              className={`mock-card-item ${mock.status === 'Taken' ? 'taken' : mock.status === 'Scheduled' ? 'scheduled' : ''}`}
            >
              {/* Header */}
              <div className="mock-card-header" onClick={() => toggleExpand(mock.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mock-card-id">#{mock.id}</span>
                  <span className="mock-card-title">{mock.title || `Mock Test ${mock.id}`}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mock.status === 'Taken' && displayTotal && (
                    <span className="mock-card-badge-score">
                      {displayTotal} Qs ({mock.percentile ? `${mock.percentile}%` : '-%'})
                    </span>
                  )}
                  <span className="mock-card-status-dot" style={{
                    backgroundColor: mock.status === 'Taken' ? 'var(--accent-color)' : mock.status === 'Scheduled' ? '#ff9900' : 'var(--text-tertiary)'
                  }}></span>
                  <span className="mock-card-arrow" style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {isExpanded ? (
                        <polyline points="18 15 12 9 6 15"></polyline>
                      ) : (
                        <polyline points="6 9 12 15 18 9"></polyline>
                      )}
                    </svg>
                  </span>
                </div>
              </div>

              {/* Collapsible content body */}
              {isExpanded && (
                <div className="mock-card-body">
                  <div className="mock-card-row">
                    <div className="mock-card-field">
                      <label>Mock Name</label>
                      <input
                        type="text"
                        placeholder="e.g. SIMCAT 1"
                        value={mock.title}
                        onChange={(e) => handleRowChange(mock.id, 'title', e.target.value)}
                        className="mock-card-input"
                      />
                    </div>
                    <div className="mock-card-field">
                      <label>Status</label>
                      <select
                        value={mock.status}
                        onChange={(e) => handleRowChange(mock.id, 'status', e.target.value)}
                        className="mock-card-select"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Taken">Taken</option>
                      </select>
                    </div>
                  </div>

                  <div className="mock-card-row">
                    <div className="mock-card-field">
                      <label>Date Taken</label>
                      <input
                        type="date"
                        value={mock.date}
                        onChange={(e) => handleRowChange(mock.id, 'date', e.target.value)}
                        className="mock-card-input"
                      />
                    </div>
                  </div>

                  {mock.status === 'Taken' && (
                    <>
                      <div className="mock-card-row three-cols">
                        <div className="mock-card-field">
                          <label>Quant</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={mock.quantScore}
                            onChange={(e) => handleRowChange(mock.id, 'quantScore', e.target.value)}
                            className="mock-card-input text-center"
                          />
                        </div>
                        <div className="mock-card-field">
                          <label>LRDI</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={mock.lrdiScore}
                            onChange={(e) => handleRowChange(mock.id, 'lrdiScore', e.target.value)}
                            className="mock-card-input text-center"
                          />
                        </div>
                        <div className="mock-card-field">
                          <label>VARC</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={mock.varcScore}
                            onChange={(e) => handleRowChange(mock.id, 'varcScore', e.target.value)}
                            className="mock-card-input text-center"
                          />
                        </div>
                      </div>

                      <div className="mock-card-row">
                        <div className="mock-card-field">
                          <label>Total Score</label>
                          <div className="mock-card-readonly-val">{displayTotal || '0'}</div>
                        </div>
                        <div className="mock-card-field">
                          <label>Percentile</label>
                          <input
                            type="text"
                            placeholder="e.g. 99.4"
                            value={mock.percentile}
                            onChange={(e) => handleRowChange(mock.id, 'percentile', e.target.value)}
                            className="mock-card-input"
                          />
                        </div>
                      </div>

                      <div className="mock-card-field full-width">
                        <label>Review Summary / Notes</label>
                        <textarea
                          rows="2"
                          placeholder="Silly mistakes, strategy notes..."
                          value={mock.notes}
                          onChange={(e) => handleRowChange(mock.id, 'notes', e.target.value)}
                          className="mock-card-textarea"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
