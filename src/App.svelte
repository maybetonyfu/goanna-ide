<script>
    import Fix from "./Fix.svelte";
    import Editor from "./Editor.svelte";
    import Magnify from "./icons/Magnify.svelte";
    import {getStore} from "./Store.svelte";
    import Global from "./icons/Global.svelte";
    import RoadSign from "./icons/RoadSign.svelte";
    import Header from "./components/Header.svelte";
    import {decode} from "./lib/decodeNames";
    import Construction from "./icons/Construction.svelte";
    import {onDestroy, onMount} from "svelte";
    import Haskell from "./icons/Haskell.svelte";
    import CheckMark from "./icons/CheckMark.svelte";
    import Split from "split-grid"
    import Gutter from "./components/Gutter.svelte";
    import Splide from '@splidejs/splide';

    let store = getStore()
    let interval = $state(null)

    let gutterVertical = $state(null)
    let gutterHorizontal = $state(null)
    let slider = $state(null)
    let backendUrl = import.meta.env.DEV ? "http://localhost:8080" : "https://goanna-api.fly.dev"

    onMount(() => {
        slider = new Splide( '.splide', {
            gap: '1rem',
            autoWidth: true,
            autoHeight: true,
            arrows: false,
            pagination: true,
            padding: {top: '1rem', bottom: '2rem'},
            focus: 0,
        }).mount();
        slider.on('move', (index) => {
            store.chooseFix(index)
        })
        //
        typeCheck()

        interval = setInterval(() => {
            if (store.editingInput) {
                let time = $state.snapshot(store.editingInput)
                let text = $state.snapshot(store.text)
                if (performance.now() - time > 500) {
                    store.clearInput()
                    localStorage.setItem("user:text:0", text)
                    typeCheck()
                }
            }
        }, 500)

        Split({
            columnGutters: [{
                track: 1,
                element: gutterVertical,
            }],
        })

        Split({
            rowGutters: [{
                track: 1,
                element: gutterHorizontal,
            }],
        })


    })

    onDestroy(() => {
        let text = $state.snapshot(store.text)
        localStorage.setItem("user:text:0", text)
        if (interval) {
            clearInterval(interval)
        }
        slider.destroy()
    })

    function keysWithChangedValues () {
        if (store.typeErrors.length === 0) {
            return []
        }
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
        let request = await fetch(backendUrl +"/prolog", {
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
        let request = await fetch(backendUrl+"/typecheck", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: $state.snapshot(store.text)
        })
        let response = await request.json()
        store.nodeRange = response.NodeRange
        store.parsingErrors = response.ParsingErrors
        store.typeErrors = response.TypeErrors
        store.importErrors = response.ImportErrors
        store.inferredTypes = response.InferredTypes
        store.declarations = response.Declarations

        if (response.TypeErrors.length > 0) {
            store.setDefaultErrorFix()
        } else {
            store.resetErrorFix()
        }
    }

    $effect(() => {
        if (store.getAvailableFixes()) {
            slider.refresh()
        }
    })

</script>

<main class="h-full flex flex-col">

    <section class="flex-1" style="display:grid;grid-template-columns: 1fr 10px 2fr;">
        <aside class="flex flex-col">
            <nav class="p-2 flex items-center gap-2 border-stone-300 border-b">
                <button class="btn btn-sm btn-primary " onclick={typeCheck}>TYPE CHECK
                </button>
                <button class="btn btn-sm" onclick={genProlog}>GENERATE
                    PROLOG
                </button>
            </nav>
            <section class="p-2 border-stone-300 border-b">
                {store.message}
            </section>
            <section class="flex-1" style="display:grid;grid-template-rows: 1fr 10px 1fr;">
                <section class="flex-1 flex flex-col">
                    <div class="p-2">
                        <Header text="Local Types">
                            <Magnify></Magnify>
                        </Header>
                    </div>

                    <div class="relative overflow-scroll h-full">
                        {#if store.hasErrorAndFix()}
                            <div class="absolute px-2 pb-2 w-full">
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
                                            <td class="p-1.5 text-left">{type.replaceAll("[Char]", "String")}</td>
                                            <td class="p-1.5 w-0">
                                                <div class="flex badge">
                                                    <Construction class="text-stone-500"></Construction>
                                                </div>
                                            </td>
                                        </tr>
                                    {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                </section>
                <Gutter direction="horizontal" bind:dom={gutterHorizontal}></Gutter>
                <section class="flex-1 border-t border-stone-300 flex flex-col">
                    <div class="flex justify-between items-center gap-4 p-2">
                        <Header text="Global Types">
                            <Global></Global>
                        </Header>

                    </div>
                    <div class="relative overflow-scroll h-full">
                        <div class="absolute w-full px-2 pb-2">
                            <table class="table bg-base-100 font-mono">
                                <tbody>
                                {#each store.globalTypes as [name, type]}
                                    <tr class=" border border-stone-200">
                                        <td class="p-1.5 w-0">
                                            <div>{decode(name)[1]}</div>
                                        </td>
                                        <td class="p-1.5 w-0 font-bold text-stone-300 mx-1"> ::</td>
                                        <td class="p-1.5">{type.replaceAll("[Char]", "String")}</td>
                                        <td class="p-1.5 w-0">
                                            {#if keysWithChangedValues().includes(name)}
                                                <div class="flex badge">
                                                    <Construction class="text-stone-500"></Construction>
                                                </div>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </section>
            </section>

        </aside>
        <Gutter bind:dom={gutterVertical} direction="vertical"></Gutter>
        <article class="border-stone-300 border-l flex flex-col">
            <span class="border-b border-stone-300 px-2 py-1 flex items-center gap-2">
                <Haskell class="text-primary"></Haskell>
                <span class="text-sm">Main.hs</span>
                {#if store.typeErrors && store.typeErrors.length}
                <span class="badge badge-sm text-white badge-error">
                    {store.typeErrors.length}
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
    </section>
    <footer class="w-full flex flex-col justify-between border-t border-stone-200">
        <section class="flex-1 p-2">
            <Header text="Possible Fixes">
                <RoadSign></RoadSign>
            </Header>

            <section class="splide" role="group" aria-label="Fixes">
                <div class="splide__track">
                    <ul class="splide__list">
                            {#each store.getAvailableFixes() as fix, fixId}
                                <li class="splide__slide">
                                    <button id={"fix" + fixId} class="min-w-72 bg-base-100 flex flex-col border rounded-md"
                                            class:border-stone-200={fixId !== store.selectedFix}
                                            class:border-primary={fixId === store.selectedFix}
                                            style="width: fit-content"
                                            onclick={() => {
                                                slider.go(fixId)
                                            }}
                                    >
                                        <span class="w-full flex border-b border-stone-200 gap-2 items-center text-sm px-2 py-1">
                                            <span class="">{fixId + 1} / {store.getCurrentError().Fixes.length}</span>
                                            {#if store.selectedFix === fixId}
                                                <span class="badge badge-sm badge-primary">Selected</span>
                                            {/if}
                                        </span>

                                        <Fix lines={fix.Snapshot}></Fix>
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    </div>
            </section>

        </section>


        <section class="h-7 leading-7 flex border-t border-stone-200 text-sm uppercase">
            {#if store.typeErrors.length !== 0}
                <div class="bg-error text-white px-2">
                    Type Error ({store.typeErrors.length})
                </div>
            {:else if store.importErrors.length > 0 }
                <div class="bg-error text-white px-2">
                    Import Error ({store.importErrors.length})
                </div>
            {:else if store.parsingErrors.length > 0 }
                <div class="bg-error text-white px-2">
                    Import Error ({store.parsingErrors.length})
                </div>
            {:else}
                <div class="bg-success text-white px-2">
                    OK
                </div>
            {/if}

            {#if store.typeErrors && store.typeErrors.length >= 1}
                <section class="flex gap-2 items-center px-2">
                    {#each store.typeErrors as error, index}
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
        </section>
    </footer>


</main>
