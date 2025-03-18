import { Compiler, cp1251chars, cp1251map } from "./asm.js";
import { buildDisk } from "./builder.js";

function compile(asm) {
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

    return buildDisk(compiler.bytes);
}

document.addEventListener("DOMContentLoaded", () => {
    const source = document.getElementById("source");
    const output = document.getElementById("output");

    function update() {
        if (source.value.trim())
            history.replaceState(null, "", `${location.pathname}#code=${encodeToUrl(source.value)}`);
        else
            history.replaceState(null, "", location.pathname);
        output.value = compile(source.value);
    }
    source.addEventListener("input", update);

    source.value = decodeFromUrl(new URLSearchParams(location.hash.substring(1)).get("code") || "");
    output.value = compile(source.value);
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
