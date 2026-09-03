// Instruction descriptions, taken from LogicArrows/computer-v1/programming.md.
// Instructions accepting either an operand byte or a register have two variants.

export const instructionDocs = {
    ld: {
        variants: [
            { signature: "***X***, *addr*", text: "Loads into register ***X*** a value from memory, using the operand as an address" },
            { signature: "***X***, ***Y***", text: "Loads into register ***X*** a value from memory, using register ***Y*** as an address" }
        ]
    },
    ldi: { signature: "***X***, *value*", text: "Loads the operand directly into register ***X***" },
    st: {
        variants: [
            { signature: "***X***, *addr*", text: "Stores the value of register ***X*** in memory at the address from the operand" },
            { signature: "***X***, ***Y***", text: "Stores the value of register ***X*** in memory at the address from register ***Y***" }
        ]
    },
    jmp: {
        variants: [
            { signature: "*addr*", text: "Unconditional jump to the address from the operand" },
            { signature: "***X***", text: "Unconditional jump to the address from register ***X***" }
        ]
    },
    jz: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the Z flag = 1" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the Z flag = 1" }
        ]
    },
    js: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the S flag = 1" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the S flag = 1" }
        ]
    },
    jc: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the C flag = 1" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the C flag = 1" }
        ]
    },
    jo: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the O flag = 1" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the O flag = 1" }
        ]
    },
    jnz: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the Z flag = 0" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the Z flag = 0" }
        ]
    },
    jns: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the S flag = 0" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the S flag = 0" }
        ]
    },
    jnc: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the C flag = 0" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the C flag = 0" }
        ]
    },
    jno: {
        variants: [
            { signature: "*addr*", text: "Jump to the address from the operand, if the O flag = 0" },
            { signature: "***X***", text: "Jump to the address from register ***X***, if the O flag = 0" }
        ]
    },
    rnd: { signature: "***X***", text: "Generates a random value in register ***X***" },
    hlt: { text: "Halts the program execution" },

    mov: {
        variants: [
            { signature: "***X***, ***Y***", text: "Copies from register ***Y*** to register ***X***" },
            { signature: "***X***, 0", text: "Clears register ***X***" }
        ],
        flags: "–"
    },
    and: {
        variants: [
            { signature: "***X***, ***Y***", text: "Bitwise AND between registers ***X*** and ***Y***, result is written to ***X***" },
            { signature: "***X***, 0", text: "Clears register ***X*** and updates the flags" }
        ],
        flags: "Z, S"
    },
    or: {
        variants: [
            { signature: "***X***, ***Y***", text: "Bitwise OR between registers ***X*** and ***Y***, result is written to ***X***" },
            { signature: "***X***, 0", text: "Does not perform calculations, but only updates the flags based on the value of ***X***" }
        ],
        flags: "Z, S"
    },
    xor: {
        variants: [
            { signature: "***X***, ***Y***", text: "Exclusive OR between registers ***X*** and ***Y***, result is written to ***X***" },
            { signature: "***X***, 0", text: "Does not perform calculations, but only updates the flags based on the value of ***X***" }
        ],
        flags: "Z, S"
    },
    add: {
        variants: [
            { signature: "***X***, ***Y***", text: "Adds registers ***X*** and ***Y***, result is written to ***X***" },
            { signature: "***X***, 0", text: "Works like the form above, but with 0 as the second operand" }
        ],
        flags: "Z, S, C, O"
    },
    adc: {
        variants: [
            { signature: "***X***, ***Y***", text: "Adds registers ***X***, ***Y*** and the C flag, result is written to ***X***" },
            { signature: "***X***, 0", text: "Works like the form above, but with 0 as the second operand" }
        ],
        flags: "Z, S, C, O"
    },
    sub: {
        variants: [
            { signature: "***X***, ***Y***", text: "Subtracts register ***Y*** from register ***X***, result is written to ***X***" },
            { signature: "***X***, 0", text: "Works like the form above, but with 0 as the second operand" }
        ],
        flags: "Z, S, C, O"
    },
    sbb: {
        variants: [
            { signature: "***X***, ***Y***", text: "Subtracts register ***Y*** and the C flag from register ***X***, result is written to ***X***" },
            { signature: "***X***, 0", text: "Works like the form above, but with 0 as the second operand" }
        ],
        flags: "Z, S, C, O"
    },
    neg: { signature: "***X***", text: "Changes the sign of register ***X*** (treats the value as a signed number)", flags: "Z, S, C, O" },
    inc: { signature: "***X***", text: "Adds 1 to register ***X***", flags: "Z, S" },
    dec: { signature: "***X***", text: "Subtracts 1 from register ***X***", flags: "Z, S" },
    not: { signature: "***X***", text: "Inverts each bit of register ***X***", flags: "Z, S" },
    exp: { signature: "***X***", text: "Makes all bits of register ***X*** equal to the C flag", flags: "Z, S" },
    shl: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the left, the rightmost bit is cleared", flags: "Z, S, C" },
    shr: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the right, the leftmost bit is cleared", flags: "Z, S, C" },
    sar: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the right, the leftmost bit is unchanged", flags: "Z, S, C" },
    rcl: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the left, the rightmost bit is taken from the C flag", flags: "Z, S, C" },
    rcr: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the right, the leftmost bit is taken from the C flag", flags: "Z, S, C" }
};

// Ports 3E and 3F, taken from LogicArrows/computer-v1/specification.md. A db byte can land on
// the output port itself: then the disk switches the output device as it loads
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

export const dbDoc = "**db** — define bytes: numbers, expressions";
