import { COMMANDS } from "./commands";
import { keymap } from "./keymap";

export type Context = "global" | "viewer" | "modal";
export type CommandId = (typeof COMMANDS)[number]["id"];
export type Command = { id: CommandId; label: string; hidden: boolean; withArgs: boolean; };

export type Keybind = {
	key: string;
	command: CommandId;
	context: Context;
	preventDefault?: boolean;
	isInputAllowed?: boolean;
};

export type CommandContext = { event?: KeyboardEvent; count?: number; arg?: string; };
export type CommandHandler = (context: CommandContext) => void;

const commandRegistry = new Map<CommandId, CommandHandler>();
const modifierKeys = new Set(["control", "meta", "alt", "shift"]);
const sequenceTimeoutMs = 1000;

let activeContexts: Context[] = ["global"];
let pendingCount = "";
let pendingSequence = "";
let sequenceResetTimer: ReturnType<typeof setTimeout> | null = null;

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

export function registerCommand(command: CommandId, handler: CommandHandler): () => void {
	commandRegistry.set(command, handler);

	return function unregister() {
		const currentHandler = commandRegistry.get(command);
		if (currentHandler === handler) {
			commandRegistry.delete(command);
		}
	};
}

// Run a command directly by id, independent of any key (used by the command palette).
export function executeCommand(command: CommandId, context: CommandContext = {}): boolean {
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
	return (target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select");
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

function dispatchBinding(key: string, event: KeyboardEvent, isTyping: boolean, count?: number): boolean {
	for (const context of activeContexts) {
		const binding = keymap.find((value) => value.context === context && value.key === key);

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

type SequenceNode = { command?: CommandId; children: Map<string, SequenceNode>; };

const sequenceTrieCache = new Map<Context, SequenceNode>();

function buildSequenceTrie(context: Context): SequenceNode {
	const root: SequenceNode = { children: new Map() };

	for (const binding of keymap) {
		if (binding.context !== context) continue;
		if (!binding.key.includes(" ")) continue; // only multi-key sequences

		const keys = binding.key.split(" ");
		let node = root;
		for (const k of keys) {
			let next = node.children.get(k);
			if (!next) {
				next = { children: new Map() };
				node.children.set(k, next);
			}
			node = next;
		}
		node.command = binding.command;
	}

	return root;
}

function getSequenceTrie(context: Context): SequenceNode {
	let trie = sequenceTrieCache.get(context);
	if (!trie) {
		trie = buildSequenceTrie(context);
		sequenceTrieCache.set(context, trie);
	}
	return trie;
}

let pendingNode: SequenceNode | null = null;

function resetSequenceState() {
	pendingCount = "";
	pendingNode = null;
	if (sequenceResetTimer !== null) {
		clearTimeout(sequenceResetTimer);
		sequenceResetTimer = null;
	}
}

function dispatchSequence(event: KeyboardEvent, key: string, isTyping: boolean): boolean {
	const isViewerActive = activeContexts.includes("viewer");
	if (!isViewerActive || isTyping || key.includes("+")) {
		if (pendingCount !== "" || pendingNode !== null) resetSequenceState();
		return false;
	}

	// Digits accumulate into a count only when we haven't started walking a sequence yet.
	if (pendingNode === null && isDigitKey(key)) {
		pendingCount += key;
		scheduleSequenceReset();
		return true;
	}

	for (const context of activeContexts) {
		const startNode = pendingNode ?? getSequenceTrie(context);
		const next = startNode.children.get(key);
		if (!next) continue;

		if (next.command) {
			const count = pendingCount === "" ? undefined : Number.parseInt(pendingCount, 10);
			const handler = commandRegistry.get(next.command);
			resetSequenceState();
			if (!handler) return false;
			if (event) event.preventDefault();
			handler({ event, count });
			return true;
		}

		pendingNode = next;
		scheduleSequenceReset();
		return true;
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
