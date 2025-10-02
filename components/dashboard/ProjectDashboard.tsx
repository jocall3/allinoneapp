// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import type { DashboardData } from '../../types';
import Icon from '../ui/Icon';

const DashboardCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="font-bold text-gray-200 ml-2">{title}</h3>
        </div>
        <div className="text-sm text-gray-300 space-y-2">{children}</div>
    </div>
);

interface ProjectDashboardProps {
    data: DashboardData | null;
    isLoading: boolean;
    onClose: () => void;
    onFileClick: (fileName: string) => void;
    onActionClick: (command?: string) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ data, isLoading, onClose, onFileClick, onActionClick }) => {
    if (isLoading) {
        return (
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex items-center justify-center h-48 flex-shrink-0">
                <Icon name="loader" className="animate-spin text-blue-400 mr-3" size={24} />
                <span className="text-gray-300">Gemini is analyzing this folder...</span>
            </div>
        );
    }
    
    if (!data) return null;

    return (
        <div className="p-4 border-b border-gray-700 bg-gray-900/50 relative animate-slide-down flex-shrink-0">
            <button onClick={onClose} className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-700 text-gray-400">
                <Icon name="close" size={18} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Column 1: Summary & Info */}
                <div className="lg:col-span-1 space-y-4">
                    <DashboardCard title="Project Summary" icon={<Icon name="info" size={18} className="text-blue-400" />}>
                        <p>{data.summary}</p>
                    </DashboardCard>
                    <DashboardCard title="Project Info" icon={<Icon name="folder" size={18} className="text-yellow-400" />}>
                        <p><strong>Type:</strong> {data.projectType}</p>
                        {data.techStack && data.techStack.length > 0 && (
                             <p><strong>Stack:</strong> {data.techStack.join(', ')}</p>
                        )}
                    </DashboardCard>
                </div>
                {/* Column 2: Key Files */}
                <DashboardCard title="Key Files" icon={<Icon name="fileText" size={18} className="text-green-400" />} className="lg:col-span-1">
                    {data.keyFiles.map(file => (
                        <div key={file.fileName} className="p-2 rounded-md hover:bg-gray-700 cursor-pointer" onClick={() => onFileClick(file.fileName)}>
                            <p className="font-semibold font-mono">{file.fileName}</p>
                            <p className="text-xs text-gray-400">{file.reason}</p>
                        </div>
                    ))}
                </DashboardCard>
                {/* Column 3: Actions */}
                <DashboardCard title="Suggested Actions" icon={<Icon name="sparkles" size={18} className="text-purple-400" />} className="lg:col-span-1">
                     {data.suggestedActions.map(action => (
                        <div key={action.action} className="p-2 rounded-md hover:bg-gray-700 cursor-pointer" onClick={() => onActionClick(action.command)}>
                            <p className="font-semibold">{action.action}</p>
                            {action.command && <p className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded-md inline-block mt-1">{action.command}</p>}
                        </div>
                    ))}
                </DashboardCard>
            </div>
        </div>
    );
};

export default ProjectDashboard;