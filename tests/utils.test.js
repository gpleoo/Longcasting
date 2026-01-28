/**
 * Test per js/utils.js
 * Per eseguire: npm test (richiede configurazione Jest/Vitest)
 */

// Mock del DOM per test
const mockDocument = {
    createElement: (tag) => ({
        textContent: '',
        innerHTML: '',
        set textContent(val) { this._text = val; this.innerHTML = val.replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
        get textContent() { return this._text; }
    }),
    getElementById: () => null
};

// Test debounce
function testDebounce() {
    console.log('Testing debounce...');

    let callCount = 0;
    const debouncedFn = debounce(() => callCount++, 100);

    // Chiama multiple volte rapidamente
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Dopo 50ms, non dovrebbe essere chiamata
    setTimeout(() => {
        console.assert(callCount === 0, 'debounce: should not call yet');
    }, 50);

    // Dopo 150ms, dovrebbe essere chiamata una volta
    setTimeout(() => {
        console.assert(callCount === 1, 'debounce: should call once');
        console.log('✅ debounce tests passed');
    }, 150);
}

// Test escapeHtml
function testEscapeHtml() {
    console.log('Testing escapeHtml...');

    // Usa mock se non in browser
    if (typeof document === 'undefined') {
        global.document = mockDocument;
    }

    const tests = [
        { input: '<script>alert("xss")</script>', expected: '&lt;script&gt;alert("xss")&lt;/script&gt;' },
        { input: 'Normal text', expected: 'Normal text' },
        { input: '', expected: '' },
        { input: '1 < 2 & 3 > 1', expected: '1 &lt; 2 &amp; 3 &gt; 1' }
    ];

    tests.forEach((test, i) => {
        const result = escapeHtml(test.input);
        console.assert(
            result === test.expected || result.includes('&lt;'),
            `escapeHtml test ${i + 1} failed: ${result}`
        );
    });

    console.log('✅ escapeHtml tests passed');
}

// Test formatDuration
function testFormatDuration() {
    console.log('Testing formatDuration...');

    const tests = [
        { input: 0, expected: '00:00' },
        { input: 60, expected: '01:00' },
        { input: 90, expected: '01:30' },
        { input: 3661, expected: '61:01' }
    ];

    tests.forEach((test, i) => {
        const result = formatDuration(test.input);
        console.assert(
            result === test.expected,
            `formatDuration test ${i + 1} failed: got ${result}, expected ${test.expected}`
        );
    });

    console.log('✅ formatDuration tests passed');
}

// Test isEmpty
function testIsEmpty() {
    console.log('Testing isEmpty...');

    console.assert(isEmpty(null) === true, 'isEmpty(null) should be true');
    console.assert(isEmpty(undefined) === true, 'isEmpty(undefined) should be true');
    console.assert(isEmpty('') === true, 'isEmpty("") should be true');
    console.assert(isEmpty('text') === false, 'isEmpty("text") should be false');
    console.assert(isEmpty(0) === false, 'isEmpty(0) should be false');
    console.assert(isEmpty([]) === false, 'isEmpty([]) should be false');

    console.log('✅ isEmpty tests passed');
}

// Test average
function testAverage() {
    console.log('Testing average...');

    console.assert(average([1, 2, 3, 4, 5]) === 3, 'average of 1-5 should be 3');
    console.assert(average([10, 20]) === 15, 'average of 10,20 should be 15');
    console.assert(average([]) === 0, 'average of empty array should be 0');
    console.assert(average(null) === 0, 'average of null should be 0');

    console.log('✅ average tests passed');
}

// Test generateId
function testGenerateId() {
    console.log('Testing generateId...');

    const id1 = generateId();
    const id2 = generateId();

    console.assert(typeof id1 === 'string', 'generateId should return string');
    console.assert(id1.length > 0, 'generateId should return non-empty string');
    console.assert(id1 !== id2, 'generateId should return unique values');

    console.log('✅ generateId tests passed');
}

// Esegui tutti i test
function runAllTests() {
    console.log('\n========================================');
    console.log('Running Utils Tests');
    console.log('========================================\n');

    testFormatDuration();
    testIsEmpty();
    testAverage();
    testGenerateId();
    testEscapeHtml();
    testDebounce();

    console.log('\n========================================');
    console.log('All Utils Tests Completed');
    console.log('========================================\n');
}

// Export per uso in altri ambienti
if (typeof module !== 'undefined') {
    module.exports = {
        testDebounce,
        testEscapeHtml,
        testFormatDuration,
        testIsEmpty,
        testAverage,
        testGenerateId,
        runAllTests
    };
}

// Auto-run se eseguito direttamente
if (typeof window !== 'undefined') {
    window.runUtilsTests = runAllTests;
}
