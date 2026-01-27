import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';

// Test with nonStandard option
marked.use(markedKatex({ throwOnError: false, nonStandard: true }));

const test = '$P_1$ and $$P_1 = P_2$$';

console.log('Testing with nonStandard: true...\n');
const tokens = marked.lexer(test);

function printTokens(toks, indent = 0) {
    toks.forEach((t, idx) => {
        console.log(' '.repeat(indent) + `[${idx}] type: ${t.type}, raw: ${JSON.stringify(t.raw?.substring(0, 30))}`);
        if (t.tokens) printTokens(t.tokens, indent + 2);
    });
}

printTokens(tokens);
