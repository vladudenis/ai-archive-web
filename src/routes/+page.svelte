<script lang="ts">
	import { page } from '$app/stores';
	import { availableNotebooks } from '$lib/store';
	import NotebooksNav from '../components/NotebooksNav.svelte';
	import { writable } from 'svelte/store';

	const { categories } = $page.data;
	const selectedNooks = writable({});

	function updateAvailableNotebooks(nook) {
		selectedNooks.update((currentSelectedNooks) => {
			// Make a copy of the current selected nooks
			const updatedNooks = { ...currentSelectedNooks };

			if (updatedNooks[nook.title]) {
				// Nook is already selected, so deselect it
				delete updatedNooks[nook.title];
			} else {
				// Nook is not selected, so select it
				updatedNooks[nook.title] = nook;
			}

			// Update the available notebooks based on selected nooks
			const updatedNotebooks = Object.values(updatedNooks).flatMap((n) => n.posts || []);
			availableNotebooks.set(Array.from(new Set(updatedNotebooks)));

			return updatedNooks;
		});
	}
</script>

<main class="flex min-h-screen w-screen">
	<NotebooksNav />

	<div id="exploration" class="ml-[25%] mr-[15%] flex h-full w-full flex-col p-8">
		<p class="page-title">Explore Learning Nooks</p>
		{#if categories && categories.length > 0}
			{#each categories as section}
				<section>
					<p class="section-title">{section.title}</p>
					<p class="section-description">{section.description}</p>
					<ul class="nook-grid">
						{#each section.nooks as nook}
							<li class="nook-card">
								<button
									class="nook-button"
									on:click={() => updateAvailableNotebooks(nook)}
									aria-label={`Add notebooks of ${nook.title} to view`}
									class:selected={$selectedNooks[nook.title]}
								>
									<span class="nook-content">
										<p class="nook-title">{nook.title}</p>
										<p class="nook-description">{nook.description}</p>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		{:else}
			<p class="text-gray-400">No nooks found.</p>
		{/if}
	</div>
</main>

<style>
	.page-title {
		font-size: 2.5rem; /* Slightly smaller but still prominent */
		font-weight: 700; /* Bold text */
		color: #2c3e50; /* A rich, dark color for a more subtle and elegant look */
		margin-bottom: 1.5rem; /* Space below the title */
		letter-spacing: 0.5px; /* Subtle letter spacing */
		text-transform: capitalize; /* Ensure first letter of each word is capitalized */
		display: inline-block; /* Prevent center alignment */
	}

	/* Section Styles */
	section {
		margin-bottom: 3rem;
	}

	section > p {
		margin: 0;
	}

	section .section-title {
		font-size: 2rem;
		font-weight: bold;
		color: #333;
		margin-bottom: 0.5rem;
	}

	section .section-description {
		font-size: 1rem;
		color: #555;
		margin-bottom: 1.5rem;
	}

	/* Grid Layout */
	.nook-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* Card Style */
	.nook-card {
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.nook-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.nook-button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		text-align: left;
		cursor: pointer;
		display: flex;
	}

	.nook-button.selected {
		background-color: #4682b4;
		color: white;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.nook-button.selected * {
		color: white;
		transition: color 0.2s ease;
	}

	/* Content Style */
	.nook-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.nook-title {
		font-size: 1.2rem;
		font-weight: bold;
		margin: 0 0 0.5rem;
	}

	.nook-description {
		font-size: 0.9rem;
		color: #555;
		margin: 0;
		line-height: 1.4;
	}
</style>
