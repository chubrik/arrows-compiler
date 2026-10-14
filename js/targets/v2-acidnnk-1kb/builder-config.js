import { GameMap } from "../../arrows.js";

const top = new GameMap("AAADAAAAAAAJGAwjARQCJAE0AQUCFQIlAjUCRQIWAiYDNgMnAwoJkAOSA5QDVQKWA6cAmAOZA5oBnQMMBnUChQGmAokBmwOMAY8BBgCGAREAhwETA4gBigGNAZ8DEAKLAY4BngMOAJUACwGXApwAAQeoAKkDqgOrA6wDrQOuA68DAQAAAAQTA4ABkgODAZUDEAOBAZEDhAGUAwwCkAOCAZMDDgCFAgEPoAOhA6IDowOkA6UDpgOnA6gDqQOqA6sDrAOtA64DrwMCAAAAAQEHoAOhA6IDowOkA6UDpgOnAwsAuAI=");
const bottom = new GameMap("AAADAAAAAAAEDwEEARQAEwAFAhABBgEWAQ4BFQUHBQoIFwAYABkAGgAbABwAHQAeAB8AAQAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AAgAAAAAKBxAAEQASABMAFAAVABYAFwA=");
const line = new GameMap("AAADAAAAAAAFEwAFARAABgEHAAcABgAVAAwAFgIKCBcDGAAZABoAGwAcAB0AHgAfAAEAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAIAAAAACgcQABEAEgATABQAFQAWABcA");

// Acidnnk's diskette mirrors ours top to bottom: the plug and the reader are on top, the rows
// go down from them, and the far end, where the first bytes lie, is at the bottom. Each piece
// keeps its x in the frame of the top; the line and the bottom each start on a data row, of
// which they hold only the cells left of the data
export const builderConfig = {
    top,
    bottom,
    line,
    rowBytes: 8,  // data bytes on one row of the diskette
    minBytes: 8,  // the smallest payload a diskette can carry: one row, the top and the bottom meet
    rowPitch: 2,  // map rows taken by one data row
    dataY: 11,    // y of the data row next to the top
    bottomUp: true, // the first row of bytes is the one at the bottom, next to the far end
    dataX: 8,     // x of the first data arrow in a row
    cellPitch: 1, // x step between the cells of one byte
    cells: [      // the arrow for each two-bit value of a cell: ours, mirrored
        { type: 1, rotation: 1, flipped: false },
        { type: 7, rotation: 0, flipped: false },
        { type: 7, rotation: 1, flipped: false },
        { type: 8, rotation: 1, flipped: false }
    ],
    topX: 0,      // x the top is pasted at: the pieces carry their own x
    lineX: 0,     // x the row piece is pasted at
    lineDy: 0,    // the row piece starts with its data row
    bottomDy: 9,  // bottom y = row count * rowPitch + bottomDy: on the last data row
};
