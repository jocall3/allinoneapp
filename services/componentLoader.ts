// Copyright James Burvel OÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢Callaghan III
// President Citibank Demo Business Inc.

import React, { lazy, Suspense, Component, ReactNode, useCallback, useEffect, useState, useRef } from 'react'; // Added useRef for LazyMount component

/**
 * Configuration options for the retry logic of `lazyWithRetry`.
 */
export interface RetryOptions {
    /** The maximum number of times to retry loading the component. Defaults to 3. */
    maxRetries?: number;
    /** The delay in milliseconds between retries. Defaults to 1000ms. */
    retryDelayMs?: number;
    /**
     * Optional callback function to be called on each retry attempt.
     * @param error The error that occurred during the loading attempt.
     * @param attempt The current retry attempt number (1-indexed).
     */
    onRetry?: (error: Error, attempt: number) => void;
    /**
     * Optional callback function to be called if all retries fail.
     * If not provided, a page reload will be triggered.
     * @param error The final error after all retries.
     */
    onAllRetriesFailed?: (error: Error) => void;
    /**
     * Optional unique version identifier for the component. If provided, and `lazyWithRetry` detects a
     * chunk load error, it might attempt to reload with a cache-busting mechanism specific to this version.
     * Note: Full cache-busting often requires build-time changes (e.g., unique chunk names)
     * but this can be used to inform custom `onAllRetriesFailed` logic.
     */
    componentVersion?: string;
}

/**
 * A wrapper around React.lazy to retry loading a component if it fails.
 * This is useful for handling "chunk load failed" errors that can occur
 * when a user has an old version of the site and a new version is deployed.
 *
 * @param componentImport A function that returns a dynamic import, e.g., () => import('./MyComponent')
 * @param exportName The named export of the component to be loaded.
 * @param retryOptions Optional configuration for retry behavior.
 * @returns A lazy-loaded React component.
 */
export const lazyWithRetry = <T extends React.ComponentType<any>>(
    componentImport: () => Promise<{ [key: string]: T }>,
    exportName: string,
    retryOptions?: RetryOptions
) => {
    const MAX_RETRIES = retryOptions?.maxRetries ?? 3;
    const RETRY_DELAY_MS = retryOptions?.retryDelayMs ?? 1000;

    return lazy(async () => {
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const module = await componentImport();
                if (module[exportName]) {
                    return { default: module[exportName] };
                }
                // This indicates a developer error (e.g., wrong export name), not a chunk load error.
                throw new Error(`Named export '${exportName}' not found in module.`);
            } catch (error: any) {
                console.error(`Component '${exportName}' load failed. Attempt ${i + 1}/${MAX_RETRIES}.`, error);

                retryOptions?.onRetry?.(error, i + 1);

                if (i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                } else {
                    if (retryOptions?.onAllRetriesFailed) {
                        retryOptions.onAllRetriesFailed(error);
                    } else {
                        // Default behavior after all retries fail: force a page reload.
                        // This is effective for stale chunk issues after new deployments.
                        console.error(`Failed to load component '${exportName}' after multiple retries. Reloading page.`);
                        window.location.reload();
                    }
                    // Re-throw the error to allow potential ErrorBoundaries to catch it,
                    // though a page reload will likely pre-empt this.
                    throw error;
                }
            }
        }
        // This line should theoretically not be reached, but included for robustness and type safety.
        throw new Error(`Component '${exportName}' failed to load and retries were exhausted unexpectedly.`);
    });
};

/**
 * Props for a robust Error Boundary component.
 */
export interface ErrorBoundaryProps {
    children: ReactNode;
    /**
     * A fallback UI to render when an error occurs.
     * Can be a ReactNode or a function that receives the error and component stack.
     */
    fallback?: ReactNode | ((error: Error, componentStack: string) => ReactNode);
    /**
     * Callback function invoked when an error is caught. Useful for logging errors to an external service.
     * @param error The error that was caught.
     * @param componentStack The component stack information.
     */
    onError?: (error: Error, componentStack: string, context?: Record<string, any>) => void;
    /** A unique identifier for this boundary instance, useful for distinguishing logs. */
    boundaryName?: string;
    /** Optional context object to be passed to the onError callback, useful for adding extra metadata to logs. */
    context?: Record<string, any>;
}

