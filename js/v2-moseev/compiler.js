import { createCompiler } from "../asm.js";
import { Args, commands, instructions, registers, keywords } from "../v2/reference.js";

export const Compiler = createCompiler({
    Args, commands, instructions, registers, keywords,
    memorySize: 256,
    byteAddress: (offset) => offset, // the whole memory is addressed directly
    trackLineOffsets: false // no banking — the editor draws no boundaries
});
