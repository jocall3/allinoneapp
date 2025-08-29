/**
 * @fileoverview The Permission Module for the Alchemy Ethics Blueprint.
 * This module provides a runtime security gatekeeper for sensitive operations
 * initiated by TSAL-compiled Wasm modules.
 */

type PermissionType = 'read' | 'write' | 'network';
type ResourceType = 'FileSystem' | 'API' | 'DOM';

export class PermissionModule {
    private grantedPermissions: Map<string, Set<ResourceType>>;

    constructor() {
        this.grantedPermissions = new Map();
        console.log("PermissionModule Initialized.");
    }

    /**
     * Requests permission from the user for a specific operation.
     * In a real app, this would trigger a user-facing consent dialog.
     * @param permission The type of permission being requested.
     * @param resource The resource the permission applies to.
     * @returns A promise that resolves to true if permission is granted, false otherwise.
     */
    public async request(permission: PermissionType, resource: ResourceType): Promise<boolean> {
        console.log(`[PermissionModule] Requesting '${permission}' permission for resource '${resource}'...`);
        
        // STUB: This would show a real UI prompt to the user.
        const granted = window.confirm(`An AI module is requesting permission to "${permission}" the "${resource}". Allow?`);

        if (granted) {
            if (!this.grantedPermissions.has(permission)) {
                this.grantedPermissions.set(permission, new Set());
            }
            this.grantedPermissions.get(permission)!.add(resource);
            console.log(`[PermissionModule] Permission GRANTED.`);
        } else {
            console.log(`[PermissionModule] Permission DENIED.`);
        }
        return granted;
    }

    /**
     * Checks if a specific permission has already been granted.
     * @param permission The permission type to check.
     * @param resource The resource to check against.
     * @returns True if the permission is granted, false otherwise.
     */
    public check(permission: PermissionType, resource: ResourceType): boolean {
        const hasPermission = this.grantedPermissions.has(permission) && this.grantedPermissions.get(permission)!.has(resource);
        console.log(`[PermissionModule] Checking '${permission}' for '${resource}': ${hasPermission}`);
        return hasPermission;
    }

    /**
     * Revokes a previously granted permission.
     * @param permission The permission type to revoke.
     * @param resource The resource to revoke access to.
     */
    public revoke(permission: PermissionType, resource: ResourceType): void {
        if (this.grantedPermissions.has(permission)) {
            this.grantedPermissions.get(permission)!.delete(resource);
            console.log(`[PermissionModule] Revoked '${permission}' permission for resource '${resource}'.`);
        }
    }
}
