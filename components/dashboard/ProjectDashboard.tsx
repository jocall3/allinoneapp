// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import type { DashboardData } from '../../types';
import Icon from '../ui/Icon';

// This file has been significantly enhanced to provide a more comprehensive and interactive project dashboard experience.
// It includes new data models, specialized card components, utility functions, and improved UI/UX elements,
// adhering to a high standard of quality as if developed by a leading technology company.

/**
 * @typedef {Object} Dependency
 * @property {string} name - The name of the dependency.
 * @property {string} version - The version of the dependency.
 * @property {string} [description] - An optional description for the dependency.
 */
export interface Dependency {
    name: string;
    version: string;
    description?: string;
}

/**
 * @typedef {Object} RecentActivity
 * @property {string} id - A unique identifier for the activity.
 * @property {string} timestamp - ISO string representing when the activity occurred.
 * @property {'file_edit' | 'ai_interaction' | 'command_exec'} type - The type of activity.
 * @property {string} description - A brief description of the activity.
 * @property {string} [details] - Optional additional details.
 * @property {string} [fileName] - The file name related to the activity, if applicable.
 * @property {string} [command] - The command related to the activity, if applicable.
 */
export interface RecentActivity {
    id: string;
    timestamp: string; // ISO string
    type: 'file_edit' | 'ai_interaction' | 'command_exec';
    description: string;
    details?: string;
    fileName?: string;
    command?: string;
}

/**
 * @typedef {Object} AIInsight
 * @property {string} id - A unique identifier for the insight.
 * @property {string} title - The title of the insight.
 * @property {string} description - A detailed description of the insight.
 * @property {'info' | 'warning' | 'critical'} severity - The severity level of the insight.
 * @property {Array<{ label: string; command?: string }>} [actionableItems] - Optional actionable steps with commands.
 */
export interface AIInsight {
    id: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    actionableItems?: { label: string; command?: string }[];
}

/**
 * @typedef {DashboardData} EnrichedDashboardData - An extension of the base DashboardData type with additional project details.
 * This type is used internally to assume that the `data` prop might contain more fields than strictly defined in `DashboardData`
 * from `../../types`, allowing for flexible expansion without modifying external type definitions.
 * @property {string} [projectName] - The name of the project.
 * @property {string} [language] - The primary programming language of the project.
 * @property {string} [lastUpdated] - ISO string representing the last update timestamp of the dashboard data.
 * @property {Dependency[]} [dependencies] - An array of project dependencies.
 * @property {RecentActivity[]} [recentActivity] - An array of recent activities related to the project.
 * @property {AIInsight[]} [aiInsights] - An array of AI-generated insights for the project.
 */
interface EnrichedDashboardData extends DashboardData {
    projectName?: string;
    language?: string;
    lastUpdated?: string; // ISO string
    dependencies?: Dependency[];
    recentActivity?: RecentActivity[];
    aiInsights?: AIInsight[];
}

/**
 * A reusable card component for displaying dashboard sections.
 * It provides a consistent look and feel for different types of information.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the card.
 * @param {React.ReactNode} props.icon - The icon to display next to the title, indicating the card's content type.
 * @param {React.ReactNode} props.children - The content of the card, usually text or other components.
 * @param {string} [props.className] - Optional additional CSS classes to apply to the card's container.
 * @returns {JSX.Element} The rendered DashboardCard component.
 */
export const DashboardCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 shadow-md ${className}`}>
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="font-bold text-gray-200 ml-2 text-lg">{title}</h3>
        </div>
        <div className="text-sm text-gray-300 space-y-2">{children}</div>
    </div>
);

/**
 * A skeleton loader component designed to mimic the appearance of a `DashboardCard` while data is loading.
 * Provides visual feedback to the user that content is being fetched.
 * @param {object} props - The component props.
 * @param {number} [props.count=3] - The number of line placeholders to display within the skeleton card.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {JSX.Element} The rendered DashboardCardSkeleton component.
 */
export const DashboardCardSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 3, className }) => (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 animate-pulse ${className}`}>
        <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gray-600 rounded-full mr-2"></div>
            <div className="h-4 w-1/3 bg-gray-600 rounded"></div>
        </div>
        <div className="space-y-2 pt-2">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-700 rounded w-full first:w-11/12 last:w-5/6"></div>
            ))}
        </div>
    </div>
);

