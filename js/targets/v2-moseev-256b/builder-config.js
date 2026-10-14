import { GameMap } from "../arrows.js";

const top = new GameMap("AAADAAAAAAAAAhAAABAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8AAQAAAAMCDwAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8ACgEdAj0DAwAeAwUALQICAAAAAAIDAAABAAIAEgA=");
const bottom = new GameMap("AAAEAAAAAAAGARQCAhICIgIzA0MBNAM1A0UANwNHAFgBOQNJADsDSwDLAcwDPQNNAD8DTwACHBAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADhAOIA4wDkAOUA5gDnAOgA6QDqAOsA7ADtAO4A7wAEMBMCaAF4AIgBmACoAbgAaQF5A4kBmQOpAbkDagF6A4oBmgOqAboDawF7A4sBmwOrAbsDbAF8A4wBnAOsAbwDbQF9A40BnQOtAb0DbgF+A44BngOuAb4DbwF/A48BnwOvAb8DCwcyARQAJAM2AjgCOgI8Aj4CChMjAkQBFgJGARgCSAFZARoCSgFaA1sBHAJMAVwDXQEeAk4BXgPOA18BBQYlAycDKQPKAysDLQMvAwMAyQABAAAABwoqEAJAAVADwANRARICQgFSA8IDUwEUAkQBVAPEA0UBVQFGAVYDxgNHAVcBSAFYA8gDWQE6A0oBWgPKA/oAGwErA2sCiwLLATwDTAGMAl0A3QM+Al4CnwIBEzEDQQAzA0MAJQMoATgDKQNJAGoAOwFbArsDHAA9AI0AvQLNAC4CjwILETACMgI0AjcDOQAqANoAqwLbA6wCHQEtA30CTgF+Ac4CXwG/AgULIQMjAzUCJwPJA0sALADMAW0ArQCeAK4BEAAmAwRBYAFwA4ABkAOgAbADYQFxA4EBkQOhAbEDYgFyA4IBkgOiAbIDYwFzA4MBkwOjAbMDZAF0A4QBlAOkAbQDZQF1A4UBlQOlAbUDZgF2A4YBlgOmAbYDZwF3A4cBlwOnAbcDaAF4A4gBmAOoAbgDaQF5A4kBmQOpAbkDegOKAJoDqgC6A50AAwCOAwIK4ADhAOIA4wDkAOUA5gDnAOgA7gDvAAEAAQABCgEaADoAGBRYAWgAeAFJAVkBaQB5AYkASgBaAGoAegGKAEsDWwNrAHsBiwBcA2wAfAACAAAAAgIM4ADhABIAIgAyAEIAUgCSAKIAsgDCANIA4gALAGABCgNxAXMBdQF3AQ==");
const line = new GameMap("AAADAAAAAAAEAgIAABAAIAALAAQACg0iAhQDBQElAAYCBwEIAgkBCgILAQwCDQEOAg8BAQUSAiYCKAIqAiwCLgIFBiQCFQMXAxkDGwMdAx8DAQAAAAUKCwACAQECAgMBBAIFAQcBKAMqAxsDKwIsAwUFEQMTAxcDCAEKARwAAwAJAgsBGgELAgEHIAIiAiQCFQMmABgBGQMMABAAFgMCAAAAAAICAgASACIA");

export const builderConfig = {
    top,
    bottom,
    line,
    rowBytes: 1,  // data bytes on one row of the diskette
    minBytes: 2,  // the smallest payload a diskette can carry (assumed: seen only one sample)
    rowPitch: 3,  // map rows taken by one data row: a header, the bits, a footer
    dataX: 6,     // x of the first data arrow in a row (bit 0; bit 7 stands at x = 20)
    cellPitch: 2, // x step between the cells of one byte
    cells: [      // the arrow for each one-bit value of a cell
        { type: 1, rotation: 3, flipped: false },
        { type: 1, rotation: 2, flipped: false }
    ],
    topX: 0,      // x the top cap is pasted at
    lineX: 0,     // x the row band is pasted at
    lineDy: -1,   // band y relative to its row: the header row above the bits
    bottomDy: -2, // bottom cap y = row count * rowPitch + bottomDy
};
