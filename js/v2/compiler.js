import { createCompiler } from "../asm.js";
import { Args, commands, instructions, registers, keywords } from "./reference.js";

export const Compiler = createCompiler({
    Args, commands, instructions, registers, keywords,
    memorySize: 32768,
    byteAddress: (offset) => offset < 256 ? offset : (offset & 0xFF) | 0x80, // in-bank address
    trackLineOffsets: true // the editor draws the 128-byte bank boundaries
});
