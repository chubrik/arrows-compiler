import { GameMap } from "../arrows.js";

const top = new GameMap("AAADAAAAAAAAAhAAAxADAQMCAwMDBAMFAwYDBwMIAwkDCgMLAwwDDQMOAw8DAQAAAAMCDwADAQMCAwMDBAMFAwYDBwMIAwkDCgMLAwwDDQMOAw8DCgEdBj0HBQAtBgMAHgcCAAAAAAIDAAMBAwIDEgM=");
const bottom = new GameMap("AAAEAAAAAAAGAhwQACAAMABAAFAAYABwAIAAkACgALAAwADQAOAA4QDiAOMA5ADlAOYA5wDoAOkA6gDrAOwA7QDuAO8AARQCBhIGIgYzB0MFNAc1B0UENwdHBFgFOQdJBDsHSwTLAcwDPQdNBD8HTwQLBzIGFAUkBDYHOAc6BzwHPgcEMBMCaAF4AIgBmACoAbgAaQF5A4kBmQOpAbkDagF6A4oBmgOqAboDawF7A4sBmwOrAbsDbAF8A4wBnAOsAbwDbQF9A40BnQOtAb0DbgF+A44BngOuAb4DbwF/A48BnwOvAb8DChMjAkQBFgJGARgCSAFZARoCSgFaA1sBHAJMAVwDXQEeAk4BXgPOA18BBQYlAycDKQPKAysDLQMvAwMAyQABAAAABwoqEAJAAVADwANRARICQgFSA8IDUwEUAkQBVAPEA0UBVQFGAVYDxgNHAVcBSAFYA8gDWQE6A0oBWgPKA/oAGwErB2sCiwLLATwHTAGMAl0E3QM+Al4CnwILETAHMgc0BzcEOQUqANoAqwLbBKwCHQYtBH0CTgF+Ac4CXwG/BwRBYAFwA4ABkAOgAbADYQFxA4EBkQOhAbEDYgFyA4IBkgOiAbIDYwFzA4MBkwOjAbMDZAF0A4QBlAOkAbQDZQF1A4UBlQOlAbUDZgF2A4YBlgOmAbYDZwF3A4cBlwOnAbcDaAF4A4gBmAOoAbgDaQF5A4kBmQOpAbkDegOKAJoDqgC6A50AAgrgAOEA4gDjAOQA5QDmAOcA6ADuAO8ABQshAyMDNQInB8kHSwQsBMwFbQStBJ4ErgUBEzEHQQQzB0MEJQMoBTgDKQdJAGoAOwFbArsHHAQ9AI0AvQbNBC4CjwIQACYDAwCOAwEAAQABGBRYAWgAeAFJAVkBaQB5AYkASgBaAGoAegGKAEsDWwNrAHsBiwBcA2wAfAAKARoAOgACAAAAAgsAYAECDOAA4QASACIAMgBCAFIAkgCiALIAwgDSAOIACgNxAXMBdQF3AQ==");
const line = new GameMap("AAADAAAAAAAEAgIAABAAIAALAAQFCg0iAhQDBQElAAYCBwEIAgkBCgILAQwCDQEOAg8BAQUSAiYCKAIqAiwCLgIFBiQCFQMXAxkDGwMdAx8DAQAAAAUKCwACAQECAgMBBAIFBQcFKAcqBxsHKwYsBwUFEQMTAxcHCAEKBRwEAwAJBgsBGgYLBwEHIAIiAiQCFQMmBBgFGQcMBBAAFgMCAAAAAAICAgASACIA");

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
