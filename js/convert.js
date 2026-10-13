import { buildDiskette } from "./builder.js";
import { computerFor, inputs } from "./formats.js";
import { ArrowsMapError, readArrowsMap, writeBrowserMap } from "./arrows-map.js";

// Turns what the left pane holds into what the right pane shows. A map has to be decompressed
// first, which the browser only does asynchronously, so every conversion is a promise
export async function convert(source, input, output) {
    const format = inputs[input];
    return format.kind === "map" ? convertMap(source, format.outputs[output]) : compile(source, input, output);
}

function compile(source, input, output) {
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

// The output panel names this many unsupported arrows one by one and counts the rest
const listedArrows = 50;

// A map has no lines of code behind its bytes: no line offsets, no banks, and its errors
// carry no position
async function convertMap(source, { strict }) {
    const empty = { errors: [], lineOffsets: [], byteCount: 0 };
    if (source.trim() === "")
        return { text: "", ...empty };

    let map;
    try {
        map = await readArrowsMap(source);
    } catch (error) {
        if (!(error instanceof ArrowsMapError))
            throw error;
        return { ...empty, text: `Conversion error\n\n${error.message}\n`, errors: [{ message: error.message }] };
    }

    const { text, unsupported } = writeBrowserMap(map.version, map.cells, strict);
    if (unsupported.length > 0 && strict) {
        const errors = unsupported.map(({ reason, type, x, y, data }) => ({
            message: reason === "type"
                ? `Unsupported arrow type ${type} at (${x}, ${y})`
                : `Arrow type ${type} at (${x}, ${y}) carries data (${data}) the browser version cannot keep`
        }));
        let errorMessage = `Conversion error (${errors.length} arrow${errors.length > 1 ? "s" : ""} could not be saved in the browser version; `
            + "use \"soft\" output mode to convert the map as much as possible, replacing unsupported arrows with question marks).\n\n";
        for (const error of errors.slice(0, listedArrows))
            errorMessage += error.message + "\n";
        if (errors.length > listedArrows)
            errorMessage += `... and ${errors.length - listedArrows} more\n`;
        return { ...empty, text: errorMessage, errors };
    }

    return { ...empty, text };
}