/**
 * State for the ErrorBoundary component.
 */
export interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: { componentStack: string } | null;
}

/**
 * Configuration for a global error reporter, to be used with `ErrorReporterProvider`.
 */
export interface GlobalErrorReporterConfig {
    /**
     * The primary function to call when an error is caught by any `ErrorBoundary` that
     * consumes this context. This takes precedence over individual `onError` props.
     * @param error The error object.
     * @param componentStack The component stack string.
     * @param context Additional metadata provided by the `ErrorBoundary` or its `props.context`.
     */
    reportError: (error: Error, componentStack: string, context?: Record<string, any>) => void;
    /**
     * Optional function to transform or filter errors before reporting.
     * Return `false` to prevent reporting.
     */
    shouldReportError?: (error: Error, componentStack: string, context?: Record<string, any>) => boolean;
    /**
     * Optional additional context that will be merged with the ErrorBoundary's context
     * before reporting.
     */
    globalContext?: Record<string, any>;
}

/**
 * React Context for global error reporting. Provides a way to centralize error reporting logic.
 */
export const ErrorReporterContext = React.createContext<GlobalErrorReporterConfig | undefined>(undefined);

/**
 * A React Provider component that makes a global error reporting configuration available
 * to all descendant `ErrorBoundary` components.
 *
 * @param props.config The configuration for the global error reporter.
 * @param props.children The children components to be rendered within the context.
 *
 * @example
 * <ErrorReporterProvider config={{ reportError: (err, stack, ctx) => myTelemetryService.logError(err, stack, ctx) }}>
 *   <AppRouter />
 * </ErrorReporterProvider>
 */
export const ErrorReporterProvider: React.FC<{ config: GlobalErrorReporterConfig; children: ReactNode }> = ({ config, children }) => {
    return (
        <ErrorReporterContext.Provider value={config}>
            {children}
        </ErrorReporterContext.Provider>
    );
};

/**
 * A React hook to access the global error reporting configuration.
 * @returns The `GlobalErrorReporterConfig` or `undefined` if no provider is in scope.
 */
export function useErrorReporter(): GlobalErrorReporterConfig | undefined {
    return React.useContext(ErrorReporterContext);
}

