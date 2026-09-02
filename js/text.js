// A byte order mark survives copying between editors and would reach the compiler as a character
// of the code; both editors and the URL hash strip it
export function stripBom(value) {
    return value.replace(/\uFEFF/g, "");
}
