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

		// Map headers to TOC items
		const items = headers.map((header) => ({
			id: header.id,
			text: header.textContent || '',
			level: parseInt(header.tagName.replace('H', ''), 10)
		}));

		// Update the store
		toc.set(items);
	});

	$: tocItems = $toc;
</script>

<nav
	class="sticky left-0 top-0 z-10 h-full w-1/5 overflow-y-auto border border-gray-300 bg-gray-50 p-4 shadow-sm"
>
	<h2 class="mb-2 text-lg font-semibold">Table of Contents</h2>
	<ul class="list-none space-y-1">
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