/**
 * A robust Error Boundary component to catch JavaScript errors anywhere in its child component tree,
 * log those errors, and display a fallback UI. This prevents the entire application from crashing.
 *
 * It can also be configured to report errors to an external logging service via the `onError` prop,
 * or globally via `ErrorReporterProvider`.
 *
 * @example
 * <ErrorBoundary fallback={<p>Something went wrong!</p>} onError={(error, stack) => myLogger.log('Caught error:', error, stack)}>
 *   <MyPotentiallyBuggyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    // Add contextType to consume ErrorReporterContext
    public static contextType = ErrorReporterContext;
    public context!: React.ContextType<typeof ErrorReporterContext>;

    public state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    /**
     * This static lifecycle method is called after an error has been thrown by a descendant component.
     * It receives the error that was thrown as a parameter.
     * Use it to update state so the next render will show the fallback UI.
     */
    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error, errorInfo: null }; // errorInfo populated by componentDidCatch
    }

    /**
     * This lifecycle method is called after an error has been thrown by a descendant component.
     * It receives two parameters: the error and an object with `componentStack` key.
     * Use it for side-effects like error logging.
     */
    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo }); // Update state with component stack

        const logMessage = `ErrorBoundary: Caught an error in ${this.props.boundaryName || 'unnamed boundary'}.`;
        console.error(logMessage, error, errorInfo, { context: this.props.context });

        // Report error to the global reporter if available
        const globalReporter = this.context;
        if (globalReporter?.reportError) {
            const mergedContext = { ...globalReporter.globalContext, ...this.props.context, boundaryName: this.props.boundaryName };
            if (globalReporter.shouldReportError ? globalReporter.shouldReportError(error, errorInfo.componentStack, mergedContext) : true) {
                globalReporter.reportError(error, errorInfo.componentStack, mergedContext);
            }
        }

        // Also call the individual onError prop if provided (allows local logging in addition to global)
        if (this.props.onError) {
            this.props.onError(error, errorInfo.componentStack, this.props.context);
        }

        // Example: Integrate with a global error logging service if available
        // (window as any).globalErrorLogger?.report(error, errorInfo, { context: this.props.boundaryName, ...this.props.context });
    }

    public render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    // Pass the actual error and stack to the fallback function
                    return this.props.fallback(this.state.error!, this.state.errorInfo?.componentStack || '');
                }
                return this.props.fallback;
            }
            // Default fallback if no custom one is provided
            return (
                <div style={{ padding: '20px', border: '1px solid red', color: 'red', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                    <h3>Application Error</h3>
                    <p>We're sorry, an unexpected error occurred. Please try refreshing the page or contact support.</p>
                    {/* Display error details only in development for debugging */}
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '0.85em' }}>
                            <summary>Error Details</summary>
                            <p>{this.state.error && this.state.error.toString()}</p>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Options for `createRobustLazyComponent`, combining retry and error boundary configurations.
 */
export interface RobustLazyComponentOptions extends RetryOptions, Partial<Omit<ErrorBoundaryProps, 'children'>> {
    /** The fallback UI to display specifically while the component is loading via Suspense. */
    loadingFallback?: ReactNode;
    /** The fallback UI to display when a runtime error occurs. This overrides the default `ErrorBoundary` fallback.
     * Can be a ReactNode or a function that receives the error and component stack.
     */
    errorFallback?: ReactNode | ((error: Error, componentStack: string) => ReactNode);
    /** An optional unique key for the component, useful for preloading. */
    componentKey?: string;
}

/**
 * Creates a robustly loaded component that combines `lazyWithRetry`, `React.Suspense`, and `ErrorBoundary`.
 * This is the recommended way to load dynamic components in the application, providing resilience
 * against network failures, chunk load errors, and runtime component errors.
 *
 * @param componentImport A function that returns a dynamic import, e.g., () => import('./MyComponent')
 * @param exportName The named export of the component to be loaded.
 * @param options Configuration options for fallback, error boundary, and retry logic.
 * @returns A React component ready for rendering, with built-in loading and error handling.
 *
 * @example
 * const DashboardComponent = createRobustLazyComponent(
 *   () => import('./Dashboard'),
 *   'Dashboard',
 *   {
 *     loadingFallback: <div>Loading Dashboard...</div>,
 *     errorFallback: <ErrorCard component="Dashboard" />,
 *     boundaryName: 'DashboardPageError',
 *     onError: (error, stack) => console.log('Dashboard error:', error, stack),
 *     maxRetries: 5,
 *     componentKey: 'DashboardPage'
 *   }
 * );
 *
 * // Usage in a parent component:
 * <DashboardComponent userId="123" />
 */
export function createRobustLazyComponent<T extends React.ComponentType<any>>(
    componentImport: () => Promise<{ [key: string]: T }>,
    exportName: string,
    options?: RobustLazyComponentOptions
): React.ComponentType<React.ComponentProps<T>> {
    const defaultOptions: RobustLazyComponentOptions = {
        loadingFallback: null,
        errorFallback: null,
        boundaryName: `LazyComponentErrorBoundary-${exportName}`,
        ...options,
    };

    // Override the onAllRetriesFailed default to provide a more controlled error path if not specified
    const finalOnAllRetriesFailed = defaultOptions.onAllRetriesFailed || ((error) => {
        console.error(`Final loading failure for component '${exportName}'. Consider implementing a global error screen or specific fallback.`);
        // For scenarios where the root chunk fails, a reload is often the only path.
        // For individual components, more graceful error handling might be desired.
        // As a robust default, we still trigger reload if no specific handler is provided.
        window.location.reload();
    });

    const LazyComponent = lazyWithRetry(componentImport, exportName, {
        maxRetries: defaultOptions.maxRetries,
        retryDelayMs: defaultOptions.retryDelayMs,
        onRetry: defaultOptions.onRetry,
        onAllRetriesFailed: finalOnAllRetriesFailed,
        componentVersion: defaultOptions.componentVersion,
    });

    const RobustWrapper = (props: React.ComponentProps<T>) => {
        const errorBoundaryProps: ErrorBoundaryProps = {
            fallback: defaultOptions.errorFallback || defaultOptions.loadingFallback, // Prefer error-specific fallback, then loading fallback
            onError: defaultOptions.onError,
            boundaryName: defaultOptions.boundaryName,
            context: { componentKey: defaultOptions.componentKey, exportName, ...defaultOptions.context },
        };

        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Suspense fallback={defaultOptions.loadingFallback}>
                    <LazyComponent {...props} />
                </Suspense>
            </ErrorBoundary>
        );
    };

    RobustWrapper.displayName = `RobustLazyComponent(${exportName})`;
    return RobustWrapper;
}

