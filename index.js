import { Compiler, cp1251chars, cp1251map } from "./asm.js";
import { buildDisk } from "./builder.js";

function compile(asm, format) {
    const compiler = new Compiler(asm);
    compiler.compile();

    if (compiler.errors.length > 0) {
        let errorMessage = `Compilation failed (${compiler.errors.length} error${compiler.errors.length > 1 ? "s" : ""})\n\n`;
        for (const error of compiler.errors)
            errorMessage += `Error at line ${error.position[0] + 1}, column ${error.position[1] + 1}: ${error.message}\n\n`;
        return errorMessage;
    }

    if (compiler.bytes.length === 0)
        return "";

    if (format === "hex")
        return compiler.bytes.map(byte => "0x" + byte.toString(16).toUpperCase().padStart(2, "0")).join(", ");

    return buildDisk(compiler.bytes);
}

document.addEventListener("DOMContentLoaded", () => {
    const source = document.getElementById("source");
    const output = document.getElementById("output");
    const outputFormat = document.getElementById("output-format");

    function update() {
        const params = new URLSearchParams();
        if (outputFormat.value !== "arrows")
            params.set("output", outputFormat.value);
        if (source.value.trim())
            params.set("code", encodeToUrl(stripBom(source.value)));
        const hash = params.toString();
        history.replaceState(null, "", hash ? `${location.pathname}#${hash}` : location.pathname);
        output.value = compile(source.value, outputFormat.value);
    }
    source.addEventListener("input", update);
    outputFormat.addEventListener("change", update);

    source.addEventListener("paste", (event) => {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        if (!text.includes("\uFEFF"))
            return;
        event.preventDefault();
        source.setRangeText(stripBom(text), source.selectionStart, source.selectionEnd, "end");
        update();
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

    const params = new URLSearchParams(location.hash.substring(1));
    source.value = stripBom(decodeFromUrl(params.get("code") || ""));
    const format = params.get("output");
    if (format && [...outputFormat.options].some(option => option.value === format))
        outputFormat.value = format;
    output.value = compile(source.value, outputFormat.value);
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
