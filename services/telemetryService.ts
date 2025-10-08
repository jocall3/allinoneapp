// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @typedef {object} TelemetryPayload
 * @property {string} [id] - A unique identifier for the event.
 * @property {number} [timestamp] - Unix timestamp when the event occurred.
 * @property {string} [level] - Severity level of the event (e.g., 'info', 'warning', 'error').
 * @property {string} [category] - Category of the event (e.g., 'ui', 'network', 'performance').
 * @property {Record<string, any>} [context] - Additional contextual data.
 * @property {string} [userId] - Current user's identifier.
 * @property {string} [sessionId] - Current session's identifier.
 * @property {string} [appVersion] - Application version.
 * @property {string} [platform] - Platform (e.g., 'web', 'mobile').
 * @property {string} [url] - Current URL if applicable.
 */
interface TelemetryPayload {
    id?: string;
    timestamp?: number;
    level?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    category?: string;
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    appVersion?: string;
    platform?: string;
    url?: string;
    [key: string]: any; // Allow for arbitrary additional properties
}

/**
 * @typedef {object} TelemetryEvent
 * @property {string} name - The name of the event (e.g., 'page_view', 'button_click').
 * @property {TelemetryPayload} payload - The event data.
 */
interface TelemetryEvent {
    name: string;
    payload: TelemetryPayload;
}

/**
 * @typedef {object} TelemetryBreadcrumb
 * @property {string} message - A short message describing the breadcrumb.
 * @property {string} [category] - Category for the breadcrumb (e.g., 'navigation', 'user_action').
 * @property {Record<string, any>} [data] - Additional data associated with the breadcrumb.
 * @property {number} timestamp - Unix timestamp when the breadcrumb was added.
 * @property {string} [level] - Severity level of the breadcrumb.
 */
interface TelemetryBreadcrumb {
    message: string;
    category?: string;
    data?: Record<string, any>;
    timestamp: number;
    level?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
}

/**
 * @typedef {object} TelemetryConfig
 * @property {boolean} [enabled=true] - Whether telemetry logging is active.
 * @property {boolean} [debugMode=false] - If true, logs will be more verbose in console.
 * @property {number} [flushIntervalMs=5000] - How often the event queue should be flushed (in milliseconds). Set to 0 to disable automatic flushing.
 * @property {number} [maxQueueSize=100] - Maximum number of events to queue before forcing a flush.
 * @property {number} [maxBreadcrumbs=20] - Maximum number of breadcrumbs to store.
 * @property {Record<string, any>} [defaultContext={}] - Global context data attached to all events.
 * @property {string} [appVersion='unknown'] - Application version to tag events with.
 * @property {string} [platform='web'] - Platform identifier.
 * @property {boolean} [captureUnhandledErrors=true] - Automatically capture unhandled JS errors.
 * @property {boolean} [captureUnhandledRejections=true] - Automatically capture unhandled promise rejections.
 * @property {string[]} [sensitiveKeys=[]] - List of keys to redact or truncate in payloads.
 * @property {number} [maxStringLength=500] - Maximum string length for truncation in sanitizePayload.
 * @property {number} [truncateToLength=100] - Length to truncate strings to if they exceed maxStringLength.
 */
export interface TelemetryConfig {
    enabled?: boolean;
    debugMode?: boolean;
    flushIntervalMs?: number;
    maxQueueSize?: number;
    maxBreadcrumbs?: number;
    defaultContext?: Record<string, any>;
    appVersion?: string;
    platform?: string;
    captureUnhandledErrors?: boolean;
    captureUnhandledRejections?: boolean;
    sensitiveKeys?: string[];
    maxStringLength?: number;
    truncateToLength?: number;
}

/**
 * @interface TelemetryReporter
 * @description Defines the interface for a telemetry reporter, which sends events to a specific destination.
 */
export interface TelemetryReporter {
    /**
     * Initializes the reporter.
     * @param {TelemetryConfig} config - The telemetry configuration.
     */
    init?(config: TelemetryConfig): void;

