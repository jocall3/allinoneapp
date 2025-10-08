// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @fileoverview The Transparency Log for the Alchemy Ethics Blueprint.
 * Provides a secure, auditable trail of all significant AI actions using a cryptographic chain.
 * This file has been significantly enhanced to include advanced querying, reporting,
 * export functionalities, and an integrity monitoring mechanism, adhering to
 * high-quality software engineering standards.
 */

/**
 * Defines the structure of a single entry in the Transparency Log.
 * Each entry is cryptographically linked to the previous one, forming an immutable chain.
 */
export interface LogEntry {
    timestamp: string;
    action: string;
    details: Record<string, any>;
    initiatorId?: string; // Identifier for the entity (user, AI model, system component) that initiated the action.
    componentId?: string; // Identifier for the specific AI component or module involved in the action.
    severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'AUDIT'; // The perceived severity of the logged action.
    previousHash: string; // Cryptographic hash of the previous log entry, ensuring chain integrity.
    hash: string;         // Cryptographic hash of the current log entry.
}

/**
 * Options for querying the Transparency Log, allowing for flexible retrieval of log entries.
 */
export interface LogQueryOptions {
    action?: string;
    initiatorId?: string;
    componentId?: string;
    severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'AUDIT';
    startDate?: Date; // Entries after or at this date.
    endDate?: Date;   // Entries before or at this date.
    limit?: number;   // Maximum number of entries to return.
    offset?: number;  // Number of entries to skip from the beginning of the filtered set.
}

/**
 * Summary statistics and integrity status of an audit report.
 */
export interface AuditSummary {
    totalEntries: number;
    actionsCount: { [action: string]: number }; // Count of each unique action type.
    severityCount: { [severity: string]: number }; // Count of entries by severity level.
    firstEntryTimestamp?: string; // Timestamp of the oldest entry in the report.
    lastEntryTimestamp?: string;  // Timestamp of the newest entry in the report.
    integrityStatus: boolean;     // True if the log chain is verified as intact, false otherwise.
    potentialAnomalies?: string[]; // A list of detected anomalies or suspicious patterns.
}

/**
 * Represents a comprehensive audit report generated from the Transparency Log.
 */
export interface LogReport {
    reportId: string;   // Unique identifier for this specific report.
    generatedAt: string; // Timestamp when the report was generated.
    summary: AuditSummary; // High-level summary of the log data and integrity.
    filteredEntries?: LogEntry[]; // Optional: actual log entries included in the report, if requested.
}

/**
 * Type definition for a callback function used to listen for new log entries.
 */
export type LogEventListener = (entry: LogEntry) => void;

/**
 * Manages an immutable, cryptographically secured transparency log for AI actions.
 * Each action is hashed and linked, providing an auditable trail.
 */
export class TransparencyLog {
    private logChain: LogEntry[] = [];
    private readonly GENESIS_HASH = '0'.repeat(64); // 64 zero characters for SHA-256 for the first entry.
    private listeners: LogEventListener[] = []; // Internal list of subscribers for new log entries.

    constructor() {
        console.log("TransparencyLog Initialized.");
    }

