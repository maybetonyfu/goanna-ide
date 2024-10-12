<script>
    /** @type {{text: string, children: any}} */
    let {text, children} = $props()
</script>
<h2 class="flex">
    <span class="badge badge-primary badge-outline gap-2">
        {@render children()}{text}
    </span>
</h2>