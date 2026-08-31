import { instructions, registers, keywords } from "./asm.js";

const monacoBase = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/";
const languageId = "arrows-asm";

export function createEditor(container, initialValue) {
    return new Promise((resolve) => {
        // Monaco workers can't be loaded cross-origin directly, so proxy them
        // through a data: URL that importScripts the CDN worker.
        self.MonacoEnvironment = {
            getWorkerUrl: () => "data:text/javascript;charset=utf-8," + encodeURIComponent(
                `self.MonacoEnvironment = { baseUrl: "${monacoBase}" };\n` +
                `importScripts("${monacoBase}vs/base/worker/workerMain.js");`)
        };

        require.config({ paths: { vs: monacoBase + "vs" } });
        require(["vs/editor/editor.main"], () => {
            const monaco = window.monaco;
            registerLanguage(monaco);
            registerCompletion(monaco);

            const editor = monaco.editor.create(container, {
                value: initialValue,
                language: languageId,
                theme: "arrows-dark",
                fontFamily: "ui-monospace, Consolas, Menlo, monospace",
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                detectIndentation: false,
                wordBasedSuggestions: "off"
            });

            // The compiler and the URL hash expect LF regardless of platform
            editor.getModel().setEOL(monaco.editor.EndOfLineSequence.LF);

            resolve({ monaco, editor });
        });
    });
}

function registerLanguage(monaco) {
    monaco.languages.register({ id: languageId });

    monaco.languages.setLanguageConfiguration(languageId, {
        comments: { lineComment: ";" },
        autoClosingPairs: [{ open: "\"", close: "\"" }],
        surroundingPairs: [{ open: "\"", close: "\"" }]
    });

    monaco.languages.setMonarchTokensProvider(languageId, {
        defaultToken: "",
        instructions,
        registers,
        keywords,
        tokenizer: {
            root: [
                [/;.*/, "comment"],
                [/^([ \t]*)([a-zA-Z_]\w*)(?=[ \t]*:)/, ["white", "label"]],
                [/^([ \t]*)([a-zA-Z_]\w*)(?=[ \t]+(?:db|equ)\b)/, ["white", "label"]],
                [/[a-zA-Z_]\w*/, {
                    cases: {
                        "@instructions": "keyword",
                        "@registers": "register",
                        "@keywords": "directive",
                        "@default": "identifier"
                    }
                }],
                [/\d\w*/, "number"],
                [/"(?:[^"\\]|\\.)*"/, "string"],
                [/"(?:[^"\\]|\\.)*$/, "string.invalid"],
                [/[+\-]/, "operator"],
                [/[,:]/, "delimiter"],
                [/\$/, "number"],
                [/[ \t\r]+/, "white"]
            ]
        }
    });

    monaco.editor.defineTheme("arrows-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "register", foreground: "9CDCFE" },
            { token: "directive", foreground: "C586C0" },
            { token: "label", foreground: "DCDCAA" },
            { token: "string.invalid", foreground: "F44747" }
        ],
        colors: {
            "editor.background": "#1e1e1e"
        }
    });
}

function registerCompletion(monaco) {
    monaco.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems: (model, position) => {
            const line = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
            // No suggestions inside comments and strings
            if (line.includes(";") || (line.split("\"").length - 1) % 2 === 1)
                return { suggestions: [] };

            const word = model.getWordUntilPosition(position);
            const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            const item = (label, kind, detail, sortText) =>
                ({ label, kind, detail, range, sortText, insertText: label });

            const beforeWord = line.substring(0, word.startColumn - 1);
            const instructionItems = () => instructions.map(name =>
                item(name, monaco.languages.CompletionItemKind.Keyword, "instruction", name));

            // Start of a statement: a line start or right after a "label:"
            if (/^\s*$/.test(beforeWord) || /^\s*[a-zA-Z_]\w*\s*:\s*$/.test(beforeWord))
                return { suggestions: instructionItems() };

            // Second word after a name: "db" or "equ"
            const firstWord = beforeWord.match(/^\s*([a-zA-Z_]\w*)\s+$/);
            if (firstWord && !reservedNames.has(firstWord[1]))
                return {
                    suggestions: keywords.map(name =>
                        item(name, monaco.languages.CompletionItemKind.Keyword, "directive", name))
                };

            // Argument position: registers (except in db/equ values) and known names
            const suggestions = [];
            if (!/\b(?:db|equ)\b/.test(beforeWord))
                for (const name of registers)
                    suggestions.push(item(name, monaco.languages.CompletionItemKind.Variable, "register", "0" + name));
            for (const [name, info] of collectNames(monaco, model))
                suggestions.push(item(name, info.kind, info.detail, "1" + name));
            return { suggestions };
        }
    });
}

const reservedNames = new Set([...instructions, ...registers, ...keywords]);

function collectNames(monaco, model) {
    const names = new Map();
    for (let i = 1; i <= model.getLineCount(); ++i) {
        const line = model.getLineContent(i);
        let match;
        if ((match = line.match(/^\s*([a-zA-Z_]\w*)\s*:/)) && !reservedNames.has(match[1]))
            names.set(match[1], { kind: monaco.languages.CompletionItemKind.Function, detail: "label" });
        else if ((match = line.match(/^\s*([a-zA-Z_]\w*)\s+db\b/)) && !reservedNames.has(match[1]))
            names.set(match[1], { kind: monaco.languages.CompletionItemKind.Variable, detail: "db" });
        else if ((match = line.match(/^\s*([a-zA-Z_]\w*)\s+equ\b\s*(.*)/)) && !reservedNames.has(match[1]))
            names.set(match[1], { kind: monaco.languages.CompletionItemKind.Constant, detail: ("equ " + match[2]).trim() });
    }
    return names;
}

