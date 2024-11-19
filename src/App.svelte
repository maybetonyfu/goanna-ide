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
    import Left from "./icons/Left.svelte";
    import Right from "./icons/Right.svelte";
    import examples from "./lib/examples";

    let store = getStore()
    let interval = $state(null)
    let gutterVertical = $state(null)
    let gutterHorizontal = $state(null)
    let slider = null

    onMount(() => {
        store.typeCheck()

        interval = setInterval(() => {
            if (store.editingInput) {
                let time = $state.snapshot(store.editingInput)
                let text = $state.snapshot(store.text)
                if (performance.now() - time > 500) {
                    store.clearInput()
                    localStorage.setItem("user:text:0", text)
                    store.typeCheck()
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



    $effect(() => {
        if (store.getAvailableFixes()) {
            if (slider) {
                slider.destroy()
            }
            slider = new Splide( '.splide', {
                gap: '1rem',
                autoWidth: true,
                autoHeight: true,
                arrows: false,
                pagination: false,
                padding: {top: '1rem', bottom: '2rem'},
                focus: 0,
            }).mount();

            slider.on('move', (index) => {
                store.chooseFix(index)
            })
        }
    })


</script>

<main class="h-full flex flex-col">
    <section class="flex-1" style="display:grid;grid-template-columns: 1fr 10px 2fr;">
        <aside class="flex flex-col">
            <nav class="p-2 flex items-center gap-2 border-stone-300 border-b">
                <select class="select select-sm" onchange={(e) => {
                       store.selectedExample = e.currentTarget.value
                }}>
                    <option disabled selected>Choose an example</option>
                    {#each Object.keys(examples) as key}
                        <option value={key}>{key}</option>
                    {/each}
                </select>
<!--                <button class="btn btn-sm" onclick={store.prolog}>Prolog</button>-->
            </nav>
            <section class="p-2 border-stone-300 border-b">
                {@html store.message}
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
                                    {#if store.loading}
                                        <tr class=" border border-stone-200">
                                            <td class="p-1.5 w-0">
                                                <div class="skeleton h-4 w-ful"></div>
                                            </td>
                                        </tr>
                                        <tr class=" border border-stone-200">
                                            <td class="p-1.5 w-0">
                                                <div class="skeleton h-4 w-ful"></div>
                                            </td>                                    </tr>
                                        <tr class=" border border-stone-200">
                                            <td class="p-1.5 w-0">
                                                <div class="skeleton h-4 w-ful"></div>
                                            </td>
                                        </tr>
                                    {:else}

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
                                                <td class="p-1.5 text-left">{type.replaceAll("[Char]", "String").replaceAll('list', '[]')}</td>
                                                <td class="p-1.5 w-0">
                                                    <div class="flex badge hint--bottom-left hint--medium" aria-label="The type of this fragment changes based on which possible fix is chosen.">
                                                        <Construction class="text-stone-500"></Construction>
                                                    </div>
                                                </td>
                                            </tr>
                                        {/each}
                                    {/if}
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
                                {#if store.loading}
                                    <tr class=" border border-stone-200">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                    <tr class=" border border-stone-200">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>                                    </tr>
                                    <tr class=" border border-stone-200">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                {:else}

                                    {#each store.globalTypes as [name, type]}
                                        <tr class=" border border-stone-200">
                                            <td class="p-1.5 w-0">
                                                <div>{decode(name)[1]}</div>
                                            </td>
                                            <td class="p-1.5 w-0 font-bold text-stone-300 mx-1"> ::</td>
                                            <td class="p-1.5">{type.replaceAll("[Char]", "String").replaceAll('list', '[]')}</td>
                                            <td class="p-1.5 w-0">
                                                {#if keysWithChangedValues().includes(name)}
                                                    <div class="flex badge hint--bottom-left hint--medium" aria-label="The type of this variable changes based on which possible fix is chosen.">
                                                        <Construction class="text-stone-500"></Construction>
                                                    </div>
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                {/if}
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
                <span class="mr-1">Main.hs</span>
                {#each store.typeErrors as error, errorIndex}
                    <button class="badge text-white badge-error text-sm"
                            class:badge-outline={errorIndex !== store.selectedError}
                            onclick={() => {
                        store.chooseError(errorIndex);
                    }}>
                        Type Error {errorIndex + 1}
                    </button>
                {/each}
                {#if store.parsingErrors.length !== 0}
                    <span class="badge text-white badge-error text-sm">
                        Parsing Error
                    </span>
                {/if}
                {#if store.importErrors.length !== 0}
                    <span class="badge text-white badge-error text-sm">
                        Import Error
                    </span>
                {/if}
                {#if store.typeErrors.length === 0 && store.parsingErrors.length === 0 && store.importErrors.length === 0}
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
    <footer class="w-full flex flex-col justify-between border-t border-stone-200 gap-2 p-2">
            <Header text="Possible Fixes">
                <RoadSign></RoadSign>
            </Header>

            <section class="splide" role="group" aria-label="Fixes">
                    <div class="splide__track">
                        <ul class="splide__list">
                                {#each store.getAvailableFixes() as fix, fixId}
                                    <li class="splide__slide">
                                        <button id={"fix" + fixId} class="min-w-72 bg-base-100 flex flex-col border rounded-md"
                                                aria-hidden="true"
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
                <section class="w-full flex gap-2 justify-center">
                    <button class="btn btn-sm" onclick={() => {
                         slider.go("'-1'")
                    }}>
                        <Left></Left>
                    </button>

                    {#each store.getAvailableFixes() as fix, fixId}
                        <button
                                class="btn btn-sm"
                                class:btn-primary={fixId === store.selectedFix}
                                onclick={() => {
                                    slider.go(fixId)
                                }}
                        >
                            {fixId + 1}
                        </button>
                    {/each}

                    <button class="btn btn-sm" onclick={() => {
                        slider.go("'+1'")
                    }}>
                        <Right></Right>
                    </button>
                </section>


    </footer>


</main>
