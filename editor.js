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
                detectIndentation: false
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
