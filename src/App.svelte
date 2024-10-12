<script>
    import Fix from "./Fix.svelte";
    import Editor from "./Editor.svelte";
    import Magnify from "./icons/Magnify.svelte";
    import {getStore} from "./Store.svelte.js";
    import Global from "./icons/Global.svelte";
    import RoadSign from "./icons/RoadSign.svelte";
    import Header from "./components/Header.svelte";
    import {decode} from "./lib/decodeNames";
    import Construction from "./icons/Construction.svelte";
    import {onDestroy, onMount} from "svelte";
    import Haskell from "./icons/Haskell.svelte";
    import CheckMark from "./icons/CheckMark.svelte";

    let store = getStore()
    let interval = $state(null)

    onMount(() => {
        typeCheck()
        interval = setInterval(() => {
            if (store.editingStroke) {
                let time = $state.snapshot(store.editingStroke)
                let text = $state.snapshot(store.text)
                if (performance.now() - time > 500) {
                    store.clearStroke()
                    localStorage.setItem("user:text:0", text)
                    typeCheck()
                }
            }
        }, 500)
    })

    onDestroy(() => {
        let text = $state.snapshot(store.text)
        if (interval) {
            clearInterval(interval)
        }
    })

    function keysWithChangedValues () {
        let changedKeys = []
        let error = store.getCurrentError()
        let globalTypes = []
        for (let fix of error.Fixes) {
            let globalType = $state.snapshot(fix.GlobalType)
            globalTypes.push(globalType)
        }
        let keys = Object.keys(globalTypes[0])
        for (let key of keys) {
            let values = []
            for (let globalType of globalTypes) {
                values.push(globalType[key])
            }
            if (values.some(v => v !== values[0])) {
                changedKeys.push(key)
            }
        }
        return changedKeys

    }
    async function genProlog() {
        let request = await fetch("http://localhost:8090/prolog", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: $state.snapshot(store.text)
        })
        let prolog = await request.text()
        console.log(prolog)
    }

    async function typeCheck() {
        console.log("Type Check")
        let request = await fetch("http://localhost:8090/typecheck", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: $state.snapshot(store.text)
        })
        let response = await request.json()
        store.setNodeRange(response.NodeRange)
        store.setErrors(response.TypeErrors)

        if (response.TypeErrors.length > 0) {
            store.setDefaultErrorFix()
        } else {
            store.resetErrorFix()
        }
    }

</script>

