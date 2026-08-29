// @ts-check

/**
 * Resolves named NPC-specific ejaculation macros.
 *
 * This helper allows callers to use a single lookup instead of repeating
 * named NPC checks. If a matching macro such as <<ejaculation-robin>>
 * exists for the resolved NPC name, it is returned for direct use.
 *
 * @param {string | number} index NPC index or identifier.
 * @param {...string} args Optional extra macro arguments.
 * @returns {string} Matching named NPC ejaculation macro, or an empty string if none applies.
 */
function namedNpcEjaculation(index, ...args) {
	const npcName = V.npc[V.npcrow.indexOf(index)];
	const npc = V.NPCList[index];
	if (!npc) return "";
	const output = args[0] ? " " + args[0] : "";
	// Prefer NPC-specific ejaculation macros when available.
	if (npcName && Macro.has(`ejaculation-${npcName.toLowerCase()}`) && setup.NPCNameList.includes(npcName)) {
		return `<<ejaculation-${npcName.toLowerCase()}${output}>>`;
	} else {
		return "";
	}
}

window.namedNpcEjaculation = namedNpcEjaculation;
DefineMacroS("namedNpcEjaculation", namedNpcEjaculation);

/**
 * Resolves the named NPC combat comment macro.
 *
 * Returns the corresponding <<speech-*>> macro for named NPCs that have
 * a supported combat comment handler. If no matching handler exists,
 * marks the current comment pass as having no named NPC comment.
 *
 * Special case:
 * - "Ivory Wraith" maps to <<speech-wraith>>.
 *
 * @param {string} npcName The NPC display name.
 * @returns {string} The speech macro to print, or an empty string if none applies.
 */
function namedNpcComments(npcName) {
	// Reset the no-comment flag before resolving this NPC's comment.
	delete T.noNameComment;

	// Do not return any comment while the current pass is silent.
	if (T.silent) return "";

	// Named NPCs with registered handlers resolve to their matching speech macro.
	if (npcName && Macro.has(`speech-${npcName.toLowerCase()}`) && setup.NPCNameList.includes(npcName)) {
		return `<<speech-${npcName.toLowerCase()}>>`;
	}
	// Special case for Ivory Wraith, which uses a dedicated speech macro name.
	else if (npcName === "Ivory Wraith") {
		return "<<speechWraith>>";
	}
	// No valid named NPC comment was found for this pass.
	else {
		T.noNameComment = true;
		return "";
	}
}

DefineMacroS("namedNpcComments", namedNpcComments);
