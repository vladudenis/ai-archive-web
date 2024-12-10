<script lang="ts">
	import TableOfContents from '../../../components/TableOfContents.svelte';
	import { onMount } from 'svelte';
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	export let data;
	const notebook = data.notebook;

	onMount(() => {
		const latexInlineElements = document.querySelectorAll('.latex-inline');
		latexInlineElements.forEach((el) => {
			const latex = el.innerHTML.trim();
			try {
				katex.render(latex, el, { displayMode: false }); // Inline math ($ <formula> $)
			} catch (error) {
				console.error('Error rendering inline LaTeX:', error);
			}
		});
	});

	function processRenderedBody(content) {
		return content.replace(/<(h[1-3])>/g, '<$1 class="dynamic-heading">'); // Add wrapper class to dynamic html content
	}

	let processedBody = notebook ? processRenderedBody(notebook.renderedBody) : null;
</script>

{#if notebook}
	<div class="flex h-screen w-screen">
		<TableOfContents />

		<article id="content" class="flex h-full w-full flex-col p-8">
			<h1>{notebook.title}</h1>
			<span class="mb-4">
				<p>Nook: {notebook.nook}</p>
				<p>
					Published On: {new Date(notebook.publishedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
				<p>
					UpdatedAt On: {new Date(notebook.updatedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
			</span>

			<div id="rendered-body">
				{@html processedBody}
			</div>
		</article>
	</div>
{/if}

<style>
	:global(#content) h1 {
		line-height: 1;
		margin-bottom: 0.5rem;
		font-size: 2rem;
	}

	:global(h1.dynamic-heading) {
		line-height: 1;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		font-size: 1.75rem;
		color: #4682b4;
	}

	:global(h2.dynamic-heading) {
		line-height: 1;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		font-size: 1.5rem;
		color: #4682b4;
	}

	:global(h3.dynamic-heading) {
		line-height: 1;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		font-size: 1.25rem;
		color: #4682b4;
	}
</style>
