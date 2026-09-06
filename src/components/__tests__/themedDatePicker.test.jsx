import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemedDatePicker from '../ThemedDatePicker';

describe('ThemedDatePicker Component', () => {
  it('renders trigger button with formatted date value and opens calendar on click', () => {
    const onChange = vi.fn();
    render(
      <ThemedDatePicker
        value="2026-09-06"
        onChange={onChange}
      />
    );

    // Displays formatted date (09/06/2026)
    expect(screen.getByText('09/06/2026')).toBeDefined();

    // Popover is initially closed
    expect(screen.queryByRole('dialog')).toBeNull();

    // Click trigger to open popover
    const triggerBtn = screen.getByRole('button', { name: /Select preparation start date/i });
    fireEvent.click(triggerBtn);

    // Popover is now open
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('September')).toBeDefined();
    expect(screen.getByText('2026')).toBeDefined();
  });

  it('selects a date from the calendar grid and invokes onChange', () => {
    const onChange = vi.fn();
    render(
      <ThemedDatePicker
        value="2026-09-06"
        onChange={onChange}
      />
    );

    // Open calendar
    fireEvent.click(screen.getByRole('button', { name: /Select preparation start date/i }));

    // Click day 15
    const day15Btn = screen.getByRole('button', { name: 'September 15, 2026' });
    fireEvent.click(day15Btn);

    expect(onChange).toHaveBeenCalledWith('2026-09-15');
    // Popover closes after selection
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('selects today when Today shortcut button is clicked', () => {
    const onChange = vi.fn();
    render(
      <ThemedDatePicker
        value="2026-09-01"
        onChange={onChange}
      />
    );

    // Open calendar
    fireEvent.click(screen.getByRole('button', { name: /Select preparation start date/i }));

    // Click Today shortcut button
    const todayBtn = screen.getByRole('button', { name: /Today/i });
    fireEvent.click(todayBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('complies with zero-emoji policy', () => {
    const { container } = render(
      <ThemedDatePicker
        value="2026-09-06"
        onChange={vi.fn()}
      />
    );

    // Open calendar
    fireEvent.click(screen.getByRole('button', { name: /Select preparation start date/i }));

    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent)).toBe(false);
  });
});