<main class="flex flex-col h-full">

    <div class="w-full flex-1 flex ">

        <aside class="min-w-80 flex flex-col">
            <nav class="p-2 flex items-center gap-2 border-stone-300 border-b">
                <button class="btn btn-sm btn-primary " onclick={typeCheck}>TYPE CHECK
                </button>
                <button class="btn btn-sm" onclick={genProlog}>GENERATE
                    PROLOG
                </button>
            </nav>

            <section class="p-2 flex-1 flex flex-col gap-2">
                <Header text="Local Types">
                    <Magnify></Magnify>
                </Header>
                {#if store.hasErrorAndFix()}
                    <table class="table bg-base-100 font-mono">
                        <tbody>
                        {#each Object.entries(store.getCurrentFix().LocalType) as [name, type]}
                            <tr class={"border border-stone-200 "
                                + (store.shouldSpotlight(name) ? "" : "text-stone-300")}
                                onmouseenter={() => { store.setSpotlightNode(name) }}
                                onmouseleave={() => { store.setSpotlightNode(null) }}>
                                <td class="p-1.5 w-0">
                                    <span class={store.getCurrentError().CriticalNodes[name].Class
                                     + (store.getCurrentFix().MCS.includes(+name) ? " mark-active-node": "")
                                    }>
                                        {store.getCurrentError().CriticalNodes[name].DisplayName}
                                    </span>
                                </td>
                                <td class="p-1.5 w-0 font-bold text-stone-300 mx-1"> ::</td>
                                <td class="p-1.5 text-left">{type}</td>
                                <td class="p-1.5 w-0">
                                    <div class="flex badge badge-warning">
                                        <Construction></Construction>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                {/if}
            </section>

            <section class="p-2 flex-1 border-t border-stone-300 flex flex-col gap-2">
                <div class="flex justify-between items-center gap-4">
                    <Header text="Global Types">
                        <Global></Global>
                    </Header>
                    <div class="flex items-center gap-2 text-sm">
                        Show Prelude
                        <input type="checkbox" class="toggle toggle-sm" checked={false} />
                    </div>
                </div>
                {#if store.hasErrorAndFix()}
                    <table class="table bg-base-100 font-mono">
                        <tbody>
                        {#each Object.entries(store.getCurrentFix().GlobalType).filter(([n,t]) => !n.startsWith('p_')) as [name, type]}
                            <tr class=" border border-stone-200">
                                <td class="p-1.5 w-0">
                                    <div>{decode(name)[1]}</div>
                                </td>
                                <td class="p-1.5 w-0 font-bold text-stone-300 mx-1"> ::</td>
                                <td class="p-1.5">{type}</td>
                                <td class="p-1.5 w-0">
                                    {#if keysWithChangedValues().includes(name)}
                                        <div class="flex badge badge-warning">
                                            <Construction></Construction>
                                        </div>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                {/if}
            </section>
        </aside>
        <article class="flex-grow flex-1 border-stone-300 border-l flex flex-col">
            <span class="border-b border-stone-300 px-2 py-1 flex items-center gap-2">
                <Haskell class="text-primary"></Haskell>
                <span class="text-sm">Main.hs</span>
                {#if store.errors && store.errors.length}
                <span class="badge badge-sm text-white badge-error">
                    {store.errors.length}
                </span>
                {:else}
                <span class="badge badge-sm text-white badge-success text-lg">
                    <CheckMark></CheckMark>
                </span>
                {/if}
            </span>
            <div class="relative flex-1">
                <Editor></Editor>
            </div>
        </article>
    </div>

    <footer class=" flex flex-col border-t border-stone-300 p-2 gap-2">
        <Header text="Possible Fixes">
            <RoadSign></RoadSign>
        </Header>
        {#if store.selectedError !== null}

        <section class="carousel carousel-center space-x-2">
            {#each store.getCurrentError().Fixes as fix, fixId}
                <button id={"fix" + fixId} class={"carousel-item min-w-72 bg-base-100 flex flex-col border rounded-md overflow-hidden " +
                            (store.selectedFix === fixId ? "border-primary" : "border-stone-200")
                        } onclick={() => store.chooseFix(fixId)}>

                    <div class="flex border-b border-stone-200  w-full gap-2 items-center text-sm px-2 py-1">
                        <span class="">{fixId + 1} / {store.getCurrentError().Fixes.length}</span>

                        {#if store.selectedFix === fixId}
                            <span class="badge badge-sm badge-primary">Selected</span>
                        {/if}
                    </div>

                    <Fix lines={fix.Snapshot} selected={store.selectedFix === fixId}></Fix>
                </button>
            {/each}
        </section>

        <div class="flex w-full justify-center gap-2 py-2">
            {#each store.getCurrentError().Fixes as fix, fixId}
                {#if store.selectedFix === fixId}
                 <a href={"#fix"  + fixId} class="btn btn-xs btn-primary" >{fixId + 1}</a>
                    {:else}
                    <a href={"#fix"  + fixId} class="btn btn-xs" onclick={()=>store.chooseFix(fixId)}>{fixId + 1}</a>
                {/if}
            {/each}
        </div>
        {/if}
    </footer>

    <div class="flex border-t border-stone-200 text-sm uppercase">
        {#if store.errors && store.errors.length !== 0}
            <div class="bg-error text-white px-2 h-8 leading-8">
                Type Error ({store.errors.length})
            </div>
        {:else}
            <div class="bg-success text-white px-2 h-8 leading-8">
                OK
            </div>
        {/if}

        {#if store.errors && store.errors.length >= 1}
            <section class="flex gap-2 items-center px-2">
                {#each store.errors as error, index}
                    {#if index === store.selectedError }
                        <div class="btn btn-xs btn-primary">
                            Error {index + 1}
                        </div>
                    {:else}
                        <button onclick={() => store.chooseError(index)}
                                class="btn btn-xs">
                            Error {index + 1}
                        </button>
                    {/if}
                {/each}
            </section>
        {/if}
    </div>
</main>