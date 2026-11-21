import { GameMap } from "../../arrows.js";

const top = new GameMap("AAADAAAAAAAAAhAAABAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8AAQAAAAMCDwAAAQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8ACgEdAj0DAwAeAwUALQICAAAAAAIDAAABAAIAEgA=");
const bottom = new GameMap("AAAEAAAAAAAGAhwQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA4QDiAOMA5ADlAOYA5wDoAOkA6gDrAOwA7QDuAO8AATgCAhICIgIzA0MBNAM1A0UANwNHADkDSQCpArkAWgFqAXoAigGaAKoBugA7A0sAawF7A4sBmwOrAbsDbAF8A4wBnAOsAbwDPQNNAG0BfQONAZ0DrQG9A24BfgOOAZ4DrgG+Az8DTwBvAX8DjwGfA68BvwMLCDIBFAAkAzYCOAI6AsoDPAI+AgQAEwIKEiMCRAEWAkYBGAJIARoCSgFbARwCTAFcA8wDXQEeAk4BXgPOA18BBQYlAycDKQOZACsDLQMvAwMAiQEBAAEAARgUWAFoAHgBSQFZAWkAeQGJAEoAWgBqAHoBigBLA1sDawB7AYsAXANsAHwACgEaADoAAQAAAAcKKhACQAFQA8ADUQESAkIBUgPCA1MBFAJEAVQDxANFAVUBRgFWA8YDRwFXAUgBWAPIA1kBOgNKAVoDygP6ABsBKwNrAosCywE8A0wBjAJdAN0DPgJeAp8CCxEwAjICNAI3AzkAKgDaAKsC2wOsAh0BLQN9Ak4BfgHOAl8BvwIBVGABcAOAAZADoAGwAzEDQQBhAXEDgQGRA6EBsQNiAXIDggGSA6IBsgMzA0MAYwFzA4MBkwOjAbMDZAF0A4QBlAOkAbQDJQNlAXUDhQGVA6UBtQNmAXYDhgGWA6YBtgNnAXcDhwGXA6cBtwMoATgDaAF4A4gBmAOoAbgDKQNJAGkBeQOJAZkDqQG5A2oAegOKAJoDqgC6AzsBWwK7AxwAPQCNAL0CzQAuAo8CAgrgAOEA4gDjAOQA5QDmAOcA6ADuAO8ABQshAyMDNQInA8kDSwAsAMwBbQCtAJ4ArgEQACYDBACdAAMAjgMCAAAAAgsAYAECDOAA4QASACIAMgBCAFIAkgCiALIAwgDSAOIACgNxAXMBdQF3AQ==");
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
