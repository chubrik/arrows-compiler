export { instructionDocs, dbDoc } from "../v2/docs.js";

export const portDocs = {
    0xFD: { doc: "**Port FD** — the input port" },
    0xFE: { doc: "**Port FE** — the display, left half: the byte written appears in the bottom row and pushes the rows above it up" },
    0xFF: { doc: "**Port FF** — the display, right half: the byte written appears in the bottom row and pushes the rows above it up" }
};
