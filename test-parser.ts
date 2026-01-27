import { MarkdownParser } from './src/utils/parser/MarkdownParser.ts';

const parser = new MarkdownParser();

const testMarkdown = `甲的正面数 > 乙的正面数（记概率为 $P_1$）

由于两人抛掷的硬币数相同（都是 100 个），且硬币正反概率均等，根据对称性，显然有：
$$P_1 = P_2$$`;

console.log('Parsing test markdown...');
console.log('='.repeat(50));
const ast = parser.parse(testMarkdown);

function printTokens(tokens: any[], indent = 0) {
    const prefix = '  '.repeat(indent);
    tokens.forEach((token, idx) => {
        console.log(`${prefix}[${idx}] type: ${token.type}`);
        if (token.raw) console.log(`${prefix}    raw: ${token.raw.substring(0, 60)}${token.raw.length > 60 ? '...' : ''}`);
        if (token.text) console.log(`${prefix}    text: ${token.text.substring(0, 60)}${token.text.length > 60 ? '...' : ''}`);
        if (token.tokens && token.tokens.length > 0) {
            console.log(`${prefix}    tokens:`);
            printTokens(token.tokens, indent + 2);
        }
    });
}

printTokens(ast.tokens);
