import { error } from '@sveltejs/kit';
import blocksToHtml from '@sanity/block-content-to-html';
import imageUrlBuilder from '@sanity/image-url';
import client from '$lib/sanityClient.js';

const h = blocksToHtml.h;

// Setup image URL builder
const builder = imageUrlBuilder(client);

// Custom serializer for images
const imageSerializer = (props) => {
	const imageUrl = builder.image(props.node.asset).url(); // Get image URL using the reference
	const altText = props.node.alt || 'Image'; // Optional: Use alt text if available, or default to 'Image'

	return h('img', {
		src: imageUrl,
		alt: altText,
		className: 'sanity-image' // Add a class for styling if needed
	});
};

export async function load({ params, fetch }) {
	try {
		const slug = params.slug;

		const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0]{
					title,
					"mainImageUrl": nook.asset->url, // Adjust to match the correct image field reference
					"authorName": author->name,
					"slug": slug.current,
					body[]{
						...,
						children[]{
							text, // Retrieve the text content of blocks
							_type,
							marks
						}
					},
					publishedAt,
					updatedAt,
					"nook": nook->title
        }`);

		const res = await fetch(
			`https://x4ducbn5.api.sanity.io/v2023-01-01/data/query/production?query=${query}`
		);

		if (!res.ok) {
			console.error('Fetch failed:', res.status, res.statusText);
			throw error(res.status, `Failed to fetch notebook: ${res.statusText}`);
		}

		const data = await res.json();

		if (!data.result) {
			console.error('Notebook not found in response:', data);
			throw error(404, 'Notebook not found');
		}

		// Define serializers
		const serializers = {
			types: {
				// Custom serializer for code block
				code: (props) =>
					h('pre', { className: props.node.language }, h('code', {}, props.node.code)),
				// Custom serializer for latex
				latex: (props) => h('span', { className: 'latex-inline' }, props.node.content),
				// Custom serializer for image
				image: (props) => {
					// Handle image
					const imageUrl = builder.image(props.node.asset).url();
					const altText = props.node.alt || 'Image';
					return h('img', {
						src: imageUrl,
						alt: altText,
						className: 'sanity-image'
					});
				},
				// Custom serializer for table
				table: (props) => {
					const tableRows = props.node.rows.map((row, index) => {
						const tableCells = row.cells.map((cell) => {
							// If it's the first row, use <th> for table header cells
							if (index === 0) {
								return h('th', { className: 'sanity-table-header' }, cell);
							} else {
								return h('td', {}, cell); // Regular cells in subsequent rows
							}
						});

						// Render each row in a <tr> element
						return h('tr', {}, tableCells);
					});

					// Wrap all rows in a <table> element
					return h('table', { className: 'sanity-table' }, tableRows);
				}
			}
		};

		// Render body content to HTML
		const renderedBody = blocksToHtml({
			blocks: data.result.body,
			serializers: serializers
		});

		// Return the notebook with rendered body
		return {
			notebook: {
				...data.result,
				renderedBody // Include the transformed body as HTML
			}
		};
	} catch (err) {
		console.error('Error in load function:', err);
		throw error(500, 'Server Error');
	}
}
