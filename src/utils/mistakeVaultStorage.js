/**
 * Utility for Mistake Vault Storage, Spaced Repetition Scheduling, and Markdown Export
 */

export const MISTAKE_ERROR_TYPES = [
  { id: 'trap_option', label: 'Trap Option / Distractor', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'calc_slip', label: 'Calculation Slip', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  { id: 'concept_gap', label: 'Concept Gap', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
  { id: 'misread', label: 'Misread Question / Constraint', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' },
  { id: 'time_pressure', label: 'Time Pressure / Panic Guess', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' }
];

export const MISTAKE_SUBJECTS = ['Quant', 'LRDI', 'VARC'];

const STORAGE_KEY = 'catalyze_mistake_vault_v1';

// Starter templates so the tab never feels deserted on first open
export const STARTER_MISTAKES = [
  {
    id: 'starter_qa_1',
    title: 'Time-Speed-Distance: Relative Speed & Unit Mismatch',
    source: 'SimCAT Mock 3, QA Q14',
    subject: 'Quant',
    topic: 'Arithmetic / TSD',
    errorTypeId: 'calc_slip',
    whatHappened: 'Multiplied train speed in km/h with time in seconds without converting by 5/18.',
    takeawayRule: 'Always box the units first. Convert km/h to m/s before multiplying time in seconds.',
    status: 'needs_reattempt', // 'needs_reattempt' | 'mastered'
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter_varc_1',
    title: 'Philosophy RC: Extreme Word Trap in Option C',
    source: 'CAT 2022 Slot 1 RC Q6',
    subject: 'VARC',
    topic: 'Reading Comprehension',
    errorTypeId: 'trap_option',
    whatHappened: 'Picked Option C which used "always precipitates" instead of the author\'s nuanced "often facilitates".',
    takeawayRule: 'Eliminate extreme qualifiers ("always", "never", "only", "entirely") unless explicitly affirmed in the passage.',
    status: 'needs_reattempt',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter_lrdi_1',
    title: 'Games & Tournaments: Overcounting Draws in Round Robin',
    source: 'Sectional Test 5, LRDI Set 2',
    subject: 'LRDI',
    topic: 'Games & Tournaments',
    errorTypeId: 'misread',
    whatHappened: 'Assumed a win gives 2 points and draw gives 1, but instructions stated 3 for win, 1 for tie.',
    takeawayRule: 'Spend the first 45 seconds highlighting scoring rules and tournament tie-breakers in the question brief.',
    status: 'mastered',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];

export function getStoredMistakes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read mistake vault from localStorage:', err);
    return [];
  }
}

export function saveStoredMistakes(mistakes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
    // Trigger persistent storage if available
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  } catch (err) {
    console.error('Could not save mistake vault to localStorage:', err);
  }
}

export function calculateMistakeStats(mistakes) {
  const total = mistakes.length;
  const todayStr = new Date().toISOString().split('T')[0];

  const dueForReattempt = mistakes.filter(
    m => m.status === 'needs_reattempt' && (!m.dueDate || m.dueDate <= todayStr)
  ).length;

  const mastered = mistakes.filter(m => m.status === 'mastered').length;
  const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0;

  // Breakdown by error type
  const typeCounts = {};
  MISTAKE_ERROR_TYPES.forEach(t => { typeCounts[t.id] = 0; });
  mistakes.forEach(m => {
    if (typeCounts[m.errorTypeId] !== undefined) {
      typeCounts[m.errorTypeId]++;
    } else {
      typeCounts[m.errorTypeId] = (typeCounts[m.errorTypeId] || 0) + 1;
    }
  });

  return {
    total,
    dueForReattempt,
    mastered,
    masteryRate,
    typeCounts
  };
}

export function exportMistakesToMarkdown(mistakes) {
  const dateStr = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  let md = `# CATalyze Mistake Vault & Formula Cheat Sheet\n`;
  md += `*Generated on ${dateStr} | Total Traps Documented: ${mistakes.length}*\n\n`;
  md += `---\n\n`;

  const subjects = ['Quant', 'LRDI', 'VARC', 'General'];

  subjects.forEach(subj => {
    const subjMistakes = mistakes.filter(m => (m.subject || 'General') === subj);
    if (subjMistakes.length === 0) return;

    md += `## ${subj.toUpperCase()} NOTES & FORMULAS (${subjMistakes.length})\n\n`;

    subjMistakes.forEach((m, idx) => {
      const typeObj = MISTAKE_ERROR_TYPES.find(t => t.id === m.errorTypeId);
      const typeLabel = typeObj ? typeObj.label : (m.subject || 'General');

      md += `### ${idx + 1}. ${m.title || 'Untitled Note'}\n`;
      if (m.source) {
        md += `- **Source / Reference**: ${m.source}\n`;
      }
      if (m.topic) {
        md += `- **Topic**: ${m.topic}\n`;
      }
      const text = m.content || m.takeawayRule || m.whatHappened || '';
      if (text) {
        md += `> ${text}\n`;
      }
      md += `\n---\n\n`;
    });
  });

  md += `\n*End of Notes & Vault. Review these takeaways before every mock session.*\n`;
  return md;
}

export function downloadFile(filename, content, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