    /**
     * Sends a batch of telemetry events.
     * @param {TelemetryEvent[]} events - An array of telemetry events to send.
     * @param {TelemetryBreadcrumb[]} breadcrumbs - Current breadcrumbs to include with relevant events (e.g., errors).
     */
    sendEvents(events: TelemetryEvent[], breadcrumbs: TelemetryBreadcrumb[]): Promise<void> | void;

    /**
     * Disposes of any resources held by the reporter.
     */
    destroy?(): void;
}

/**
 * @class ConsoleReporter
 * @implements {TelemetryReporter}
 * @description A telemetry reporter that logs events to the browser console.
 * Mimics the original file's console logging behavior but in a structured way.
 */
export class ConsoleReporter implements TelemetryReporter {
    private debugMode: boolean = false;
    private maxStringLength: number = 500;
    private truncateToLength: number = 100;
    private sensitiveKeys: string[] = [];

    init(config: TelemetryConfig) {
        this.debugMode = config.debugMode ?? false;
        this.maxStringLength = config.maxStringLength ?? 500;
        this.truncateToLength = config.truncateToLength ?? 100;
        this.sensitiveKeys = config.sensitiveKeys ?? [];
        if (this.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c ConsoleReporter initialized.', 'color: #9333ea; font-weight: bold;', 'color: inherit;', config);
        }
    }

    private sanitizePayloadForConsole(payload: Record<string, any>): Record<string, any> {
        const sanitized: Record<string, any> = {};
        for (const key in payload) {
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
                const value = payload[key];
                if (this.sensitiveKeys.includes(key)) {
                    sanitized[key] = '[REDACTED]';
                } else if (typeof value === 'string' && value.length > this.maxStringLength) {
                    sanitized[key] = `${value.substring(0, this.truncateToLength)}... (truncated)`;
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Recursively sanitize nested objects
                    sanitized[key] = this.sanitizePayloadForConsole(value);
                } else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }

    sendEvents(events: TelemetryEvent[], breadcrumbs: TelemetryBreadcrumb[]): void {
        if (!events || events.length === 0) {
            return;
        }

        events.forEach(event => {
            const sanitizedPayload = this.sanitizePayloadForConsole(event.payload);
            const level = event.payload.level || 'info';
            const logFn = this.getConsoleLogFn(level);
            const headerColor = this.getLogColor(level);
            const headerText = this.getLogHeaderText(level);

            const details = { ...sanitizedPayload };
            if (details.error && details.error instanceof Error) {
                details.error = {
                    message: details.error.message,
                    name: details.error.name,
                    stack: details.error.stack,
                };
            }

            if (level === 'error' || level === 'critical') {
                logFn(
                    `%c[${headerText}]%c ${event.name}`,
                    `color: ${headerColor}; font-weight: bold;`,
                    'color: inherit;',
                    { ...details, breadcrumbs: breadcrumbs }
                );
            } else {
                 logFn(
                    `%c[${headerText}]%c ${event.name}`,
                    `color: ${headerColor}; font-weight: bold;`,
                    'color: inherit;',
                    details
                );
            }
        });
    }

    private getConsoleLogFn(level: TelemetryPayload['level']): (...args: any[]) => void {
        switch (level) {
            case 'error':
            case 'critical':
                return console.error;
            case 'warn':
                return console.warn;
            case 'debug':
                return console.debug;
            case 'info':
            default:
                return console.log;
        }
    }

    private getLogColor(level: TelemetryPayload['level']): string {
        switch (level) {
            case 'error':
            case 'critical':
                return '#ef4444'; // Red
            case 'warn':
                return '#f97316'; // Orange
            case 'debug':
                return '#9333ea'; // Purple
            case 'info':
            default:
                return '#84cc16'; // Green
        }
    }

    private getLogHeaderText(level: TelemetryPayload['level']): string {
        switch (level) {
            case 'error':
            case 'critical':
                return 'TELEMETRY ERROR';
            case 'warn':
                return 'TELEMETRY WARN';
            case 'debug':
                return 'TELEMETRY DEBUG';
            case 'info':
            default:
                return 'TELEMETRY EVENT';
        }
    }
}

/**
 * @class ApiReporter
 * @implements {TelemetryReporter}
 * @description A placeholder reporter to send telemetry events to a backend API.
 * In a real application, this would make network requests.
 */
export class ApiReporter implements TelemetryReporter {
    private endpoint: string = '/api/telemetry';
    private debugMode: boolean = false;