/**
 * Global state for tracking multiple asynchronous loading operations.
 */
export interface GlobalLoadingState {
    /** A map of active loading keys to their start timestamps. */
    activeLoadings: Map<string, number>;
    /** Function to register a loading process. */
    startLoading: (key: string) => void;
    /** Function to unregister a loading process. */
    stopLoading: (key: string) => void;
    /** True if any loading process is active. */
    isLoading: boolean;
}

/**
 * React Context for global loading state.
 * Provides a way to centralize loading indicators across an application.
 */
export const LoadingContext = React.createContext<GlobalLoadingState>({
    activeLoadings: new Map(),
    startLoading: () => {},
    stopLoading: () => {},
    isLoading: false,
});

/**
 * A Provider component for managing and exposing a global loading state.
 * This allows multiple components to register their loading status, and a
 * global UI to react (e.g., show a loading spinner/progress bar).
 *
 * @example
 * <LoadingProvider>
 *   <GlobalSpinner /> // This component can consume `useLoadingState`
 *   <AppContent />
 * </LoadingProvider>
 */
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeLoadings, setActiveLoadings] = useState<Map<string, number>>(new Map());

    const startLoading = useCallback((key: string) => {
        setActiveLoadings(prev => {
            const newMap = new Map(prev);
            newMap.set(key, Date.now());
            return newMap;
        });
    }, []);

    const stopLoading = useCallback((key: string) => {
        setActiveLoadings(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    }, []);

    const isLoading = activeLoadings.size > 0;

    const contextValue = { activeLoadings, startLoading, stopLoading, isLoading };

    return (
        <LoadingContext.Provider value={contextValue}>
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * A React hook to access the global loading state and control functions.
 * Use this hook in components that need to indicate loading, or in a global UI
 * to show/hide a loading indicator.
 * @returns The `GlobalLoadingState` object.
 *
 * @example
 * function MyComponent() {
 *   const { startLoading, stopLoading, isLoading } = useLoadingState();
 *
 *   useEffect(() => {
 *     startLoading('myDataFetch');
 *     fetchData().then(() => stopLoading('myDataFetch'));
 *   }, []);
 *
 *   return isLoading ? <p>Loading data...</p> : <p>Data loaded.</p>;
 * }
 */
export function useLoadingState(): GlobalLoadingState {
    return React.useContext(LoadingContext);
}


type ComponentPreloadCache = Map<string, Promise<any>>;
const componentPreloadCache: ComponentPreloadCache = new Map();

/**
 * Preloads a lazy component by initiating its import process.
 * This can improve perceived performance for components that are likely to be used soon,
 * by fetching the component's code bundle in the background before it's actually rendered.
 *
 * @param componentKey A unique identifier for the component to preload.
 * @param componentImport A function that returns a dynamic import, e.g., () => import('./MyComponent')
 * @returns A Promise that resolves when the component module has been loaded.
 *          The promise is cached, so subsequent calls with the same key won't re-initiate the fetch.
 *
 * @example
 * // In an early stage of your application (e.g., after login, or on route hover):
 * preloadComponent('HomePage', () => import('./Home'));
 *
 * // Later, when rendering:
 * const HomePageComponent = createRobustLazyComponent(
 *   () => import('./Home'),
 *   'Home',
 *   { componentKey: 'HomePage', fallback: <LoadingSpinner /> }
 * );
 * <HomePageComponent /> // This will likely render instantly if preloaded successfully.
 */
export function preloadComponent(componentKey: string, componentImport: () => Promise<any>): Promise<any> {
    if (!componentPreloadCache.has(componentKey)) {
        const loadPromise = componentImport();
        componentPreloadCache.set(componentKey, loadPromise);
        // Remove from cache on failure to allow subsequent attempts, or for clearer error state
        loadPromise.catch(error => {
            console.error(`Failed to preload component '${componentKey}':`, error);
            componentPreloadCache.delete(componentKey);
        });
    }
    return componentPreloadCache.get(componentKey)!;
}

/**
 * Preloads a component when it becomes visible in the viewport.
 * Uses Intersection Observer API for efficient background loading.
 *
 * @param componentKey A unique identifier for the component to preload.
 * @param componentImport A function that returns a dynamic import.
 * @returns A React ref that should be attached to the element whose visibility triggers the preload.
 *
 * @example
 * const MyLazyComponent = createRobustLazyComponent(...);
 * const preloadRef = preloadComponentOnVisibility('MyLazyComponent', () => import('./MyLazyComponent'));
 *
 * return (
 *   <div>
 *     <div ref={preloadRef} style={{ minHeight: '100px' }}>
 *       {/* This area triggers preload when visible */}
 *     </div>
 *     <MyLazyComponent />
 *   </div>
 * );
 */
