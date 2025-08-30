import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DesktopView } from './DesktopView';
import { GlobalStateProvider } from '../../contexts/GlobalStateContext';

// Mock child components as they have their own dependencies
vi.mock('../LeftSidebar', () => ({
    LeftSidebar: () => <div>Sidebar</div>
}));
vi.mock('./Taskbar', () => ({
    Taskbar: () => <div>Taskbar</div>
}));
vi.mock('./FeatureDock', () => ({
    FeatureDock: () => <input placeholder="Search all features..." />
}));


describe('DesktopView', () => {
  it('renders the feature dock', () => {
    render(
        <GlobalStateProvider>
            <DesktopView windows={[]} activeId={null} onLaunch={() => {}} onClose={() => {}} onMinimize={() => {}} onFocus={() => {}} onUpdate={() => {}} />
        </GlobalStateProvider>
    );
    expect(screen.getByPlaceholderText('Search all features...')).toBeInTheDocument();
  });
});
