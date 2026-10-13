import { GameMap } from "./arrows.js";

// The map formats of the game, as the text a user brings: a map copied in the browser version,
// a map copied in the Steam version, or the Steam save file, which is JSON with the map in
// its data field (the clipboard and the field are one encoding, the clipboard only has its
// coordinates counted from zero). The text is base64 of a two-byte format version and the body:
//
//     u16  chunk count
//     per chunk: u16 x, u16 y (magnitude in bits 0-14, sign in bit 15), u8 types - 1
//     per type:  u8 type, u8 cells - 1
//     per cell:  u8 position (x | y << 4), u8 flags
//
// Version 0 is the browser version: the body follows the version as it is, and the flags are
// rotation | flipped << 2. The Steam version is a native program with no code to look at; its
// formats are read back from the saves themselves. A byte follows the version saying whether the
// body is a zlib stream (1) or raw (0, seen on a tiny map); in the body a cell may carry two bytes
// of data behind its flags (the key of a button, the note of a sound arrow) and a script arrow (type 33)
// the script text after them, as many bytes as the data says. Version 4 (the first Steam builds)
// keeps the flags as data | rotation << 1 | flipped << 3, version 5 as rotation | flipped << 2
// | data << 3; the top four bits hold the signal state. The browser keeps none of that
const layouts = {
    0: (flags) => ({ hasData: false, rotation: flags & 3, flipped: (flags & 4) !== 0 }),
    4: (flags) => ({ hasData: (flags & 1) !== 0, rotation: (flags >> 1) & 3, flipped: (flags & 8) !== 0 }),
    5: (flags) => ({ hasData: (flags & 8) !== 0, rotation: flags & 3, flipped: (flags & 4) !== 0 })
};

const browserVersion = 0;
const scriptType = 33;

// The browser version knows the arrows up to the wall and draws every other type as a question
// mark; type 26 is that question mark itself. Its button (21) is a different arrow from the
// Steam button of the same number, which is bound to a key
export const lastBrowserType = 25;
export const placeholderType = 26;
const buttonType = 21;

// What is wrong with the text, in words for the output panel
export class ArrowsMapError extends Error { }

export async function readArrowsMap(text) {
    let encoded = text.trim();
    if (encoded.startsWith("{")) {
        let file;
        try {
            file = JSON.parse(encoded);
        } catch {
            throw new ArrowsMapError("The text looks like a save file, but it is not valid JSON");
        }
        if (typeof file.data !== "string")
            throw new ArrowsMapError("The save file has no \"data\" field with the map in it");
        encoded = file.data;
    }

    const bytes = decodeBase64(encoded);
    if (bytes.length < 4)
        throw new ArrowsMapError("The text is too short to be a map");
    const version = bytes[0] | (bytes[1] << 8);
    const layout = layouts[version];
    if (!layout)
        throw new ArrowsMapError(version < 256
            ? `Unknown map format version ${version}: the browser version and Steam versions 4 and 5 are supported`
            : "The text is not a map copied from the game");
    let body;
    if (version === browserVersion)
        body = bytes.subarray(2);
    else if (bytes[2] === 1)
        body = await inflate(bytes.subarray(3));
    else if (bytes[2] === 0)
        body = bytes.subarray(3);
    else
        throw new ArrowsMapError(`Unknown map encoding ${bytes[2]}: compressed (1) and raw (0) are known`);
    return { version, cells: readBody(body, layout) };
}

// Whether a text is a map, by its opening alone: a save file with a data field, or base64 that
// starts with a known format version. Cheap enough to ask on every paste; whether the rest of
// the text holds up is for the conversion to tell
export function looksLikeMap(text) {
    let encoded = text.trim();
    if (encoded.startsWith("{")) {
        try {
            encoded = JSON.parse(encoded).data;
        } catch {
            return false;
        }
        if (typeof encoded !== "string")
            return false;
    }
    encoded = encoded.replace(/\s+/g, "");
    if (encoded.length < 8 || !/^[A-Za-z0-9+/]+=*$/.test(encoded))
        return false;
    const head = Uint8Array.from(atob(encoded.slice(0, 4)), (char) => char.charCodeAt(0));
    const version = head[0] | (head[1] << 8);
    return version === browserVersion || (version in layouts && head[2] <= 1);
}

