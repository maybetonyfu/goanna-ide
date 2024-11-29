<script lang="ts">
    let {direction, dom=$bindable()} = $props<{direction: `vertical` | `horizontal`, dom: HTMLElement }>()
</script>
{#if direction === `vertical`}
    <div bind:this={dom} class="bg-base-300 flex flex-col justify-center items-center gap-0.5 " style="grid-row: 1/-1;cursor: col-resize;grid-column: 2;">
        <div class="rounded-full bg-neutral opacity-40 w-1 h-1 select-none"></div>
        <div class="rounded-full bg-neutral opacity-40 w-1 h-1 select-none"></div>
        <div class="rounded-full bg-neutral opacity-40 w-1 h-1 select-none"></div>
    </div>
{:else}
    <div bind:this={dom}  class="bg-base-300  flex justify-center items-center gap-0.5" style="grid-column: 1/-1;cursor: row-resize;grid-row: 2;">
        <div class="rounded-full bg-neutral opacity-40 w-1 h-1 select-none"></div>
        <div class="rounded-full bg-neutral opacity-40 w-1 h-1 select-none"></div>
        <div class="rounded-full bg-neutral opacity-40 w-1 h-1 select-none"></div>
    </div>
{/if }
