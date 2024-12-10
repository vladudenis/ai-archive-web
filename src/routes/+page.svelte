<script>
	import { page } from '$app/stores';
	const { posts } = $page.data;
</script>

<main>
	<h1>Posts</h1>
	{#if posts && posts.length > 0}
		<ul>
			{#each posts as post}
				<li>
					<a href={`/notebooks/${post.slug}`}>{post.title}</a>
					{#if post.mainImage}
						<img src={post.mainImage.asset.url} alt={post.title} />
					{/if}
					<p>By {post.author}</p>
					<p>Nook: {post.nook}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No posts found.</p>
	{/if}
</main>
