<script lang="ts">
	import { toc, tof } from '$lib/store';

	$: tocItems = $toc;
	$: tofItems = $tof;

	let activeView = 'toc';
	$: activeItems = activeView === 'toc' ? tocItems : tofItems;
</script>

<nav
	class="fixed left-3 top-8 z-10 min-h-72 w-1/5 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 pl-6"
>
	<!-- Toggle Buttons -->
	<div class="mb-4 flex justify-between">
		<button
			class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
			on:click={() => (activeView = 'toc')}
			class:bg-gray-300={activeView === 'toc'}
			class:bg-gray-200={activeView !== 'toc'}
		>
			Table of Contents
		</button>
		<button
			class="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
			on:click={() => (activeView = 'tof')}
			class:bg-gray-300={activeView === 'tof'}
			class:bg-gray-200={activeView !== 'tof'}
		>
			Table of Figures
		</button>
	</div>

	<!-- Dynamic Heading -->
	<h2 class="mb-2 text-lg font-semibold">
		{activeView === 'toc' ? 'Table of Contents' : 'Table of Figures'}
	</h2>

	<!-- Dynamic List -->
	<ul class="ml-1 list-none space-y-1">
		{#each activeItems as { id, text, level }}
			<li style="margin-left: {level - 1}rem;">
				<a href={`#${id}`} class="text-[#4682b4] hover:underline focus:outline-none">
					{text}
				</a>
			</li>
		{/each}
	</ul>
</nav>