    init(config: TelemetryConfig) {
        // This could be configured via config.defaultContext.telemetryEndpoint or similar
        // For now, it's a fixed endpoint.
        this.debugMode = config.debugMode ?? false;
        if (this.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c ApiReporter initialized.', 'color: #9333ea; font-weight: bold;', 'color: inherit;', { endpoint: this.endpoint, config });
        }
    }

    async sendEvents(events: TelemetryEvent[], breadcrumbs: TelemetryBreadcrumb[]): Promise<void> {
        if (!events || events.length === 0) {
            return;
        }

        // In a real scenario, you might filter events for API, add breadcrumbs only to errors, etc.
        const payload = {
            events: events,
            globalContext: {
                appVersion: events[0]?.payload.appVersion,
                platform: events[0]?.payload.platform,
                userId: events[0]?.payload.userId,
                sessionId: events[0]?.payload.sessionId,
            },
            breadcrumbs: breadcrumbs, // Often only sent with errors, but including for demo
            timestamp: Date.now(),
        };

        if (this.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Sending %d events to API endpoint: %s', 'color: #9333ea; font-weight: bold;', 'color: inherit;', events.length, this.endpoint, payload);
        }

        try {
            // Placeholder for actual fetch/axios call
            // await fetch(this.endpoint, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(payload),
            // });
             if (this.debugMode) {
                 console.debug('%c[TELEMETRY DEBUG]%c ApiReporter: Events successfully sent (mocked).', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
             }
        } catch (error) {
            console.error('%c[TELEMETRY ERROR]%c Failed to send telemetry events to API:', 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
        }
    }
}


/**
 * @class LocalStorageReporter
 * @implements {TelemetryReporter}
 * @description A reporter that stores telemetry events in local storage, useful for offline scenarios
 * or as a backup before sending to API.
 */
export class LocalStorageReporter implements TelemetryReporter {
    private readonly STORAGE_KEY = 'telemetry_event_queue';
    private debugMode: boolean = false;
    private maxQueueSize: number = 100;

    init(config: TelemetryConfig) {
        this.debugMode = config.debugMode ?? false;
        this.maxQueueSize = config.maxQueueSize ?? 100;
         if (this.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c LocalStorageReporter initialized.', 'color: #9333ea; font-weight: bold;', 'color: inherit;', config);
        }
    }

    async sendEvents(events: TelemetryEvent[], breadcrumbs: TelemetryBreadcrumb[]): Promise<void> {
        if (!events || events.length === 0) {
            return;
        }

        try {
            const storedEventsStr = localStorage.getItem(this.STORAGE_KEY);
            let storedEvents: { event: TelemetryEvent, breadcrumbs: TelemetryBreadcrumb[] }[] = storedEventsStr ? JSON.parse(storedEventsStr) : [];

            const eventsToStore = events.map(event => ({ event, breadcrumbs }));
            storedEvents.push(...eventsToStore);

            // Cap the size of the stored queue
            if (storedEvents.length > this.maxQueueSize * 2) { // Allow buffer before truncation
                storedEvents = storedEvents.slice(storedEvents.length - this.maxQueueSize);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedEvents));
            if (this.debugMode) {
                console.debug('%c[TELEMETRY DEBUG]%c Stored %d events in local storage. Total: %d', 'color: #9333ea; font-weight: bold;', 'color: inherit;', events.length, storedEvents.length);
            }
        } catch (error) {
            console.error('%c[TELEMETRY ERROR]%c Failed to store telemetry events in local storage:', 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
        }
    }

    /**
     * Retrieves all stored events and clears them from local storage.
     * @returns {{ event: TelemetryEvent, breadcrumbs: TelemetryBreadcrumb[] }[]} The array of stored events.
     */
    retrieveAndClearStoredEvents(): { event: TelemetryEvent, breadcrumbs: TelemetryBreadcrumb[] }[] {
        try {
            const storedEventsStr = localStorage.getItem(this.STORAGE_KEY);
            if (storedEventsStr) {
                localStorage.removeItem(this.STORAGE_KEY);
                const events = JSON.parse(storedEventsStr);
                if (this.debugMode) {
                    console.debug('%c[TELEMETRY DEBUG]%c Retrieved and cleared %d events from local storage.', 'color: #9333ea; font-weight: bold;', 'color: inherit;', events.length);
                }
                return events;
            }
        } catch (error) {
            console.error('%c[TELEMETRY ERROR]%c Failed to retrieve/clear telemetry events from local storage:', 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
        }
        return [];
    }
}

/**
 * @class TelemetryService
 * @description A comprehensive service for capturing, buffering, and reporting application telemetry.
 * It supports multiple reporters, global context, breadcrumbs, and automatic error capturing.
 */
export class TelemetryService {
    private config: Required<TelemetryConfig>;
    private reporters: TelemetryReporter[];
    private _eventQueue: TelemetryEvent[] = [];
    private _breadcrumbs: TelemetryBreadcrumb[] = [];
    private _globalContext: TelemetryPayload = {};
    private _flushIntervalId: ReturnType<typeof setInterval> | null = null;
    private _isInitialized: boolean = false;

    constructor(initialConfig?: TelemetryConfig, reporters?: TelemetryReporter[]) {
        this.config = {
            enabled: true,
            debugMode: false,
            flushIntervalMs: 5000,
            maxQueueSize: 100,
            maxBreadcrumbs: 20,
            defaultContext: {},
            appVersion: 'unknown',
            platform: 'web',
            captureUnhandledErrors: true,
            captureUnhandledRejections: true,
            sensitiveKeys: [],
            maxStringLength: 500,
            truncateToLength: 100,
            ...initialConfig,
        };

        this.reporters = reporters || [new ConsoleReporter()];

        // Initialize reporters with the config
        this.reporters.forEach(reporter => reporter.init?.(this.config));

        this._globalContext = {
            appVersion: this.config.appVersion,
            platform: this.config.platform,
            ...this.config.defaultContext,
        };

        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c TelemetryService instantiated with config:', 'color: #9333ea; font-weight: bold;', 'color: inherit;', this.config);
        }
    }

    /**
     * Initializes the telemetry service, starting the flush interval and setting up global error handlers.
     */
    public init(): void {
        if (this._isInitialized) {
            if (this.config.debugMode) {
                console.warn('%c[TELEMETRY DEBUG]%c TelemetryService already initialized.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
            }
            return;
        }

        if (!this.config.enabled) {
            if (this.config.debugMode) {
                console.info('%c[TELEMETRY INFO]%c TelemetryService is disabled by configuration.', 'color: #84cc16; font-weight: bold;', 'color: inherit;');
            }
            this._isInitialized = true;
            return;
        }

        this.startFlushInterval();
        this.setupGlobalErrorHandlers();
        this.retrieveAndFlushLocalStorageEvents(); // Attempt to send any events from previous sessions

        this._isInitialized = true;
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c TelemetryService initialized successfully.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
        }
    }

    /**
     * Cleans up the telemetry service, stopping flush intervals and removing error handlers.
     */
    public destroy(): void {
        if (!this._isInitialized) return;

        this.stopFlushInterval();
        this.removeGlobalErrorHandlers();
        this.flushQueue(true); // Attempt a final flush
        this.reporters.forEach(reporter => reporter.destroy?.());

        this._isInitialized = false;
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c TelemetryService destroyed.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
        }
    }

    /**
     * Updates the telemetry configuration.
     * @param {Partial<TelemetryConfig>} newConfig - Partial configuration to merge.
     */
    public updateConfig(newConfig: Partial<TelemetryConfig>): void {
        const oldEnabled = this.config.enabled;
        const oldFlushInterval = this.config.flushIntervalMs;

        this.config = { ...this.config, ...newConfig };

        // Re-initialize reporters with updated config if necessary
        this.reporters.forEach(reporter => reporter.init?.(this.config));

        if (this.config.enabled && !oldEnabled) {
            this.startFlushInterval();
            this.setupGlobalErrorHandlers();
        } else if (!this.config.enabled && oldEnabled) {
            this.stopFlushInterval();
            this.removeGlobalErrorHandlers();
        } else if (this.config.enabled && this.config.flushIntervalMs !== oldFlushInterval) {
            this.startFlushInterval(); // Restart with new interval
        }

        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c TelemetryService config updated:', 'color: #9333ea; font-weight: bold;', 'color: inherit;', this.config);
        }
    }

