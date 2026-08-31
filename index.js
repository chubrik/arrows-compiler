import { Compiler, cp1251chars, cp1251map } from "./asm.js";
import { buildDisk } from "./builder.js";
import { createEditor, updateBankBoundaries } from "./editor.js";

function compile(asm, format) {
    const compiler = new Compiler(asm);
    compiler.compile();

    const { lineOffsets } = compiler;
    const byteCount = compiler.bytes.length; // buildDisk() pads and consumes the bytes

    if (compiler.errors.length > 0) {
        let errorMessage = `Compilation failed (${compiler.errors.length} error${compiler.errors.length > 1 ? "s" : ""})\n\n`;
        for (const error of compiler.errors)
            errorMessage += `Error at line ${error.position[0] + 1}, column ${error.position[1] + 1}: ${error.message}\n\n`;
        return { text: errorMessage, errors: compiler.errors, lineOffsets, byteCount };
    }

    if (byteCount === 0)
        return { text: "", errors: [], lineOffsets, byteCount };

    if (format === "hex")
        return { text: compiler.bytes.map(byte => "0x" + byte.toString(16).toUpperCase().padStart(2, "0")).join(", "), errors: [], lineOffsets, byteCount };

    return { text: buildDisk(compiler.bytes), errors: [], lineOffsets, byteCount };
}

document.addEventListener("DOMContentLoaded", async () => {
    const output = document.getElementById("output");
    const outputFormat = document.getElementById("output-format");

    const params = new URLSearchParams(location.hash.substring(1));
    const initialSource = stripBom(decodeFromUrl(params.get("code") || ""));
    const format = params.get("output");
    if (format && [...outputFormat.options].some(option => option.value === format))
        outputFormat.value = format;

    const { monaco, editor } = await createEditor(document.getElementById("source"), initialSource);

    function setErrorMarkers(errors) {
        const model = editor.getModel();
        const markers = errors.map(({ position: [line, column], message }) => {
            const start = model.validatePosition({ lineNumber: line + 1, column: column + 1 });
            const word = model.getWordAtPosition(start);
            return {
                severity: monaco.MarkerSeverity.Error,
                message,
                startLineNumber: start.lineNumber,
                startColumn: word?.startColumn ?? start.column,
                endLineNumber: start.lineNumber,
                endColumn: word?.endColumn ?? start.column + 1
            };
        });
        monaco.editor.setModelMarkers(model, "arrows", markers);
    }

    function showResult({ text, errors, lineOffsets, byteCount }) {
        output.value = text;
        output.classList.toggle("errors", errors.length > 0);
        setErrorMarkers(errors);
        updateBankBoundaries(editor, lineOffsets, byteCount);
    }

    function update() {
        const source = editor.getValue();
        const params = new URLSearchParams();
        if (outputFormat.value !== "arrows")
            params.set("output", outputFormat.value);
        if (source.trim())
            params.set("code", encodeToUrl(stripBom(source)));
        const hash = params.toString();
        history.replaceState(null, "", hash ? `${location.pathname}#${hash}` : location.pathname);

        showResult(compile(source, outputFormat.value));
    }

    editor.onDidChangeModelContent(update);
    outputFormat.addEventListener("change", update);

    // A click on an error line in the output jumps to its position in the code;
    // a click anywhere else in the failed output jumps to the first error
    const errorPattern = /^Error at line (\d+), column (\d+)/;
    output.addEventListener("click", () => {
        if (!output.classList.contains("errors"))
            return;
        const lines = output.value.split("\n");
        const lineIndex = output.value.substring(0, output.selectionStart).split("\n").length - 1;
        const match = lines[lineIndex]?.match(errorPattern)
            ?? lines.map(line => line.match(errorPattern)).find(Boolean);
        if (!match)
            return;
        const position = { lineNumber: +match[1], column: +match[2] };
        editor.setPosition(position);
        editor.revealPositionInCenterIfOutsideViewport(position);
        editor.focus();
    });

    editor.onDidPaste((event) => {
        const model = editor.getModel();
        const pasted = model.getValueInRange(event.range);
        if (pasted.includes("\uFEFF"))
            editor.executeEdits("strip-bom", [{ range: event.range, text: stripBom(pasted) }]);

        // Trim the trailing whitespace on every line
        const trims = [];
        for (let i = 1; i <= model.getLineCount(); ++i) {
            const line = model.getLineContent(i);
            const trailing = line.match(/[ \t]+$/);
            if (trailing)
                trims.push({
                    range: new monaco.Range(i, line.length - trailing[0].length + 1, i, line.length + 1),
                    text: ""
                });
        }
        if (trims.length > 0)
            editor.executeEdits("trim-trailing", trims);

        // After a paste the document should end with exactly one newline
        const value = model.getValue();
        const trailing = value.match(/\n*$/)[0].length;
        if (trailing !== 1) {
            const start = model.getPositionAt(value.length - trailing);
            const end = model.getPositionAt(value.length);
            editor.executeEdits("normalize-eol", [{
                range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                text: "\n"
            }]);
        }

        // Monaco has already scrolled to where the paste ended, a line above the newline just
        // appended; this handler runs after everything the paste set in motion, so the last
        // word on where to look is ours
        editor.revealPosition(editor.getPosition());
    });

    const copyButton = document.getElementById("copy");
    let copyResetTimer;
    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(output.value);
        } catch {
            output.select();
            document.execCommand("copy");
        }
        copyButton.textContent = "Copied!";
        clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(() => copyButton.textContent = "Copy", 1500);
    });

    showResult(compile(initialSource, outputFormat.value));
    editor.focus();
});

function stripBom(value) {
    return value.replace(/\uFEFF/g, "");
}

function encodeToUrl(value) {
    const tabbed = value.replace(/    /g, "\x00");
    const buffer = [];
    let charCode;
    let cp1251code;
    for (let i = 0; i < tabbed.length; ++i) {
        if ((charCode = tabbed.charCodeAt(i)) < 128)
            buffer.push(charCode);
        else if (cp1251code = cp1251map[tabbed[i]])
            buffer.push(cp1251code);
        else
            buffer.push(0x01, (charCode >> 8) & 0xFF, charCode & 0xFF);
    }
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function decodeFromUrl(code) {
    const base64 = code
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    let value = "";
    let charCode;
    for (let i = 0; i < bytes.length; ++i) {
        charCode = bytes[i];
        if (charCode === 0)
            value += "    ";
        else if (charCode === 1) {
            if (bytes.length < i + 3)
                return value;
            value += String.fromCharCode((bytes[++i] << 8) | bytes[++i]);
        } else if (charCode < 128)
            value += String.fromCharCode(charCode);
        else
            value += cp1251chars[charCode - 128];
    }
    return value;
}
