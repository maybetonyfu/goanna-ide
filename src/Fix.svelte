<script lang="ts">
    import Fold from "./icons/Fold.svelte";
    let {lines} = $props<{lines:any[]}>()

</script>

<div class="w-full p-2">
    {#each lines as line, index}
        {#if index !== 0 && line.LineNumber - lines[index-1].LineNumber > 1 }
            <div class="flex justify-center bg-base-100 items-center text-stone-500 py-1">
                <Fold></Fold>
            </div>
        {/if}
        <div class="flex whitespace-pre h-6 items-center font-mono bg-base-200 text-sm ">
            <span class="w-4 text-center bg-base-300 h-6 leading-6  text-stone-500 mr-2 border-stone-300 border-r">{line.LineNumber + 1}</span>
            {#each line.Spans as span}
                {#if span.Tag === "error"}
                 <span class="mark mark-active-node">{span.Text}</span>
                {:else if span.Tag === "critical"}
                    <span class="text-stone-400">{span.Text}</span>
                {:else if span.Tag === "normal" }
                    <span class="text-stone-400">{span.Text}</span>
                {/if}
            {/each}
        </div>
    {/each}
</div>

