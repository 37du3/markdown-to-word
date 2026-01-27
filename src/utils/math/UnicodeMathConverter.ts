/**
 * LaTeX to UnicodeMath Converter
 * Converts LaTeX formulas to Microsoft UnicodeMath format for Word compatibility
 * Based on gemini-voyager implementation
 */

/**
 * Greek letter mappings (LaTeX command -> Unicode character)
 */
const GREEK_LETTERS: Record<string, string> = {
    // Lowercase
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
    pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
    phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    varepsilon: 'ε', vartheta: 'ϑ', varpi: 'ϖ', varrho: 'ϱ',
    varsigma: 'ς', varphi: 'ϕ',
    // Uppercase
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ',
    Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
};

/**
 * Mathematical operators and symbols
 */
const MATH_SYMBOLS: Record<string, string> = {
    // Operators
    times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓',
    ast: '∗', star: '⋆', circ: '∘', bullet: '•',
    // Relations
    le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
    approx: '≈', equiv: '≡', sim: '∼', simeq: '≃',
    ll: '≪', gg: '≫', subset: '⊂', supset: '⊃',
    subseteq: '⊆', supseteq: '⊇', in: '∈', notin: '∉', ni: '∋',
    // Arrows
    to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
    Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔',
    uparrow: '↑', downarrow: '↓', mapsto: '↦',
    // Logic
    land: '∧', lor: '∨', lnot: '¬', neg: '¬',
    forall: '∀', exists: '∃', nexists: '∄',
    // Sets
    emptyset: '∅', varnothing: '∅',
    cup: '∪', cap: '∩', setminus: '∖',
    // Calculus
    partial: '∂', nabla: '∇', infty: '∞',
    int: '∫', iint: '∬', iiint: '∭', oint: '∮',
    sum: '∑', prod: '∏', coprod: '∐',
    // Misc
    sqrt: '√', surd: '√', prime: '′', angle: '∠',
    triangle: '△', square: '□', diamond: '◇',
    ldots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱',
    aleph: 'ℵ', hbar: 'ℏ', ell: 'ℓ', wp: '℘', Re: 'ℜ', Im: 'ℑ',
    // Brackets
    langle: '⟨', rangle: '⟩', lceil: '⌈', rceil: '⌉',
    lfloor: '⌊', rfloor: '⌋',
};

/**
 * Superscript digit mappings
 */
const SUPERSCRIPTS: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ',
};

/**
 * Subscript digit mappings
 */
const SUBSCRIPTS: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ',
    'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'n': 'ₙ', 'r': 'ᵣ', 's': 'ₛ',
};

/**
 * Convert character to Unicode mathematical bold
 */
function toMathBold(char: string): string {
    const code = char.charCodeAt(0);

    // Uppercase letters A-Z -> Mathematical Bold
    if (code >= 0x41 && code <= 0x5a) {
        return String.fromCodePoint(0x1d400 + (code - 0x41));
    }

    // Lowercase letters a-z -> Mathematical Bold
    if (code >= 0x61 && code <= 0x7a) {
        return String.fromCodePoint(0x1d41a + (code - 0x61));
    }

    // Numbers 0-9 -> Mathematical Bold Digits
    if (code >= 0x30 && code <= 0x39) {
        return String.fromCodePoint(0x1d7ce + (code - 0x30));
    }

    return char;
}

/**
 * Convert string to Unicode mathematical bold
 */
function toBoldText(text: string): string {
    return Array.from(text).map(char => toMathBold(char)).join('');
}

/**
 * Convert character to Unicode mathematical italic
 */
function toMathItalic(char: string): string {
    const code = char.charCodeAt(0);

    // Uppercase letters A-Z -> Mathematical Italic
    if (code >= 0x41 && code <= 0x5a) {
        return String.fromCodePoint(0x1d434 + (code - 0x41));
    }

    // Lowercase letters a-z -> Mathematical Italic (h is special)
    if (code >= 0x61 && code <= 0x7a) {
        if (char === 'h') return 'ℎ'; // Planck constant
        return String.fromCodePoint(0x1d44e + (code - 0x61));
    }

    return char;
}

/**
 * Convert string to Unicode mathematical italic
 */
function toItalicText(text: string): string {
    return Array.from(text).map(char => toMathItalic(char)).join('');
}

/**
 * Convert LaTeX formula to UnicodeMath format
 * @param latex - LaTeX formula (without $ delimiters)
 * @returns UnicodeMath formatted string
 */