    /**
     * Registers a listener function to be called whenever a new log entry is added.
     * @param listener The callback function to invoke with the new LogEntry.
     * @returns A function to unsubscribe the listener.
     */
    public onLogEntry(listener: LogEventListener): () => void {
        this.listeners.push(listener);
        console.log(`[TransparencyLog] Listener registered. Total listeners: ${this.listeners.length}`);
        // Return an unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
            console.log(`[TransparencyLog] Listener unsubscribed. Total listeners: ${this.listeners.length}`);
        };
    }

    /**
     * Emits a new log entry to all registered listeners.
     * @param entry The LogEntry to emit.
     */
    private emitLogEntry(entry: LogEntry): void {
        this.listeners.forEach(listener => {
            try {
                listener(entry);
            } catch (error) {
                console.error("[TransparencyLog] Error emitting log event to listener:", error);
            }
        });
    }

    /**
     * Logs a significant AI action, linking it to the previous action with detailed context.
     * Automatically calculates hash and updates the log chain.
     * @param action A string describing the action (e.g., 'MODEL_INFERENCE', 'REQUEST_DATA_ACCESS').
     * @param details A JSON-serializable object with specific context about the action.
     * @param initiatorId Optional: Identifier for who or what initiated this action.
     * @param componentId Optional: Identifier for the specific component involved.
     * @param severity Optional: The severity level of this log entry (default 'INFO').
     */
    public async logAction(
        action: string,
        details: Record<string, any>,
        initiatorId?: string,
        componentId?: string,
        severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'AUDIT' = 'INFO'
    ): Promise<void> {
        const timestamp = new Date().toISOString();
        const previousHash = this.getLastHash();

        const entryToHash: Omit<LogEntry, 'hash'> = {
            timestamp,
            action,
            details,
            initiatorId,
            componentId,
            severity,
            previousHash,
        };

        const hash = await this.calculateHash(entryToHash);

        const newEntry: LogEntry = { ...entryToHash, hash };

        this.logChain.push(newEntry);
        console.log(`[TransparencyLog] Logged action (${severity}): "${action}" by "${initiatorId || 'N/A'}" (Component: ${componentId || 'N/A'})`);
        this.emitLogEntry(newEntry); // Notify listeners of the new entry
    }

    /**
     * Retrieves the entire audit log chain.
     * @returns A deep copy of the array of all log entries to prevent external mutation.
     */
    public getLog(): LogEntry[] {
        return JSON.parse(JSON.stringify(this.logChain));
    }

    /**
     * Queries the log chain based on provided options, allowing for filtered and paginated results.
     * @param options Criteria for filtering, limiting, and offsetting log entries.
     * @returns A deep copy of the array of log entries matching the criteria.
     */
    public queryLog(options: LogQueryOptions): LogEntry[] {
        let results = this.logChain;

        if (options.action) {
            results = results.filter(entry => entry.action === options.action);
        }
        if (options.initiatorId) {
            results = results.filter(entry => entry.initiatorId === options.initiatorId);
        }
        if (options.componentId) {
            results = results.filter(entry => entry.componentId === options.componentId);
        }
        if (options.severity) {
            results = results.filter(entry => entry.severity === options.severity);
        }
        if (options.startDate) {
            const startTimestamp = options.startDate.toISOString();
            results = results.filter(entry => entry.timestamp >= startTimestamp);
        }
        if (options.endDate) {
            const endTimestamp = options.endDate.toISOString();
            results = results.filter(entry => entry.timestamp <= endTimestamp);
        }

        // Apply offset and limit for pagination
        if (options.offset) {
            results = results.slice(options.offset);
        }
        if (options.limit) {
            results = results.slice(0, options.limit);
        }

        console.log(`[TransparencyLog] Queried log with options: ${JSON.stringify(options)}. Found ${results.length} entries.`);
        return JSON.parse(JSON.stringify(results)); // Deep copy
    }

    /**
     * Convenience method to get log entries by a specific action.
     * @param action The action string to filter by.
     * @returns Filtered log entries.
     */
    public getLogEntriesByAction(action: string): LogEntry[] {
        return this.queryLog({ action });
    }

    /**
     * Convenience method to get log entries by a specific initiator ID.
     * @param initiatorId The initiator ID to filter by.
     * @returns Filtered log entries.
     */
    public getLogEntriesByInitiator(initiatorId: string): LogEntry[] {
        return this.queryLog({ initiatorId });
    }

    /**
     * Convenience method to get log entries by a specific component ID.
     * @param componentId The component ID to filter by.
     * @returns Filtered log entries.
     */
    public getLogEntriesByComponent(componentId: string): LogEntry[] {
        return this.queryLog({ componentId });
    }

    /**
     * Convenience method to get log entries within a specific time range.
     * @param start The start date of the range (inclusive).
     * @param end The end date of the range (inclusive).
     * @returns Filtered log entries.
     */
    public getLogEntriesInTimeRange(start: Date, end: Date): LogEntry[] {
        return this.queryLog({ startDate: start, endDate: end });
    }

    /**
     * Verifies the cryptographic integrity of the entire log chain.
     * Checks if each entry's `previousHash` matches the actual hash of the preceding entry,
     * and if each entry's `hash` is correctly calculated from its own data.
     * @returns A promise that resolves to true if the chain is valid, false otherwise.
     */
    public async verifyChain(): Promise<boolean> {
        if (this.logChain.length === 0) {
            console.log("[TransparencyLog] Chain is empty, considered valid by default.");
            return true;
        }

        for (let i = 0; i < this.logChain.length; i++) {
            const entry = this.logChain[i];
            const expectedPreviousHash = i === 0 ? this.GENESIS_HASH : this.logChain[i - 1].hash;

            // 1. Verify previousHash linkage
            if (entry.previousHash !== expectedPreviousHash) {
                console.error(`[TransparencyLog] Chain integrity check FAILED at entry ${i}. ` +
                              `Previous hash mismatch: expected '${expectedPreviousHash}', got '${entry.previousHash}'.`);
                return false;
            }

            // 2. Verify current entry's hash
            const { hash, ...dataToVerify } = entry; // Exclude the hash itself from the data to be hashed
            const calculatedHash = await this.calculateHash(dataToVerify);

            if (hash !== calculatedHash) {
                console.error(`[TransparencyLog] Chain integrity check FAILED at entry ${i}. ` +
                              `Hash recalculation mismatch: stored '${hash}', calculated '${calculatedHash}'.`);
                return false;
            }
        }
        console.log("[TransparencyLog] Chain integrity verified successfully.");
        return true;
    }

    /**
     * Generates a comprehensive audit report based on the log entries.
     * Includes summary statistics, integrity status, and optionally the filtered log entries themselves.
     * @param options Optional query options to filter which entries are included in the report.
     * @param includeEntries Optional: If true, includes the actual filtered log entries in the report.
     * @returns A promise that resolves to a LogReport object.
     */
    public async generateAuditReport(options?: LogQueryOptions, includeEntries: boolean = false): Promise<LogReport> {
        // Use crypto.randomUUID for robust ID generation, with a fallback for older environments
        const reportId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const generatedAt = new Date().toISOString();

        const entriesToReport = options ? this.queryLog(options) : this.getLog();
        const integrityStatus = await this.verifyChain();

        // Calculate summary statistics
        const actionsCount: { [action: string]: number } = {};
        const severityCount: { [severity: string]: number } = {};
        entriesToReport.forEach(entry => {
            actionsCount[entry.action] = (actionsCount[entry.action] || 0) + 1;
            if (entry.severity) {
                severityCount[entry.severity] = (severityCount[entry.severity] || 0) + 1;
            }
        });

        const summary: AuditSummary = {
            totalEntries: entriesToReport.length,
            actionsCount,
            severityCount,
            firstEntryTimestamp: entriesToReport.length > 0 ? entriesToReport[0].timestamp : undefined,
            lastEntryTimestamp: entriesToReport.length > 0 ? entriesToReport[entriesToReport.length - 1].timestamp : undefined,
            integrityStatus,
            potentialAnomalies: this.detectAnomalies(entriesToReport)
        };

        const report: LogReport = {
            reportId,
            generatedAt,
            summary,
            ...(includeEntries && { filteredEntries: entriesToReport }) // Conditionally add entries
        };

        console.log(`[TransparencyLog] Generated Audit Report ID: ${report.reportId}. Integrity status: ${integrityStatus}. Anomalies: ${summary.potentialAnomalies?.length || 0}.`);
        return report;
    }

    /**
     * Exports log entries in a specified format (JSON or CSV).
     * @param format The desired export format ('json' or 'csv').
     * @param options Optional query options to filter which entries are exported.
     * @returns A promise that resolves to a string containing the exported data.
     */
    public async exportLog(format: 'json' | 'csv' = 'json', options?: LogQueryOptions): Promise<string> {
        const entriesToExport = options ? this.queryLog(options) : this.getLog();

        if (format === 'json') {
            return JSON.stringify(entriesToExport, null, 2); // Pretty print JSON
        } else if (format === 'csv') {
            if (entriesToExport.length === 0) {
                return "No entries to export.";
            }

            // Dynamically collect all possible keys from all entries to ensure a complete header
            const allKeys = new Set<string>();
            entriesToExport.forEach(entry => {
                Object.keys(entry).forEach(key => allKeys.add(key));
            });
            const headers = Array.from(allKeys).sort().join(','); // Sort headers for consistent order

            const rows = entriesToExport.map(entry => {
                const values = Array.from(allKeys).sort().map(key => { // Ensure consistent order for values
                    let value = (entry as any)[key];
                    if (value === undefined || value === null) {
                        return ''; // Represent undefined/null as empty string in CSV
                    }
                    if (typeof value === 'object') {
                        // Stringify objects and escape internal quotes
                        value = JSON.stringify(value).replace(/"/g, '""');
                        return `"${value}"`; // Always quote complex objects
                    }
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        // Quote strings that contain special CSV characters
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return String(value); // Convert other types to string
                });
                return values.join(',');
            });

            console.log(`[TransparencyLog] Exported ${entriesToExport.length} entries to CSV.`);
            return [headers, ...rows].join('\n');
        }
        throw new Error(`[TransparencyLog] Unsupported export format: ${format}. Only 'json' and 'csv' are supported.`);
    }

    /**
     * Retrieves the hash of the last entry in the log chain.
     * Returns the genesis hash if the chain is empty.
     * @returns The hash of the last log entry or the genesis hash.
     */
    private getLastHash(): string {
        return this.logChain.length > 0 ? this.logChain[this.logChain.length - 1].hash : this.GENESIS_HASH;
    }

    /**
     * Calculates the SHA-256 hash for a given log entry's data.
     * @param data The log entry data (excluding its own hash) to be hashed.
     * @returns A promise that resolves to the SHA-256 hash as a hexadecimal string.
     */
    private async calculateHash(data: Omit<LogEntry, 'hash'>): Promise<string> {
        // Ensure consistent stringification for hashing
        const entryString = JSON.stringify(data, Object.keys(data).sort()); // Sort keys for deterministic JSON string
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(entryString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Internal method to detect potential anomalies within a set of log entries.
     * @param entries The log entries to analyze for anomalies.
     * @returns A list of strings describing detected anomalies.
     */
    private detectAnomalies(entries: LogEntry[]): string[] {
        const anomalies: string[] = [];
        if (entries.length < 2) return anomalies;

        // Anomaly 1: Rapid Logging - many entries in a very short time
        const RAPID_LOGGING_THRESHOLD_COUNT = 10;
        const RAPID_LOGGING_THRESHOLD_MS = 1000; // 1 second
        for (let i = RAPID_LOGGING_THRESHOLD_COUNT - 1; i < entries.length; i++) {
            const firstEntryInWindow = entries[i - (RAPID_LOGGING_THRESHOLD_COUNT - 1)];
            const lastEntryInWindow = entries[i];
            const timeDiff = new Date(lastEntryInWindow.timestamp).getTime() - new Date(firstEntryInWindow.timestamp).getTime();
            if (timeDiff < RAPID_LOGGING_THRESHOLD_MS) {
                anomalies.push(
                    `Rapid logging detected: ${RAPID_LOGGING_THRESHOLD_COUNT} entries logged within ` +
                    `${timeDiff}ms (around ${firstEntryInWindow.timestamp} to ${lastEntryInWindow.timestamp}).`
                );
            }
        }

        // Anomaly 2: High frequency of CRITICAL actions by a single initiator/component
        const CRITICAL_ACTION_THRESHOLD = 5;
        const criticalActionsByInitiator: Record<string, number> = {};
        const criticalActionsByComponent: Record<string, number> = {};

        entries.filter(e => e.severity === 'CRITICAL').forEach(e => {
            if (e.initiatorId) {
                criticalActionsByInitiator[e.initiatorId] = (criticalActionsByInitiator[e.initiatorId] || 0) + 1;
            }
            if (e.componentId) {
                criticalActionsByComponent[e.componentId] = (criticalActionsByComponent[e.componentId] || 0) + 1;
            }
        });

        for (const initiator in criticalActionsByInitiator) {
            if (criticalActionsByInitiator[initiator] > CRITICAL_ACTION_THRESHOLD) {
                anomalies.push(
                    `High frequency (${criticalActionsByInitiator[initiator]}) of CRITICAL actions detected by initiator '${initiator}'.`
                );
            }
        }
        for (const component in criticalActionsByComponent) {
            if (criticalActionsByComponent[component] > CRITICAL_ACTION_THRESHOLD) {
                anomalies.push(
                    `High frequency (${criticalActionsByComponent[component]}) of CRITICAL actions detected for component '${component}'.`
                );
            }
        }

        // Anomaly 3: Specific highly sensitive actions occurring frequently
        // This requires domain knowledge, e.g., 'DATA_BREACH_ALERT' shouldn't happen often.
        const sensitiveActionFrequency: Record<string, number> = {};
        const SENSITIVE_ACTIONS = ['REQUEST_ADMIN_PRIVILEGE', 'DATA_EXPORT_ALL', 'MODEL_RETRAIN_CRITICAL_DATA'];
        entries.filter(e => SENSITIVE_ACTIONS.includes(e.action)).forEach(e => {
            sensitiveActionFrequency[e.action] = (sensitiveActionFrequency[e.action] || 0) + 1;
        });

        for (const actionName in sensitiveActionFrequency) {
            if (sensitiveActionFrequency[actionName] > 2) { // More than 2 times is suspicious for these actions
                anomalies.push(
                    `Unusual frequency (${sensitiveActionFrequency[actionName]} times) of sensitive action '${actionName}' detected.`
                );
            }
        }

        return anomalies;
    }
}

/**
 * A dedicated class to periodically monitor the integrity of a TransparencyLog instance.
 * It provides proactive auditing and can be configured to trigger alerts on failures.
 */
export class LogIntegrityWatcher {
    private readonly log: TransparencyLog;
    private readonly checkIntervalMs: number;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private lastReport: AuditSummary | null = null;

    /**
     * Creates an instance of LogIntegrityWatcher.
     * @param logInstance The TransparencyLog instance to monitor.
     * @param checkIntervalSeconds The interval in seconds at which to perform integrity checks (default: 3600 seconds/1 hour).
     */
    constructor(logInstance: TransparencyLog, checkIntervalSeconds: number = 3600) {
        if (!logInstance) {
            throw new Error("[LogIntegrityWatcher] TransparencyLog instance must be provided.");
        }
        this.log = logInstance;
        this.checkIntervalMs = checkIntervalSeconds * 1000;
        console.log(`[LogIntegrityWatcher] Initialized for TransparencyLog. Check interval: ${checkIntervalSeconds} seconds.`);
    }

    /**
     * Starts the periodic integrity monitoring.
     * If already watching, it will restart the timer.
     */
    public startWatching(): void {
        if (this.intervalId) {
            console.warn("[LogIntegrityWatcher] Already watching. Restarting monitor.");
            this.stopWatching();
        }
        console.log("[LogIntegrityWatcher] Starting periodic integrity watch.");
        this.intervalId = setInterval(() => this.performCheck(), this.checkIntervalMs);
        // Perform an immediate check upon starting
        this.performCheck();
    }

    /**
     * Stops the periodic integrity monitoring.
     */
    public stopWatching(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("[LogIntegrityWatcher] Stopped periodic integrity watch.");
        }
    }

    /**
     * Performs a single integrity check on the Transparency Log.
     * Logs the status and can be extended to trigger external alerts for critical issues.
     */
    private async performCheck(): Promise<void> {
        console.log("[LogIntegrityWatcher] Performing scheduled integrity check...");
        try {
            const report = await this.log.generateAuditReport();
            this.lastReport = report.summary;

            if (!report.summary.integrityStatus) {
                console.error("[LogIntegrityWatcher] CRITICAL ALERT: Transparency Log integrity check FAILED!");
                // Here, integrate with an external alerting system (e.g., Slack, PagerDuty, email)
                // Example: this.alertService.sendCriticalAlert('LOG_INTEGRITY_BREACH', report.summary);
            } else if (report.summary.potentialAnomalies && report.summary.potentialAnomalies.length > 0) {
                console.warn("[LogIntegrityWatcher] WARNING: Anomalies detected in Transparency Log:", report.summary.potentialAnomalies);
                // Example: this.alertService.sendWarningAlert('LOG_ANOMALIES_DETECTED', report.summary.potentialAnomalies);
            } else {
                console.log("[LogIntegrityWatcher] Transparency Log integrity check PASSED successfully.");
            }
        } catch (error) {
            console.error("[LogIntegrityWatcher] Error during integrity check:", error);
            // Example: this.alertService.sendErrorAlert('LOG_WATCHER_ERROR', error);
        }
    }

    /**
     * Retrieves the summary of the last audit report performed by this watcher.
     * @returns The AuditSummary from the most recent check, or null if no check has been performed yet.
     */
    public getLastAuditSummary(): AuditSummary | null {
        return this.lastReport;
    }
}
```