export function preloadComponentOnVisibility(
    componentKey: string,
    componentImport: () => Promise<any>
): React.RefCallback<HTMLElement> {
    const handleRef = useCallback((node: HTMLElement | null) => {
        if (!node) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    preloadComponent(componentKey, componentImport);
                    observer.disconnect(); // Stop observing once preloaded
                }
            });
        }, {
            rootMargin: '200px', // Start preloading 200px before it enters the viewport
            threshold: 0.1, // Trigger when 10% of the element is visible
        });

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [componentKey, componentImport]);

    return handleRef;
}

/**
 * Retrieves a component's import promise from the preload cache, or initiates loading if not present.
 * This function is an alternative to `preloadComponent` when you want to ensure a component
 * is being loaded, but don't strictly need to await the promise at the call site.
 *
 * @param componentKey A unique identifier for the component.
 * @param componentImportFactory A function that returns a dynamic import. This factory is called if the component is not in cache.
 * @returns A Promise that represents the loading of the component.
 */
export function getOrPreloadComponentImport(componentKey: string, componentImportFactory: () => Promise<any>): Promise<any> {
    if (componentPreloadCache.has(componentKey)) {
        return componentPreloadCache.get(componentKey)!;
    }
    return preloadComponent(componentKey, componentImportFactory);
}

/**
 * Represents the schema for a component's props, useful for runtime validation.
 * Can be any object where keys are prop names and values describe validation rules (e.g., Joi schema, Yup schema, or a simple type).
 */
export type ComponentPropsSchema<P extends object = any> = {
    [K in keyof P]?: any; // Define your schema structure here, e.g., Joi.object().keys(...)
};

/**
 * Interface for a registered component entry, including an optional props schema.
 */
interface RegisteredComponentEntry {
    component: React.ComponentType<any>;
    schema?: ComponentPropsSchema;
}

type ExtendedComponentRegistry = Map<string, RegisteredComponentEntry>;
const globalExtendedComponentRegistry: ExtendedComponentRegistry = new Map();

