// Instruction descriptions, taken from LogicArrows/computer-v2/programming.md.
// Instructions accepting either an operand byte or a register have two variants.

export const instructionDocs = {
    nop: { text: "Does nothing, proceeds to the next instruction" },
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
    hlt: { text: "Halts the program execution" },

    clr: { signature: "***X***", text: "Clears register ***X***", flags: "–" },
    mov: { signature: "***X***, ***Y***", text: "Copies from register ***Y*** to register ***X***", flags: "–" },
    and: { signature: "***X***, ***Y***", text: "Bitwise AND between registers ***X*** and ***Y***, result is written to ***X***", flags: "Z, S" },
    or: { signature: "***X***, ***Y***", text: "Bitwise OR between registers ***X*** and ***Y***, result is written to ***X***", flags: "Z, S" },
    xor: { signature: "***X***, ***Y***", text: "Exclusive OR between registers ***X*** and ***Y***, result is written to ***X***", flags: "Z, S" },
    add: { signature: "***X***, ***Y***", text: "Adds registers ***X*** and ***Y***, result is written to ***X***", flags: "Z, S, C, O" },
    adc: { signature: "***X***, ***Y***", text: "Adds registers ***X***, ***Y*** and the C flag, result is written to ***X***", flags: "Z, S, C, O" },
    sub: { signature: "***X***, ***Y***", text: "Subtracts register ***Y*** from register ***X***, result is written to ***X***", flags: "Z, S, C, O" },
    sbb: { signature: "***X***, ***Y***", text: "Subtracts register ***Y*** and the C flag from register ***X***, result is written to ***X***", flags: "Z, S, C, O" },
    neg: { signature: "***X***", text: "Changes the sign of register ***X*** (treats the value as a signed number)", flags: "Z, S, C, O" },
    inc: { signature: "***X***", text: "Adds 1 to register ***X***", flags: "Z, S" },
    dec: { signature: "***X***", text: "Subtracts 1 from register ***X***", flags: "Z, S" },
    not: { signature: "***X***", text: "Inverts each bit of register ***X***", flags: "Z, S" },
    test: { signature: "***X***", text: "Updates the flags based on the value of register ***X***", flags: "Z, S" },
    rnd: { signature: "***X***", text: "Generates a random value in register ***X***", flags: "Z, S" },
    shl: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the left, the rightmost bit is cleared", flags: "Z, S, C" },
    shr: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the right, the leftmost bit is cleared", flags: "Z, S, C" },
    sar: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the right, the leftmost bit is unchanged", flags: "Z, S, C" },
    rcl: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the left, the rightmost bit is taken from the C flag", flags: "Z, S, C" },
    rcr: { signature: "***X***", text: "Shifts all bits of register ***X*** one position to the right, the leftmost bit is taken from the C flag", flags: "Z, S, C" }
};
