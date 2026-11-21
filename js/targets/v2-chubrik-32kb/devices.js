import { bankPort, ioPort, outputAddresses } from "../v2-chubrik-1kb/devices.js";

// The same devices as the Chubrik v2 computer with the 1 KB memory; the bank number takes a byte
export const portDocs = {
    ...outputAddresses,
    0x3E: ioPort,
    0x3F: bankPort(8) // the common part and 255 banks of 128 bytes: 32 KB
};
