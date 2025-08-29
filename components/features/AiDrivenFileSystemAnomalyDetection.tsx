import React from 'react';
import { ShieldCheckIcon } from '../icons';

export const AiDrivenFileSystemAnomalyDetection: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <ShieldCheckIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                AI File System Anomaly Detection
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This conceptual feature demonstrates how an AI could monitor file system activity for unusual patterns that might indicate security threats, ransomware, or malfunctioning software.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-lg">
                <p className="font-semibold">Example AI Alerts:</p>
                 <ul className="list-disc list-inside text-text-secondary">
                    <li className="text-red-400">"Alert: A high number of files (1,000+) were encrypted in the '/Documents' folder in a short period. This is a potential sign of ransomware."</li>
                    <li className="text-yellow-400">"Warning: The application 'log-generator.exe' is writing to its log file 100 times per second, which is unusually high and may indicate a bug."</li>
                    <li className="text-blue-400">"Info: A large number of files were deleted from the '/Cache' directory, which appears to be a normal cleanup operation."</li>
                </ul>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI. This would require a background service with deep system integration.</p>
        </div>
    );
};
