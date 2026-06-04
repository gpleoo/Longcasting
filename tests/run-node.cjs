#!/usr/bin/env node
/**
 * Runner CommonJS per eseguire i test in node.
 *
 * Il package.json del progetto ha "type": "module", quindi node tratterebbe
 * i file .js come ESM e i `require` relativi dei test fallirebbero. Qui usiamo
 * `vm` per caricare il sorgente e i test in un sandbox con shim di `window`/
 * `module`, così gli stessi file dei test funzionano sia nel browser sia in node.
 *
 * Uso: node tests/run-node.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadInto(sandbox, file) {
    const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
    // Avvolge in una IIFE: evita collisioni tra dichiarazioni top-level dei
    // vari file (es. `class GPSTracker` vs `const GPSTracker`) nello stesso
    // contesto vm. Gli export "window.X = ..." atterrano comunque sul sandbox.
    vm.runInContext('(function(){\n' + code + '\n})();', sandbox, { filename: file });
}

// Sandbox condiviso con gli oggetti globali necessari + shim window/module.
const sandbox = {
    console,
    Math,
    Date,
    isFinite,
    isNaN,
    parseFloat,
    parseInt,
    setInterval,
    clearInterval,
    navigator: undefined
};
sandbox.window = sandbox; // gli export "window.X = ..." atterrano sul sandbox
sandbox.global = sandbox;
sandbox.module = { exports: {} };
vm.createContext(sandbox);

// Carica il sorgente da testare e i test (browser-compatibili) nello stesso contesto.
loadInto(sandbox, '../js/GPSTracker.js');
loadInto(sandbox, 'gpstracker.test.js');

// Conta i fallimenti: console.assert in node non lancia eccezioni.
let fails = 0;
const origAssert = console.assert.bind(console);
console.assert = (cond, ...msg) => {
    if (!cond) {
        fails++;
        origAssert(false, ...msg);
    }
};

sandbox.runGPSTrackerTests();

console.assert = origAssert;
if (fails === 0) {
    console.log('>>> TUTTI I TEST PASSATI ✅');
    process.exit(0);
} else {
    console.log(`>>> FALLIMENTI: ${fails} ❌`);
    process.exit(1);
}