    /**
     * Sets global user context information.
     * @param {string} userId - The user's unique identifier.
     * @param {Record<string, any>} [properties] - Additional user properties.
     */
    public setUser(userId: string, properties?: Record<string, any>): void {
        this._globalContext.userId = userId;
        this._globalContext.userProperties = properties;
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c User set:', 'color: #9333ea; font-weight: bold;', 'color: inherit;', { userId, properties });
        }
    }

    /**
     * Clears the current user context.
     */
    public clearUser(): void {
        delete this._globalContext.userId;
        delete this._globalContext.userProperties;
         if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c User context cleared.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
        }
    }

    /**
     * Sets global session context information.
     * @param {string} sessionId - The session's unique identifier.
     * @param {Record<string, any>} [properties] - Additional session properties.
     */
    public setSession(sessionId: string, properties?: Record<string, any>): void {
        this._globalContext.sessionId = sessionId;
        this._globalContext.sessionProperties = properties;
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Session set:', 'color: #9333ea; font-weight: bold;', 'color: inherit;', { sessionId, properties });
        }
    }

    /**
     * Clears the current session context.
     */
    public clearSession(): void {
        delete this._globalContext.sessionId;
        delete this._globalContext.sessionProperties;
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Session context cleared.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
        }
    }

    /**
     * Adds a breadcrumb to the history, useful for debugging error sequences.
     * @param {string} message - A short message for the breadcrumb.
     * @param {string} [category='general'] - Category of the breadcrumb.
     * @param {Record<string, any>} [data] - Additional data.
     * @param {'debug' | 'info' | 'warn' | 'error' | 'critical'} [level='info'] - Severity level.
     */
    public addBreadcrumb(
        message: string,
        category: string = 'general',
        data?: Record<string, any>,
        level: TelemetryBreadcrumb['level'] = 'info'
    ): void {
        if (!this.config.enabled) return;

        const breadcrumb: TelemetryBreadcrumb = {
            message,
            category,
            data: data ? this.sanitizePayload(data) : undefined,
            timestamp: Date.now(),
            level,
        };
        this._breadcrumbs.push(breadcrumb);
        if (this._breadcrumbs.length > this.config.maxBreadcrumbs) {
            this._breadcrumbs.shift(); // Remove the oldest breadcrumb
        }
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Breadcrumb added:', 'color: #9333ea; font-weight: bold;', 'color: inherit;', breadcrumb);
        }
    }

    /**
     * Logs a custom telemetry event.
     * @param {string} eventName - The name of the event.
     * @param {Record<string, any>} [payload={}] - Additional data for the event.
     */
    public logEvent(eventName: string, payload: Record<string, any> = {}): void {
        if (!this.config.enabled) return;

        const combinedPayload: TelemetryPayload = {
            ...this._globalContext,
            ...this.config.defaultContext, // Merge default context configured at init
            ...payload,
            timestamp: Date.now(),
            level: payload.level || 'info',
            id: crypto.randomUUID?.() || Date.now().toString() + Math.random().toString().slice(2),
        };

        this._queueEvent({ name: eventName, payload: combinedPayload });
        this.addBreadcrumb(`Event: ${eventName}`, 'event', combinedPayload, combinedPayload.level);
    }

    /**
     * Logs an error event.
     * @param {Error | string} error - The error object or a string message.
     * @param {Record<string, any>} [context={}] - Additional context for the error.
     */
    public logError(error: Error | string, context: Record<string, any> = {}): void {
        if (!this.config.enabled) return;

        const errorPayload: TelemetryPayload = {
            ...this._globalContext,
            ...this.config.defaultContext,
            ...context,
            level: 'error',
            timestamp: Date.now(),
            id: crypto.randomUUID?.() || Date.now().toString() + Math.random().toString().slice(2),
        };

        if (error instanceof Error) {
            errorPayload.errorMessage = error.message;
            errorPayload.errorName = error.name;
            errorPayload.errorStack = error.stack;
            errorPayload.errorType = 'JavaScriptError';
            errorPayload.error = error; // Keep original error object for reporters if needed
        } else {
            errorPayload.errorMessage = error;
            errorPayload.errorName = 'GenericError';
            errorPayload.errorType = 'StringError';
        }

        this._queueEvent({ name: 'error_occurred', payload: errorPayload });
        this.addBreadcrumb(`Error: ${errorPayload.errorMessage}`, 'error', { ...context, stack: errorPayload.errorStack }, 'error');
    }

    /**
     * Measures the performance of an async operation and logs a performance event.
     * @template T
     * @param {string} metricName - The name of the performance metric.
     * @param {() => Promise<T>} operation - The asynchronous function to measure.
     * @param {Record<string, any>} [payload={}] - Additional data for the performance event.
     * @returns {Promise<T>} The result of the operation.
     */
    public async measurePerformance<T>(
        metricName: string,
        operation: () => Promise<T>,
        payload: Record<string, any> = {}
    ): Promise<T> {
        if (!this.config.enabled) {
            return operation(); // If telemetry is disabled, just run the operation
        }

        const start = performance.now();
        let status = 'success';
        let errorDetails: Record<string, any> | undefined;

        try {
            const result = await operation();
            return result;
        } catch (error: any) {
            status = 'failed';
            errorDetails = {
                message: error.message,
                name: error.name,
                stack: error.stack,
            };
            this.logError(error, {
                ...payload,
                metricName: metricName,
                perfStatus: status,
                category: 'performance_measurement',
            });
            throw error; // Re-throw the error after logging
        } finally {
            const end = performance.now();
            const duration = end - start;

            const perfPayload: TelemetryPayload = {
                ...this._globalContext,
                ...this.config.defaultContext,
                ...payload,
                metricName,
                durationMs: parseFloat(duration.toFixed(2)),
                status,
                error: errorDetails,
                level: status === 'failed' ? 'warn' : 'info',
                timestamp: Date.now(),
                id: crypto.randomUUID?.() || Date.now().toString() + Math.random().toString().slice(2),
            };
            this._queueEvent({ name: 'performance_metric', payload: perfPayload });
            this.addBreadcrumb(`Performance: ${metricName} (${status})`, 'performance', perfPayload, perfPayload.level);
        }
    }

    /**
     * Forcefully flushes the event queue immediately.
     * @param {boolean} [isDestroying=false] - True if flushing during service destruction.
     */
    public flush(isDestroying: boolean = false): void {
        if (!this.config.enabled && !isDestroying) return;
        this.flushQueue(isDestroying);
    }

    // --- Private / Internal Methods ---

    /**
     * Sanitizes a payload by truncating long strings and redacting sensitive keys.
     * This is a utility for internal use before queuing/sending.
     * @param {Record<string, any>} payload - The payload to sanitize.
     * @returns {Record<string, any>} The sanitized payload.
     */
    private sanitizePayload(payload: Record<string, any>): Record<string, any> {
        const sanitized: Record<string, any> = {};
        for (const key in payload) {
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
                const value = payload[key];
                if (this.config.sensitiveKeys.includes(key)) {
                    sanitized[key] = '[REDACTED]';
                } else if (typeof value === 'string' && value.length > this.config.maxStringLength) {
                    sanitized[key] = `${value.substring(0, this.config.truncateToLength)}... (truncated)`;
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Recursively sanitize nested objects
                    sanitized[key] = this.sanitizePayload(value);
                } else if (value instanceof Error) {
                     sanitized[key] = {
                         message: value.message,
                         name: value.name,
                         stack: value.stack,
                     };
                }
                else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }

    private _queueEvent(event: TelemetryEvent): void {
        const sanitizedEvent: TelemetryEvent = {
            ...event,
            payload: this.sanitizePayload(event.payload),
        };

        this._eventQueue.push(sanitizedEvent);
        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Event queued:', 'color: #9333ea; font-weight: bold;', 'color: inherit;', sanitizedEvent);
        }

        if (this._eventQueue.length >= this.config.maxQueueSize) {
            this.flushQueue();
        }
    }

    private async flushQueue(isDestroying: boolean = false): Promise<void> {
        if (this._eventQueue.length === 0) {
            if (this.config.debugMode) {
                console.debug('%c[TELEMETRY DEBUG]%c Flush triggered, but queue is empty.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
            }
            return;
        }

        const eventsToFlush = [...this._eventQueue];
        this._eventQueue = []; // Clear the queue immediately

        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Flushing %d events to reporters.', 'color: #9333ea; font-weight: bold;', 'color: inherit;', eventsToFlush.length);
        }

        const promises = this.reporters.map(reporter => {
            try {
                return reporter.sendEvents(eventsToFlush, this._breadcrumbs);
            } catch (err) {
                console.error('%c[TELEMETRY ERROR]%c Reporter failed to send events:', 'color: #ef4444; font-weight: bold;', 'color: inherit;', reporter, err);
                return Promise.resolve(); // Prevent one reporter failure from blocking others
            }
        });

        await Promise.allSettled(promises);

        if (this.config.debugMode) {
            console.debug('%c[TELEMETRY DEBUG]%c Events flushed and reporters processed.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
        }
    }

    private startFlushInterval(): void {
        this.stopFlushInterval(); // Clear any existing interval first

        if (this.config.enabled && this.config.flushIntervalMs > 0) {
            this._flushIntervalId = setInterval(() => this.flushQueue(), this.config.flushIntervalMs);
            if (this.config.debugMode) {
                console.debug('%c[TELEMETRY DEBUG]%c Automatic flush interval started (every %dms).', 'color: #9333ea; font-weight: bold;', 'color: inherit;', this.config.flushIntervalMs);
            }
        }
    }

    private stopFlushInterval(): void {
        if (this._flushIntervalId) {
            clearInterval(this._flushIntervalId);
            this._flushIntervalId = null;
            if (this.config.debugMode) {
                console.debug('%c[TELEMETRY DEBUG]%c Automatic flush interval stopped.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
            }
        }
    }

    private handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent): void => {
        if (!this.config.enabled) return;

        let error: Error | string;
        let context: Record<string, any> = { source: 'unhandled_exception' };

        if (event instanceof ErrorEvent) {
            error = event.error || new Error(event.message);
            context.filename = event.filename;
            context.lineno = event.lineno;
            context.colno = event.colno;
            context.source = 'window.onerror';
        } else if (event instanceof PromiseRejectionEvent) {
            error = (event.reason instanceof Error) ? event.reason : new Error(String(event.reason));
            context.source = 'unhandledrejection';
            context.reason = String(event.reason); // Capture reason as string for better logging
        } else {
             error = new Error('Unknown unhandled error type');
             context.source = 'unknown_unhandled_error';
        }

        this.logError(error, context);
    };

    private setupGlobalErrorHandlers(): void {
        if (typeof window !== 'undefined') {
            if (this.config.captureUnhandledErrors && !window.onerror) { // Check to avoid overriding if already set
                window.addEventListener('error', this.handleGlobalError);
                if (this.config.debugMode) {
                    console.debug('%c[TELEMETRY DEBUG]%c Global error handler (window.onerror) attached.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
                }
            } else if (this.config.captureUnhandledErrors && this.config.debugMode) {
                console.warn('%c[TELEMETRY DEBUG]%c window.onerror already set. TelemetryService will not override.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
            }

            if (this.config.captureUnhandledRejections && !window.onunhandledrejection) { // Check to avoid overriding
                window.addEventListener('unhandledrejection', this.handleGlobalError);
                 if (this.config.debugMode) {
                    console.debug('%c[TELEMETRY DEBUG]%c Global promise rejection handler (window.onunhandledrejection) attached.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
                }
            } else if (this.config.captureUnhandledRejections && this.config.debugMode) {
                 console.warn('%c[TELEMETRY DEBUG]%c window.onunhandledrejection already set. TelemetryService will not override.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
            }
        }
    }

    private removeGlobalErrorHandlers(): void {
         if (typeof window !== 'undefined') {
            window.removeEventListener('error', this.handleGlobalError);
            window.removeEventListener('unhandledrejection', this.handleGlobalError);
            if (this.config.debugMode) {
                console.debug('%c[TELEMETRY DEBUG]%c Global error handlers removed.', 'color: #9333ea; font-weight: bold;', 'color: inherit;');
            }
        }
    }

    private retrieveAndFlushLocalStorageEvents(): void {
        const localStorageReporter = this.reporters.find(r => r instanceof LocalStorageReporter) as LocalStorageReporter | undefined;
        if (localStorageReporter) {
            const storedEvents = localStorageReporter.retrieveAndClearStoredEvents();
            if (storedEvents.length > 0) {
                // Re-queue these events for immediate flushing via other reporters
                if (this.config.debugMode) {
                    console.debug('%c[TELEMETRY DEBUG]%c Re-queueing %d events from LocalStorage.', 'color: #9333ea; font-weight: bold;', 'color: inherit;', storedEvents.length);
                }
                storedEvents.forEach(item => this._eventQueue.push(item.event)); // Note: breadcrumbs for historical events are often not re-queued
                this.flushQueue();
            }
        }
    }
}

// --- Singleton Instance and Legacy Exports ---
// To maintain backward compatibility and simplify usage, we export a singleton instance
// and wrapper functions that delegate to its methods.

/**
 * The singleton instance of the TelemetryService.
 * Configure it using `telemetryService.init()` and `telemetryService.updateConfig()`.
 * By default, it uses ConsoleReporter and has sensible defaults.
 * Other reporters (e.g., ApiReporter, LocalStorageReporter) can be added during instantiation.
 */
export const telemetryService = new TelemetryService(
    {}, // Default config can be overridden here
    [
        new ConsoleReporter(),
        new ApiReporter(),
        new LocalStorageReporter(),
    ]
);

// Auto-initialize the service if running in a browser environment
if (typeof window !== 'undefined') {
    telemetryService.init();
}


/**
 * @function logEvent
 * @description Logs a custom telemetry event.
 * Delegates to the `telemetryService` singleton.
 * @param {string} eventName - The name of the event.
 * @param {Record<string, any>} [payload={}] - Additional data for the event.
 */
export const logEvent = (eventName: string, payload: Record<string, any> = {}) => {
  telemetryService.logEvent(eventName, payload);
};

/**
 * @function logError
 * @description Logs an error event.
 * Delegates to the `telemetryService` singleton.
 * @param {Error | string} error - The error object or a string message.
 * @param {Record<string, any>} [context={}] - Additional context for the error.
 */
export const logError = (error: Error, context: Record<string, any> = {}) => {
  telemetryService.logError(error, context);
};

/**
 * @function measurePerformance
 * @description Measures the performance of an async operation and logs a performance event.
 * Delegates to the `telemetryService` singleton.
 * @template T
 * @param {string} metricName - The name of the performance metric.
 * @param {() => Promise<T>} operation - The asynchronous function to measure.
 * @returns {Promise<T>} The result of the operation.
 */
export const measurePerformance = async <T>(
  metricName: string,
  operation: () => Promise<T>,
  payload: Record<string, any> = {}
): Promise<T> => {
  return telemetryService.measurePerformance(metricName, operation, payload);
};

// You can also export other useful methods directly from the singleton if desired
// export const setUser = telemetryService.setUser.bind(telemetryService);
// export const setSession = telemetryService.setSession.bind(telemetryService);
// export const addBreadcrumb = telemetryService.addBreadcrumb.bind(telemetryService);
// export const updateTelemetryConfig = telemetryService.updateConfig.bind(telemetryService);