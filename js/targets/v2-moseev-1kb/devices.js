import { bankPort } from "../v2-chubrik-1kb/devices.js";

// The bank port works as on the Chubrik v2 computer with the 1 KB memory, only at another address
export const portDocs = {
    0x7C: { doc: "**Port 7C** — the display, left half: the byte written appears in the bottom row and pushes the rows above it up" },
    0x7D: { doc: "**Port 7D** — the display, right half: the byte written appears in the bottom row and pushes the rows above it up" },
    0x7E: { doc: "**Port 7E** — the input port" },
    0x7F: bankPort(3, 0x7F) // the common part and 7 banks of 128 bytes: 1 KB
};
