import { computers } from "./computers.js";
import * as v1Reference from "./v1/reference.js";
import * as v1Docs from "./v1/docs.js";
import * as v2Reference from "./v2/reference.js";
import * as v2Docs from "./v2/docs.js";

// What the left pane may hold, and what the right pane may show for it. An assembly input is
// a language (its reference tables and instruction docs make the dialect); each of its outputs
// names the computer that does the work: the compiler with its memory model, the port docs of
// its devices and the diskette format of its memory. The map input takes a map saved in the
// Steam version, and its outputs differ in whether what the browser version cannot
// keep stops the conversion
export const inputs = {
    "asm-v1": {
        label: "Assembly · Chubrik v1",
        kind: "asm",
        reference: v1Reference,
        docs: v1Docs,
        outputs: {
            "diskette": { label: "Diskette", computer: "v1", render: "diskette" },
            "hex": { label: "HEX", computer: "v1", render: "hex" }
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
            "diskette": { label: "Diskette 1 KB", computer: "v2", render: "diskette", largerMemory: "32k" },
            "32k": { label: "Diskette 32 KB", computer: "v2-32k", render: "diskette" },
            "moseev": { label: "Diskette (Moseev)", computer: "v2-moseev", render: "diskette" },
            // The bytes belong to the architecture and are the same for every computer the program
            // fits in; the widest memory keeps the limit out of the way
            "hex": { label: "HEX", computer: "v2-32k", render: "hex" }
        }
    },
    "map": {
        label: "Steam Map",
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

export function computerFor(input, output) {
    return computers[inputs[input].outputs[output].computer];
}

// The input names the dialect, the computer of the output compiles it and names the devices.
// A map has no dialect: the page gives it a bare field instead of the code editor
export function dialectFor(input, output) {
    const { kind, reference, docs } = inputs[input];
    if (kind !== "asm")
        return null;
    const computer = computerFor(input, output);
    return {
        Compiler: computer.Compiler,
        reference,
        docs: { instructionDocs: docs.instructionDocs, dbDoc: docs.dbDoc, portDocs: computer.docs.portDocs }
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
