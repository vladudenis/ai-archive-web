<script lang="ts">
	import { toc, tof, tofx } from '$lib/store';
	import { Book, Image, Sigma } from 'lucide-svelte';

	$: tocItems = $toc;
	$: tofItems = $tof;
	$: tofxItems = $tofx;

	let activeView = 'toc';
	$: activeItems = activeView === 'toc' ? tocItems : activeView === 'tof' ? tofItems : tofxItems;
</script>

<nav
	class="fixed left-3 top-8 z-10 max-h-[95%] min-h-72 w-1/5 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 pl-6"
>
	<!-- Toggle Buttons -->
	<div class="mb-4 flex justify-between">
		<button
			class="rounded-md bg-gray-200 p-1 text-sm font-medium text-gray-700 transition duration-300 hover:bg-gray-300 focus:outline-none lg:px-4 lg:py-2"
			on:click={() => (activeView = 'toc')}
			class:bg-gray-300={activeView === 'toc'}
			class:bg-gray-200={activeView !== 'toc'}
		>
			<Book />
		</button>
		<button
			class="rounded-md bg-gray-200 p-1 text-sm font-medium text-gray-700 transition duration-300 hover:bg-gray-300 focus:outline-none lg:px-4 lg:py-2"
			on:click={() => (activeView = 'tof')}
			class:bg-gray-300={activeView === 'tof'}
			class:bg-gray-200={activeView !== 'tof'}
		>
			<Image />
		</button>
		<button
			class="rounded-md bg-gray-200 p-1 text-sm font-medium text-gray-700 transition duration-300 hover:bg-gray-300 focus:outline-none lg:px-4 lg:py-2"
			on:click={() => (activeView = 'tofx')}
			class:bg-gray-300={activeView === 'tofx'}
			class:bg-gray-200={activeView !== 'tofx'}
		>
			<Sigma />
		</button>
	</div>

	<!-- Dynamic Heading -->
	<h2 class="mb-2 text-lg font-semibold">
		{activeView === 'toc'
			? 'Table of Contents'
			: activeView === 'tof'
				? 'Table of Figures'
				: 'Table of Facts'}
	</h2>

	<!-- Dynamic List -->
	<ul class="ml-1 list-none space-y-1">
		{#each activeItems as { id, text, level }}
			<li style="margin-left: {level - 1}rem;">
				<a
					href={`#${id}`}
					class="text-sm text-[#4682b4] hover:underline focus:outline-none lg:text-base"
				>
					{text}
				</a>
			</li>
		{/each}
	</ul>
</nav>
