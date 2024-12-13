<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	interface TOCItem {
		id: string;
		text: string;
		level: number;
	}

	const toc = writable<TOCItem[]>([]);

	onMount(() => {
		// Get all headers from the page
		const headers = Array.from(document.querySelectorAll('.dynamic-heading'));

		// Initialize level indices
		const levelIndices = {};

		// Map headers to TOC items with hierarchical numbering
		const items = headers.map((header) => {
			const level = parseInt(header.tagName.replace('H', ''), 10);

			// Update level indices
			levelIndices[level] = (levelIndices[level] || 0) + 1;

			// Reset deeper level indices
			Object.keys(levelIndices).forEach((key) => {
				if (parseInt(key, 10) > level) {
					delete levelIndices[key];
				}
			});

			// Generate the hierarchical number (e.g., "1.1.2")
			const prefix = Object.keys(levelIndices)
				.sort((a, b) => a - b)
				.map((key) => levelIndices[key])
				.join('.');

			return {
				id: `${prefix}${header.textContent.replace(/ /g,'')}`,
				text: `${prefix} ${header.textContent}` || '',
				level
			};
		});

		// Update the store
		toc.set(items);
	});

	$: tocItems = $toc;
</script>

<nav
	class="fixed left-0 top-0 z-10 h-screen w-1/5 overflow-y-auto border border-gray-300 bg-gray-50 p-4 pl-6"
>
	<p></p>
	<h2 class="mb-2 text-lg font-semibold">Table of Contents</h2>
	<ul class="list-none space-y-1 ml-1">
		{#each tocItems as { id, text, level }}
			<li style="margin-left: {level - 1}rem;">
				<a
					href={`#${id}`}
					class="text-[#4682b4] hover:underline focus:outline-none focus:ring focus:ring-blue-300"
				>
					{text}
				</a>
			</li>
		{/each}
	</ul>
</nav>
