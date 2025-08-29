/**
 * @fileoverview The Transparency Log for the Alchemy Ethics Blueprint.
 * Provides a secure, auditable trail of all significant AI actions using a cryptographic chain.
 */

export interface LogEntry {
    timestamp: string;
    action: string;
    details: Record<string, any>;
    previousHash: string; // Hash of the previous log entry
    hash: string;         // Hash of the current entry
}

export class TransparencyLog {
    private logChain: LogEntry[] = [];
    private readonly GENESIS_HASH = '0'.repeat(64); // 64 zero characters for SHA-256

    constructor() {
        console.log("TransparencyLog Initialized.");
    }

    /**
     * Logs a significant AI action, linking it to the previous action.
     * @param action A string describing the action (e.g., 'COMPILE_TSAL', 'REQUEST_PERMISSION').
     * @param details A JSON-serializable object with context about the action.
     */
    public async logAction(action: string, details: Record<string, any>): Promise<void> {
        const timestamp = new Date().toISOString();
        const previousHash = this.getLastHash();

        const entryToHash: Omit<LogEntry, 'hash'> = {
            timestamp,
            action,
            details,
            previousHash,
        };
        
        const hash = await this.calculateHash(entryToHash);

        const newEntry: LogEntry = { ...entryToHash, hash };

        this.logChain.push(newEntry);
        console.log(`[TransparencyLog] Logged action:`, newEntry);
    }

    /**
     * Retrieves the entire audit log chain.
     * @returns A copy of the array of all log entries.
     */
    public getLog(): LogEntry[] {
        return JSON.parse(JSON.stringify(this.logChain)); // Deep copy to prevent mutation
    }
    
    /**
     * Verifies the integrity of the entire log chain.
     * @returns A promise that resolves to true if the chain is valid, false otherwise.
     */
    public async verifyChain(): Promise<boolean> {
        for (let i = 0; i < this.logChain.length; i++) {
            const entry = this.logChain[i];
            const previousHash = i === 0 ? this.GENESIS_HASH : this.logChain[i-1].hash;
            
            if(entry.previousHash !== previousHash) {
                console.error(`[TransparencyLog] Chain broken at entry ${i}: previousHash mismatch.`);
                return false;
            }

            const { hash, ...dataToVerify } = entry;
            const calculatedHash = await this.calculateHash(dataToVerify);

            if(hash !== calculatedHash) {
                console.error(`[TransparencyLog] Chain broken at entry ${i}: hash mismatch.`);
                return false;
            }
        }
        console.log("[TransparencyLog] Chain integrity verified successfully.");
        return true;
    }

    private getLastHash(): string {
        return this.logChain.length > 0 ? this.logChain[this.logChain.length - 1].hash : this.GENESIS_HASH;
    }

    private async calculateHash(data: Omit<LogEntry, 'hash'>): Promise<string> {
        const entryString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(entryString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
