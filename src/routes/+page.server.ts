import { error } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	const query = encodeURIComponent(`*[_type == "category"]{
  rank,
  title,
  description,
  "mainImageUrl": mainImage.asset->url,
  "nooks": *[_type == "nook" && references(^._id)]{
    title,
    description,
    "posts": *[_type == "post" && references(^._id)]{
    	rank,
      title,
      "authorNames": authors[]->name,
			"slug": slug.current,
    }
   }
	}`);
	const url = `https://x4ducbn5.api.sanity.io/v2023-01-01/data/query/production?query=${query}`;

	try {
		const res = await fetch(url);
		if (!res.ok) {
			const errorText = await res.text();
			console.log(errorText);
			throw new Error('Failed to fetch categories');
		}
		const { result: categories } = await res.json();
		return { categories };
	} catch (err) {
		console.error('Error fetching categories:', err);
		throw error(500, 'Failed to load categories');
	}
};
