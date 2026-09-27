import { Compiler as v1Compiler } from "./v1/compiler.js";
import * as v1Reference from "./v1/reference.js";
import * as v1Docs from "./v1/docs.js";
import { builderConfig as v1Diskette } from "./v1/builder-config.js";
import { Compiler as v2Compiler } from "./v2/compiler.js";
import * as v2Reference from "./v2/reference.js";
import * as v2Docs from "./v2/docs.js";
import { builderConfig as v2Diskette } from "./v2/builder-config.js";

export const computers = {
    "v1": { Compiler: v1Compiler, reference: v1Reference, docs: v1Docs, builderConfig: v1Diskette },
    "v2": { Compiler: v2Compiler, reference: v2Reference, docs: v2Docs, builderConfig: v2Diskette }
};

export const defaultComputer = "v2";
