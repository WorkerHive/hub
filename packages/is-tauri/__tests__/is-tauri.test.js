'use strict';

const isTauri = require('../lib/is-tauri');

describe('is-tauri', () => {

    test('Checks window object with __TAURI__ values', () => {
        window.__TAURI__ = {promisified: true}
        expect(isTauri()).toBe(true)
    })

    test('Checks uninitialized window object', () => {
        window.__TAURI__ = null;
        expect(isTauri()).toBe(false)
    })
});
