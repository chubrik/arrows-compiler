// Port 3E, taken from LogicArrows/computer-v2/specification.md. A write connects the output
// devices, replacing the whole set at once; a read returns the code of the last key pressed.
// A db byte can land on the port itself: then the diskette connects the devices as it loads
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

export const portDocs = {
    0x3E: {
        doc: "**Port 3E** — the output devices on write, the keyboard on read\n"
            + "- bits 5,4 — display: `01` monochrome, `11` color\n"
            + "- bits 3,2 — digital indicator: `01` unsigned, `11` signed\n"
            + "- bit 0 — terminal",
        describeLoaded: describeDevices
    }
};
