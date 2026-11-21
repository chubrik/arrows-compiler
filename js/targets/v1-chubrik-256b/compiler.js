import { Args, commands, instructions, keywords, registers, reserved } from "../../asm-v1/reference.js";
import { createCompiler } from "../../asm.js";

export const Compiler = createCompiler({
    Args, commands, instructions, registers, keywords, reserved,
    memorySize: 256,
    byteAddress: (offset) => offset, // the whole memory is addressed directly
    trackLineOffsets: false // no banking — the editor draws no boundaries
});
