<script lang="ts">
    import Fold from "./icons/Fold.svelte";
    let {lines} = $props<{lines:any[]}>()

        function findOffset(lines) {
        let numberOfSpaces = lines.map(l => l.Spans[0].Text.match(/^\s*/)[0].length)
        let offset = Math.min(...numberOfSpaces)
         if (offset < 8) {
             return offset
         } else {
             return offset - 8
         }
    }

    function shrinkLines (lines) {
        let offset = findOffset(lines)
        return lines.map(l => {
            return {
                LineNumber: l.LineNumber,
                Spans: l.Spans.map((s, i) => {
                    return {
                        Tag: s.Tag,
                        Text: i === 0 ? s.Text.substring(offset) : s.Text
                    }
                })
            }
        })
    }


</script>

<div class="w-full p-2 bg-base-200">
    {#each shrinkLines(lines) as line, index}
        {#if index !== 0 && index !== line.length - 1 && line.LineNumber - lines[index-1].LineNumber > 1 }
            <div class="flex justify-center border-y border-base-300  items-center text-stone-500 py-1">
                <Fold></Fold>
            </div>
        {/if}
        <div
            class="flex whitespace-pre items-center font-mono bg-base-100 text-sm border-x border-base-300"
            class:border-t={index === 0}
            class:border-b={index === lines.length - 1}
        >
            <span class="w-4 text-center bg-base-300 leading-6 text-sm mr-2">{line.LineNumber + 1}</span>
            {#each line.Spans as span, spanIndex}
                {#if span.Tag === "error"}
                 <span class="mark mark-active-node">{span.Text}</span>
                {:else if span.Tag === "critical"}
                    <span class="opacity-30">{span.Text}</span>
                {:else if span.Tag === "normal" }
                    <span class="opacity-30">{span.Text}</span>
                {/if}
            {/each}
        </div>
    {/each}
</div>

