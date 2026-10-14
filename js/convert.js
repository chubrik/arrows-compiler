import { ArrowsMapError, describeExtras, nameType, readArrowsMap, writeBrowserMap } from "./arrows-map.js";
import { buildDiskette } from "./builder.js";
import { inputs, targetFor } from "./formats.js";

// Turns what the left pane holds into what the right pane shows. A map has to be decompressed
// first, which the browser only does asynchronously, so every conversion is a promise
export async function convert(source, input, output) {
    const format = inputs[input];
    return format.kind === "map" ? convertMap(source, format.outputs[output]) : compile(source, input, output);
}

function compile(source, input, output) {
    const { render } = inputs[input].outputs[output];
    const { Compiler, builderConfig } = targetFor(input, output);
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

// The output panel names this many problems one by one and counts the rest
const listedProblems = 50;

// The line of the error list for one thing the browser version cannot keep
function describeLoss(cell, version) {
    switch (cell.reason) {
        case "type": return `Unsupported arrow ${nameType(cell.type, version)} at (${cell.x}, ${cell.y})`;
        case "duplicate": return `Cell (${cell.x}, ${cell.y}) is written twice`;
        default: return `Arrow ${nameType(cell.type, version)} at (${cell.x}, ${cell.y}) ${describeExtras(cell)}, which the browser version cannot keep`;
    }
}

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
    const problems = [
        ...map.repeatedChunks.map(([x, y]) => `Chunk (${x}, ${y}) is listed twice`),
        ...unsupported.map(cell => describeLoss(cell, map.version)),
        ...(map.trailing > 0 ? [`The map data goes on for ${map.trailing} byte${map.trailing > 1 ? "s" : ""} after the last chunk`] : [])
    ];
    if (problems.length > 0 && strict) {
        const errors = problems.map(message => ({ message }));
        let errorMessage = `Conversion error (${errors.length} item${errors.length > 1 ? "s" : ""} could not be saved in the browser version; `
            + "use \"soft\" output mode to convert the map as much as possible: unsupported arrows become question marks, everything else is dropped).\n\n";
        for (const error of errors.slice(0, listedProblems))
            errorMessage += error.message + "\n";
        if (errors.length > listedProblems)
            errorMessage += `... and ${errors.length - listedProblems} more\n`;
        return { ...empty, text: errorMessage, errors };
    }

    return { ...empty, text };
}
