import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatchNotesHubModal from '../PatchNotesHubModal';
import UpdateNotificationToast from '../UpdateNotificationToast';
import SettingsView from '../SettingsView';
import { PATCH_RELEASES, SYSTEM_HEALTH } from '../../data/patchNotesData';

describe('Release Notes & Changelog Hub System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('contains valid structured patch releases and system health metadata', () => {
    expect(PATCH_RELEASES.length).toBeGreaterThanOrEqual(4);
    const latest = PATCH_RELEASES[0];
    expect(latest.version).toBe('1.0.88');
    expect(latest.codename).toContain('PROTOCOL HORIZON');
    expect(latest.telemetryBenchmarks.firestoreLatencyMs).toBeDefined();
    expect(latest.telemetryBenchmarks.localStorageSyncMs).toBeDefined();
    expect(latest.sections.features.length).toBeGreaterThan(0);
    expect(latest.sections.balancing.length).toBeGreaterThan(0);
    expect(latest.sections.security.length).toBeGreaterThan(0);
    expect(latest.sections.engine.length).toBeGreaterThan(0);
    expect(SYSTEM_HEALTH.status).toBe('OPTIMAL');
  });

  it('renders PatchNotesHubModal with hero banner, live latency HUD, and zero-emoji compliance', async () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();

    const { container } = render(
      <PatchNotesHubModal
        isOpen={true}
        onClose={handleClose}
        onNavigateTab={handleNavigate}
        initialVersion="1.0.88"
      />
    );

    // Assert zero emojis rule
    const rawText = container.textContent || '';
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(rawText)).toBe(false);

    // Hero banner and version
    expect(screen.getByText(/BUILD v1.0.88/i)).toBeDefined();
    expect(screen.getByText(/PROTOCOL HORIZON/i)).toBeDefined();
    expect(screen.getByText(/STATUS: OPTIMAL/i)).toBeDefined();

    // Telemetry HUD
    expect(screen.getByText(/LIVE SYSTEM TELEMETRY & LATENCY BENCHMARK/i)).toBeDefined();
    expect(screen.getByText(/CLOUD SYNC LATENCY/i)).toBeDefined();
    expect(screen.getByText(/LOCAL STORAGE I\/O/i)).toBeDefined();
    expect(screen.getByText(/FRAME RENDER TARGET/i)).toBeDefined();

    // Feature highlights
    expect(screen.getByText(/Adaptive Backlog Recovery Cockpit/i)).toBeDefined();
    expect(screen.getByText(/Launch Recovery Cockpit/i)).toBeDefined();
  });

  it('supports interactive feature launching directly from showcase cards', () => {
    const handleNavigate = vi.fn();

    render(
      <PatchNotesHubModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={handleNavigate}
        initialVersion="1.0.88"
      />
    );

    const recoveryBtn = screen.getByRole('button', { name: /Launch Recovery Cockpit/i });
    fireEvent.click(recoveryBtn);
    expect(handleNavigate).toHaveBeenCalledWith('recovery');
  });

  it('switches patch cycles when clicking on the timeline sidebar', () => {
    render(
      <PatchNotesHubModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        initialVersion="1.0.88"
      />
    );

    // Click on v1.0.87 release
    const v87Buttons = screen.getAllByText(/v1.0.87/i);
    expect(v87Buttons.length).toBeGreaterThan(0);
    fireEvent.click(v87Buttons[0]);

    // Hero updates to v1.0.87 codename
    expect(screen.getByText(/AESTHETIC MATRIX/i)).toBeDefined();
    expect(screen.getByText(/Japanese Cat Stamp Rally/i)).toBeDefined();
  });

  it('filters patch notes by category chips', () => {
    render(
      <PatchNotesHubModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        initialVersion="1.0.88"
      />
    );

    // Filter to Security & Cloud
    const secFilterBtn = screen.getByRole('button', { name: /Security & Cloud/i });
    fireEvent.click(secFilterBtn);

    expect(screen.getByText(/SECURITY HARDENING & CLOUD DATA INTEGRITY/i)).toBeDefined();
    expect(screen.getByText(/Non-Destructive Local & Cloud Sync Merge/i)).toBeDefined();
  });

  it('runs live latency benchmark and updates telemetry metrics', async () => {
    render(
      <PatchNotesHubModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        initialVersion="1.0.88"
      />
    );

    // Initial benchmark triggers on mount; wait for it to settle back to RUN BENCHMARK
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /RUN BENCHMARK/i })).toBeDefined();
    }, { timeout: 1500 });

    const benchmarkBtn = screen.getByRole('button', { name: /RUN BENCHMARK/i });
    fireEvent.click(benchmarkBtn);

    expect(screen.getByText(/TESTING SYSTEM/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /RUN BENCHMARK/i })).toBeDefined();
    }, { timeout: 1500 });
  });

  it('invokes onOpenPatchNotes from SettingsView banner and header chip', () => {
    const handleOpenPatchNotes = vi.fn();

    render(
      <SettingsView
        currentTheme="dark"
        onOpenPatchNotes={handleOpenPatchNotes}
      />
    );

    // 1. Panoramic header chip
    const chipBtn = screen.getByRole('button', { name: /PATCH v1\.0\.88/i });
    fireEvent.click(chipBtn);
    expect(handleOpenPatchNotes).toHaveBeenCalledTimes(1);

    // 2. Switch to Cloud & Portability tab
    const cloudNavBtn = screen.getByRole('button', { name: /Cloud/i });
    fireEvent.click(cloudNavBtn);

    // Patch banner CTA
    const bannerCta = screen.getByRole('button', { name: /Open Patch Notes Hub/i });
    fireEvent.click(bannerCta);
    expect(handleOpenPatchNotes).toHaveBeenCalledTimes(2);
  });

  it('invokes onOpenPatchNotes from UpdateNotificationToast', () => {
    const handleOpenPatchNotes = vi.fn();
    const handleDismiss = vi.fn();

    render(
      <UpdateNotificationToast
        updateData={{ version: '1.0.89', releaseNotes: 'New security patches deployed.' }}
        onDismiss={handleDismiss}
        onOpenPatchNotes={handleOpenPatchNotes}
      />
    );

    const patchNotesBtn = screen.getByRole('button', { name: /Patch Notes/i });
    fireEvent.click(patchNotesBtn);
    expect(handleOpenPatchNotes).toHaveBeenCalledTimes(1);
  });
});
