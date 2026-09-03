import { buildDisk } from "./builder.js";
import { createMonacoEditor } from "./editor.js";
import { createPlainEditor } from "./plain-editor.js";
import { cp1251chars, cp1251map, stripBom } from "./text.js";
import { Compiler as CompilerV1 } from "./v1/asm.js";
import { builderConfig as builderConfigV1 } from "./v1/builder-config.js";
import { Compiler as CompilerV2 } from "./v2/asm.js";
import { builderConfig as builderConfigV2 } from "./v2/builder-config.js";

const cpuVersions = {
    "v1": { Compiler: CompilerV1, builderConfig: builderConfigV1 },
    "v2": { Compiler: CompilerV2, builderConfig: builderConfigV2 },
};
const defaultCpu = "v2";

const modeKey = "editor-mode";
const themeKey = "theme";

// The theme is resolved and applied here, while the module runs: waiting for DOMContentLoaded
// would let the page flash the dark ground state at someone who asked for the light one
const lightQuery = matchMedia("(prefers-color-scheme: light)");
applyTheme(storedTheme());

function compile(asm, format, cpu) {
    const { Compiler, builderConfig } = cpuVersions[cpu];
    const compiler = new Compiler(asm);
    compiler.compile();

    const lineOffsets = compiler.lineOffsets ?? []; // the v1 compiler tracks no banking
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

    return { text: buildDisk(compiler.bytes, builderConfig), errors: [], lineOffsets, byteCount };
}

document.addEventListener("DOMContentLoaded", async () => {
    const source = document.getElementById("source");
    const output = document.getElementById("output");
    const cpuSelect = document.getElementById("cpu");
    const outputFormat = document.getElementById("output-format");
    const editorMode = document.getElementById("editor-mode");
    const themeSelect = document.getElementById("theme");

    const params = new URLSearchParams(location.hash.substring(1));
    const initialSource = stripBom(decodeFromUrl(params.get("code") || ""));
    const format = params.get("output");
    if (format && [...outputFormat.options].some(option => option.value === format))
        outputFormat.value = format;
    const cpu = params.get("cpu");
    if (cpu && cpu in cpuVersions)
        cpuSelect.value = cpu;

    editorMode.value = storedMode();
    themeSelect.value = storedTheme();

    // Whichever editor is running, the page talks to it through the same handful of methods
    async function createEditor(mode, value) {
        const theme = document.documentElement.dataset.theme;
        if (mode === "monaco")
            try {
                return await createMonacoEditor(source, value, theme, cpuSelect.value);
            } catch {
                // Offline, or the CDN is out of reach: the simple editor still compiles, and
                // the fallback is not remembered — the choice stands for the next visit
                editorMode.value = "plain";
            }
        return createPlainEditor(source, value, theme);
    }

    let editor = await createEditor(editorMode.value, initialSource);
    editor.onChange(update);

    let lastResult;
    let pendingCompile = false;

    function compileNow() {
        pendingCompile = false;
        showResult(compile(editor.getValue(), outputFormat.value, cpuSelect.value));
    }

    function showResult(result) {
        lastResult = result;
        output.value = result.text;
        output.classList.toggle("errors", result.errors.length > 0);
        editor.setErrors(result.errors);
    }

    function showBankBoundaries() {
        editor.setBankBoundaries(lastResult.lineOffsets, lastResult.byteCount);
    }

    function updateHash() {
        const source = stripBom(editor.getValue());
        const params = new URLSearchParams();
        if (cpuSelect.value !== defaultCpu)
            params.set("cpu", cpuSelect.value);
        if (outputFormat.value !== "arrows")
            params.set("output", outputFormat.value);
        if (source.trim())
            params.set("code", encodeToUrl(source));
        const hash = params.toString();
        history.replaceState(null, "", hash ? `${location.pathname}#${hash}` : location.pathname);
    }

    let compileTimer;
    let idleTimer;

    function update() {
        pendingCompile = true;
        clearTimeout(compileTimer);
        compileTimer = setTimeout(compileNow, 10);
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (pendingCompile) {
                clearTimeout(compileTimer);
                compileNow();
            }
            updateHash();
            showBankBoundaries();
        }, 500);
    }

    outputFormat.addEventListener("change", () => {
        compileNow();
        updateHash();
    });

    // A new target computer means a new dialect in the editor, new bytes and a new bank layout
    cpuSelect.addEventListener("change", () => {
        editor.setCpu(cpuSelect.value);
        compileNow();
        updateHash();
        showBankBoundaries();
    });

    // Switching editors keeps the code and the caret; what it costs is redrawing what
    // lives inside the editor being replaced
    editorMode.addEventListener("change", async () => {
        const mode = editorMode.value;
        try {
            localStorage.setItem(modeKey, mode);
        } catch { } // a browser with the storage turned off simply forgets the choice
        const value = editor.getValue();
        const { line, column } = editor.getPosition();
        editor.dispose();
        editor = await createEditor(mode, value);
        editor.onChange(update);

        // The text did not change, so there is nothing to compile again: only what lived
        // inside the old editor has to be put back — the error markers and the separators
        if (pendingCompile)
            compileNow();
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

    compileNow();
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