/**
 * Registers a React component (typically one created by `createRobustLazyComponent`) with a unique key.
 * This allows components to be referenced and retrieved by a string identifier,
 * facilitating dynamic component loading and rendering based on configurations,
 * feature flags, or content management systems.
 *
 * @param key The unique string key for the component (e.g., 'DashboardPage', 'ProductCard').
 * @param component The React component to register.
 * @param schema An optional schema to validate the props passed to this component dynamically.
 * @throws {Error} If a component with the same key is already registered, indicating a potential conflict.
 *
 * @example
 * // In an application initialization module:
 * registerComponent('Dashboard', createRobustLazyComponent(() => import('./Dashboard'), 'Dashboard', { loadingFallback: <LoadingSpinner /> }));
 *
 * // With prop validation schema (e.g., using a simple validator function)
 * const dashboardSchema = {
 *   userId: (val: any) => typeof val === 'string' && val.length > 0,
 *   theme: (val: any) => ['light', 'dark'].includes(val),
 * };
 * registerComponent('ValidatedDashboard', createRobustLazyComponent(() => import('./ValidatedDashboard'), 'ValidatedDashboard'), dashboardSchema);
 *
 * // In a dynamic rendering component:
 * const ComponentToRender = getRegisteredComponent(someConfig.componentName);
 * if (ComponentToRender) {
 *   return <ComponentToRender {...someConfig.props} />;
 * } else {
 *   return <div>Error: Component '{someConfig.componentName}' not found.</div>;
 * }
 */
export function registerComponent(key: string, component: React.ComponentType<any>, schema?: ComponentPropsSchema): void {
    if (globalExtendedComponentRegistry.has(key)) {
        throw new Error(`Component with key '${key}' is already registered. Please use a unique key.`);
    }
    globalExtendedComponentRegistry.set(key, { component, schema });
    console.debug(`Component '${key}' registered successfully.`);
}

/**
 * Retrieves a previously registered React component by its key from the global registry.
 *
 * @param key The unique string key of the component (e.g., 'DashboardPage').
 * @returns The registered React component, or `undefined` if no component is found for the given key.
 */
export function getRegisteredComponent(key: string): React.ComponentType<any> | undefined {
    return globalExtendedComponentRegistry.get(key)?.component;
}

/**
 * Retrieves a previously registered React component entry (component and its schema) by its key.
 *
 * @param key The unique string key of the component.
 * @returns The registered component entry, or `undefined`.
 */
export function getRegisteredComponentEntry(key: string): RegisteredComponentEntry | undefined {
    return globalExtendedComponentRegistry.get(key);
}

/**
 * A React hook for dynamically retrieving a registered component.
 *
 * @param componentKey The key of the component to retrieve.
 * @returns The registered React component, or `undefined` if not found.
 */
export function useDynamicComponent(componentKey: string): React.ComponentType<any> | undefined {
    const [component, setComponent] = useState<React.ComponentType<any> | undefined>(undefined);

    useEffect(() => {
        setComponent(getRegisteredComponent(componentKey));
    }, [componentKey]);

    return component;
}

/**
 * A type for defining component configurations, used with `DynamicComponentRenderer`.
 */
export interface ComponentConfig {
    componentKey: string;
    props?: { [key: string]: any };
    /** Optional explicit `fallback` for this specific dynamic render if the component is not found. */
    fallback?: ReactNode;
    /** Optional `errorBoundaryProps` for a dedicated ErrorBoundary wrapping this specific dynamic render. */
    errorBoundaryProps?: Partial<ErrorBoundaryProps>;
    /** If true, and the component is not found, `null` will be returned instead of a warning message. */
    renderNullIfNotFound?: boolean;
}

/**
 * Dynamically loads and renders a component based on a configuration object.
 * This is a higher-level utility that leverages `getRegisteredComponent` and allows
 * for flexible rendering of components and their props based on external data.
 *
 * @param config The configuration object containing `componentKey` and `props`.
 * @param config.componentKey The key of the component to render, as registered via `registerComponent`.
 * @param config.props Optional props to pass to the component.
 * @param options Additional rendering options, e.g., a fallback for unregistered components.
 * @returns The rendered React component or a fallback if not found/configured.
 *
 * @example
 * const componentConfig = {
 *   componentKey: 'Dashboard',
 *   props: { userId: '123', theme: 'dark' }
 * };
 *
 * <DynamicComponentRenderer config={componentConfig} />
 *
 * // With fallback for missing component:
 * <DynamicComponentRenderer
 *   config={{ componentKey: 'NonExistentComponent' }}
 *   options={{ fallback: <div>Component not found!</div> }}
 * />
 *
 * // With explicit null for missing component:
 * <DynamicComponentRenderer
 *   config={{ componentKey: 'NonExistentComponent', renderNullIfNotFound: true }}
 * /> // Renders null
 */