function decodeBase64(text) {
    let binary;
    try {
        binary = atob(text.replace(/\s+/g, ""));
    } catch {
        throw new ArrowsMapError("The text is not base64, as a map copied from the game would be");
    }
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// zlib is what the browser calls "deflate"
async function inflate(bytes) {
    try {
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {
        throw new ArrowsMapError("The map data is damaged: it does not decompress");
    }
}

function readBody(body, layout) {
    let index = 0;
    const skip = (count) => {
        if (index + count > body.length)
            throw new ArrowsMapError("The map data ends early");
        index += count;
    };
    const byte = () => {
        skip(1);
        return body[index - 1];
    };
    const word = () => byte() | (byte() << 8);
    const coordinate = () => {
        const value = word();
        return value & 0x8000 ? -(value & 0x7FFF) : value;
    };

    const cells = [];
    const chunkCount = word();
    for (let i = 0; i < chunkCount; ++i) {
        const chunkX = coordinate();
        const chunkY = coordinate();
        const typeCount = byte() + 1;
        for (let j = 0; j < typeCount; ++j) {
            const type = byte();
            const cellCount = byte() + 1;
            for (let k = 0; k < cellCount; ++k) {
                const position = byte();
                const { hasData, rotation, flipped } = layout(byte());
                let data = null;
                if (hasData) {
                    data = word();
                    if (type === scriptType)
                        skip(data); // the script text, which the browser has no use for
                }
                cells.push({ x: chunkX * 16 + (position & 0xF), y: chunkY * 16 + (position >> 4), type, rotation, flipped, data });
            }
        }
    }
    if (index !== body.length)
        throw new ArrowsMapError("The map data goes on beyond its last chunk");
    return cells;
}

// An arrow that looks and acts the same whichever way it is turned: the source block, the pulse
// generator, the button, the target and the wall. Their rotation and flip are noise.
const turnless = new Set([2, 9, 21, 23, 25]);
const twoWaySplitter = 6;
const mirrorless = new Set([1, 3, 4, 5, 8, 10, 12, 15, 16, 17, 18, 19, 20, 22, 24]);
const sideways = new Set([7, 11]);

function normalForm(type, rotation, flipped) {
    if (turnless.has(type))
        return [0, false];
    if (type === twoWaySplitter)
        return [rotation % 2, false];
    if (mirrorless.has(type))
        return [rotation, false];
    if (sideways.has(type))
        return [flipped ? (rotation + 3) % 4 : rotation, false];
    return [rotation, flipped];
}

// The cells in the browser format, placed the way the game places a copy: the smallest x and y
// at zero, so that a paste lands under the cursor. Every arrow is written in its normal form,
// and everything the browser draws as a question mark becomes one, standing upright; only a
// question mark that was one already keeps its turn. What the browser version cannot keep is
// reported, and the strict output stops at it. The soft output goes on: a question mark for such
// an arrow, the arrow without its data otherwise. An empty cell is nothing, whatever is written on it.
export function writeBrowserMap(version, cells, strict) {
    const unsupported = [];
    let minX = Infinity;
    let minY = Infinity;
    for (const cell of cells)
        if (cell.type !== 0) {
            minX = Math.min(minX, cell.x);
            minY = Math.min(minY, cell.y);
        }
    const map = new GameMap();
    let placed = 0;
    for (const cell of cells) {
        let { type, rotation, flipped } = cell;
        if (type === 0)
            continue;
        if (version !== browserVersion && (type === buttonType || type > lastBrowserType)) {
            unsupported.push({ ...cell, reason: "type" });
            if (strict)
                continue;
            [type, rotation, flipped] = [placeholderType, 0, false];
        } else {
            if (cell.data !== null) {
                unsupported.push({ ...cell, reason: "data" });
                if (strict)
                    continue;
            }
            if (type > placeholderType)
                [type, rotation, flipped] = [placeholderType, 0, false];
            else
                [rotation, flipped] = normalForm(type, rotation, flipped);
        }
        map.setArrow(cell.x - minX, cell.y - minY, type, rotation, flipped);
        ++placed;
    }
    return { text: placed > 0 ? map.save() : "", unsupported };
}
