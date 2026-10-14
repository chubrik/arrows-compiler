import { createCompiler } from "../asm.js";
import { Args, commands, instructions, registers, keywords } from "../v2/reference.js";

// The Chubrik v2 architecture on the 32 KB memory: the same processor and banking, more banks
export const Compiler = createCompiler({
    Args, commands, instructions, registers, keywords,
    memorySize: 32768,
    byteAddress: (offset) => offset < 256 ? offset : (offset & 0xFF) | 0x80, // in-bank address
    trackLineOffsets: true // the editor draws the 128-byte bank boundaries
});
