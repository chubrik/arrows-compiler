// Ports 3E and 3F and addresses 3A to 3D, taken from LogicArrows/computer-v2/specification.md. A
// read of 3E returns the code of the key pressed and resets the port, unlike on the v1 computer,
// where the program resets it itself. A write connects the output devices, replacing the whole set
// at once; a db byte can land on the port itself: then the diskette connects the devices as it
// loads. A write to 3F connects a memory bank, but only from a program: a db byte there switches
// nothing. Of the number written the memory reads only as many low bits as its banks need.
// Addresses 3A to 3D are the outputs of the digital indicator and the terminal: they show what is
// written only while 3E keeps the device connected
function describeDevices(value) {
    const devices = [];
    if (value & 0b010000)
        devices.push(value & 0b100000 ? "the color display" : "the monochrome display");
    if (value & 0b000100)
        devices.push(value & 0b001000 ? "the signed digital indicator" : "the unsigned digital indicator");
    if (value & 0b000001)
        devices.push("the terminal");
    if (devices.length === 0)
        return "disconnects every output device";
    return "connects " + devices.slice(0, -1).join(", ") + (devices.length > 1 ? " and " : "") + devices.at(-1);
}

export const ioPort = {
    doc: "**Port 3E** — the keyboard on read: reads the code of the key pressed (cp1251);\n"
        + "the port resets itself after the read to detect repeated input\n"
        + "The output devices on write, the whole set at once:\n"
        + "- bits 5,4 — display: `01` monochrome, `11` color\n"
        + "- bits 3,2 — digital indicator: `01` unsigned, `11` signed\n"
        + "- bit 0 — terminal",
    describeLoaded: describeDevices
};

export function bankPort(bits, port = 0x3F) {
    return {
        doc: `**Port ${port.toString(16).toUpperCase()}** — the memory bank: the bank number written, 1 to ${2 ** bits - 1}, `
            + "connects that bank to the addresses `80...FF`"
            + (bits < 8 ? `; only the low ${bits} bits of the number count` : "")
            + "; `0` connects bank 1, which is also connected while nothing has been written",
        describeLoaded: () => "switches no bank: only a program can"
    };
}

// The digital indicator and the terminal of the Chubrik v2 computer
export const outputAddresses = {
    0x3A: { doc: "**Address 3A** — the digital indicator: the byte written appears as a decimal number" },
    0x3B: { doc: "**Address 3B** — the digital indicator: the byte written, multiplied by 256, appears as a decimal number" },
    0x3C: { doc: "**Address 3C** — the terminal: the byte written appears as a character in the `cp1251` encoding" },
    0x3D: { doc: "**Address 3D** — the terminal: every six bytes written appear as one graphic character" }
};

export const portDocs = {
    ...outputAddresses,
    0x3E: ioPort,
    0x3F: bankPort(3) // the common part and 7 banks of 128 bytes: 1 KB
};
