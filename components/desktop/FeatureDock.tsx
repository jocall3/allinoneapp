// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature } from '../../types.ts';

// --- Local Storage Keys ---
const LS_KEY_PINNED_FEATURES = 'feature_dock_pinned_features';
const LS_KEY_RECENT_FEATURES = 'feature_dock_recent_features';
const MAX_RECENT_FEATURES = 10; // Limit for recently used features

// --- Local Storage Helper Functions ---
const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

const setLocalStorageItem = <T>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage for key "${key}":`, error);
    }
};

// --- Exported FeatureContextMenu Component ---
export interface FeatureContextMenuProps {
    feature: Feature;
    position: { x: number; y: number };
    isPinned: boolean;
    onClose: () => void;
    onPinToggle: (id: string) => void;
    onShowDetails: (id: string) => void;
}

export const FeatureContextMenu: React.FC<FeatureContextMenuProps> = ({
    feature,
    position,
    isPinned,
    onClose,
    onPinToggle,
    onShowDetails,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Adjust position to keep menu within viewport
    const style: React.CSSProperties = {
        top: position.y,
        left: position.x,
        position: 'fixed',
        zIndex: 1000,
    };

    return (
        <div
            ref={menuRef}
            style={style}
            className="bg-surface border border-border rounded-lg shadow-lg py-1 text-text-primary text-sm min-w-[150px]"
            onClick={onClose} // Close menu on any item click
        >
            <button
                className="block w-full text-left px-4 py-2 hover:bg-background/80"
                onClick={() => onPinToggle(feature.id)}
            >
                {isPinned ? 'Unpin from Dock' : 'Pin to Dock'}
            </button>
            <button
                className="block w-full text-left px-4 py-2 hover:bg-background/80"
                onClick={() => onShowDetails(feature.id)}
            >
                Feature Details
            </button>
            {/* Add more context menu items here if needed */}
        </div>
    );
};

// --- Exported FeatureDetailsModal Component ---
export interface FeatureDetailsModalProps {
    feature: Feature | null;
    onClose: () => void;
}

export const FeatureDetailsModal: React.FC<FeatureDetailsModalProps> = ({ feature, onClose }) => {
    if (!feature) return null;

    return (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">{feature.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary text-2xl"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <p className="text-text-secondary text-sm mb-4">
                    Category: <span className="text-text-primary font-medium">{feature.category}</span>
                </p>
                <div className="text-text-primary text-6xl mb-4 text-center">{feature.icon}</div>
                <p className="text-text-secondary leading-relaxed">
                    {/* Placeholder description as Feature type doesn't expose it. */}
                    This is a comprehensive description for the "{feature.name}" feature. It is a key component of our system, designed to facilitate specific tasks within the "{feature.category}" category. Users can expect a smooth and intuitive experience, with robust performance and seamless integration with other modules. For more information, please refer to the internal documentation or contact support.
                </p>
                {/* Add more details here if Feature type expands */}
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- FeatureButton Component (enhanced) ---
interface FeatureButtonProps {
    feature: Feature;
    onOpen: (id: string) => void;
    onContextMenu: (event: React.MouseEvent, feature: Feature) => void;
    isPinned?: boolean;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ feature, onOpen, onContextMenu, isPinned }) => {
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default browser context menu
        onContextMenu(e, feature);
    };

    return (
        <button
            onClick={() => onOpen(feature.id)}
            onContextMenu={handleContextMenu}
            className={`relative w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg bg-surface/50 hover:bg-surface/80 transition-colors group border ${
                isPinned ? 'border-primary' : 'border-transparent hover:border-border'
            }`}
            title={feature.name}
            aria-label={feature.name}
        >
            {isPinned && (
                <span className="absolute top-1 right-1 text-xs text-primary bg-background rounded-full px-1 py-0.5" aria-hidden="true">
                    ★
                </span>
            )}
            <div className="text-primary group-hover:scale-110 transition-transform text-2xl">{feature.icon}</div>
            <span className="text-xs text-text-secondary mt-2 text-center w-full break-words line-clamp-2">
                {feature.name}
            </span>
        </button>
    );
};

// --- FeatureDock Main Component ---
interface FeatureDockProps {
    onOpen: (id: string) => void;
}

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [pinnedFeatureIds, setPinnedFeatureIds] = useState<string[]>([]);
    const [recentFeatureIds, setRecentFeatureIds] = useState<string[]>([]);

    // State for context menu and details modal
    const [contextMenuState, setContextMenuState] = useState<{
        feature: Feature;
        position: { x: number; y: number };
    } | null>(null);
    const [detailsModalFeature, setDetailsModalFeature] = useState<Feature | null>(null);

    // Load pinned and recent features from localStorage on mount
    useEffect(() => {
        setPinnedFeatureIds(getLocalStorageItem(LS_KEY_PINNED_FEATURES, []));
        setRecentFeatureIds(getLocalStorageItem(LS_KEY_RECENT_FEATURES, []));
    }, []);

    // Save pinned features to localStorage whenever it changes
    useEffect(() => {
        setLocalStorageItem(LS_KEY_PINNED_FEATURES, pinnedFeatureIds);
    }, [pinnedFeatureIds]);

    // Save recent features to localStorage whenever it changes, limit to MAX_RECENT_FEATURES
    useEffect(() => {
        setLocalStorageItem(LS_KEY_RECENT_FEATURES, recentFeatureIds.slice(0, MAX_RECENT_FEATURES));
    }, [recentFeatureIds]);

    // Add a feature to the recent list
    const addRecentFeature = useCallback((featureId: string) => {
        setRecentFeatureIds(prev => {
            const newRecents = [featureId, ...prev.filter(id => id !== featureId)];
            return newRecents;
        });
    }, []);

    // Handle opening a feature, also adds it to recent list
    const handleOpenFeature = useCallback((featureId: string) => {
        onOpen(featureId);
        addRecentFeature(featureId);
    }, [onOpen, addRecentFeature]);

    // Toggle pin status of a feature
    const handleTogglePin = useCallback((featureId: string) => {
        setPinnedFeatureIds(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    }, []);

    // Context menu handlers
    const handleOpenContextMenu = useCallback((event: React.MouseEvent, feature: Feature) => {
        setContextMenuState({
            feature,
            position: { x: event.clientX, y: event.clientY },
        });
    }, []);

    const handleCloseContextMenu = useCallback(() => {
        setContextMenuState(null);
    }, []);

    const handlePinFromContextMenu = useCallback((featureId: string) => {
        handleTogglePin(featureId);
        handleCloseContextMenu();
    }, [handleTogglePin, handleCloseContextMenu]);

    const handleShowDetailsFromContextMenu = useCallback((featureId: string) => {
        const feature = ALL_FEATURES.find(f => f.id === featureId);
        if (feature) {
            setDetailsModalFeature(feature);
        }
        handleCloseContextMenu();
    }, [handleCloseContextMenu]);

    const handleCloseDetailsModal = useCallback(() => {
        setDetailsModalFeature(null);
    }, []);

    // Memoized list of unique categories for filtering
    const uniqueCategories = useMemo(() => {
        const categories = new Set(ALL_FEATURES.map(f => f.category));
        return ['All', ...Array.from(categories).sort()];
    }, []);

    // Memoized filtered features based on search term and selected category
    const filteredFeatures = useMemo(() => {
        let features = ALL_FEATURES;
        if (selectedCategory && selectedCategory !== 'All') {
            features = features.filter(f => f.category === selectedCategory);
        }
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            features = features.filter(
                f => f.name.toLowerCase().includes(lowerSearch) || f.category.toLowerCase().includes(lowerSearch)
            );
        }
        return features;
    }, [searchTerm, selectedCategory]);

    // Memoized lists for pinned and recent features
    const pinnedFeaturesList = useMemo(() => {
        return pinnedFeatureIds
            .map(id => ALL_FEATURES.find(f => f.id === id))
            .filter(Boolean) as Feature[];
    }, [pinnedFeatureIds]);

    const recentFeaturesList = useMemo(() => {
        // Ensure recent features are actually available in ALL_FEATURES
        return recentFeatureIds
            .map(id => ALL_FEATURES.find(f => f.id === id))
            .filter(Boolean) as Feature[];
    }, [recentFeatureIds]);

    return (
        <div className="absolute top-0 left-0 right-0 bg-surface/30 backdrop-blur-sm border-b border-border p-3 z-10">
            <div className="max-w-7xl mx-auto flex flex-col h-full">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search all features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded-lg bg-background/80 border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary"
                    aria-label="Search features"
                />

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {uniqueCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category || (category === 'All' && selectedCategory === null)
                                    ? 'bg-primary text-white'
                                    : 'bg-background/80 text-text-secondary hover:bg-background/60'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Main scrollable content area */}
                <div className="flex-grow overflow-y-auto pb-4">
                    {/* Pinned Features Section */}
                    {pinnedFeaturesList.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-text-primary mb-3">Pinned Features</h3>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {pinnedFeaturesList.map(feature => (
                                    <FeatureButton
                                        key={feature.id}
                                        feature={feature}
                                        onOpen={handleOpenFeature}
                                        onContextMenu={handleOpenContextMenu}
                                        isPinned={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Features Section */}
                    {recentFeaturesList.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-text-primary mb-3">Recently Used</h3>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {recentFeaturesList.map(feature => (
                                    <FeatureButton
                                        key={feature.id}
                                        feature={feature}
                                        onOpen={handleOpenFeature}
                                        onContextMenu={handleOpenContextMenu}
                                        isPinned={pinnedFeatureIds.includes(feature.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Features Section (with Search/Category Filter) */}
                    <h3 className="text-lg font-semibold text-text-primary mb-3">All Features</h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {filteredFeatures.length > 0 ? (
                            filteredFeatures.map(feature => (
                                <FeatureButton
                                    key={feature.id}
                                    feature={feature}
                                    onOpen={handleOpenFeature}
                                    onContextMenu={handleOpenContextMenu}
                                    isPinned={pinnedFeatureIds.includes(feature.id)}
                                />
                            ))
                        ) : (
                            <p className="text-text-secondary text-center w-full py-8">
                                No features match your criteria. Try adjusting your search or category filter.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Render FeatureContextMenu if active */}
            {contextMenuState && (
                <FeatureContextMenu
                    feature={contextMenuState.feature}
                    position={contextMenuState.position}
                    isPinned={pinnedFeatureIds.includes(contextMenuState.feature.id)}
                    onClose={handleCloseContextMenu}
                    onPinToggle={handlePinFromContextMenu}
                    onShowDetails={handleShowDetailsFromContextMenu}
                />
            )}

            {/* Render FeatureDetailsModal if active */}
            {detailsModalFeature && (
                <FeatureDetailsModal
                    feature={detailsModalFeature}
                    onClose={handleCloseDetailsModal}
                />
            )}
        </div>
    );
};