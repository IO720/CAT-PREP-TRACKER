import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Icons } from './AspirantIcons';
import { 
  AnimatedFlameIcon, 
  AnimatedTargetIcon, 
  AnimatedLightningIcon,
  AnimatedCrownIcon
} from './AnimatedUiIcons';
import { playGamingAchievementSound } from '../utils/audioUtils';
import { stripEmojis } from '../utils/textUtils';

// CAT Percentile Estimator based on scaled composite scores
const estimateCatPercentile = (score) => {
  const s = parseFloat(score) || 0;
  if (s >= 105) return 99.8;
  if (s >= 92) return 99.2;
  if (s >= 80) return 98.0;
  if (s >= 70) return 95.5;
  if (s >= 60) return 92.0;
  if (s >= 50) return 86.0;
  if (s >= 40) return 78.0;
  if (s >= 30) return 65.0;
  return Math.max(10, Math.round(s * 1.5));
};

export default function MockTrackerView({ state, updateMockRow }) {
  const { mocks = [] } = state;
  const [selectedMockId, setSelectedMockId] = useState(1);
  const [activePhaseFilter, setActivePhaseFilter] = useState('ALL'); // 'ALL' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'TAKEN'
  const [editingMock, setEditingMock] = useState(null);
  const containerRef = useRef(null);

  // Completed mocks sorted by ID
  const completedMocks = useMemo(() => {
    return mocks
      .filter(m => m.status === 'Taken' && (m.totalScore || (parseFloat(m.quantScore) || 0) + (parseFloat(m.lrdiScore) || 0) + (parseFloat(m.varcScore) || 0) > 0))
      .map(m => {
        const q = parseFloat(m.quantScore) || 0;
        const l = parseFloat(m.lrdiScore) || 0;
        const v = parseFloat(m.varcScore) || 0;
        const total = parseFloat(m.totalScore) || (q + l + v);
        const p = parseFloat(m.percentile) || estimateCatPercentile(total);
        return { ...m, quantScore: q, lrdiScore: l, varcScore: v, totalScore: total, estimatedPercentile: p };
      });
  }, [mocks]);

  // Next upcoming mock (first uncompleted mock)
  const nextMock = useMemo(() => {
    return mocks.find(m => m.status !== 'Taken') || mocks[0];
  }, [mocks]);

  // Set default selected mock to nextMock if not explicitly chosen
  useEffect(() => {
    if (nextMock) {
      setSelectedMockId(nextMock.id);
    }
  }, [nextMock?.id]);

  // Overall Statistics & Improvement Calculations
  const stats = useMemo(() => {
    const totalTaken = completedMocks.length;
    if (totalTaken === 0) {
      return {
        totalTaken: 0,
        avgScore: 0,
        peakScore: 0,
        maxPercentile: 0,
        baselineScore: 0,
        latestScore: 0,
        latestPercentile: 0,
        scoreDelta: 0,
        overallGain: 0,
        gainStreak: 0,
        strongestSection: 'Balanced',
        opportunitySection: 'Pending Mocks',
        sectionalAverages: { quant: 0, lrdi: 0, varc: 0 }
      };
    }

    let qSum = 0, lSum = 0, vSum = 0, tSum = 0;
    let peak = 0;
    let maxPct = 0;

    completedMocks.forEach(m => {
      qSum += m.quantScore;
      lSum += m.lrdiScore;
      vSum += m.varcScore;
      tSum += m.totalScore;
      if (m.totalScore > peak) peak = m.totalScore;
      if (m.estimatedPercentile > maxPct) maxPct = m.estimatedPercentile;
    });

    const latest = completedMocks[completedMocks.length - 1];
    const previous = completedMocks.length > 1 ? completedMocks[completedMocks.length - 2] : null;
    const baseline = completedMocks[0];

    const scoreDelta = previous ? latest.totalScore - previous.totalScore : 0;
    const overallGain = latest.totalScore - baseline.totalScore;

    // Calculate Positive Improvement Streak
    let streak = 0;
    for (let i = completedMocks.length - 1; i >= 1; i--) {
      if (completedMocks[i].totalScore >= completedMocks[i - 1].totalScore) {
        streak++;
      } else {
        break;
      }
    }

    const avgQ = Math.round((qSum / totalTaken) * 10) / 10;
    const avgL = Math.round((lSum / totalTaken) * 10) / 10;
    const avgV = Math.round((vSum / totalTaken) * 10) / 10;

    const sections = [
      { name: 'Quant', avg: avgQ },
      { name: 'DILR', avg: avgL },
      { name: 'VARC', avg: avgV }
    ];
    sections.sort((a, b) => b.avg - a.avg);

    return {
      totalTaken,
      avgScore: Math.round((tSum / totalTaken) * 10) / 10,
      peakScore: peak,
      maxPercentile: maxPct,
      baselineScore: baseline.totalScore,
      latestScore: latest.totalScore,
      latestPercentile: latest.estimatedPercentile,
      scoreDelta,
      overallGain,
      gainStreak: streak,
      strongestSection: sections[0]?.name || 'Quant',
      opportunitySection: sections[2]?.name || 'DILR',
      sectionalAverages: { quant: avgQ, lrdi: avgL, varc: avgV }
    };
  }, [completedMocks]);

  // Selected Mock Object & previous score calculation
  const selectedMock = useMemo(() => {
    return mocks.find(m => m.id === selectedMockId) || mocks[0] || {};
  }, [mocks, selectedMockId]);

  const selectedMockDetails = useMemo(() => {
    const isTaken = selectedMock.status === 'Taken';
    const q = parseFloat(selectedMock.quantScore) || 0;
    const l = parseFloat(selectedMock.lrdiScore) || 0;
    const v = parseFloat(selectedMock.varcScore) || 0;
    const total = parseFloat(selectedMock.totalScore) || (q + l + v);
    const p = parseFloat(selectedMock.percentile) || (isTaken ? estimateCatPercentile(total) : 0);

    let delta = null;
    if (isTaken) {
      const idx = completedMocks.findIndex(m => m.id === selectedMock.id);
      if (idx > 0) {
        delta = total - completedMocks[idx - 1].totalScore;
      }
    }

    return { isTaken, q, l, v, total, p, delta };
  }, [selectedMock, completedMocks]);

  // Phase Definitions for the 30-Mock Grid
  const phases = useMemo(() => [
    {
      id: 'PHASE_1',
      name: 'Phase 1: Diagnostic & Foundation',
      range: 'Mocks 01 - 10',
      description: 'Establish baseline test stamina, pacing benchmark, and uncover conceptual blind spots.',
      mocks: mocks.slice(0, 10)
    },
    {
      id: 'PHASE_2',
      name: 'Phase 2: Strategy & Speed Elevation',
      range: 'Mocks 11 - 20',
      description: 'Refine question selection filters, error elimination routines, and DILR set targeting.',
      mocks: mocks.slice(10, 20)
    },
    {
      id: 'PHASE_3',
      name: 'Phase 3: Peak Exam Simulation',
      range: 'Mocks 21 - 30',
      description: 'Simulate high-pressure exam day conditions to lock in 99.0+%ile consistency.',
      mocks: mocks.slice(20, 30)
    }
  ], [mocks]);

  // Filtered Phases based on user selection
  const displayedPhases = useMemo(() => {
    if (activePhaseFilter === 'ALL') return phases;
    if (activePhaseFilter === 'TAKEN') {
      return phases.map(p => ({
        ...p,
        mocks: p.mocks.filter(m => m.status === 'Taken')
      })).filter(p => p.mocks.length > 0);
    }
    return phases.filter(p => p.id === activePhaseFilter);
  }, [phases, activePhaseFilter]);

  // Modal Form State
  const [modalForm, setModalForm] = useState({
    id: 1,
    title: '',
    status: 'Taken',
    date: '',
    quantScore: '',
    lrdiScore: '',
    varcScore: '',
    percentile: '',
    notes: ''
  });

  const openEditModal = (mock) => {
    setModalForm({
      id: mock.id,
      title: mock.title || `Mock Test ${mock.id}`,
      status: mock.status || 'Taken',
      date: mock.date || new Date().toISOString().split('T')[0],
      quantScore: mock.quantScore ?? '',
      lrdiScore: mock.lrdiScore ?? '',
      varcScore: mock.varcScore ?? '',
      percentile: mock.percentile ?? '',
      notes: mock.notes || ''
    });
    setEditingMock(mock);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const q = parseFloat(modalForm.quantScore) || 0;
    const l = parseFloat(modalForm.lrdiScore) || 0;
    const v = parseFloat(modalForm.varcScore) || 0;
    const total = q + l + v;
    const p = modalForm.percentile 
      ? parseFloat(modalForm.percentile) 
      : (modalForm.status === 'Taken' ? estimateCatPercentile(total) : '');

    const updates = {
      title: stripEmojis(modalForm.title),
      status: modalForm.status,
      date: modalForm.date,
      quantScore: modalForm.status === 'Taken' ? q : '',
      lrdiScore: modalForm.status === 'Taken' ? l : '',
      varcScore: modalForm.status === 'Taken' ? v : '',
      totalScore: modalForm.status === 'Taken' ? total : '',
      percentile: p ? String(p) : '',
      notes: stripEmojis(modalForm.notes)
    };

    updateMockRow(modalForm.id, updates);
    if (modalForm.status === 'Taken') {
      playGamingAchievementSound(0.035);
    }
    setEditingMock(null);
  };

  // Readiness Tier Brackets
  const readinessTiers = [
    { label: 'Foundation', range: '< 70%ile', min: 0, max: 70 },
    { label: 'Contender', range: '70-85%ile', min: 70, max: 85 },
    { label: 'Top Tier', range: '85-95%ile', min: 85, max: 95 },
    { label: 'IIM Elite', range: '99+%ile', min: 95, max: 100 }
  ];

  const currentTier = useMemo(() => {
    const p = stats.latestPercentile || 0;
    if (p >= 95) return 'IIM Elite';
    if (p >= 85) return 'Top Tier';
    if (p >= 70) return 'Contender';
    return 'Foundation';
  }, [stats.latestPercentile]);

  return (
    <div ref={containerRef} className="mock-terminal-container fade-in">
      
      {/* 1. SPACIOUS TOP TELEMETRY DECK (3 COHESIVE PILLARS) */}
      <div className="mock-cockpit-hero">
        
        {/* Pillar 1: Next Mission Spotlight */}
        <div className="cockpit-card mission-spotlight">
          <div className="card-top-tag">
            <span className="live-ping-dot" />
            <span>ACTIVE FLIGHT STATUS</span>
          </div>

          <div className="spotlight-title-row">
            <span className="spotlight-id-badge">MOCK #{nextMock.id < 10 ? `0${nextMock.id}` : nextMock.id}</span>
            <div className="spotlight-text-block">
              <h2 className="spotlight-title">{nextMock.title || `Mock Test ${nextMock.id}`}</h2>
              <span className="spotlight-subtitle">
                {nextMock.status === 'Scheduled' ? `Scheduled for ${nextMock.date}` : 'Awaiting flight simulation'}
              </span>
            </div>
          </div>

          <div className="spotlight-cta-row">
            <button
              type="button"
              className="cockpit-primary-btn"
              onClick={() => openEditModal(nextMock)}
            >
              <AnimatedLightningIcon size={15} color="#04101e" />
              <span>Log Mock #{nextMock.id} Scores</span>
            </button>
            <span className="spotlight-stage-badge">
              {nextMock.id <= 10 ? 'Phase 1: Diagnostic' : nextMock.id <= 20 ? 'Phase 2: Speed' : 'Phase 3: Peak'}
            </span>
          </div>
        </div>

        {/* Pillar 2: Telemetry Readout & Percentile Tier Stepper */}
        <div className="cockpit-card telemetry-readout">
          <div className="card-top-tag">
            <span>PERFORMANCE TELEMETRY</span>
          </div>

          <div className="readout-hero-metric">
            <div className="metric-score-group">
              <span className="metric-num">{stats.latestScore > 0 ? stats.latestScore : '--'}</span>
              <span className="metric-unit">pts</span>
            </div>
            <div className="metric-details-group">
              <span className="metric-percentile-tag">
                {stats.latestPercentile > 0 ? `${stats.latestPercentile}%ile Current` : 'Target: 99.0+%ile'}
              </span>
              <span className="metric-delta-text">
                {stats.scoreDelta !== 0 
                  ? (stats.scoreDelta > 0 ? `▲ +${stats.scoreDelta} pts vs prior` : `▼ ${stats.scoreDelta} pts vs prior`)
                  : `Overall Gain: ${stats.overallGain >= 0 ? `+${stats.overallGain}` : stats.overallGain} pts`}
              </span>
            </div>
          </div>

          {/* Linear-Style Percentile Bracket Stepper */}
          <div className="readout-stepper-track">
            {readinessTiers.map((tier) => (
              <div 
                key={tier.label}
                className={`stepper-step ${currentTier === tier.label ? 'active' : ''}`}
              >
                <div className="step-bar" />
                <span className="step-label">{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 3: Cadence Streak & Sectional Balance */}
        <div className="cockpit-card cadence-balance">
          <div className="card-top-tag">
            <span>CADENCE & SECTIONAL RADAR</span>
          </div>

          <div className="streak-hero-block">
            <div className="streak-flame-wrap">
              <AnimatedFlameIcon size={18} color="#fbbf24" />
            </div>
            <div className="streak-text-wrap">
              <span className="streak-main-title">
                {stats.gainStreak > 0 ? `${stats.gainStreak} Test Score Gain Streak` : `${stats.totalTaken} of 30 Mocks Cleared`}
              </span>
              <span className="streak-progress-sub">
                Completion Rate: {Math.round((stats.totalTaken / (mocks.length || 30)) * 100)}% • Avg: {stats.avgScore} pts
              </span>
            </div>
          </div>

          {/* Sectional Tri-Bar */}
          <div className="cockpit-sectional-tri-bar">
            <div className="sec-tri-item quant">
              <span className="sec-tri-label">QA</span>
              <span className="sec-tri-val">{stats.sectionalAverages.quant}</span>
            </div>
            <div className="sec-tri-item lrdi">
              <span className="sec-tri-label">DILR</span>
              <span className="sec-tri-val">{stats.sectionalAverages.lrdi}</span>
            </div>
            <div className="sec-tri-item varc">
              <span className="sec-tri-label">VARC</span>
              <span className="sec-tri-val">{stats.sectionalAverages.varc}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. FILTER STRIP & ACTIONS */}
      <div className="mock-command-toolbar">
        <div className="phase-filter-tabs">
          <button
            type="button"
            className={`phase-tab-btn ${activePhaseFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActivePhaseFilter('ALL')}
          >
            All 30 Mocks (30)
          </button>
          <button
            type="button"
            className={`phase-tab-btn ${activePhaseFilter === 'PHASE_1' ? 'active' : ''}`}
            onClick={() => setActivePhaseFilter('PHASE_1')}
          >
            Phase 1: Diagnostic (1-10)
          </button>
          <button
            type="button"
            className={`phase-tab-btn ${activePhaseFilter === 'PHASE_2' ? 'active' : ''}`}
            onClick={() => setActivePhaseFilter('PHASE_2')}
          >
            Phase 2: Speed (11-20)
          </button>
          <button
            type="button"
            className={`phase-tab-btn ${activePhaseFilter === 'PHASE_3' ? 'active' : ''}`}
            onClick={() => setActivePhaseFilter('PHASE_3')}
          >
            Phase 3: Peak (21-30)
          </button>
          <button
            type="button"
            className={`phase-tab-btn ${activePhaseFilter === 'TAKEN' ? 'active' : ''}`}
            onClick={() => setActivePhaseFilter('TAKEN')}
          >
            Completed ({stats.totalTaken})
          </button>
        </div>

        <div className="toolbar-legend">
          <span className="legend-chip"><span className="dot taken" /> Evaluated</span>
          <span className="legend-chip"><span className="dot next" /> Next Mission</span>
          <span className="legend-chip"><span className="dot pending" /> Pending</span>
        </div>
      </div>

      {/* 3. SPACIOUS TWO-COLUMN WORKSPACE: 30-MISSION GRID & INSPECTOR */}
      <div className="mock-workspace-grid">
        
        {/* LEFT: 30-MOCK EXAM ORBIT TILES */}
        <div className="mock-board-panel">
          <div className="phases-flow-stack">
            {displayedPhases.map((phase) => (
              <div key={phase.id} className="phase-card-block">
                <div className="phase-block-head">
                  <div className="phase-title-row">
                    <span className="phase-title-text">{phase.name}</span>
                    <span className="phase-range-badge">{phase.range}</span>
                  </div>
                  <p className="phase-subtext">{phase.description}</p>
                </div>

                {/* Generous 5-Column Flight Grid */}
                <div className="phase-tiles-grid">
                  {phase.mocks.map((m) => {
                    const isTaken = m.status === 'Taken';
                    const isScheduled = m.status === 'Scheduled';
                    const isNext = m.id === nextMock.id;
                    const isSelected = m.id === selectedMockId;
                    const totalScore = parseFloat(m.totalScore) || (
                      (parseFloat(m.quantScore) || 0) + (parseFloat(m.lrdiScore) || 0) + (parseFloat(m.varcScore) || 0)
                    );

                    return (
                      <div
                        key={m.id}
                        className={`mock-flight-tile ${isTaken ? 'is-taken' : isScheduled ? 'is-scheduled' : 'is-pending'} ${isNext ? 'is-next' : ''} ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setSelectedMockId(m.id)}
                      >
                        <div className="tile-top-bar">
                          <span className="tile-num-badge">#{m.id < 10 ? `0${m.id}` : m.id}</span>
                          {isTaken ? (
                            <span className="tile-status-icon taken">
                              <Icons.Check size={11} />
                            </span>
                          ) : isNext ? (
                            <span className="tile-pulse-indicator">NEXT</span>
                          ) : isScheduled ? (
                            <span className="tile-status-icon scheduled">
                              <Icons.Calendar size={11} />
                            </span>
                          ) : (
                            <span className="tile-status-icon pending" />
                          )}
                        </div>

                        <div className="tile-body-score">
                          {isTaken ? (
                            <div className="tile-score-readout">
                              <span className="score-big">{totalScore}</span>
                              <span className="score-unit">pts</span>
                            </div>
                          ) : (
                            <div className="tile-score-placeholder">
                              <span>--</span>
                            </div>
                          )}
                        </div>

                        <div className="tile-bottom-meta">
                          <span className="tile-mock-label">{m.title || `Mock Test ${m.id}`}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SPACIOUS MISSION INSPECTOR PANEL */}
        <div className="mock-inspector-panel">
          <div className="inspector-head">
            <div className="inspector-badge-row">
              <span className="inspector-badge-lbl">MISSION INSPECTOR</span>
              <span className="inspector-id-code">MOCK #{selectedMock.id < 10 ? `0${selectedMock.id}` : selectedMock.id}</span>
            </div>
            <button
              type="button"
              className="inspector-action-btn"
              onClick={() => openEditModal(selectedMock)}
            >
              <Icons.Edit size={13} />
              <span>{selectedMockDetails.isTaken ? 'Edit Scores' : 'Log Exam'}</span>
            </button>
          </div>

          <div className="inspector-body">
            <div className="inspector-title-block">
              <h3 className="inspector-mock-name">{selectedMock.title || `Mock Test ${selectedMock.id}`}</h3>
              <div className="inspector-meta-row">
                <span className={`status-pill ${selectedMock.status || 'Not Started'}`}>
                  {selectedMock.status === 'Taken' ? 'Evaluated & Cleared' : selectedMock.status === 'Scheduled' ? 'Exam Scheduled' : 'Awaiting Attempt'}
                </span>
                <span className="date-tag">
                  {selectedMock.date ? `Date: ${selectedMock.date}` : 'No date set'}
                </span>
              </div>
            </div>

            {selectedMockDetails.isTaken ? (
              <div className="inspector-score-breakdown">
                {/* Composite Score Card */}
                <div className="composite-score-hero">
                  <div className="composite-left">
                    <span className="score-huge">{selectedMockDetails.total}</span>
                    <span className="score-huge-lbl">Composite Points</span>
                  </div>
                  <div className="composite-right">
                    <span className="percentile-highlight">{selectedMockDetails.p}%ile</span>
                    {selectedMockDetails.delta !== null && (
                      <span className={`delta-tag ${selectedMockDetails.delta >= 0 ? 'gain' : 'drop'}`}>
                        {selectedMockDetails.delta >= 0 ? `▲ +${selectedMockDetails.delta}` : `▼ ${selectedMockDetails.delta}`} vs prior
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 Sectional Cards with Progress Bars */}
                <div className="sectional-meters-grid">
                  <div className="sec-meter-card quant">
                    <div className="sec-meter-top">
                      <span className="sec-name">Quantitative (QA)</span>
                      <span className="sec-points">{selectedMockDetails.q} pts</span>
                    </div>
                    <div className="sec-meter-track">
                      <div 
                        className="sec-meter-fill qa" 
                        style={{ width: `${Math.min(100, Math.round((selectedMockDetails.q / 60) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="sec-meter-card lrdi">
                    <div className="sec-meter-top">
                      <span className="sec-name">Data Interpretation & LR</span>
                      <span className="sec-points">{selectedMockDetails.l} pts</span>
                    </div>
                    <div className="sec-meter-track">
                      <div 
                        className="sec-meter-fill dilr" 
                        style={{ width: `${Math.min(100, Math.round((selectedMockDetails.l / 60) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="sec-meter-card varc">
                    <div className="sec-meter-top">
                      <span className="sec-name">Verbal Ability & RC</span>
                      <span className="sec-points">{selectedMockDetails.v} pts</span>
                    </div>
                    <div className="sec-meter-track">
                      <div 
                        className="sec-meter-fill varc" 
                        style={{ width: `${Math.min(100, Math.round((selectedMockDetails.v / 60) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Strategy Review & Mistake Notes */}
                <div className="strategy-notes-card">
                  <div className="strategy-notes-header">
                    <Icons.Target size={13} />
                    <span>Strategy Takeaways & Error Log</span>
                  </div>
                  <p className="strategy-notes-text">
                    {selectedMock.notes 
                      ? `"${stripEmojis(selectedMock.notes)}"`
                      : 'No analytical review logged yet. Record silly mistakes and pacing insights to refine set selection.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="inspector-pending-card">
                <div className="pending-icon-circle">
                  <Icons.Award size={26} />
                </div>
                <h4 className="pending-title">Exam Flight Not Attempted</h4>
                <p className="pending-desc">
                  Take this 2-hour full-length CAT exam to unlock precision sectional telemetry, velocity delta, and projected percentile bracket.
                </p>
                <button
                  type="button"
                  className="record-exam-btn"
                  onClick={() => openEditModal(selectedMock)}
                >
                  <AnimatedLightningIcon size={14} color="#ffffff" />
                  <span>Record Mock #{selectedMock.id} Scores</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. SCORE LOGGER MODAL */}
      {editingMock && (
        <div className="mock-modal-overlay" onClick={() => setEditingMock(null)}>
          <div className="mock-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-mock-id">MOCK #{modalForm.id}</span>
                <h3>{modalForm.title || `Mock Test ${modalForm.id}`}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditingMock(null)}>
                <Icons.Close size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="modal-body-form">
              <div className="form-row two-cols">
                <div className="form-field">
                  <label>Mock Exam Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SIMCAT 1, AIMCAT 2601"
                    value={modalForm.title}
                    onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Taken">Taken (Completed)</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Date Attempted</label>
                  <input
                    type="date"
                    value={modalForm.date}
                    onChange={(e) => setModalForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              {modalForm.status === 'Taken' && (
                <>
                  <div className="form-row sectional-scores-row">
                    <div className="form-field">
                      <label>Quant (QA)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={modalForm.quantScore}
                        onChange={(e) => setModalForm(prev => ({ ...prev, quantScore: e.target.value }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>DILR</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={modalForm.lrdiScore}
                        onChange={(e) => setModalForm(prev => ({ ...prev, lrdiScore: e.target.value }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>VARC</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={modalForm.varcScore}
                        onChange={(e) => setModalForm(prev => ({ ...prev, varcScore: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Auto-Calculated Composite Display */}
                  <div className="modal-total-calc-banner">
                    <div>
                      <span className="calc-label">Total Composite Score</span>
                      <span className="calc-val">
                        {(parseFloat(modalForm.quantScore) || 0) + (parseFloat(modalForm.lrdiScore) || 0) + (parseFloat(modalForm.varcScore) || 0)} pts
                      </span>
                    </div>
                    <div>
                      <span className="calc-label">Projected CAT Percentile</span>
                      <span className="calc-val accent">
                        {modalForm.percentile || estimateCatPercentile(
                          (parseFloat(modalForm.quantScore) || 0) + (parseFloat(modalForm.lrdiScore) || 0) + (parseFloat(modalForm.varcScore) || 0)
                        )}%ile
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="form-field full">
                <label>Review Notes & Strategy Takeaways</label>
                <textarea
                  rows="3"
                  placeholder="What went wrong? Silly calculation errors, poor set selection in DILR, pacing issues..."
                  value={modalForm.notes}
                  onChange={(e) => setModalForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingMock(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Mock Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
