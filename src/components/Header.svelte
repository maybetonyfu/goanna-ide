<script lang="ts">
    let {text, children} = $props<{text: string, children: any}>()
</script>
<h2 class="flex">
    <span class="badge badge-primary badge-outline gap-2">
        {@render children()}{text}
    </span>
</h2>