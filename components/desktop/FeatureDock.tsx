import React, { useState, useMemo } from 'react';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature } from '../../types.ts';

interface FeatureButtonProps {
    feature: Feature;
    onOpen: (id: string) => void;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ feature, onOpen }) => {
    return (
        <button
            onClick={() => onOpen(feature.id)}
            className="w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/80 transition-colors group"
            title={feature.name}
        >
            <div className="text-cyan-400 group-hover:scale-110 transition-transform text-2xl">{feature.icon}</div>
            <span className="text-xs text-slate-300 mt-2 text-center w-full break-words line-clamp-2">{feature.name}</span>
        </button>
    );
};

interface FeatureDockProps {
    onOpen: (id: string) => void;
}

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredFeatures = useMemo(() => {
        if (!searchTerm) return ALL_FEATURES;
        const lowerSearch = searchTerm.toLowerCase();
        return ALL_FEATURES.filter(
            f => f.name.toLowerCase().includes(lowerSearch) || f.category.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    return (
        <div className="absolute top-0 left-0 right-0 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-3 z-10">
            <div className="max-w-7xl mx-auto">
                 <input
                    type="text"
                    placeholder="Search all features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                />
                <div className="h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {filteredFeatures.map(feature => (
                            <FeatureButton key={feature.id} feature={feature} onOpen={onOpen} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