export function latexToUnicodeMath(latex: string): string {
    if (!latex) return '';

    // Normalize backslashes: marked-katex may output double backslashes (\\command)
    // Convert them to single backslashes for consistent processing
    let result = latex.replace(/\\\\/g, '\\');

    // Replace Greek letters
    for (const [cmd, unicode] of Object.entries(GREEK_LETTERS)) {
        result = result.replace(new RegExp(`\\\\${cmd}\\b`, 'g'), unicode);
    }

    // Replace math symbols
    for (const [cmd, unicode] of Object.entries(MATH_SYMBOLS)) {
        result = result.replace(new RegExp(`\\\\${cmd}\\b`, 'g'), unicode);
    }

    // Handle fractions: \frac{a}{b} -> a/b or (a)/(b)
    result = result.replace(
        /\\frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
        (_: string, num: string, den: string) => {
            const n = num.trim();
            const d = den.trim();
            // Use parentheses if numerator/denominator is complex
            if (n.length > 1 || d.length > 1) {
                return `(${n})/(${d})`;
            }
            return `${n}/${d}`;
        }
    );

    // Handle square roots: \sqrt{x} -> √(x)
    result = result.replace(
        /\\sqrt\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
        (_, content) => `√(${content})`
    );

    // Handle nth roots: \sqrt[n]{x} -> ∜(x) or n√(x)
    result = result.replace(
        /\\sqrt\s*\[([^\]]+)\]\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
        (_, n, content) => {
            if (n === '3') return `∛(${content})`;
            if (n === '4') return `∜(${content})`;
            return `${n}√(${content})`;
        }
    );

    // Handle superscripts: ^{abc} -> convert to Unicode superscripts where possible
    result = result.replace(/\^{([^{}]*)}/g, (_: string, content: string) => {
        return Array.from(content)
            .map((c: string) => SUPERSCRIPTS[c] || `^${c}`)
            .join('');
    });

    // Handle simple superscripts: ^2 -> ²
    result = result.replace(/\^([0-9n])/g, (_: string, c: string) => SUPERSCRIPTS[c] || `^${c}`);

    // Handle subscripts: _{abc} -> convert to Unicode subscripts where possible
    result = result.replace(/_{([^{}]*)}/g, (_: string, content: string) => {
        return Array.from(content)
            .map((c: string) => {
                // Use Unicode subscript if available
                if (SUBSCRIPTS[c]) return SUBSCRIPTS[c];
                // For letters/numbers not in map, use normal char followed by combining subscript
                // Note: Word may not render combining marks perfectly, but it's better than nothing
                return c + '\u0332'; // Combining low line as approximation
            })
            .join('');
    });

    // Handle simple subscripts: _2 -> ₂
    result = result.replace(/_([0-9a-zA-Z])/g, (_: string, c: string) => SUBSCRIPTS[c] || c + '\u0332');

    // Handle bold text: \mathbf{x} -> mathematical bold
    result = result.replace(/\\mathbf\s*\{([^{}]*)\}/g, (_: string, text: string) => toBoldText(text));
    result = result.replace(/\\textbf\s*\{([^{}]*)\}/g, (_: string, text: string) => toBoldText(text));
    result = result.replace(/\\boldsymbol\s*\{([^{}]*)\}/g, (_: string, text: string) => toBoldText(text));

    // Handle italic text: \mathit{x} -> mathematical italic
    result = result.replace(/\\mathit\s*\{([^{}]*)\}/g, (_: string, text: string) => toItalicText(text));
    result = result.replace(/\\textit\s*\{([^{}]*)\}/g, (_: string, text: string) => toItalicText(text));

    // Handle text mode: \text{...} -> plain text
    result = result.replace(/\\text\s*\{([^{}]*)\}/g, '$1');
    result = result.replace(/\\mathrm\s*\{([^{}]*)\}/g, '$1');

    // Handle common functions (should stay upright)
    const functions = [
        'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
        'arcsin', 'arccos', 'arctan',
        'sinh', 'cosh', 'tanh', 'coth',
        'exp', 'log', 'ln', 'lg',
        'det', 'dim', 'ker', 'max', 'min', 'sup', 'inf',
        'gcd', 'lcm', 'arg', 'deg', 'lim',
    ];

    for (const func of functions) {
        result = result.replace(new RegExp(`\\\\${func}\\b`, 'g'), func);
    }

    // Handle matrices: \begin{matrix}...\end{matrix} -> [■(...)]
    result = result.replace(
        /\\begin\{(?:matrix|pmatrix|bmatrix|vmatrix|Vmatrix)\}([\s\S]*?)\\end\{(?:matrix|pmatrix|bmatrix|vmatrix|Vmatrix)\}/g,
        (_, content) => {
            const rows = (content as string)
                .trim()
                .split('\\\\')
                .map((row: string) => row.trim())
                .join('@');
            return `[■(${rows})]`;
        }
    );

    // Handle overline/bar: \overline{x} or \bar{x} -> x̄
    result = result.replace(/\\(?:overline|bar)\s*\{([^{}]*)\}/g, '$1\u0304');

    // Handle hat: \hat{x} -> x̂
    result = result.replace(/\\hat\s*\{([^{}]*)\}/g, '$1\u0302');

    // Handle tilde: \tilde{x} -> x̃
    result = result.replace(/\\tilde\s*\{([^{}]*)\}/g, '$1\u0303');

    // Handle dot: \dot{x} -> ẋ
    result = result.replace(/\\dot\s*\{([^{}]*)\}/g, '$1\u0307');

    // Handle double dot: \ddot{x} -> ẍ
    result = result.replace(/\\ddot\s*\{([^{}]*)\}/g, '$1\u0308');

    // Handle vector: \vec{x} -> x⃗
    result = result.replace(/\\vec\s*\{([^{}]*)\}/g, '$1\u20D7');

    // Remove common LaTeX commands that should be stripped
    result = result.replace(/\\left/g, '');
    result = result.replace(/\\right/g, '');
    result = result.replace(/\\,/g, ' ');
    result = result.replace(/\\:/g, ' ');
    result = result.replace(/\\;/g, ' ');
    result = result.replace(/\\!/g, '');
    result = result.replace(/\\quad/g, '  ');
    result = result.replace(/\\qquad/g, '    ');
    result = result.replace(/\\ /g, ' ');

    // Remove remaining braces that were just for grouping
    result = result.replace(/\{([^{}]*)\}/g, '$1');

    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    return result;
}

/**
 * Check if a string contains LaTeX math
 */
export function containsLatexMath(text: string): boolean {
    return /\$[^$]+\$|\$\$[^$]+\$\$|\\[a-zA-Z]+/.test(text);
}