export const DynamicComponentRenderer: React.FC<{
    config: ComponentConfig;
}> = ({ config }) => {
    const componentEntry = getRegisteredComponentEntry(config.componentKey);

    if (!componentEntry || !componentEntry.component) {
        if (config.renderNullIfNotFound) {
            return null;
        }
        console.warn(`Attempted to render unregistered component: '${config.componentKey}'`);
        return (config.fallback || (
            <div style={{ color: 'orange', padding: '10px', border: '1px dashed orange', borderRadius: '4px' }}>
                Warning: Component '{config.componentKey}' not found in registry.
            </div>
        )) as React.ReactElement;
    }

    const ComponentToRender = componentEntry.component;
    let validatedProps = config.props;

    // Perform prop validation if a schema is provided
    if (componentEntry.schema && config.props) {
        try {
            // This is a simple example. In a real app, integrate with a robust validation library (Joi, Yup, Zod).
            // For now, it assumes schema values are simple predicate functions.
            for (const propName in componentEntry.schema) {
                if (Object.prototype.hasOwnProperty.call(componentEntry.schema, propName)) {
                    const validator = componentEntry.schema[propName];
                    if (typeof validator === 'function' && !validator(config.props[propName])) {
                        console.error(`DynamicComponentRenderer: Prop validation failed for component '${config.componentKey}'. Prop '${propName}' is invalid.`, config.props[propName]);
                        // Optionally throw or adjust props. For now, just log.
                    }
                }
            }
        } catch (validationError: any) {
            console.error(`DynamicComponentRenderer: Error during prop validation for component '${config.componentKey}':`, validationError);
            // Decide how to handle validation errors: render an error fallback, filter props, etc.
            // For now, continue with the potentially invalid props or strip them.
            // Example: validatedProps = {}; // Clear props on severe validation failure
        }
    }

    const componentElement = <ComponentToRender {...validatedProps} />;

    // Wrap with an optional ErrorBoundary if specified, for granular error handling.
    if (config.errorBoundaryProps) {
        return (
            <ErrorBoundary
                {...config.errorBoundaryProps}
                boundaryName={config.errorBoundaryProps.boundaryName || `DynamicRendererBoundary-${config.componentKey}`}
                context={{ componentKey: config.componentKey, ...config.errorBoundaryProps.context }}
            >
                {componentElement}
            </ErrorBoundary>
        );
    }

    return componentElement;
};

export interface LazyMountProps {
    /** The content to render. */
    children: ReactNode;
    /**
     * If true, children will be mounted immediately. Useful for toggling lazy behavior.
     * Defaults to false.
     */
    forceMount?: boolean;
    /**
     * Optional component to render while children are not mounted (e.g., a placeholder).
     * Defaults to `null`.
     */
    placeholder?: ReactNode;
    /**
     * Optional delay in milliseconds before mounting children, even after criteria are met.
     * Useful to debounce mounting or ensure smooth transitions. Defaults to 0.
     */
    delayMs?: number;
    /**
     * Options for the Intersection Observer. Only applies if `mountOnVisible` is true.
     */
    intersectionObserverOptions?: IntersectionObserverInit;
    /**
     * If true, children will mount when the component enters the viewport.
     * Defaults to false.
     */
    mountOnVisible?: boolean;
    /**
     * If true, children will mount after the specified `delayMs` has passed since render.
     * Defaults to false.
     */
    mountAfterDelay?: boolean;
}

