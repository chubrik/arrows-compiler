import { buildDiskette } from "./builder.js";
import { computerFor, inputs } from "./formats.js";

// Turns what the left pane holds into what the right pane shows
export function convert(source, input, output) {
    const { render } = inputs[input].outputs[output];
    const { Compiler, builderConfig } = computerFor(input, output);
    const compiler = new Compiler(source);
    compiler.compile();

    const { lineOffsets } = compiler;
    const byteCount = compiler.bytes.length; // buildDiskette() pads and consumes the bytes

    if (compiler.errors.length > 0) {
        let errorMessage = `Compilation failed (${compiler.errors.length} error${compiler.errors.length > 1 ? "s" : ""})\n\n`;
        for (const error of compiler.errors)
            errorMessage += `Error at line ${error.position[0] + 1}, column ${error.position[1] + 1}: ${error.message}\n\n`;
        return { text: errorMessage, errors: compiler.errors, lineOffsets, byteCount };
    }

    if (byteCount === 0)
        return { text: "", errors: [], lineOffsets, byteCount };

    if (render === "hex")
        return { text: compiler.bytes.map(byte => "0x" + byte.toString(16).toUpperCase().padStart(2, "0")).join(", "), errors: [], lineOffsets, byteCount };

    return { text: buildDiskette(compiler.bytes, builderConfig), errors: [], lineOffsets, byteCount };
}
