import React, { useState } from 'react';

export default function ErrorLogView({ state, onDayClick }) {
  const { tracker } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All'); // All, Quant, LRDI, VARC

  // Gather all logged items with notes
  const logs = [];

  for (const [month, weeks] of Object.entries(tracker)) {
    weeks.forEach(week => {
      week.days.forEach(day => {
        if (day.notes && day.notes.trim() !== "") {
          logs.push({
            month,
            weekName: week.week,
            dayName: day.day,
            notes: day.notes,
            quantCount: day.quantCount,
            lrdiCount: day.lrdiCount,
            varcCount: day.varcCount,
            quantCompleted: day.quantCompleted,
            lrdiCompleted: day.lrdiCompleted,
            varcCompleted: day.varcCompleted,
          });
        }
      });
    });
  }

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'All' || log.month === selectedMonth;
    
    let matchesSubject = true;
    if (selectedSubject === 'Quant') {
      matchesSubject = log.quantCompleted || log.notes.toLowerCase().includes('quant') || log.notes.toLowerCase().includes('qa');
    } else if (selectedSubject === 'LRDI') {
      matchesSubject = log.lrdiCompleted || log.notes.toLowerCase().includes('lrdi') || log.notes.toLowerCase().includes('set');
    } else if (selectedSubject === 'VARC') {
      matchesSubject = log.varcCompleted || log.notes.toLowerCase().includes('varc') || log.notes.toLowerCase().includes('rc');
    }

    return matchesSearch && matchesMonth && matchesSubject;
  });

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 className="page-title">Error Log & Insights</h1>
          <p className="page-subtitle">Aggregate and review your notes, errors, and key formulas across days.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">Search Notes</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Month</label>
          <select
            className="filter-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="All">All Months</option>
            {Object.keys(tracker).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Subject Inference</label>
          <select
            className="filter-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Quant">Quantitative (Quant)</option>
            <option value="LRDI">Logical Reasoning (LRDI)</option>
            <option value="VARC">Verbal / Reading (VARC)</option>
          </select>
        </div>
      </div>

      {/* Logs Render */}
      <div className="error-logs-container">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="error-log-item">
              <div className="error-log-header">
                <span className="error-log-meta">
                  <strong>{log.month}</strong> &bull; {log.weekName} &bull; {log.dayName}
                </span>
                <button
                  className="status-badge in-progress"
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                  onClick={() => onDayClick(log.month, log.weekName)}
                >
                  Edit Day
                </button>
              </div>
              <div className="error-log-content">{log.notes}</div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                {log.quantCompleted && (
                  <span className="status-badge completed" style={{ fontSize: '9px', padding: '2px 4px', cursor: 'default' }}>
                    QA: {log.quantCount}
                  </span>
                )}
                {log.lrdiCompleted && (
                  <span className="status-badge completed" style={{ fontSize: '9px', padding: '2px 4px', cursor: 'default' }}>
                    LRDI: {log.lrdiCount}
                  </span>
                )}
                {log.varcCompleted && (
                  <span className="status-badge completed" style={{ fontSize: '9px', padding: '2px 4px', cursor: 'default' }}>
                    VARC: {log.varcCount}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            {logs.length === 0 
              ? "You haven't logged any day notes yet. Go to Daily Drills to write logs!" 
              : "No notes matching the selected filters."
            }
          </div>
        )}
      </div>
    </div>
  );
}
