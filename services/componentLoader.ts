// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { lazy, Suspense, Component, ReactNode } from 'react';

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
    onError?: (error: Error, componentStack: string) => void;
    /** A unique identifier for this boundary instance, useful for distinguishing logs. */
    boundaryName?: string;
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
 * A robust Error Boundary component to catch JavaScript errors anywhere in its child component tree,
 * log those errors, and display a fallback UI. This prevents the entire application from crashing.
 *
 * It can also be configured to report errors to an external logging service via the `onError` prop.
 *
 * @example
 * <ErrorBoundary fallback={<p>Something went wrong!</p>} onError={(error, stack) => myLogger.log('Caught error:', error, stack)}>
 *   <MyPotentiallyBuggyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
        console.error(logMessage, error, errorInfo);

        if (this.props.onError) {
            this.props.onError(error, errorInfo.componentStack);
        }

        // Example: Integrate with a global error logging service if available
        // (window as any).globalErrorLogger?.report(error, errorInfo, { context: this.props.boundaryName });
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
    /** The fallback UI to display while the component is loading and also for error states. */
    fallback?: ReactNode;
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
 *     fallback: <div>Loading Dashboard...</div>,
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
        fallback: null,
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
    });

    const RobustWrapper = (props: React.ComponentProps<T>) => {
        const errorBoundaryProps: ErrorBoundaryProps = {
            fallback: defaultOptions.fallback, // This fallback serves for both loading and error states
            onError: defaultOptions.onError,
            boundaryName: defaultOptions.boundaryName,
        };

        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Suspense fallback={defaultOptions.fallback}>
                    <LazyComponent {...props} />
                </Suspense>
            </ErrorBoundary>
        );
    };

    RobustWrapper.displayName = `RobustLazyComponent(${exportName})`;
    return RobustWrapper;
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

// Global registry for RobustLazyComponents or any React components,
// allowing them to be retrieved by a string key for dynamic rendering.
type ComponentRegistry = Map<string, React.ComponentType<any>>;
const globalComponentRegistry: ComponentRegistry = new Map();

/**
 * Registers a React component (typically one created by `createRobustLazyComponent`) with a unique key.
 * This allows components to be referenced and retrieved by a string identifier,
 * facilitating dynamic component loading and rendering based on configurations,
 * feature flags, or content management systems.
 *
 * @param key The unique string key for the component (e.g., 'DashboardPage', 'ProductCard').
 * @param component The React component to register.
 * @throws {Error} If a component with the same key is already registered, indicating a potential conflict.
 *
 * @example
 * // In an application initialization module:
 * registerComponent('Dashboard', createRobustLazyComponent(() => import('./Dashboard'), 'Dashboard', { fallback: <LoadingSpinner /> }));
 * registerComponent('UserProfile', createRobustLazyComponent(() => import('./UserProfile'), 'UserProfile'));
 *
 * // In a dynamic rendering component:
 * const ComponentToRender = getRegisteredComponent(someConfig.componentName);
 * if (ComponentToRender) {
 *   return <ComponentToRender {...someConfig.props} />;
 * } else {
 *   return <div>Error: Component '{someConfig.componentName}' not found.</div>;
 * }
 */
export function registerComponent(key: string, component: React.ComponentType<any>): void {
    if (globalComponentRegistry.has(key)) {
        // In a production-ready system, consider if overwriting is acceptable or if it should be an error.
        // For robustness, usually disallow overwriting to prevent unexpected behavior.
        throw new Error(`Component with key '${key}' is already registered. Please use a unique key.`);
    }
    globalComponentRegistry.set(key, component);
    console.debug(`Component '${key}' registered successfully.`);
}

/**
 * Retrieves a previously registered React component by its key from the global registry.
 *
 * @param key The unique string key of the component (e.g., 'DashboardPage').
 * @returns The registered React component, or `undefined` if no component is found for the given key.
 */
export function getRegisteredComponent(key: string): React.ComponentType<any> | undefined {
    return globalComponentRegistry.get(key);
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
 */
export const DynamicComponentRenderer: React.FC<{
    config: { componentKey: string; props?: { [key: string]: any } };
    options?: {
        fallback?: ReactNode; // Fallback if componentKey is not found
        errorBoundaryProps?: Partial<ErrorBoundaryProps>; // Props for an outer ErrorBoundary specific to this dynamic render
    };
}> = ({ config, options }) => {
    const ComponentToRender = getRegisteredComponent(config.componentKey);

    if (!ComponentToRender) {
        console.warn(`Attempted to render unregistered component: '${config.componentKey}'`);
        return (options?.fallback || (
            <div style={{ color: 'orange', padding: '10px', border: '1px dashed orange' }}>
                Warning: Component '{config.componentKey}' not found in registry.
            </div>
        )) as React.ReactElement;
    }

    const componentElement = <ComponentToRender {...config.props} />;

    // Wrap with an optional ErrorBoundary if specified, for granular error handling.
    if (options?.errorBoundaryProps) {
        return (
            <ErrorBoundary {...options.errorBoundaryProps} boundaryName={options.errorBoundaryProps.boundaryName || `DynamicRendererBoundary-${config.componentKey}`}>
                {componentElement}
            </ErrorBoundary>
        );
    }

    return componentElement;
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
    globalComponentRegistry.clear();
    console.debug("Global component registry cleared.");
}