/**
 * `LazyMount` defers the actual mounting and rendering of its children until
 * certain conditions are met, such as becoming visible in the viewport or after a delay.
 * This can significantly improve initial page load performance and perceived responsiveness
 * by avoiding rendering off-screen or non-critical components immediately.
 *
 * It uses an `IntersectionObserver` when `mountOnVisible` is true to detect visibility.
 * If no `placeholder` is provided with `mountOnVisible`, a minimal invisible `div` is rendered
 * to serve as the observation target.
 *
 * @example
 * // Mounts after 2 seconds
 * <LazyMount mountAfterDelay delayMs={2000} placeholder={<div>Loading content...</div>}>
 *   <HeavyComponent />
 * </LazyMount>
 *
 * @example
 * // Mounts when visible in viewport
 * <LazyMount mountOnVisible placeholder={<div style={{ height: '300px', background: '#f0f0f0' }}>Scroll down to load</div>}>
 *   <ImageGallery />
 * </LazyMount>
 *
 * @example
 * // Combining with `createRobustLazyComponent` for full lazy experience:
 * const LazyDashboard = createRobustLazyComponent(() => import('./Dashboard'), 'Dashboard');
 * <LazyMount mountOnVisible placeholder={<div>Dashboard placeholder</div>}>
 *   <LazyDashboard />
 * </LazyMount>
 */
export const LazyMount: React.FC<LazyMountProps> = ({
    children,
    forceMount = false,
    placeholder = null,
    delayMs = 0,
    intersectionObserverOptions,
    mountOnVisible = false,
    mountAfterDelay = false,
}) => {
    const [shouldMount, setShouldMount] = useState(false);
    const elementRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Effect for mounting after a delay
    useEffect(() => {
        if (forceMount) {
            setShouldMount(true);
            return;
        }

        if (mountAfterDelay && delayMs > 0 && !shouldMount) {
            timeoutRef.current = setTimeout(() => {
                setShouldMount(true);
            }, delayMs);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [forceMount, mountAfterDelay, delayMs, shouldMount]);

    // Effect for mounting on visibility
    useEffect(() => {
        if (forceMount || shouldMount || !mountOnVisible || !elementRef.current) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setShouldMount(true);
                    observer.disconnect();
                }
            });
        }, intersectionObserverOptions);

        observer.observe(elementRef.current);

        return () => {
            // Disconnect observer on component unmount or when dependencies change
            if (observer) {
                observer.disconnect();
            }
        };
    }, [forceMount, shouldMount, mountOnVisible, intersectionObserverOptions]);


    if (shouldMount || forceMount) {
        return <>{children}</>;
    }

    if (mountOnVisible) {
        // Create an observable element. If a placeholder is provided, it's rendered inside.
        // If no placeholder, a minimal invisible div is used for observation.
        const observableElement = (
            <div
                ref={elementRef}
                style={
                    placeholder === null
                        ? { minHeight: '1px', minWidth: '1px', overflow: 'hidden', pointerEvents: 'none' } // Minimal size for observation
                        : {} // Let the placeholder define the visual area
                }
            >
                {placeholder}
            </div>
        );
        return observableElement;
    }

    return <>{placeholder}</>;
};

// Expose a helper to clear the preload cache, primarily for testing or specific reset scenarios.
/**
 * Clears the internal component preload cache.
 * Use with caution, primarily for testing or scenarios where dynamic component re-evaluation is needed.
 */
export function clearComponentPreloadCache(): void {
    componentPreloadCache.clear();
    console.debug("Component preload cache cleared.");
}

// Expose a helper to clear the component registry, primarily for testing or specific reset scenarios.
/**
 * Clears the internal global component registry.
 * Use with caution, primarily for testing or scenarios where dynamic component re-registration is needed.
 */
export function clearComponentRegistry(): void {
    globalExtendedComponentRegistry.clear();
    console.debug("Global component registry cleared.");
}

/**
 * A utility to check if a component with a given key is already registered.
 * @param key The component key to check.
 * @returns `true` if registered, `false` otherwise.
 */
export function isComponentRegistered(key: string): boolean {
    return globalExtendedComponentRegistry.has(key);
}

/**
 * An advanced `useDynamicComponent` hook that also returns the component's schema.
 * @param componentKey The key of the component.
 * @returns An object containing the component and its schema, or `undefined` if not found.
 */
export function useDynamicComponentEntry(componentKey: string): RegisteredComponentEntry | undefined {
    const [entry, setEntry] = useState<RegisteredComponentEntry | undefined>(undefined);

    useEffect(() => {
        setEntry(getRegisteredComponentEntry(componentKey));
    }, [componentKey]);

    return entry;
}