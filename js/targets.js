import { Compiler as v1Compiler } from "./v1/compiler.js";
import * as v1Docs from "./v1/docs.js";
import { builderConfig as v1Diskette } from "./v1/builder-config.js";
import { Compiler as v2Compiler } from "./v2/compiler.js";
import * as v2Docs from "./v2/docs.js";
import { builderConfig as v2Diskette } from "./v2/builder-config.js";
import { Compiler as v2_32kCompiler } from "./v2-32k/compiler.js";
import * as v2_32kDocs from "./v2-32k/docs.js";
import { builderConfig as v2_32kDiskette } from "./v2-32k/builder-config.js";
import { Compiler as moseevCompiler } from "./v2-moseev/compiler.js";
import * as moseevDocs from "./v2-moseev/docs.js";
import { builderConfig as moseevDiskette } from "./v2-moseev/builder-config.js";

// Every computer the site builds for: a processor with its memory model (the compiler), its
// devices (the port docs) and the diskette format of its memory (the builder config). Which
// language it speaks and which output picks it, formats.js says
export const computers = {
    "v1": { Compiler: v1Compiler, docs: v1Docs, builderConfig: v1Diskette },
    "v2": { Compiler: v2Compiler, docs: v2Docs, builderConfig: v2Diskette },
    "v2-32k": { Compiler: v2_32kCompiler, docs: v2_32kDocs, builderConfig: v2_32kDiskette },
    "v2-moseev": { Compiler: moseevCompiler, docs: moseevDocs, builderConfig: moseevDiskette }
};
