<script>
	import { page } from '$app/stores';
	const { posts } = $page.data;
</script>

<main>
	<div>
		<h1>Posts:</h1>
		{#if posts && posts.length > 0}
			<ul>
				{#each posts as post}
					<li>
						<a href={`/notebooks/${post.slug}`}>{post.title}</a>
						{#if post.mainImage}
							<img src={post.mainImage.asset.url} alt={post.title} />
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p>No posts found.</p>
		{/if}
	</div>

	<div id="exploration" class="ml-[20%] flex h-full w-full flex-col p-8"></div>
</main>