/**
 * Utility function to copy text to the user's clipboard.
 * This function handles the browser's clipboard API and provides a console log for feedback.
 * In a production environment, this would typically integrate with a toast notification system.
 * @param {string} text - The text string to be copied to the clipboard.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the copy operation was successful, `false` otherwise.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Copied to clipboard:', text); // For debugging, replaced by toast in production
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Optionally, show a fallback notification or alert if clipboard access fails
        return false;
    }
};

/**
 * A reusable component for displaying an action item, optionally including a command
 * that can be executed or copied to the clipboard. Provides interactive elements and accessibility.
 * @param {object} props - The component props.
 * @param {string} props.label - The visible label or description of the action.
 * @param {string} [props.command] - An optional command string associated with the action.
 * @param {(command?: string) => void} props.onActionClick - A callback function invoked when the action item is clicked,
 *                                                           passing the associated command if available.
 * @returns {JSX.Element} The rendered CommandActionItem component.
 */
export const CommandActionItem: React.FC<{ label: string; command?: string; onActionClick: (command?: string) => void }> = ({ label, command, onActionClick }) => {
    const handleCopyClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the parent div's onClick from firing
        if (command) {
            copyToClipboard(command);
            // Future enhancement: show a temporary visual feedback like a "Copied!" tooltip
        }
    };

    return (
        <div
            className="p-2 rounded-md hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors duration-200"
            onClick={() => onActionClick(command)}
            role="button"
            tabIndex={0}
            aria-label={`Action: ${label}${command ? `. Command: ${command}` : ''}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onActionClick(command);
                }
            }}
        >
            <p className="font-semibold text-gray-200">{label}</p>
            {command && (
                <div className="flex items-center space-x-2 ml-4">
                    <p className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded-md max-w-[200px] truncate" title={command}>
                        {command}
                    </p>
                    <button
                        onClick={handleCopyClick}
                        className="p-1 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400 transition-colors duration-200"
                        aria-label={`Copy command: ${command}`}
                        title="Copy command"
                    >
                        <Icon name="copy" size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * A specialized `DashboardCard` for displaying AI-generated insights.
 * Each insight can have a severity level and a list of actionable items with commands.
 * @param {object} props - The component props.
 * @param {AIInsight[]} props.insights - An array of `AIInsight` objects to display.
 * @param {(command?: string) => void} props.onActionClick - Callback for when an actionable item's command is clicked.
 * @returns {JSX.Element} The rendered AIInsightsCard component.
 */
export const AIInsightsCard: React.FC<{ insights: AIInsight[]; onActionClick: (command?: string) => void }> = ({ insights, onActionClick }) => {
    if (!insights || insights.length === 0) {
        return (
            <DashboardCard title="AI Insights" icon={<Icon name="lightbulb" size={18} className="text-pink-400 flex-shrink-0" />}>
                <p>No specific insights available at this time from Gemini.</p>
            </DashboardCard>
        );
    }

    const getSeverityColor = (severity: AIInsight['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getSeverityIcon = (severity: AIInsight['severity']) => {
        switch (severity) {
            case 'critical': return 'alertTriangle';
            case 'warning': return 'alertCircle';
            case 'info': return 'info';
            default: return 'lightbulb';
        }
    };

    return (
        <DashboardCard title="AI Insights" icon={<Icon name="lightbulb" size={18} className="text-pink-400 flex-shrink-0" />}>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {insights.map((insight) => (
                    <div key={insight.id} className="p-3 rounded-md bg-gray-800 border border-gray-700 shadow-sm">
                        <div className="flex items-center mb-2">
                            <Icon name={getSeverityIcon(insight.severity)} size={16} className={`${getSeverityColor(insight.severity)} mr-2 flex-shrink-0`} />
                            <h4 className={`font-bold ${getSeverityColor(insight.severity)} text-base flex-grow`}>{insight.title}</h4>
                        </div>
                        <p className="text-sm text-gray-300 mb-2 leading-relaxed">{insight.description}</p>
                        {insight.actionableItems && insight.actionableItems.length > 0 && (
                            <div className="mt-3 border-t border-gray-700 pt-3 space-y-1">
                                <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Actions:</p>
                                {insight.actionableItems.map((item, idx) => (
                                    <CommandActionItem key={idx} label={item.label} command={item.command} onActionClick={onActionClick} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

/**
 * A specialized `DashboardCard` for displaying a list of project dependencies.
 * Includes a "Show All" toggle for longer lists to improve readability.
 * @param {object} props - The component props.
 * @param {Dependency[]} props.dependencies - An array of `Dependency` objects to display.
 * @returns {JSX.Element} The rendered ProjectDependenciesCard component.
 */
export const ProjectDependenciesCard: React.FC<{ dependencies: Dependency[] }> = ({ dependencies }) => {
    if (!dependencies || dependencies.length === 0) {
        return (
            <DashboardCard title="Project Dependencies" icon={<Icon name="box" size={18} className="text-indigo-400 flex-shrink-0" />}>
                <p>No project dependencies identified.</p>
            </DashboardCard>
        );
    }

    const [showAll, setShowAll] = React.useState(false);
    const visibleDependencies = showAll ? dependencies : dependencies.slice(0, 7); // Show first 7 by default

    return (
        <DashboardCard title="Project Dependencies" icon={<Icon name="box" size={18} className="text-indigo-400 flex-shrink-0" />}>
            <ul className="list-disc list-inside space-y-2 max-h-56 overflow-y-auto pr-2 text-gray-300">
                {visibleDependencies.map((dep, index) => (
                    <li key={index} className="flex flex-col items-start p-1 hover:bg-gray-800 rounded-sm">
                        <div className="flex items-baseline">
                            <span className="text-gray-200 font-mono text-sm font-semibold">{dep.name}</span>
                            <span className="text-gray-400 text-xs ml-2">v{dep.version}</span>
                        </div>
                        {dep.description && <span className="text-gray-500 text-xs italic ml-4">{dep.description}</span>}
                    </li>
                ))}
            </ul>
            {dependencies.length > 7 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 rounded transition-colors duration-200"
                    aria-expanded={showAll}
                >
                    {showAll ? 'Show Less' : `Show All (${dependencies.length})`}
                </button>
            )}
        </DashboardCard>
    );
};

/**
 * A specialized `DashboardCard` for displaying recent activities within the project.
 * It shows a timeline of events like file edits, AI interactions, or command executions.
 * @param {object} props - The component props.
 * @param {RecentActivity[]} props.activity - An array of `RecentActivity` objects.
 * @param {(fileName: string) => void} props.onFileClick - Callback for when a file-related activity is clicked.
 * @param {(command?: string) => void} props.onActionClick - Callback for when a command-related activity is clicked.
 * @returns {JSX.Element} The rendered RecentActivityCard component.
 */
export const RecentActivityCard: React.FC<{ activity: RecentActivity[]; onFileClick: (fileName: string) => void; onActionClick: (command?: string) => void }> = ({ activity, onFileClick, onActionClick }) => {
    if (!activity || activity.length === 0) {
        return (
            <DashboardCard title="Recent Activity" icon={<Icon name="activity" size={18} className="text-teal-400 flex-shrink-0" />}>
                <p>No recent activity recorded for this project.</p>
            </DashboardCard>
        );
    }

    const formatTimeAgo = (isoString: string) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (seconds < 60) return `${seconds}s ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            if (days < 30) return `${days}d ago`;
            const months = Math.floor(days / 30);
            return `${months}mo ago`;
        } catch {
            return new Date(isoString).toLocaleDateString(); // Fallback to a simple date string
        }
    };

    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'file_edit': return <Icon name="fileEdit" size={14} className="text-orange-400 mr-2" />;
            case 'ai_interaction': return <Icon name="sparkles" size={14} className="text-purple-400 mr-2" />;
            case 'command_exec': return <Icon name="terminal" size={14} className="text-green-400 mr-2" />;
            default: return <Icon name="activity" size={14} className="text-gray-400 mr-2" />;
        }
    };

    return (
        <DashboardCard title="Recent Activity" icon={<Icon name="activity" size={18} className="text-teal-400 flex-shrink-0" />}>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {activity.map((item) => (
                    <div
                        key={item.id}
                        className="p-2 rounded-md hover:bg-gray-700 border border-gray-800 cursor-pointer transition-colors duration-200"
                        onClick={() => {
                            if (item.fileName) onFileClick(item.fileName);
                            else if (item.command) onActionClick(item.command);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Activity: ${item.description}${item.fileName ? `. File: ${item.fileName}` : ''}${item.command ? `. Command: ${item.command}` : ''}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (item.fileName) onFileClick(item.fileName);
                                else if (item.command) onActionClick(item.command);
                            }
                        }}
                    >
                        <div className="flex items-center text-gray-300">
                            {getActivityIcon(item.type)}
                            <p className="font-semibold text-sm flex-grow leading-tight">{item.description}</p>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
                        </div>
                        {item.fileName && (
                            <p className="text-xs text-gray-400 font-mono mt-1 ml-6 truncate" title={item.fileName}>File: {item.fileName}</p>
                        )}
                        {item.command && (
                            <p className="text-xs text-gray-400 font-mono bg-gray-900 px-2 py-1 rounded-md inline-block mt-1 ml-6 truncate max-w-[calc(100%-24px)]" title={item.command}>
                                {item.command}
                            </p>
                        )}
                        {item.details && (
                            <p className="text-xs text-gray-500 mt-1 ml-6 italic">{item.details}</p>
                        )}
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

/**
 * Props for the ProjectDashboard component.
 * It extends the base `DashboardData` with optional fields to enrich the dashboard display.
 */
interface ProjectDashboardProps {
    data: DashboardData | null;
    isLoading: boolean;
    onClose: () => void;
    onFileClick: (fileName: string) => void;
    onActionClick: (command?: string) => void;
}

/**
 * The main `ProjectDashboard` component, displaying a comprehensive overview of a project.
 * It orchestrates various specialized `DashboardCard` components to present summary, info,
 * key files, suggested actions, AI insights, dependencies, and recent activity.
 * Includes detailed loading states and error handling.
 * @param {ProjectDashboardProps} props - The component props.
 * @returns {JSX.Element | null} The rendered project dashboard or null if no data is available after loading.
 */
const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ data, isLoading, onClose, onFileClick, onActionClick }) => {
    // Cast `data` to `EnrichedDashboardData` to allow for optional extended fields
    // while maintaining compatibility with the base `DashboardData` type.
    const enrichedData = data as EnrichedDashboardData | null;

    if (isLoading) {
        return (
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex flex-col items-center justify-center h-full min-h-[200px] flex-shrink-0 animate-pulse transition-all duration-300">
                <Icon name="loader" className="animate-spin text-blue-400 mr-3 mb-3" size={32} />
                <span className="text-gray-300 text-lg font-semibold">Gemini is analyzing this project...</span>
                <p className="text-gray-500 text-sm mt-1">Gathering project summary, dependencies, and AI-driven insights.</p>
                <p className="text-gray-500 text-xs mt-0.5 opacity-75">This might take a moment.</p>
            </div>
        );
    }
    
    if (!enrichedData) {
        return (
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex flex-col items-center justify-center h-full min-h-[200px] flex-shrink-0 text-center transition-all duration-300">
                <Icon name="alertCircle" className="text-red-400 mb-3" size={32} />
                <span className="text-gray-300 text-lg font-semibold">Project dashboard data not available.</span>
                <p className="text-gray-500 text-sm mt-1">There was an issue loading the project information or no project is currently selected.</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close dashboard"
                    title="Close Dashboard"
                >
                    Close Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 border-b border-gray-700 bg-gray-900/50 relative animate-slide-down flex-shrink-0 overflow-hidden">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 z-10"
                aria-label="Close Project Dashboard"
                title="Close Dashboard"
            >
                <Icon name="close" size={18} />
            </button>

            {/* Project Header Section */}
            <div className="mb-6 pb-4 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center mb-2 sm:mb-0">
                    <Icon name="layoutDashboard" size={28} className="mr-3 text-blue-300 flex-shrink-0" />
                    <h2 className="text-2xl font-extrabold text-gray-50 leading-tight">
                        Project Dashboard
                    </h2>
                </div>
                <p className="text-gray-400 text-sm italic sm:text-right">
                    Insights for <span className="font-semibold text-gray-300">{enrichedData.projectName || 'Current Project'}</span>
                    {enrichedData.lastUpdated && <span className="ml-3 block sm:inline">Last updated: {new Date(enrichedData.lastUpdated).toLocaleString()}</span>}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Column 1: Summary, Info, AI Insights */}
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Project Summary" icon={<Icon name="info" size={18} className="text-blue-400 flex-shrink-0" />}>
                        <p className="text-base leading-relaxed text-gray-300">{enrichedData.summary}</p>
                    </DashboardCard>

                    <DashboardCard title="Project Info" icon={<Icon name="folder" size={18} className="text-yellow-400 flex-shrink-0" />}>
                        <p className="text-gray-300"><strong>Type:</strong> <span className="text-gray-200">{enrichedData.projectType || 'Unknown'}</span></p>
                        {enrichedData.language && <p className="text-gray-300"><strong>Language:</strong> <span className="text-gray-200">{enrichedData.language}</span></p>}
                        {enrichedData.techStack && enrichedData.techStack.length > 0 && (
                            <p className="text-gray-300"><strong>Stack:</strong> <span className="text-gray-200">{enrichedData.techStack.join(', ')}</span></p>
                        )}
                    </DashboardCard>

                    {/* AI Insights Card: Conditionally rendered based on data availability or loading state */}
                    {enrichedData.aiInsights && enrichedData.aiInsights.length > 0 ? (
                        <AIInsightsCard insights={enrichedData.aiInsights} onActionClick={onActionClick} />
                    ) : isLoading ? (
                        <DashboardCardSkeleton count={4} />
                    ) : (
                        <DashboardCard title="AI Insights" icon={<Icon name="lightbulb" size={18} className="text-pink-400 flex-shrink-0" />}>
                            <p>No specific insights available at this time from Gemini.</p>
                        </DashboardCard>
                    )}
                </div>

                {/* Column 2: Key Files, Recent Activity */}
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Key Files" icon={<Icon name="fileText" size={18} className="text-green-400 flex-shrink-0" />}>
                        <div className="max-h-64 overflow-y-auto pr-2">
                            {enrichedData.keyFiles.length > 0 ? (
                                enrichedData.keyFiles.map(file => (
                                    <div key={file.fileName}
                                        className="p-2 rounded-md hover:bg-gray-700 cursor-pointer flex flex-col transition-colors duration-150"
                                        onClick={() => onFileClick(file.fileName)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Open file: ${file.fileName}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onFileClick(file.fileName);
                                            }
                                        }}
                                    >
                                        <p className="font-semibold font-mono text-gray-200 truncate">{file.fileName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{file.reason}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No key files identified for this project.</p>
                            )}
                        </div>
                    </DashboardCard>

                    {/* Recent Activity Card: Conditionally rendered */}
                    {enrichedData.recentActivity && enrichedData.recentActivity.length > 0 ? (
                        <RecentActivityCard activity={enrichedData.recentActivity} onFileClick={onFileClick} onActionClick={onActionClick} />
                    ) : isLoading ? (
                        <DashboardCardSkeleton count={5} />
                    ) : (
                        <DashboardCard title="Recent Activity" icon={<Icon name="activity" size={18} className="text-teal-400 flex-shrink-0" />}>
                            <p>No recent activity recorded for this project.</p>
                        </DashboardCard>
                    )}
                </div>

                {/* Column 3: Suggested Actions, Dependencies */}
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Suggested Actions" icon={<Icon name="sparkles" size={18} className="text-purple-400 flex-shrink-0" />}>
                        <div className="max-h-64 overflow-y-auto pr-2">
                            {enrichedData.suggestedActions.length > 0 ? (
                                enrichedData.suggestedActions.map(action => (
                                    <CommandActionItem key={action.action} label={action.action} command={action.command} onActionClick={onActionClick} />
                                ))
                            ) : (
                                <p>No specific actions suggested at this time by Gemini.</p>
                            )}
                        </div>
                    </DashboardCard>

                    {/* Project Dependencies Card: Conditionally rendered */}
                    {enrichedData.dependencies && enrichedData.dependencies.length > 0 ? (
                        <ProjectDependenciesCard dependencies={enrichedData.dependencies} />
                    ) : isLoading ? (
                        <DashboardCardSkeleton count={6} />
                    ) : (
                        <DashboardCard title="Project Dependencies" icon={<Icon name="box" size={18} className="text-indigo-400 flex-shrink-0" />}>
                            <p>No project dependencies identified.</p>
                        </DashboardCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;