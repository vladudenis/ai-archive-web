<script lang="ts">
	import { onMount } from 'svelte';
	import katex from 'katex';
	import 'katex/dist/katex.min.css';
	import hljs from 'highlight.js';
	import { toc, tof, tofx } from '$lib/store';
	import TableOfThings from '../../../components/TableOfThings.svelte';

	export let data;
	const notebook = data.notebook;
	const tocItems = [];
	const tofItems = [];
	const tofxItems = [];

	// Pre-Processing
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

			tocItems.push({
				id: header.id,
				text: header.textContent,
				level
			});
		});

		toc.set(tocItems);

		// Process and number dynamic figures
		const figures = Array.from(document.querySelectorAll('.sanity-image'));
		figures.forEach((figure, idx) => {
			// Add a caption
			const span = document.createElement('span');
			span.className = `figure-caption`;
			span.textContent = `Figure ${idx + 1}: ${figure.alt}`;
			figure.insertAdjacentElement('afterend', span);

			// Add an ID to the figure for potential referencing
			figure.id = `figure-${idx + 1}`;
			figure.textContent = `Figure ${idx + 1}`;

			tofItems.push({
				id: figure.id,
				text: `${figure.textContent}: ${figure.alt}`,
				level: 1
			});
		});

		tof.set(tofItems);

		// Process LaTeX
		const codeBlocks = document.querySelectorAll('pre code');
		codeBlocks.forEach((block) => {
			hljs.highlightElement(block); // Highlight.js applies syntax highlighting
		});

		// Definition and Theorem Blocks
		const defBlocks = document.querySelectorAll('.def-block');
		const thmBlocks = document.querySelectorAll('.thm-block');

		// Process definition and theorem blocks
		processDefThmBlocks(defBlocks);
		processDefThmBlocks(thmBlocks);

		// Process and number facts
		const definitions = Array.from(document.querySelectorAll('.def-block'));
		definitions.forEach((def, idx) => {
			def.id = `thm-${idx + 1}`;

			const text = def.querySelectorAll('.fact-highlight')[0].textContent;

			tofxItems.push({
				id: def.id,
				text: `${text.substring(0, text.length - 1)} ${idx + 1}`,
				level: 1
			});
		});
		const theorems = Array.from(document.querySelectorAll('.thm-block'));
		theorems.forEach((thm, idx) => {
			thm.id = `thm-${idx + 1}`;

			const text = thm.querySelectorAll('.fact-highlight')[0].textContent;

			tofxItems.push({
				id: thm.id,
				text: `${text.substring(0, text.length - 1)} ${idx + 1}`,
				level: 1
			});
		});

		tofx.set(tofxItems);
	});

	// Def-Thm block function
	function processDefThmBlocks(blocks) {
		blocks.forEach((block) => {
			let sibling = block.nextElementSibling;
			let contentToAdd = [];

			// Extract content after the <strong> definition label
			const strongElement = block.querySelector('strong');
			if (strongElement) {
				// Extract the HTML after the <strong> element
				let contentAfterStrong = block.innerHTML.slice(strongElement.outerHTML.length);
				const contentElement = createBlockElement(
					'paragraph-inline',
					contentAfterStrong.replace(/&lt;|&gt;/g, '')
				);

				contentToAdd.push(strongElement);
				contentToAdd.push(contentElement);
			}

			// Iterate through siblings and collect content until we find '>'
			while (sibling && !sibling.textContent.includes('>')) {
				contentToAdd.push(sibling);
				sibling = sibling.nextElementSibling;
			}

			// Add the final element that contains '>'
			if (sibling) {
				sibling.textContent = sibling.textContent.replace(/[<>]/g, '');
				contentToAdd.push(sibling);
			}

			// Insert collected content inside the def-block
			const children = block.children;

			block.innerHTML = ''; // Clear the original block content
			for (const child of children) {
				block.appendChild(child);
			}

			// Append the collected content as the second child
			contentToAdd.forEach((content) => {
				if (typeof content == 'string') {
					// Just in case
					const cleanedContent = content.replace(/&lt;|&gt;|[<>]/g, '');
					block.append(createBlockElement('paragraph-inline', cleanedContent));
				} else {
					block.appendChild(content);
				}
			});
		});
	}

	// Helper function
	function createBlockElement(className, text) {
		// Helper function to create an element with a given className and text
		const element = document.createElement('p');
		element.className = className;
		element.innerHTML = text;
		return element;
	}

	// Processing
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
		<TableOfThings />

		<article id="content" class="mx-[20%] flex h-full w-full flex-col p-8">
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
				<p>
					Contributors: {notebook.authorNames.length ? notebook.authorNames.join(', ') : 'None'}
				</p>
			</div>

			<div id="rendered-body" class="ml-1">
				{@html processedBody}
			</div>
		</article>
	</main>
{/if}

