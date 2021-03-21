'use strict';

module.exports = isTauri;

function isTauri() {
    return Boolean(typeof(window) !== 'undefined' && window != undefined && window.__TAURI__ != null && window.__TAURI__.promisified != null)
}
