import { latexToUnicodeMath } from './src/utils/math/UnicodeMathConverter.ts';

// Test cases
const tests = [
    { input: 'P_1', expected: 'P₁' },
    { input: 'P_2', expected: 'P₂' },
    { input: 'P_3', expected: 'P₃' },
    { input: '2P_1 + P_3 = 1', expected: '2P₁ + P₃ = 1' },
    { input: 'P_1 = P_2', expected: 'P₁ = P₂' },
];

console.log('Testing latexToUnicodeMath:');
console.log('='.repeat(50));

tests.forEach(({ input, expected }) => {
    const result = latexToUnicodeMath(input);
    const passed = result === expected;
    console.log(`Input:    ${input}`);
    console.log(`Expected: ${expected}`);
    console.log(`Got:      ${result}`);
    console.log(`Status:   ${passed ? '✓ PASS' : '✗ FAIL'}`);
    console.log('-'.repeat(50));
});
