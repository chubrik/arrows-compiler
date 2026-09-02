import { stripBom } from "./text.js";

const tabSize = 4;

// execCommand costs about 25 ms per kilobyte in Chrome, so a program the size of Tetris would
// freeze the page for a second. Bigger edits go through setRangeText, which is instant but
// wipes the native undo stack — a trade only the rare unclean paste has to pay
const undoableSize = 2048;

// A plain textarea for the machines Monaco is too heavy for: no highlighting, no completion,
// no hints and no bank separators — the code, the compiler and the errors in the output panel.
// Everything the page asks of an editor it asks through the same interface as of Monaco
export function createPlainEditor(container, initialValue) {
    const textarea = document.createElement("textarea");
    textarea.value = initialValue;
    textarea.setSelectionRange(0, 0); // assigning the value leaves the caret at the end of the text
    textarea.wrap = "off"; // an assembly line is never wrapped, the ruler stands at column 100
    textarea.spellcheck = false;
    textarea.autocapitalize = "off";
    textarea.autocomplete = "off";
    textarea.setAttribute("autocorrect", "off");

    // The gutter scrolls with the text but has no scrollbar of its own
    const gutter = document.createElement("div");
    gutter.className = "plain-gutter";
    const numbers = document.createElement("div");
    gutter.appendChild(numbers);

    const wrapper = document.createElement("div");
    wrapper.className = "plain-editor";
    wrapper.append(gutter, textarea);
    container.appendChild(wrapper);

    // The numbers are one text node, rebuilt only when the line count changes: typing
    // inside a line must not touch the DOM
    let numbered = 0;

    function updateNumbers() {
        const count = countLines(textarea.value);
        if (count === numbered)
            return;
        numbered = count;
        let text = "1";
        for (let i = 2; i <= count; ++i)
            text += "\n" + i;
        numbers.textContent = text;
    }

    updateNumbers();
    textarea.addEventListener("input", updateNumbers);

    // Only the vertical scrolling reaches the gutter: a long line moves the text alone
    textarea.addEventListener("scroll", () => {
        numbers.style.transform = "translateY(" + -textarea.scrollTop + "px)";
    });

    // Without this the key walks the focus away from the editor
    textarea.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || event.ctrlKey || event.altKey || event.metaKey)
            return;
        event.preventDefault();
        if (event.shiftKey)
            outdent(textarea);
        else
            indent(textarea);
    });

    // The pasted code goes through the cleanup Monaco does: no BOM, no trailing whitespace,
    // exactly one newline at the end of the file. Replacing the whole text at once — the usual
    // way a program arrives here — cleans the document as thoroughly as the Monaco path does
    textarea.addEventListener("paste", (event) => {
        const pasted = event.clipboardData?.getData("text/plain");
        if (pasted == null)
            return;
        // A textarea turns CRLF into LF on its own, so judge the text as it will land: otherwise
        // "line\r\n\r\n\r\n" looks like it ends with a single newline and the extra lines survive
        const text = pasted.replace(/\r\n?/g, "\n");
        const cleaned = stripBom(text).replace(/[ \t]+$/gm, "");
        const { value, selectionStart: start, selectionEnd: end } = textarea;

        // Clean code needs no edit of ours: the browser pastes it instantly and keeps its own
        // undo entry, while our edit would cost a second on a program the size of Tetris
        if (cleaned === text && trailingNewlines(value.slice(0, start) + cleaned + value.slice(end)) === 1)
            return;

        event.preventDefault();
        replaceSelection(textarea, cleaned);
        normalizeTail(textarea);
        revealCaret(textarea);
    });

    return {
        getValue: () => textarea.value,

        getPosition: () => {
            const before = textarea.value.slice(0, textarea.selectionStart);
            const lineStart = before.lastIndexOf("\n") + 1;
            return { line: countLines(before), column: before.length - lineStart + 1 };
        },

        goToPosition: (line, column) => {
            const offset = offsetAt(textarea.value, line, column);
            textarea.focus();
            textarea.setSelectionRange(offset, offset);
            revealLine(textarea, line);
        },

        focus: () => textarea.focus(),
        onChange: (handler) => textarea.addEventListener("input", handler),
        setErrors: () => { }, // the output panel lists them, and a click there leads to the line
        setBankBoundaries: () => { },
        dispose: () => wrapper.remove()
    };
}

// execCommand is deprecated, but it is the only edit the browser puts on the native undo stack;
// setRangeText would leave the user without Ctrl+Z
function replaceSelection(textarea, text) {
    if (text.length <= undoableSize && document.execCommand(text === "" ? "delete" : "insertText", false, text))
        return;
    textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, "end");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function indent(textarea) {
    const column = textarea.selectionStart - lineStartAt(textarea.value, textarea.selectionStart);
    replaceSelection(textarea, " ".repeat(tabSize - column % tabSize));
}

// Only the spaces the caret sits behind are removed: a block outdent belongs to the advanced editor
function outdent(textarea) {
    const { value, selectionStart: start, selectionEnd: end } = textarea;
    if (start !== end)
        return;
    const lineStart = lineStartAt(value, start);
    const width = (start - lineStart) % tabSize || tabSize;
    const spaces = value.slice(Math.max(lineStart, start - width), start).match(/ *$/)[0].length;
    if (spaces === 0)
        return;
    textarea.setSelectionRange(start - spaces, start);
    replaceSelection(textarea, "");
}

// The file ends with exactly one newline: a line to type on, and no blank tail beyond it
function normalizeTail(textarea) {
    const value = textarea.value;
    const trailing = trailingNewlines(value);
    if (trailing === 1)
        return;
    // A caret standing at the end of the text belongs after the newline this adds, on the
    // empty last line — where the browser and Monaco both leave it after a paste
    const caret = textarea.selectionStart;
    const atEnd = caret === value.length;
    textarea.setSelectionRange(value.length - trailing, value.length);
    replaceSelection(textarea, "\n");
    const restored = atEnd ? textarea.value.length : Math.min(caret, textarea.value.length);
    textarea.setSelectionRange(restored, restored);
}

function trailingNewlines(value) {
    return value.match(/\n*$/)[0].length;
}

// Our own edits leave the view where it was, while the browser would have followed the caret:
// after a paste the end of the pasted code has to be in sight, as it is in Monaco
function revealCaret(textarea) {
    revealLine(textarea, countLines(textarea.value.slice(0, textarea.selectionStart)));
}

// A textarea scrolls to the caret on its own only while typing, not after setSelectionRange
function revealLine(textarea, line) {
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 19;
    const top = (line - 1) * lineHeight;
    if (top < textarea.scrollTop || top + lineHeight > textarea.scrollTop + textarea.clientHeight)
        textarea.scrollTop = top - (textarea.clientHeight - lineHeight) / 2;
}

function lineStartAt(value, offset) {
    return value.lastIndexOf("\n", offset - 1) + 1;
}

function countLines(value) {
    let lines = 1;
    for (let i = value.indexOf("\n"); i >= 0; i = value.indexOf("\n", i + 1))
        ++lines;
    return lines;
}

function offsetAt(value, line, column) {
    let start = 0;
    for (let i = 1; i < line; ++i) {
        const next = value.indexOf("\n", start);
        if (next < 0)
            return value.length;
        start = next + 1;
    }
    const end = value.indexOf("\n", start);
    return start + Math.min(column - 1, (end < 0 ? value.length : end) - start);
}
