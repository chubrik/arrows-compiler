import { GameMap } from "../../arrows.js";

const top = new GameMap("AAADAAAAAAAGCREQACAAMAABAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAKDSICIwIkAiUCJgInAigCKQIqAisCLAItAi4CLwIMAUEBMgIBADMDDgE0AUQEEwBCARAAQwEBAAAAAQkPAAABAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAKDyACIQIiAiMCJAIlAiYCJwIoAikCKgIrAiwCLQIuAi8CAgAAAAEJCAAAAQACAAMABAAFABYAJgA2AAoEIAIhAiICIwIkAg==");
const bottom = new GameMap("AAAEAAAAAAALDQEIBjkGCQgUACQAeAB6AHsAfAB9AH4AfwAGABYADAg0AkQCVABmABcAdwEZAnkDOwEBCUYAtgAYA0gCGgMbAxwDHQIeAx8DDgRkAXUEJgFHBUkDEQQnAjcCVwI8AT0BChKQA5IDlANWAHYChgCWA6YAKAE4AFgBWQNLAywBTANNAz4BTgNPAwsDZwIpAUoCLQMECSoBWgErAVsBXAFdAS4BXgEvAV8BEgE2ADoBGBHUAeQB9AHFAdUB5QH1AcYA1gDmAPYAxwPXA+cD9wPYA+gD+AMAAAEAABgCBQEGAAcDAQAAAAYBGxADEQISAxMDMwEUAzQBFQI1ARYDFwM3AxgDOAMZAjkDGgM6AxsDOwMcAzwDHQI9Ax4DPgMfAz8DCgwgAUADQQNDAyQBRANFA0YDRwMoAUgDSQMsAQsDIQMlAykDLQMEHlABUQEiATIBUgEjAVMBVAFVASYBVgEnAVcBWAFZASoBSgNaASsBSwNbAUwDXAFNA10BLgFOA14BLwFPA18BDQEwAUIDEQA2AgkPcABxAHIAcwB0AHUAdgB3AHgAeQB6AHsAfAB9AH4AfwACAAAABgEOEAMwAxECMQMSAzIDUgATA1MDFANUAxUCFgMXAxgDCQpwAHEAcgBzAHQAZQBWAEcAOAApABoACgEgASQBCwUhA0QAJQNFAjYCJwIECUADUAFRACIBIwEzA0MBNAM1AyYBEQBBAwYAQgE=");
const line = new GameMap("AAADAAAAAAAGCQEAABAABgACAAwAAwAKCwQDBQIGAgcCCAIJAgoCCwIMAg0CDgIPAhMAEgEQABMBBwAUAQEAAAAACg8AAgECAgIDAgQCBQIGAgcCCAIJAgoCCwIMAg0CDgIPAgIAAAABCgQAAgECAgIDAgQCCQEGABYA");

export const builderConfig = {
    top,
    bottom,
    line,
    rowBytes: 8,  // data bytes on one row of the diskette
    minBytes: 16, // the smallest payload a diskette can carry
    rowPitch: 2,  // map rows taken by one data row
    dataX: 9,     // x of the first data arrow in a row
    cellPitch: 1, // x step between the cells of one byte
    cells: [      // the arrow for each two-bit value of a cell
        { type: 1, rotation: 1, flipped: false },
        { type: 7, rotation: 1, flipped: false },
        { type: 7, rotation: 0, flipped: false },
        { type: 8, rotation: 1, flipped: false }
    ],
    topX: 4,      // x the top cap is pasted at
    lineX: 4,     // x the row separator is pasted at
    lineDy: 1,    // separator y relative to its row: the one below it
    bottomDy: 1,  // bottom cap y = row count * rowPitch + bottomDy
};
