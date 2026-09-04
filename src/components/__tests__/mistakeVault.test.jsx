import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorLogView from '../ErrorLogView';
import {
  getStoredMistakes,
  exportMistakesToMarkdown
} from '../../utils/mistakeVaultStorage';

describe('Study Notes & Mistake Vault Unit Tests', () => {
  it('defaults to empty array without hardcoded dummy cards', () => {
    localStorage.clear();
    const mistakes = getStoredMistakes();
    expect(mistakes).toEqual([]);
  });

  it('exports cards into clean structured markdown', () => {
    const sample = [
      {
        id: 'test_1',
        title: 'TSD Relative Speed Unit Conversion',
        subject: 'Quant',
        content: 'Always convert km/h to m/s before multiplying time in seconds.',
        source: 'SimCAT Mock 3'
      }
    ];
    const md = exportMistakesToMarkdown(sample);
    expect(md).toContain('# CATalyze Mistake Vault & Formula Cheat Sheet');
    expect(md).toContain('QUANT NOTES');
    expect(md).toContain('TSD Relative Speed Unit Conversion');
    expect(md).toContain('Always convert km/h to m/s');
  });

  it('renders ErrorLogView with clean header, smooth search, and empty state', () => {
    localStorage.clear();
    const mockState = { tracker: {} };
    render(<ErrorLogView state={mockState} onDayClick={vi.fn()} />);

    expect(screen.getAllByText(/ERROR LOG/).length).toBeGreaterThan(0);
    expect(screen.getByText('New Note Card')).toBeDefined();
    expect(screen.getByText('Export (.md)')).toBeDefined();
    expect(screen.getByPlaceholderText('Type to search notes and formulas...')).toBeDefined();
    expect(screen.getByText('Your Study Vault is Empty')).toBeDefined();
  });

  it('opens and closes the clean card creation modal', () => {
    localStorage.clear();
    const mockState = { tracker: {} };
    render(<ErrorLogView state={mockState} onDayClick={vi.fn()} />);

    const newCardBtn = screen.getByText('New Note Card');
    fireEvent.click(newCardBtn);

    expect(screen.getByText('New Study Card')).toBeDefined();
    expect(screen.getByPlaceholderText('Write your note, formula, or mistake reflection here...')).toBeDefined();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('New Study Card')).toBeNull();
  });
});
