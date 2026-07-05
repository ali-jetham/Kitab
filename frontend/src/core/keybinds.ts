import { keymap } from "./keymap";

export type Context = "global" | "viewer" | "modal";

export type Command = {
	id: string;
	label: string;
	hidden: boolean;
};

export const COMMANDS = [
	{ id: "library.refreshCovers", label: "Library: Refersh Covers", hidden: false },
	{ id: "library.scan", label: "Library: Scan", hidden: false },
	{ id: "ui.modal.toggle", label: "Toggle Command Palette", hidden: true },
	{ id: "ui.modal.close", label: "Close Command Palette", hidden: true },
	{ id: "modal.next", label: "Next Command", hidden: true },
	{ id: "modal.prev", label: "Previous Command", hidden: true },
	{ id: "modal.select", label: "Select Current Command", hidden: true },
	{ id: "pdf.fitHeight", label: "Fit to Window Height", hidden: false },
	{ id: "pdf.fitWidth", label: "Fit to Window Width", hidden: false },
	{ id: "pdf.zoomIn", label: "Zoom In", hidden: true },
	{ id: "pdf.zoomOut", label: "Zoom Out", hidden: true },
	{ id: "pdf.scrollDown", label: "Scroll Document Down", hidden: true },
	{ id: "pdf.scrollUp", label: "Scroll Document Up", hidden: false },
	{ id: "pdf.nextPage", label: "Go to Next Page", hidden: false },
	{ id: "pdf.prevPage", label: "Go to Previous Page", hidden: false },
	{ id: "pdf.gotoFirstPage", label: "Go to First Page", hidden: false },
	{ id: "pdf.gotoLastPage", label: "Go to Last Page", hidden: false },
	{ id: "pdf.rotateClockwise", label: "Rotate Clockwise", hidden: false },
	{
		id: "pdf.rotateAntiClockwise",
		label: "Rotate Counter-Clockwise",
		hidden: false,
	},
] as const;

export type CommandId = (typeof COMMANDS)[number]["id"];

export type Keybind = {
	key: string;
	command: CommandId;
	context: Context;
	preventDefault?: boolean;
	isInputAllowed?: boolean;
};

export type CommandContext = {
	event?: KeyboardEvent;
	count?: number;
};

export type CommandHandler = (context: CommandContext) => void;

const commandRegistry = new Map<CommandId, CommandHandler>();
const modifierKeys = new Set(["control", "meta", "alt", "shift"]);
const sequenceTimeoutMs = 1000;

let activeContexts: Context[] = ["global"];
let pendingCount = "";
let pendingSequence = "";
let sequenceResetTimer: ReturnType<typeof setTimeout> | null = null;

function resetSequenceState() {
	pendingCount = "";
	pendingSequence = "";
	if (sequenceResetTimer !== null) {
		clearTimeout(sequenceResetTimer);
		sequenceResetTimer = null;
	}
}

function scheduleSequenceReset() {
	if (sequenceResetTimer !== null) {
		clearTimeout(sequenceResetTimer);
	}

	sequenceResetTimer = setTimeout(() => {
		resetSequenceState();
	}, sequenceTimeoutMs);
}

export function setActiveContexts(contexts: Context[]) {
	activeContexts = Array.from(new Set(contexts));
	resetSequenceState();
}

export function registerCommand(
	command: CommandId,
	handler: CommandHandler,
): () => void {
	commandRegistry.set(command, handler);

	return function unregister() {
		const currentHandler = commandRegistry.get(command);
		if (currentHandler === handler) {
			commandRegistry.delete(command);
		}
	};
}

// Run a command directly by id, independent of any key (used by the command palette).
export function executeCommand(
	command: CommandId,
	context: CommandContext = {},
): boolean {
	const handler = commandRegistry.get(command);
	if (!handler) return false;

	handler(context);
	return true;
}

function isTypingElement(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	const tagName = target.tagName.toLowerCase();
	return (
		target.isContentEditable ||
		tagName === "input" ||
		tagName === "textarea" ||
		tagName === "select"
	);
}

function normalizeKey(key: string): string | null {
	if (modifierKeys.has(key)) return null;
	if (key === " ") return "space";
	if (key === "Escape") return "escape";

	return key;
}

function toKey(event: KeyboardEvent): string | null {
	const key = normalizeKey(event.key);
	if (!key) return null;

	const parts: string[] = [];

	if (event.ctrlKey) parts.push("ctrl");
	if (event.metaKey) parts.push("meta");
	if (event.altKey) parts.push("alt");

	parts.push(key);
	return parts.join("+");
}

function dispatchBinding(
	key: string,
	event: KeyboardEvent,
	isTyping: boolean,
	count?: number,
): boolean {
	for (const context of activeContexts) {
		const binding = keymap.find(
			(value) => value.context === context && value.key === key,
		);

		if (!binding) continue;
		if (isTyping && !binding.isInputAllowed) continue;

		const handler = commandRegistry.get(binding.command);
		if (!handler) return false;

		if (binding.preventDefault ?? true) {
			event.preventDefault();
		}

		handler({ event, count });
		return true;
	}

	return false;
}

function isDigitKey(key: string): boolean {
	return key.length === 1 && key >= "0" && key <= "9";
}

function dispatchSequence(
	event: KeyboardEvent,
	key: string,
	isTyping: boolean,
): boolean {
	const isViewerActive = activeContexts.includes("viewer");
	if (!isViewerActive || isTyping || key.includes("+")) {
		if (pendingCount !== "" || pendingSequence !== "") {
			resetSequenceState();
		}
		return false;
	}

	const hasPendingInput = pendingCount !== "" || pendingSequence !== "";
	const isDigit = isDigitKey(key);

	if (!hasPendingInput) {
		if (isDigit) {
			pendingCount = key;
			scheduleSequenceReset();
			return true;
		}

		if (key === "g") {
			pendingSequence = "g";
			scheduleSequenceReset();
			return true;
		}

		return false;
	}

	if (pendingSequence === "") {
		if (isDigit) {
			pendingCount += key;
			scheduleSequenceReset();
			return true;
		}

		if (key === "g") {
			pendingSequence = "g";
			scheduleSequenceReset();
			return true;
		}

		resetSequenceState();
		return false;
	}

	if (pendingSequence === "g" && key === "g") {
		const count =
			pendingCount === "" ? undefined : Number.parseInt(pendingCount, 10);
		resetSequenceState();
		return dispatchBinding("gg", event, isTyping, count);
	}

	resetSequenceState();
	return false;
}

export function dispatch(event: KeyboardEvent): boolean {
	const key = toKey(event);
	if (!key) return false;

	const isTyping = isTypingElement(event.target);

	if (dispatchSequence(event, key, isTyping)) return true;
	return dispatchBinding(key, event, isTyping);
}
