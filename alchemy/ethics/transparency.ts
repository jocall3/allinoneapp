/**
 * @fileoverview The Transparency Log for the Alchemy Ethics Blueprint.
 * Provides a secure, auditable trail of all significant AI actions.
 */

export interface LogEntry {
    timestamp: string;
    action: string;
    details: Record<string, any>;
    hash?: string; // For ensuring integrity
}

export class TransparencyLog {
    private log: LogEntry[];

    constructor() {
        this.log = [];
        console.log("TransparencyLog Initialized.");
    }

    /**
     * Logs a significant AI action.
     * @param action A string describing the action (e.g., 'COMPILE_TSAL', 'REQUEST_PERMISSION').
     * @param details A JSON-serializable object with context about the action.
     */
    public logAction(action: string, details: Record<string, any>): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            action,
            details,
        };

        // In a real implementation, you would add a cryptographic hash
        // of the previous entry to create a tamper-proof chain.
        // entry.hash = this.calculateHash(entry, this.getLastHash());

        this.log.push(entry);
        console.log(`[TransparencyLog] Logged action:`, entry);
    }

    /**
     * Retrieves the entire audit log.
     * @returns An array of all log entries.
     */
    public getLog(): LogEntry[] {
        // Return a copy to prevent mutation
        return [...this.log];
    }

    private getLastHash(): string | undefined {
        return this.log.length > 0 ? this.log[this.log.length - 1].hash : undefined;
    }

    // private async calculateHash(entry: LogEntry, previousHash?: string): Promise<string> {
    //     const entryString = JSON.stringify(entry) + (previousHash || '');
    //     const encoder = new TextEncoder();
    //     const data = encoder.encode(entryString);
    //     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    //     const hashArray = Array.from(new Uint8Array(hashBuffer));
    //     return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // }
}
