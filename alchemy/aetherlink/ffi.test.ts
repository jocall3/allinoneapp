import { describe, it, expect } from 'vitest';
import { AetherLink } from './ffi';

describe('AetherLink FFI', () => {
    it('should create an import object', () => {
        const aetherLink = new AetherLink();
        const importObject = aetherLink.createImportObject();

        expect(importObject).toHaveProperty('host');
        expect(importObject.host).toHaveProperty('console_log');
        expect(importObject).toHaveProperty('env');
        expect(importObject.env).toHaveProperty('abort');
    });
});
