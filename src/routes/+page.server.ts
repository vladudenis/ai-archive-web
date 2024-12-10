import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	const query = encodeURIComponent(`*[_type == "post"]{
		title,
		"slug": slug.current,
		body,
		mainImage{asset->{url}},
		"categories": categories[]->title,
		"author": author->name
	}`);
	const url = `https://x4ducbn5.api.sanity.io/v2023-01-01/data/query/production?query=${query}`;

	try {
		const res = await fetch(url);
		if (!res.ok) {
			const errorText = await res.text();
			console.log(errorText);
			throw new Error('Failed to fetch posts');
		}
		const { result: posts } = await res.json();
		return { posts };
	} catch (err) {
		console.error('Error fetching posts:', err);
		throw error(500, 'Failed to load posts');
	}
};
