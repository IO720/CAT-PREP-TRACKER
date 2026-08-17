import React, { useState } from 'react';
import { Icons } from './AspirantIcons';

export default function MockTrackerView({ state, updateMockRow }) {
  const { mocks } = state;
  const [expandedMockId, setExpandedMockId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRowChange = (mockId, field, value) => {
    updateMockRow(mockId, field, value);
  };

  const toggleExpand = (id) => {
    setExpandedMockId(expandedMockId === id ? null : id);
  };

  // Calculations & Analytics
  const takenMocks = mocks.filter(m => m.status === 'Taken');
  const scheduledMocks = mocks.filter(m => m.status === 'Scheduled');
  const notStartedMocks = mocks.filter(m => m.status === 'Not Started' || !m.status);
  const totalTaken = takenMocks.length;
  const completionRate = Math.round((totalTaken / (mocks.length || 30)) * 100);

  let avgQuant = 0;
  let avgLrdi = 0;
  let avgVarc = 0;
  let avgTotal = 0;
  let maxPercentile = 0;
  let highestScore = 0;

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
      if (p > 0) maxPercentile = Math.max(maxPercentile, p);
      if (t > 0) highestScore = Math.max(highestScore, t);
    });

    avgQuant = Math.round((qSum / totalTaken) * 10) / 10;
    avgLrdi = Math.round((lSum / totalTaken) * 10) / 10;
    avgVarc = Math.round((vSum / totalTaken) * 10) / 10;
    avgTotal = Math.round((tSum / totalTaken) * 10) / 10;
  }

  // Filtered Mocks List
  const filteredMocks = mocks.filter(m => {
    // Status filter
    if (activeFilter !== 'ALL') {
      if (activeFilter === 'Not Started') {
        if (m.status && m.status !== 'Not Started') return false;
      } else if (m.status !== activeFilter) {
        return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (m.title || `Mock Test ${m.id}`).toLowerCase().includes(q);
      const notesMatch = (m.notes || '').toLowerCase().includes(q);
      const numMatch = `#${m.id}`.includes(q) || `${m.id}` === q;
      return titleMatch || notesMatch || numMatch;
    }
    return true;
  });

  // Render SVG Trend Progression Curve
  const renderTrendChart = () => {
    const chartData = takenMocks
      .map((m) => {
        const q = parseFloat(m.quantScore) || 0;
        const l = parseFloat(m.lrdiScore) || 0;
        const v = parseFloat(m.varcScore) || 0;
        const t = parseFloat(m.totalScore) || (q + l + v);
        return {
          label: m.title || `M#${m.id}`,
          score: t,
          percentile: m.percentile
        };
      })
      .filter(d => d.score > 0);

    if (chartData.length < 2) {
      return (
        <div className="mock-chart-empty-state">
          <div className="empty-chart-icon-wrap">
            <Icons.TrendingUp size={24} />
          </div>
          <div className="empty-chart-text">
            <h4>No Score Progression Yet</h4>
            <p>Log scores for at least 2 completed mocks to unlock performance trajectory & percentile trends.</p>
          </div>
        </div>
      );
    }

    const width = 560;
    const height = 160;
    const padding = 28;

    const scores = chartData.map(d => d.score);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = Math.max(...scores) + 12;
    const scoreRange = maxScore - minScore || 1;

    const points = chartData.map((d, idx) => {
      const x = padding + (idx / (chartData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.score - minScore) / scoreRange) * (height - padding * 2);
      return { x, y, score: d.score, label: d.label, percentile: d.percentile };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="mock-trend-svg">
        <defs>
          <linearGradient id="mockAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-color, #38bdf8)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent-color, #38bdf8)" stopOpacity="0.0" />
          </linearGradient>
          <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Grid reference lines */}
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
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="#64748b"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Shaded Area Under Curve */}
        <path d={areaD} fill="url(#mockAreaGrad)" />

        {/* Main Line Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent-color, #38bdf8)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Markers */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-point-group">
            <circle
              cx={p.x}
              cy={p.y}
              r={4.5}
              fill="var(--accent-color, #38bdf8)"
              stroke="#0f172a"
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y - 9}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill="#ffffff"
            >
              {p.score}
            </text>
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#94a3b8"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="mock-tracker-view-wrapper fade-in">
      {/* Top Header Row */}
      <div className="mock-header-hero-card">
        <div className="mock-hero-top-row">
          <div className="mock-hero-left">
            <div className="mock-icon-badge">
              <Icons.Trophy size={22} />
            </div>
            <div>
              <h1 className="mock-main-title">Mock Tests Tracker</h1>
              <p className="mock-sub-title">
                Comprehensive 30 full-length mock exam series, sectional score telemetry, and percentile projection.
              </p>
            </div>
          </div>

          <div className="mock-rate-pill">
            <span className="rate-num">{completionRate}%</span>
            <span className="rate-lbl">Mocks Completed</span>
          </div>
        </div>

        {/* Analytics Dual Grid */}
        <div className="mock-analytics-hero-grid">
          {/* Card 1: Metric Badges & Sectional Breakdown */}
          <div className="mock-stat-panel-card">
            <div className="panel-card-header">
              <Icons.Activity size={14} />
              <span>Series Performance Overview</span>
            </div>

            <div className="mock-hero-stats-row">
              <div className="mock-metric-box">
                <span className="metric-box-lbl">Completed</span>
                <span className="metric-box-val">{totalTaken} / {mocks.length || 30}</span>
                <span className="metric-box-sub">Full Length Mocks</span>
              </div>

              <div className="mock-metric-box">
                <span className="metric-box-lbl">Avg Score</span>
                <span className="metric-box-val accent">{avgTotal}</span>
                <span className="metric-box-sub">Points / Test</span>
              </div>

              <div className="mock-metric-box">
                <span className="metric-box-lbl">Peak Score</span>
                <span className="metric-box-val">{highestScore || '-'}</span>
                <span className="metric-box-sub">Max Achieved</span>
              </div>

              <div className="mock-metric-box">
                <span className="metric-box-lbl">Max Percentile</span>
                <span className="metric-box-val emerald">{maxPercentile > 0 ? `${maxPercentile}%` : '-'}</span>
                <span className="metric-box-sub">Target: 99.5+%ile</span>
              </div>
            </div>

            {/* Sectional Averages Strip */}
            <div className="mock-sectionals-strip">
              <span className="sectionals-label">Sectional Averages:</span>
              <div className="sectional-chip quant">
                <span className="chip-code">QUANT</span>
                <span className="chip-val">{avgQuant}</span>
              </div>
              <div className="sectional-chip lrdi">
                <span className="chip-code">LRDI</span>
                <span className="chip-val">{avgLrdi}</span>
              </div>
              <div className="sectional-chip varc">
                <span className="chip-code">VARC</span>
                <span className="chip-val">{avgVarc}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Trend Line Graph */}
          <div className="mock-stat-panel-card">
            <div className="panel-card-header">
              <Icons.TrendingUp size={14} />
              <span>Score Progression Trajectory</span>
            </div>
            <div className="mock-chart-wrapper">
              {renderTrendChart()}
            </div>
          </div>
        </div>

        {/* Filter & Search Controls Bar */}
        <div className="mock-controls-bar">
          <div className="mock-filter-tabs">
            <button
              type="button"
              className={`mock-filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              <span>All Mocks ({mocks.length || 30})</span>
            </button>
            <button
              type="button"
              className={`mock-filter-btn ${activeFilter === 'Taken' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Taken')}
            >
              <span>Completed ({totalTaken})</span>
            </button>
            <button
              type="button"
              className={`mock-filter-btn ${activeFilter === 'Scheduled' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Scheduled')}
            >
              <span>Scheduled ({scheduledMocks.length})</span>
            </button>
            <button
              type="button"
              className={`mock-filter-btn ${activeFilter === 'Not Started' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Not Started')}
            >
              <span>Not Started ({notStartedMocks.length})</span>
            </button>
          </div>

          <div className="mock-search-input-wrap">
            <Icons.Target size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search mock name, review notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mock-search-input"
            />
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="desktop-only mock-table-card-container animate-slide-up">
        <table className="modern-mocks-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Mock</th>
              <th style={{ width: '140px' }}>Status</th>
              <th style={{ width: '160px' }}>Mock Series & Name</th>
              <th style={{ width: '140px' }}>Date Taken</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Quant</th>
              <th style={{ width: '80px', textAlign: 'center' }}>LRDI</th>
              <th style={{ width: '80px', textAlign: 'center' }}>VARC</th>
              <th style={{ width: '85px', textAlign: 'center' }}>Total</th>
              <th style={{ width: '100px', textAlign: 'center' }}>%ile</th>
              <th>Analytical Notes & Strategy Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredMocks.map((mock) => {
              const calculatedTotal = (parseFloat(mock.quantScore) || 0) + (parseFloat(mock.lrdiScore) || 0) + (parseFloat(mock.varcScore) || 0);
              const displayTotal = mock.status === 'Taken' ? (mock.totalScore !== "" ? mock.totalScore : calculatedTotal) : "";

              return (
                <tr key={mock.id} className="modern-mock-row">
                  <td className="mock-cell-id">
                    <span className="mock-id-badge">#{mock.id < 10 ? `0${mock.id}` : mock.id}</span>
                  </td>

                  <td>
                    <select
                      value={mock.status || 'Not Started'}
                      onChange={(e) => handleRowChange(mock.id, 'status', e.target.value)}
                      className={`mock-status-pill-select ${mock.status === 'Taken' ? 'taken' : mock.status === 'Scheduled' ? 'scheduled' : 'not-started'}`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Taken">Taken</option>
                    </select>
                  </td>

                  <td>
                    <input
                      type="text"
                      className="mock-inline-input name"
                      placeholder={`Mock Test ${mock.id}`}
                      value={mock.title}
                      onChange={(e) => handleRowChange(mock.id, 'title', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      className="mock-inline-input date"
                      value={mock.date}
                      onChange={(e) => handleRowChange(mock.id, 'date', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      className="mock-inline-input score quant"
                      placeholder="0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.quantScore}
                      onChange={(e) => handleRowChange(mock.id, 'quantScore', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      className="mock-inline-input score lrdi"
                      placeholder="0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.lrdiScore}
                      onChange={(e) => handleRowChange(mock.id, 'lrdiScore', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      className="mock-inline-input score varc"
                      placeholder="0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.varcScore}
                      onChange={(e) => handleRowChange(mock.id, 'varcScore', e.target.value)}
                    />
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div className={`mock-total-display ${displayTotal ? 'active' : ''}`}>
                      {displayTotal || '-'}
                    </div>
                  </td>

                  <td>
                    <input
                      type="text"
                      className="mock-inline-input percentile"
                      placeholder="99.0"
                      disabled={mock.status !== 'Taken'}
                      value={mock.percentile}
                      onChange={(e) => handleRowChange(mock.id, 'percentile', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      className="mock-inline-input notes"
                      placeholder="Silly mistakes, pacing summary, topics to revise..."
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
        {filteredMocks.map((mock) => {
          const calculatedTotal = (parseFloat(mock.quantScore) || 0) + (parseFloat(mock.lrdiScore) || 0) + (parseFloat(mock.varcScore) || 0);
          const displayTotal = mock.status === 'Taken' ? (mock.totalScore !== "" ? mock.totalScore : calculatedTotal) : "";
          const isExpanded = expandedMockId === mock.id;

          return (
            <div 
              key={mock.id} 
              className={`mock-mobile-card ${mock.status === 'Taken' ? 'taken' : mock.status === 'Scheduled' ? 'scheduled' : ''}`}
            >
              {/* Header */}
              <div className="mock-card-header" onClick={() => toggleExpand(mock.id)}>
                <div className="card-header-left">
                  <span className="mock-id-badge">#{mock.id}</span>
                  <span className="mock-card-title">{mock.title || `Mock Test ${mock.id}`}</span>
                </div>
                <div className="card-header-right">
                  {mock.status === 'Taken' && displayTotal && (
                    <span className="mock-card-badge-score">
                      {displayTotal} pts {mock.percentile ? `(${mock.percentile}%)` : ''}
                    </span>
                  )}
                  <span className={`mock-card-status-dot ${mock.status || 'not-started'}`} />
                  <span className="mock-card-arrow">
                    <Icons.ArrowRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                  </span>
                </div>
              </div>

              {/* Collapsible content body */}
              {isExpanded && (
                <div className="mock-card-body animate-fade-in">
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
