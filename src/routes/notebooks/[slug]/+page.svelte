<script lang="ts">
	import TableOfContents from '../../../components/TableOfContents.svelte';
	import { onMount } from 'svelte';
	import katex from 'katex';
	import 'katex/dist/katex.min.css';
	import hljs from 'highlight.js';
	import ReferencesNav from '../../../components/ReferencesNav.svelte';

	export let data;
	const notebook = data.notebook;

	onMount(() => {
		// Render KaTeX for inline LaTeX elements
		const latexInlineElements = document.querySelectorAll('.latex-inline');
		latexInlineElements.forEach((el) => {
			const latex = el.innerHTML.trim();
			try {
				katex.render(latex, el, { displayMode: false }); // Inline math ($ <formula> $)
			} catch (error) {
				console.error('Error rendering inline LaTeX:', error);
			}
		});

		// Process and number dynamic headings
		const headers = Array.from(document.querySelectorAll('.dynamic-heading'));
		const levelIndices = {};

		headers.forEach((header) => {
			const level = parseInt(header.tagName.replace('H', ''), 10);

			// Update level indices
			levelIndices[level] = (levelIndices[level] || 0) + 1;

			// Reset deeper level indices
			Object.keys(levelIndices).forEach((key) => {
				if (parseInt(key, 10) > level) {
					delete levelIndices[key];
				}
			});

			// Generate hierarchical number (e.g., "1.1.2")
			const prefix = Object.keys(levelIndices)
				.sort((a, b) => a - b)
				.map((key) => levelIndices[key])
				.join('.');

			// Prepend the hierarchical number to the heading's text
			header.textContent = `${prefix} ${header.textContent}`;
			header.id = header.textContent.replace(/ /g, '');
		});

		const codeBlocks = document.querySelectorAll('pre code');
		codeBlocks.forEach((block) => {
			hljs.highlightElement(block); // Highlight.js applies syntax highlighting
		});
	});

	function processRenderedBody(content: string): string {
		// Add a wrapper class to dynamic headings
		content = content.replace(/<(h[1-3])>/g, '<$1 class="dynamic-heading">');

		// Add "python" as the default language if not specified
		content = content.replace(/<pre><code>/g, '<pre><code class="language-python">');

		// Process table annotations and convert to HTML table structure
		content = content.replace(/<span class="table"[^>]*>(.*?)<\/span>/g, (match, tableContent) => {
			// Convert rows and cells into a proper HTML table
			const rows = JSON.parse(tableContent);
			let tableHtml = '<table class="table">';
			rows.forEach((row: any) => {
				tableHtml += '<tr>';
				row.forEach((cell: string) => {
					tableHtml += `<td>${cell}</td>`;
				});
				tableHtml += '</tr>';
			});
			tableHtml += '</table>';
			return tableHtml;
		});

		return content;
	}

	let processedBody = notebook ? processRenderedBody(notebook.renderedBody) : null;
</script>

{#if notebook}
	<main class="flex min-h-screen w-screen">
		<TableOfContents />

		<article id="content" class="ml-[20%] mr-[22%] flex h-full w-full flex-col p-8">
			<p class="pb-1 text-4xl">{notebook.title}</p>
			<div class="mb-4">
				<div class="flex flex-wrap gap-1">
					Associated Nooks: {#each notebook.nooks as nook}
						<span
							class="inline-flex items-center rounded-full bg-gray-200 px-3 text-sm font-medium text-gray-800"
							>{nook}</span
						>
					{/each}
				</div>
				<p>
					Published: {new Date(notebook.publishedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
				<p>
					Last Update: {new Date(notebook.updatedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>
			</div>

			<div id="rendered-body" class="ml-1">
				{@html processedBody}
			</div>
		</article>

		<ReferencesNav />
	</main>
{/if}

<style>
	/* <-- Dynamic html block styles --> */
	:global(#content .paragraph-inline) {
		display: inline;
	}

	:global(#content p:empty) {
		display: block; /* Ensure it acts as a block element */
		margin: 0.75em 0; /* Add vertical spacing */
	}

	:global(#content ul) {
		list-style-type: disc; /* Ensure bullets are used */
		padding-left: 1.5em; /* Indent the list */
	}

	:global(#content li) {
		margin-bottom: 0.5em; /* Optional: adds space between list items */
	}

	:global(#content) h1 {
		line-height: 1;
		margin-bottom: 0.5rem;
		font-size: 2rem;
	}

	:global(.dynamic-heading) {
		margin-left: -0.5rem;
	}

	:global(h1.dynamic-heading) {
		line-height: 1;
		margin-bottom: 0.5rem;
		margin-top: 1.5rem;
		font-size: 1.75rem;
		color: #4682b4;
	}

	:global(h2.dynamic-heading) {
		line-height: 1;
		margin-bottom: 0.5rem;
		margin-top: 1.5rem;
		font-size: 1.5rem;
		color: #4682b4;
	}

	:global(h3.dynamic-heading) {
		line-height: 1;
		margin-bottom: 0.5rem;
		margin-top: 1.5rem;
		font-size: 1.25rem;
		color: #4682b4;
	}

	/* <-- Code block styles --> */
	:global(pre) {
		background: #282c34; /* Background color for code blocks */
		color: white; /* Default text color */
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto; /* Scroll for long lines */
		font-size: 0.9rem;
		display: inline-block; /* Make <pre> only as large as the content inside */
	}

	:global(code) {
		font-family: 'Fira Code', 'Courier New', monospace; /* Use monospaced font */
	}

	:global(.hljs-keyword) {
		color: #c678dd; /* Example keyword color */
	}

	:global(.hljs-string) {
		color: #98c379; /* Example string color */
	}

	:global(.hljs-comment) {
		color: #5c6370; /* Example comment color */
		font-style: italic;
	}

	/* <-- Table styles --> */
	/* Table container */
	:global(.sanity-table) {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-family: Arial, sans-serif;
		background-color: #fff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	/* Table headers */
	:global(.sanity-table th) {
		background-color: #4caf50;
		color: white;
		padding: 12px 15px;
		text-align: left;
		font-weight: bold;
		border-bottom: 2px solid #ddd;
	}

	/* Table rows */
	:global(.sanity-table tr) {
		border-bottom: 1px solid #ddd;
	}

	/* Table cells */
	:global(.sanity-table td) {
		padding: 12px 15px;
		text-align: left;
	}

	/* Alternating row colors */
	:global(.sanity-table tr:nth-child(even)) {
		background-color: #f9f9f9;
	}

	/* Hover effect */
	:global(.sanity-table tr:hover) {
		background-color: #f1f1f1;
	}

	/* Border for table cells */
	:global(.sanity-table td, .sanity-table th) {
		border: 1px solid #ddd;
	}
</style>
