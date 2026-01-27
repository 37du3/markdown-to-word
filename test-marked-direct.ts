import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';

marked.use(markedKatex({ throwOnError: false }));

const tests = [
    'This is inline: $P_1$',
    'Block math:\n\n$$P_1 = P_2$$',
    '$x^2 + y^2 = z^2$',
];

console.log('Testing marked-katex-extension...\n');

tests.forEach((test, idx) => {
    console.log(`Test ${idx + 1}: ${test.substring(0, 40)}...`);
    const tokens = marked.lexer(test);
    console.log('Tokens:', JSON.stringify(tokens.map(t => ({
        type: t.type,
        raw: t.raw?.substring(0, 30),
        text: t.text?.substring(0, 30)
    })), null, 2));
    console.log('---\n');
});
