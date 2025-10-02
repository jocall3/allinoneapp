// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @fileoverview The Permission Module for the Alchemy Ethics Blueprint.
 * Provides a runtime security gatekeeper for sensitive operations.
 */

type PermissionType = 'read' | 'write' | 'network';
type ResourceType = 'FileSystem' | 'API' | 'DOM';
type PermissionState = 'granted' | 'denied' | 'prompt';

interface PermissionStatus {
    state: PermissionState;
    // Potentially add expiry or scope information here in a more complex system.
}

export class PermissionModule {
    // Stores permissions as "permissionType:ResourceType" -> status
    private permissionStore: Map<string, PermissionStatus>;

    constructor() {
        this.permissionStore = new Map();
        console.log("PermissionModule Initialized.");
    }

    private getKey(permission: PermissionType, resource: ResourceType): string {
        return `${permission}:${resource}`;
    }

    /**
     * Requests permission from the user for a specific operation.
     * This simulates a user-facing consent dialog.
     * @param permission The type of permission being requested.
     * @param resource The resource the permission applies to.
     * @returns A promise that resolves to true if permission is granted, false otherwise.
     */
    public async request(permission: PermissionType, resource: ResourceType): Promise<boolean> {
        const key = this.getKey(permission, resource);
        const currentState = this.permissionStore.get(key);

        if (currentState?.state === 'granted') {
            return true;
        }

        console.log(`[PermissionModule] Requesting '${permission}' permission for resource '${resource}'...`);
        
        // STUB: This would trigger a real UI element.
        const granted = window.confirm(
            `An AI-generated module is requesting permission to "${permission}" the "${resource}".\n\nThis could allow it to:\n- ${this.getPermissionImplication(permission, resource)}\n\nDo you allow this action?`
        );

        this.permissionStore.set(key, { state: granted ? 'granted' : 'denied' });
        console.log(`[PermissionModule] Permission for '${key}' was ${granted ? 'GRANTED' : 'DENIED'}.`);
        return granted;
    }

    /**
     * Checks if a specific permission has already been granted without prompting the user.
     */
    public check(permission: PermissionType, resource: ResourceType): boolean {
        const key = this.getKey(permission, resource);
        const status = this.permissionStore.get(key);
        return status?.state === 'granted';
    }

    /**
     * Revokes a previously granted permission.
     */
    public revoke(permission: PermissionType, resource: ResourceType): void {
        const key = this.getKey(permission, resource);
        if (this.permissionStore.has(key)) {
            this.permissionStore.set(key, { state: 'denied' });
            console.log(`[PermissionModule] Revoked '${permission}' permission for resource '${resource}'.`);
        }
    }
    
    private getPermissionImplication(permission: PermissionType, resource: ResourceType): string {
        if (resource === 'FileSystem') {
            return permission === 'read' ? 'Read files from your local disk.' : 'Create, modify, and delete files on your local disk.';
        }
        if (resource === 'API') {
            return 'Make network requests to external servers, which could send your data.';
        }
        if (resource === 'DOM') {
            return 'Read or modify the content of the current web page.';
        }
        return 'Perform a sensitive operation.';
    }
}
