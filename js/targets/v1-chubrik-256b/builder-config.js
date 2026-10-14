import { GameMap } from "../arrows.js";

const top = new GameMap("AAACAAAAAAAGCRMAABAAIAAwAEAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8AChUlAkUCJgJGAicCRwIoAkgCKQJJAioCSgIrAksCLAJMAi0CTQIuAk4CLwJPAgwBQQEyAgEAMwMOATQBRAQTAEIBEABDAQEAAAABCQoAAAEAAgADAAQABQAGABYAJgA2AEYACgkgAkACIQJBAiICQgIjAkMCJAJEAg==");
const bottom = new GameMap("AAAEAAAAAQABCggAAwIDEwAEAwYDCAMKAwwDDgMYCCMAMwBDACQDNANEAyUDNQNFAwAAAAAOCRsBABEAIQAxAEEAUQBhAHEAgQCRAKEAsQDBANEA4QDiAOQA5QDmAOcA6ADpAOoA6wDsAO0A7gDvAA4GAwbGA1cEyAPKA8wDzgMMC3MAkwDTAAQAVAKUAZYBmAGaAZwBngF/AQoWEwBTAGMBwwDzACQABQMVAmUBJgNGAKYDZwFoAogCuANZA1oBugNbA6wDvgNfAwsJMwAUASUBBgJmAXYChwB4AUkDaQEBObMANAKkAFUBhQE2AVYChgG2AAcDFwEnAHcDCAMYASgDOAEJAxkAKQM5AYkBCgIaASoDOgFKA4oBCwMbASsDOwBLA4sBDAMcAiwCPAJMA4wBDQMdAC0APQFNAI0BDgIeAS4DPgBOA44BDwMfAi8BPwJPA48BBwE1AkUCEwjEALUCNwK3AkgCuQK7Ar0CvwISAaMARAIQDJUAxQNHAZcAxwOZAMkDmwDLA50AzQOfAM8DDQJ0BlgBXQcDBYMAZAK0AHUBqAJcAgQKegGqAmsBewBsAXwDvABtAX0DbgKuAgYAfgEFBaUApwCpAKsArQCvAAEAAAALASYAAxABMANAAIABAQMRADEBQQOBAQICEgEiAzIBQgNyA4IBAwMTASMDMwJDA1MBYwCDAQQDFAEkAzQARABUAGQDBQMVAiUCNQJFAlUCZQMJFOAA4QDiAOMA5ADmAAcAFwAnADcARwBXAGcAdwCHAJcApwC3AMcA1wDnAAsDIAEhA4QB9QIQBlADcACRAMEDYgCTAMMDEwRRA2EBcQOxArMCDANgAZABUgOSAQoGoAOyA3QDlQK1AtUCdgMIAJQBBQGhAKMABAGwAKICDQCkBw4CwAPCA7QHAQABAAAKAgADAgMEAw==");
const line = new GameMap("AAACAAAAAAAGCQEAABAAEwACARAAAwEHAAQBBgASAAwAEwAKCxQDFQIWAhcCGAIZAhoCGwIcAh0CHgIfAgEAAAABCQEGABYACgQQAhECEgITAhQC");

export const builderConfig = {
    top,
    bottom,
    line,
    rowBytes: 4,  // data bytes on one row of the diskette
    minBytes: 8,  // the smallest payload a diskette can carry
    rowPitch: 2,  // map rows taken by one data row
    dataX: 6,     // x of the first data arrow in a row
    cellPitch: 1, // x step between the cells of one byte
    cells: [      // the arrow for each two-bit value of a cell
        { type: 1, rotation: 1, flipped: false },
        { type: 7, rotation: 1, flipped: false },
        { type: 7, rotation: 0, flipped: false },
        { type: 8, rotation: 1, flipped: false }
    ],
    topX: 1,      // x the top cap is pasted at
    lineX: 1,     // x the row separator is pasted at
    lineDy: 2,    // separator y relative to its row: the one below it
    bottomDy: 2,  // bottom cap y = row count * rowPitch + bottomDy
};