<style>
	/* Gallery styles */
	:global(.img-inline) {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		white-space: nowrap;
	}

	:global(.img-grid) {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	/* Figure/Image styles */
	:global(.figure-caption) {
		font-size: 0.9rem; /* Slightly smaller than body text */
		color: #4682b4; /* Muted color for better contrast */
		text-align: center; /* Center the caption text */
		margin-top: 0.5rem; /* Add spacing between the figure and caption */
		font-style: italic; /* Italicized to indicate it's a caption */
		line-height: 1.4; /* Improve readability */
	}

	/* Note block styles */
	:global(.note-block) {
		background-color: #d9ebff; /* Light blue background for emphasis */
		border-left: 5px solid steelblue; /* Left border for extra visual focus */
		padding: 10px 15px; /* Padding for better readability */
		margin: 20px 0; /* Space above and below the note block */
		border-radius: 4px; /* Slightly rounded corners for a modern look */
		color: #003366; /* Dark blue text color for good contrast */
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	:global(.note-highlight) {
		display: block;
	}

	/* Definition block styles */
	:global(.def-block) {
		border-left: 4px solid #0073e6; /* Blue accent for the left border */
		padding: 1rem;
		margin: 1.5rem 0;
		background-color: #f9f9f9; /* Light gray background for emphasis */
		font-family: 'Georgia', serif; /* Classic serif font for a formal look */
		font-size: 1.1rem;
		line-height: 1.6;
		color: #333; /* Dark text for readability */
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
	}

	/* Theorem block styles */
	:global(.thm-block) {
		border-left: 4px solid #0073e6; /* Blue accent for the left border */
		padding: 1rem;
		margin: 1.5rem 0;
		background-color: #f9f9f9; /* Light gray background for emphasis */
		font-family: 'Georgia', serif; /* Classic serif font for a formal look */
		font-size: 1.1rem;
		line-height: 1.6;
		color: #333; /* Dark text for readability */
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
	}

	:global(.fact-highlight) {
		font-weight: bold;
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		color: #0056b3; /* Slightly darker blue for the title */
		display: block;
	}

	/* <-- Paragraph and header block styles --> */
	:global(#content .paragraph-inline) {
		display: inline;
	}

	:global(#content .paragraph-inline a) {
		color: steelblue;
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
	:global(.sanity-table) {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-family: Arial, sans-serif;
		background-color: #fff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	:global(.sanity-table th) {
		background-color: #4caf50;
		color: white;
		padding: 12px 15px;
		text-align: left;
		font-weight: bold;
		border-bottom: 2px solid #ddd;
	}

	:global(.sanity-table tr) {
		border-bottom: 1px solid #ddd;
	}

	:global(.sanity-table td) {
		padding: 12px 15px;
		text-align: left;
	}

	:global(.sanity-table tr:nth-child(even)) {
		background-color: #f9f9f9;
	}

	:global(.sanity-table tr:hover) {
		background-color: #f1f1f1;
	}

	:global(.sanity-table td, .sanity-table th) {
		border: 1px solid #ddd;
	}
</style>
