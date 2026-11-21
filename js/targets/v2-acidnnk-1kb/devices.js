import { bankPort, ioPort } from "../v2-chubrik-1kb/devices.js";

// The ports 3E and 3F of the Chubrik v2 computer, without its digital indicator and terminal
export const portDocs = {
    0x3E: ioPort,
    0x3F: bankPort(3) // the common part and 7 banks of 128 bytes: 1 KB
};
