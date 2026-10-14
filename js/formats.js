import * as v1Docs from "./asm-v1/docs.js";
import * as v1Reference from "./asm-v1/reference.js";
import * as v2Docs from "./asm-v2/docs.js";
import * as v2Reference from "./asm-v2/reference.js";
import { targets } from "./targets.js";

// What the left pane may hold, and what the right pane may show for it. An assembly input is
// a language (its reference tables and instruction docs make the dialect); each of its outputs
// names the target computer that does the work: the compiler with its memory model, the port docs of
// its devices and the diskette format of its memory. The map input takes a map of either
// version of the game, and its outputs differ in whether what the browser version cannot
// keep stops the conversion
export const inputs = {
    "asm-v1": {
        label: "Assembly · Chubrik v1",
        kind: "asm",
        reference: v1Reference,
        docs: v1Docs,
        outputs: {
            "diskette": { label: "Diskette", target: "v1-chubrik-256b", render: "diskette" },
            "hex": { label: "HEX", target: "v1-chubrik-256b", render: "hex" }
        }
    },
    "asm-v2": {
        label: "Assembly · Chubrik v2",
        kind: "asm",
        reference: v2Reference,
        docs: v2Docs,
        outputs: {
            // largerMemory: the diskette of the same computer with a bigger memory, for a program
            // that does not fit this one
            "diskette": { label: "Diskette 1 KB", target: "v2-chubrik-1kb", render: "diskette", largerMemory: "32k" },
            "32k": { label: "Diskette 32 KB", target: "v2-chubrik-32kb", render: "diskette" },
            "moseev": { label: "Diskette (Moseev)", target: "v2-moseev-256b", render: "diskette" },
            // The bytes belong to the architecture and are the same for every computer the program
            // fits in; the widest memory keeps the limit out of the way
            "hex": { label: "HEX", target: "v2-chubrik-32kb", render: "hex" }
        }
    },
    "map": {
        label: "Arrows Map",
        kind: "map",
        outputs: {
            "map": { label: "Browser Map", strict: true },
            "soft": { label: "Browser Map (soft)", strict: false }
        }
    }
};

export const defaultInput = "asm-v2";

// The first output of an input is the one a bare link means
export function defaultOutput(input) {
    return Object.keys(inputs[input].outputs)[0];
}

export function targetFor(input, output) {
    return targets[inputs[input].outputs[output].target];
}

// The input names the dialect, the computer of the output compiles it and names the devices.
// A map has no dialect: the page gives it a bare field instead of the code editor
export function dialectFor(input, output) {
    const { kind, reference, docs } = inputs[input];
    if (kind !== "asm")
        return null;
    const target = targetFor(input, output);
    return {
        Compiler: target.Compiler,
        reference,
        docs: { instructionDocs: docs.instructionDocs, dbDoc: docs.dbDoc, portDocs: target.portDocs }
    };
}

// The input and output a link asks for (its in= and out= parameters), with the defaults filling
// in whatever it leaves out
export function resolveConversion(params) {
    let input = params.get("in");
    let output = params.get("out");
    if (!(input in inputs))
        input = defaultInput;
    if (!(output in inputs[input].outputs))
        output = defaultOutput(input);
    return { input, output };
}
