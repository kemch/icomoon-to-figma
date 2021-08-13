<script>
	export let percent = "0%";
</script>

{#if percent !== "0%"}
<div class="max">
	<div class="percent" style="width: {percent};"></div>
</div>
{/if}


<style>
	.max {
		position: absolute;
		top:  0;
		left:  0;
		right:  0;
		width: 100%;
		height: 2px;
		/*background-color: var(--blue3);*/
	}
	.percent {
		height: 2px;
		background-color: var(--blue);
	}
	[style="width: 100%;"] {
		display: none;
	}
</style>	