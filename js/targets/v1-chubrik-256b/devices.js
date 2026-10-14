// Ports 3E and 3F, taken from LogicArrows/computer-v1/specification.md. A db byte can land on
// the output port itself: then the diskette switches the output device as it loads
function describeSwitch(value) {
    switch (value) {
        case 0x80: return "switches the output to the display";
        case 0x40: return "switches the output to the terminal";
        case 0x10: return "switches the output to the digital indicator";
        default: return "no output device matches this value";
    }
}

export const portDocs = {
    0x3E: {
        doc: "**Port 3E** — the keyboard: reads the code of the last key pressed (cp1251);\n"
            + "the program resets the port itself to detect repeated input"
    },
    0x3F: {
        doc: "**Port 3F** — switches the output device on write\n"
            + "- `80` — display\n"
            + "- `40` — terminal\n"
            + "- `10` — digital indicator",
        describeLoaded: describeSwitch
    }
};
