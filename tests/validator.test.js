/**
 * Test per js/Validator.js
 */

// Test validateType
function testValidateType() {
    console.log('Testing Validator.validateType...');

    // String
    console.assert(Validator.validateType('hello', 'string') === true, 'string validation');
    console.assert(Validator.validateType(123, 'string') === false, 'number is not string');

    // Number
    console.assert(Validator.validateType(123, 'number') === true, 'number validation');
    console.assert(Validator.validateType(NaN, 'number') === false, 'NaN is not valid number');
    console.assert(Validator.validateType('123', 'number') === false, 'string is not number');

    // Boolean
    console.assert(Validator.validateType(true, 'boolean') === true, 'boolean validation');
    console.assert(Validator.validateType(1, 'boolean') === false, 'number is not boolean');

    // Array
    console.assert(Validator.validateType([], 'array') === true, 'array validation');
    console.assert(Validator.validateType({}, 'array') === false, 'object is not array');

    // Object
    console.assert(Validator.validateType({}, 'object') === true, 'object validation');
    console.assert(Validator.validateType([], 'object') === false, 'array is not object');

    // Null/undefined
    console.assert(Validator.validateType(null, 'string') === true, 'null passes validation');
    console.assert(Validator.validateType(undefined, 'number') === true, 'undefined passes validation');

    console.log('✅ validateType tests passed');
}

// Test validateRange
function testValidateRange() {
    console.log('Testing Validator.validateRange...');

    console.assert(Validator.validateRange(50, { min: 0, max: 100 }) === true, 'in range');
    console.assert(Validator.validateRange(-1, { min: 0, max: 100 }) === false, 'below min');
    console.assert(Validator.validateRange(101, { min: 0, max: 100 }) === false, 'above max');
    console.assert(Validator.validateRange(0, { min: 0 }) === true, 'at min');
    console.assert(Validator.validateRange(100, { max: 100 }) === true, 'at max');

    console.log('✅ validateRange tests passed');
}

// Test validate session
function testValidateSession() {
    console.log('Testing Validator.validateSession...');

    // Valid session
    const validSession = {
        id: 123456,
        dataInizio: '2024-01-15T10:00:00',
        lanci: [
            { distanza: 120.5 },
            { distanza: 125.3 }
        ]
    };

    const validResult = Validator.validateSession(validSession);
    console.assert(validResult.valid === true, 'valid session should pass');
    console.assert(validResult.errors.length === 0, 'valid session should have no errors');

    // Invalid session - missing required field
    const invalidSession = {
        id: 123456,
        lanci: []
    };

    const invalidResult = Validator.validateSession(invalidSession);
    console.assert(invalidResult.valid === false, 'invalid session should fail');
    console.assert(invalidResult.errors.length > 0, 'invalid session should have errors');

    // Session with invalid cast
    const sessionWithInvalidCast = {
        id: 123456,
        dataInizio: '2024-01-15T10:00:00',
        lanci: [
            { distanza: -10 } // Invalid: negative distance
        ]
    };

    const castResult = Validator.validateSession(sessionWithInvalidCast);
    console.assert(castResult.warnings.length > 0, 'should warn about out of range distance');

    console.log('✅ validateSession tests passed');
}

// Test validateImport
function testValidateImport() {
    console.log('Testing Validator.validateImport...');

    // Valid import
    const validImport = {
        version: '2.0',
        sessions: [
            {
                id: 1,
                dataInizio: '2024-01-15',
                lanci: [{ distanza: 100 }]
            }
        ],
        profile: { nome: 'Test' }
    };

    const validResult = Validator.validateImport(validImport);
    console.assert(validResult.valid === true, 'valid import should pass');
    console.assert(validResult.stats.sessions === 1, 'should count 1 session');
    console.assert(validResult.stats.casts === 1, 'should count 1 cast');

    // Invalid import - no data
    const emptyImport = {};
    const emptyResult = Validator.validateImport(emptyImport);
    console.assert(emptyResult.valid === false, 'empty import should fail');

    // Old format import
    const oldFormatImport = {
        version: '1.0',
        casts: [
            { distanza: 100, data: '2024-01-15' }
        ]
    };

    const oldResult = Validator.validateImport(oldFormatImport);
    console.assert(oldResult.warnings.length > 0, 'should warn about old format');

    console.log('✅ validateImport tests passed');
}

// Test sanitizeString
function testSanitizeString() {
    console.log('Testing Validator.sanitizeString...');

    // Mock document if not in browser
    if (typeof document === 'undefined') {
        global.document = {
            createElement: () => ({
                textContent: '',
                innerHTML: '',
                set textContent(val) {
                    this._text = val;
                    this.innerHTML = val
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                }
            })
        };
    }

    const xss = '<script>alert("xss")</script>';
    const sanitized = Validator.sanitizeString(xss);

    console.assert(!sanitized.includes('<script>'), 'should escape script tags');
    console.assert(sanitized.includes('&lt;') || sanitized.includes('script'), 'should contain escaped content');

    console.log('✅ sanitizeString tests passed');
}

// Test parseNumber
function testParseNumber() {
    console.log('Testing Validator.parseNumber...');

    console.assert(Validator.parseNumber('123') === 123, 'parse string number');
    console.assert(Validator.parseNumber('abc', 0) === 0, 'return default for invalid');
    console.assert(Validator.parseNumber(150, 0, 0, 100) === 100, 'clamp to max');
    console.assert(Validator.parseNumber(-50, 0, 0, 100) === 0, 'clamp to min');
    console.assert(Validator.parseNumber('45.5') === 45.5, 'parse float');

    console.log('✅ parseNumber tests passed');
}

// Run all tests
function runAllTests() {
    console.log('\n========================================');
    console.log('Running Validator Tests');
    console.log('========================================\n');

    testValidateType();
    testValidateRange();
    testValidateSession();
    testValidateImport();
    testSanitizeString();
    testParseNumber();

    console.log('\n========================================');
    console.log('All Validator Tests Completed');
    console.log('========================================\n');
}

// Export
if (typeof module !== 'undefined') {
    module.exports = { runAllTests };
}

if (typeof window !== 'undefined') {
    window.runValidatorTests = runAllTests;
}
