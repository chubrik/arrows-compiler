import { GameMap } from "../../arrows.js";

const top = new GameMap("AAAJAAAAAAAJGAwjARQCJAE0AQUCFQIlAjUCRQIWAiYDNgMnAwoJkAOSA5QDVQKWA6cAmAOZA5oBnQMMBnUChQGmAokBmwOMAY8BBgCGAREAhwETA4gBigGNAZ8DEAKLAY4BngMOAJUACwGXApwAAQeoAKkDqgOrA6wDrQOuA68DAQAAAAkTBoABkgODAZUDhgGYA40DEAWBAZEDhAGUA4cBlwMMBZADggGTA4UBlgOKAw4AiAIEBIkCmQGLApsBnAEKAIwDDwGOA54ACwCaAAMAnQABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DAgAAAAABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DAwAAAAABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DBAAAAAABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DBQAAAAABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DBgAAAAABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DBwAAAAABD6ADoQOiA6MDpAOlA6YDpwOoA6kDqgOrA6wDrQOuA68DCAAAAAEBB6ADoQOiA6MDpAOlA6YDpwMLALgC");
const bottom = new GameMap("AAAJAAAAAAAEDwEEARQAEwAFAhABBgEWAQ4BFQUHBQoIFwAYABkAGgAbABwAHQAeAB8AAQAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AAgAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AAwAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8ABAAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8ABQAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8ABgAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8ABwAAAAAKDxAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8ACAAAAAAKBxAAEQASABMAFAAVABYAFwA=");
const line = new GameMap("AAAJAAAAAAAFEwAFARAABgEHAAcABgAVAAwAFgIKCBcDGAAZABoAGwAcAB0AHgAfAAEAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAIAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAMAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAQAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAUAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAYAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAcAAAAACg8QABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfAAgAAAAACgcQABEAEgATABQAFQAWABcA");

// Acidnnk's diskette mirrors ours top to bottom: the plug and the reader are on top, the rows
// go down from them, and the far end, where the first bytes lie, is at the bottom. Each piece
// keeps its x in the frame of the top; the line and the bottom each start on a data row, of
// which they hold only the cells left of the data
export const builderConfig = {
    top,
    bottom,
    line,
    header: (length) => [length & 0xFF, length >> 8], // the program length, low byte first
    rowBytes: 32, // data bytes on one row of the diskette
    minBytes: 32, // the smallest payload a diskette can carry: one row, the top and the bottom meet
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
