import { convert } from "./convert.js";
import { createMonacoEditor } from "./editor.js";
import { computerFor, defaultInput, defaultOutput, inputs, resolveConversion } from "./formats.js";
import { createPlainEditor } from "./plain-editor.js";
import { cp1251chars, cp1251map, stripBom } from "./text.js";

const modeKey = "editor-mode";
const themeKey = "theme";

// The theme is resolved and applied here, while the module runs: waiting for DOMContentLoaded
// would let the page flash the dark ground state at someone who asked for the light one
const lightQuery = matchMedia("(prefers-color-scheme: light)");
applyTheme(storedTheme());

document.addEventListener("DOMContentLoaded", async () => {
    const source = document.getElementById("source");
    const output = document.getElementById("output");
    const inputSelect = document.getElementById("input-format");
    const outputSelect = document.getElementById("output-format");
    const editorMode = document.getElementById("editor-mode");
    const themeSelect = document.getElementById("theme");

    const params = new URLSearchParams(location.hash.substring(1));
    const initialSource = stripBom(decodeFromUrl(params.get("code") || ""));

    // The lists come from the registry, the outputs depend on the input. The markup carries the
    // same lists for the default input, so the toolbar has its final width before the script
    // runs: a select filled only here would start empty and push the toolbar around
    inputSelect.replaceChildren();
    for (const [key, { label }] of Object.entries(inputs))
        inputSelect.add(new Option(label, key));

    function fillOutputs(input, wanted) {
        outputSelect.replaceChildren();
        for (const [key, { label }] of Object.entries(inputs[input].outputs))
            outputSelect.add(new Option(label, key));
        outputSelect.value = wanted in inputs[input].outputs ? wanted : defaultOutput(input);
    }

    const conversion = resolveConversion(params);
    inputSelect.value = conversion.input;
    fillOutputs(conversion.input, conversion.output);

    editorMode.value = storedMode();
    themeSelect.value = storedTheme();

    // A map is one long line of base64 with nothing to highlight and nothing to number: it gets
    // a bare field that wraps, whichever editor is chosen for code, and the choice hides meanwhile
    const editorModeGroup = editorMode.closest(".toolbar-group");
    const isMap = () => inputs[inputSelect.value].kind === "map";

    function showEditorChoice() {
        editorModeGroup.hidden = isMap();
    }

    showEditorChoice();

    // Whichever editor is running, the page talks to it through the same handful of methods
    async function createEditor(mode, value) {
        const theme = document.documentElement.dataset.theme;
        if (isMap())
            return createPlainEditor(source, value, { bare: true });
        if (mode === "monaco")
            try {
                return await createMonacoEditor(source, value, theme, inputSelect.value, outputSelect.value);
            } catch {
                // Offline, or the CDN is out of reach: the simple editor still compiles, and
                // the fallback is not remembered — the choice stands for the next visit
                editorMode.value = "plain";
            }
        return createPlainEditor(source, value);
    }

    let editor = await createEditor(editorMode.value, initialSource);
    let editorIsMap = isMap();
    editor.onChange(update);

    // A whole program pasted into the empty editor may not fit the memory of the output chosen;
    // when the same computer comes with a larger one, the page switches to its diskette silently
    let pastedIntoEmpty = false;

    function notePaste({ wasEmpty }) {
        pastedIntoEmpty = wasEmpty;
    }

    editor.onPaste(notePaste);

    let lastResult;
    let pendingCompile = false;
    let conversionSerial = 0;

    // A conversion takes a moment (a map is decompressed first) and the text may change
    // meanwhile: only the latest conversion started gets to show its result
    async function compileNow() {
        pendingCompile = false;
        const serial = ++conversionSerial;
        const source = editor.getValue();
        const input = inputSelect.value;
        let output = outputSelect.value;
        const pasted = pastedIntoEmpty;
        pastedIntoEmpty = false;
        let result = await convert(source, input, output);
        if (serial !== conversionSerial)
            return;
        if (pasted) {
            const { largerMemory } = inputs[input].outputs[output];
            if (largerMemory && result.byteCount > computerFor(input, output).Compiler.memorySize) {
                output = largerMemory;
                outputSelect.value = output;
                editor.setConversion(input, output);
                result = await convert(source, input, output);
                if (serial !== conversionSerial)
                    return;
            }
        }
        showResult(result);
    }

    // A click on an error leads to its line; an error of a map conversion names none, so the
    // output of a failed conversion is not clickable then
    function showResult(result) {
        lastResult = result;
        output.value = result.text;
        output.classList.toggle("errors", result.errors.some(error => error.position));
        editor.setErrors(result.errors);
    }

    function showBankBoundaries() {
        editor.setBankBoundaries(lastResult.lineOffsets, lastResult.byteCount);
    }

    function updateHash() {
        const source = stripBom(editor.getValue());
        const params = new URLSearchParams();
        if (inputSelect.value !== defaultInput)
            params.set("in", inputSelect.value);
        if (outputSelect.value !== defaultOutput(inputSelect.value))
            params.set("out", outputSelect.value);
        if (source.trim())
            params.set("code", encodeToUrl(source));
        const hash = params.toString();
        try {
            history.replaceState(null, "", hash ? `${location.pathname}#${hash}` : location.pathname);
        } catch { } // a map file can outgrow what the browser lets a link hold: the code then stays out of the link
    }

    let compileTimer;
    let idleTimer;

    function update() {
        pendingCompile = true;
        clearTimeout(compileTimer);
        compileTimer = setTimeout(compileNow, 10);
        clearTimeout(idleTimer);
        idleTimer = setTimeout(async () => {
            if (pendingCompile) {
                clearTimeout(compileTimer);
                await compileNow();
            }
            updateHash();
            showBankBoundaries();
        }, 500);
    }

    // A new output may mean a new computer: new bytes, new hints and a new bank layout
    outputSelect.addEventListener("change", async () => {
        editor.setConversion(inputSelect.value, outputSelect.value);
        await compileNow();
        updateHash();
        showBankBoundaries();
    });

    // Replaces the editor, keeping the text and the caret; what lived inside the old one, the
    // error markers and the separators, the caller puts back
    async function replaceEditor() {
        const value = editor.getValue();
        const position = editor.getPosition();
        editor.dispose();
        editor = await createEditor(editorMode.value, value);
        editorIsMap = isMap();
        editor.onChange(update);
        editor.onPaste(notePaste);
        return position;
    }

    // A new input means a new dialect and a new list of outputs; an output of the same name
    // stays chosen, otherwise the first one does. Code and a map live in different editors
    inputSelect.addEventListener("change", async () => {
        fillOutputs(inputSelect.value, outputSelect.value);
        showEditorChoice();
        if (isMap() !== editorIsMap)
            await replaceEditor();
        else
            editor.setConversion(inputSelect.value, outputSelect.value);
        await compileNow();
        updateHash();
        showBankBoundaries();
    });

    // Switching editors keeps the code and the caret; what it costs is redrawing what
    // lives inside the editor being replaced
    editorMode.addEventListener("change", async () => {
        try {
            localStorage.setItem(modeKey, editorMode.value);
        } catch { } // a browser with the storage turned off simply forgets the choice
        const { line, column } = await replaceEditor();

        // The text did not change, so there is nothing to compile again: only what lived
        // inside the old editor has to be put back — the error markers and the separators
        if (pendingCompile)
            await compileNow();
        else
            showResult(lastResult);

        showBankBoundaries();
        editor.goToPosition(line, column);
    });

    themeSelect.addEventListener("change", () => {
        try {
            localStorage.setItem(themeKey, themeSelect.value);
        } catch { }
        editor.setTheme(applyTheme(themeSelect.value));
    });

    // A system that turns dark for the night takes the page along, unless a theme was picked by hand
    lightQuery.addEventListener("change", () => {
        if (themeSelect.value === "auto")
            editor.setTheme(applyTheme("auto"));
    });

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
        editor.goToPosition(+match[1], +match[2]);
    });

    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && (event.code === "KeyS" || event.key.toLowerCase() === "s"))
            event.preventDefault();
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

    await compileNow();
    showBankBoundaries();
    editor.focus();
});

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

// Monaco is the default; the simple editor is a property of the device, not of the program,
// so the choice stays out of the URL that gets shared along with the code
function storedMode() {
    try {
        return localStorage.getItem(modeKey) === "plain" ? "plain" : "monaco";
    } catch {
        return "monaco";
    }
}

// Auto follows the browser or the system; a deliberate choice outlives what they say
function storedTheme() {
    try {
        const theme = localStorage.getItem(themeKey);
        return theme === "light" || theme === "dark" ? theme : "auto";
    } catch {
        return "auto";
    }
}

function applyTheme(choice) {
    const theme = choice === "auto" ? (lightQuery.matches ? "light" : "dark") : choice;
    document.documentElement.dataset.theme = theme;
    return theme;
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
