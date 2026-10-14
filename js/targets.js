import { builderConfig as v1Chubrik256bDiskette } from "./targets/v1-chubrik-256b/builder-config.js";
import { Compiler as v1Chubrik256bCompiler } from "./targets/v1-chubrik-256b/compiler.js";
import { portDocs as v1Chubrik256bPorts } from "./targets/v1-chubrik-256b/devices.js";
import { builderConfig as v2Acidnnk1kbDiskette } from "./targets/v2-acidnnk-1kb/builder-config.js";
import { Compiler as v2Acidnnk1kbCompiler } from "./targets/v2-acidnnk-1kb/compiler.js";
import { portDocs as v2Acidnnk1kbPorts } from "./targets/v2-acidnnk-1kb/devices.js";
import { builderConfig as v2Acidnnk32kbDiskette } from "./targets/v2-acidnnk-32kb/builder-config.js";
import { Compiler as v2Acidnnk32kbCompiler } from "./targets/v2-acidnnk-32kb/compiler.js";
import { portDocs as v2Acidnnk32kbPorts } from "./targets/v2-acidnnk-32kb/devices.js";
import { builderConfig as v2Chubrik1kbDiskette } from "./targets/v2-chubrik-1kb/builder-config.js";
import { Compiler as v2Chubrik1kbCompiler } from "./targets/v2-chubrik-1kb/compiler.js";
import { portDocs as v2Chubrik1kbPorts } from "./targets/v2-chubrik-1kb/devices.js";
import { builderConfig as v2Chubrik32kbDiskette } from "./targets/v2-chubrik-32kb/builder-config.js";
import { Compiler as v2Chubrik32kbCompiler } from "./targets/v2-chubrik-32kb/compiler.js";
import { portDocs as v2Chubrik32kbPorts } from "./targets/v2-chubrik-32kb/devices.js";
import { builderConfig as v2Moseev256bDiskette } from "./targets/v2-moseev-256b/builder-config.js";
import { Compiler as v2Moseev256bCompiler } from "./targets/v2-moseev-256b/compiler.js";
import { portDocs as v2Moseev256bPorts } from "./targets/v2-moseev-256b/devices.js";

// Every computer the site builds for, named architecture-author-memory: a processor with its
// memory model (the compiler), its devices (the port docs) and the diskette format of its
// memory (the builder config). Which language it speaks and which output picks it, formats.js says
export const targets = {
    "v1-chubrik-256b": { Compiler: v1Chubrik256bCompiler, portDocs: v1Chubrik256bPorts, builderConfig: v1Chubrik256bDiskette },
    "v2-chubrik-1kb": { Compiler: v2Chubrik1kbCompiler, portDocs: v2Chubrik1kbPorts, builderConfig: v2Chubrik1kbDiskette },
    "v2-chubrik-32kb": { Compiler: v2Chubrik32kbCompiler, portDocs: v2Chubrik32kbPorts, builderConfig: v2Chubrik32kbDiskette },
    "v2-acidnnk-1kb": { Compiler: v2Acidnnk1kbCompiler, portDocs: v2Acidnnk1kbPorts, builderConfig: v2Acidnnk1kbDiskette },
    "v2-acidnnk-32kb": { Compiler: v2Acidnnk32kbCompiler, portDocs: v2Acidnnk32kbPorts, builderConfig: v2Acidnnk32kbDiskette },
    "v2-moseev-256b": { Compiler: v2Moseev256bCompiler, portDocs: v2Moseev256bPorts, builderConfig: v2Moseev256bDiskette }
};
