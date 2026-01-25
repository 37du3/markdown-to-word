// 直接测试转换逻辑以复现 Invalid array length 错误
import { readFileSync } from 'fs';
import { MarkdownParser } from './src/utils/parser/MarkdownParser.js';
import { DocxConverter } from './src/utils/converter/DocxConverter.js';

const markdown = readFileSync('/tmp/test-deepseek-content.md', 'utf-8');

console.log('Markdown content length:', markdown.length);
console.log('Starting conversion test...\n');

try {
    const parser = new MarkdownParser();
    const ast = parser.parse(markdown);

    console.log('[Parser] AST tokens:', ast.tokens?.length);
    console.log('[Parser] AST string length:', JSON.stringify(ast).length);

    const converter = new DocxConverter();
    const options = {
        table: {
            enableMergedCells: true,
            defaultAlign: 'left',
            headerBackground: '#f0f0f0',
            borderColor: '#000000',
        },
        code: {
            showLineNumbers: false,
            theme: 'light',
            fontFamily: 'JetBrains Mono',
            fontSize: 10,
        },
        text: {
            fontFamily: 'Noto Serif SC',
            fontSize: 12,
            lineHeight: 1.5,
            linkColor: '#0563c1',
        },
        heading: {
            fontFamily: 'Noto Serif SC',
            h1Size: 16,
            h2Size: 14,
            h3Size: 13,
            h4Size: 12,
            h5Size: 11,
            h6Size: 10,
        },
        math: {
            output: 'katex',
        },
    };

    converter.convert(ast, options).then(result => {
        if (result.success) {
            console.log('\n✅ Conversion successful!');
            console.log('Blob size:', result.docx.size, 'bytes');
        } else {
            console.error('\n❌ Conversion failed:');
            console.error('Error:', result.error?.message);
            console.error('Stack:', result.error?.stack);
        }
    }).catch(err => {
        console.error('\n❌ Unexpected error:');
        console.error(err);
    });

} catch (err) {
    console.error('\n❌ Parser error:');
    console.error(err.message);
    console.error(err.stack);
}
