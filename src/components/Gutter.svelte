<script lang="ts">
    let {direction, dom=$bindable()} = $props<{direction: `vertical` | `horizontal`, dom: HTMLElement }>()
</script>
{#if direction === `vertical`}
    <div bind:this={dom} class="bg-base-300" style="grid-row: 1/-1;cursor: col-resize;grid-column: 2;">
    </div>
{:else}
    <div bind:this={dom}  class="bg-base-300" style="grid-column: 1/-1;cursor: row-resize;grid-row: 2;">
    </div>
{/if }
