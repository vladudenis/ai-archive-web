<script>
	const refs = [{ description: 'desc', source: 'source', link: 'link' }];
	// TODO
</script>

<nav
	class="fixed right-0 top-0 z-10 h-full w-1/5 overflow-y-auto border border-gray-300 bg-gray-50 p-4 pl-6"
>
	<h2 class="mb-2 text-lg font-semibold">References</h2>
	<ul class="ml-1 list-none space-y-1">
		{#each refs as { description, source, link }}
			<li>
				<p>{description}</p>
				<a
					href={link}
					class="text-[#4682b4] hover:underline focus:outline-none focus:ring focus:ring-blue-300"
				>
					{source}
				</a>
			</li>
		{/each}
	</ul>
</nav>
