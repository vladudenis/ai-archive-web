<script lang="ts">
	import { availableNotebooks } from '$lib/store';
	import { onMount } from 'svelte';

	onMount(() => {
		availableNotebooks.set([]);
	});
</script>

<nav
	class="fixed left-0 top-0 z-10 h-full w-1/4 overflow-y-auto border-r border-gray-300 bg-gray-50 p-6"
>
	<h2 class="mb-4 text-xl font-semibold">Available Notebooks</h2>
	<ul class="space-y-4">
		{#if $availableNotebooks.length > 0}
			{#each $availableNotebooks as { authorNames, title, slug }}
				<li>
					<a href={`/notebooks/${slug}`}>
						<p class="text-sm font-medium text-gray-800 lg:text-lg">{title}</p>
						<p class="text-xs text-gray-600 lg:text-sm">
							by {authorNames.length ? authorNames.join(', ') : 'None'}
						</p>
					</a>
				</li>
			{/each}
		{:else}
			<p class="text-gray-600">No notebooks to show. Select some nooks to proceed.</p>
		{/if}
	</ul>
</nav>

<style>
	nav {
		box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;
	}

	li {
		padding: 1rem;
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	li:hover {
		transform: translateY(-5px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
</style>
