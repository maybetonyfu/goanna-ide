<script>
    import Fix from "./Fix.svelte";
    import Editor from "./Editor.svelte";
    import Magnify from "./icons/Magnify.svelte";
    import {getStore} from "./Store.svelte";
    import Global from "./icons/Global.svelte";
    import RoadSign from "./icons/RoadSign.svelte";
    import Header from "./components/Header.svelte";
    import {decode} from "./lib/decodeNames";
    import {onDestroy, onMount} from "svelte";
    import Haskell from "./icons/Haskell.svelte";
    import CheckMark from "./icons/CheckMark.svelte";
    import Split from "split-grid"
    import Gutter from "./components/Gutter.svelte";
    import Splide from '@splidejs/splide';
    import Left from "./icons/Left.svelte";
    import Right from "./icons/Right.svelte";
    import examples from "./lib/examples";
    import Branch from "./icons/Branch.svelte";
    import Play from "./icons/Play.svelte";

    let store = getStore()
    let interval = $state(null)
    let gutterVertical = $state(null)
    let gutterHorizontal = $state(null)
    let slider = null


    onMount(() => {
        store.typeCheck()
        slider = new Splide( '.splide', {
            gap: '1rem',
            autoWidth: true,
            autoHeight: true,
            arrows: false,
            pagination: false,
            padding: {top: '1rem', bottom: '2rem'},
            focus: 0,
        }).mount();

        slider.on('click', (s) => {
            slider.go(s.index)
            store.chooseFix(s.index)
        })

        interval = setInterval(() => {
            if (store.editingInput) {
                let time = $state.snapshot(store.editingInput)
                if (performance.now() - time > 500) {
                    store.clearInput()
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
            slider.refresh()
        }
    })


</script>

<main class="h-full flex flex-col">
    <section class="flex-1" style="display:grid;grid-template-columns: 1fr 10px 2fr;">
        <aside class="flex flex-col">
            <section class="flex flex-col gap-3 pt-1 pb-4 px-2 border-base-300  border-b">
                <div class="flex items-center gap-3">
                    <a href="https://goanna.typecheck.me">
                        <img src="/goanna.svg" class="w-12 h-12" alt="Goanna Logo" />
                    </a>
                    <select class="select select-primary select-sm w-full" onchange={_ => store.setSpotlightNode(null)} bind:value={store.selectedExample}>
                        <option disabled selected value="default">Choose an example</option>
                        {#each Object.keys(examples) as key}
                            <option value={key}>{key}</option>
                        {/each}
                    </select>
                </div>

                <div class="card card-compact bg-base-300 text-base-content">
                    <div class=card-body >
                        <div>
                            {@html store.message}
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-xs btn-success" onclick={() => store.run()} disabled={!store.canRun}>
                                {#if store.running}
                                <span class="loading loading-spinner loading-xs"></span>
                                {:else}
                                <Play class="text-base"></Play>
                                {/if}
                                Run
                            </button>
                            <button class="btn btn-xs btn-secondary"  onclick={() => store.prolog()}>Prolog</button>
                            <button class="btn btn-xs btn-primary" onclick={() => store.typeCheck()}>Type Check</button>
                        </div>
                    </div>
                </div>


            </section>
            <section class="flex-1" style="display:grid;grid-template-rows: 1fr 10px 1fr;">
                <section class="flex-1 flex flex-col">
                    <div class="py-4 px-2">
                        <Header text="Local Types">
                            <Magnify></Magnify>
                        </Header>
                    </div>

                    <div class="relative overflow-scroll h-full">
                        <div class="absolute px-2 pb-2 w-full">
                            <table class="table bg-base-100 font-mono">
                                <tbody>
                                {#if store.loading}
                                    <tr class=" border border-base-300">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                    <tr class=" border border-base-300">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                    <tr class=" border borderbase-300">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                {:else}
                                    {#each store.localTypes as [name, type]}
                                        <tr class={"border border-base-300 hover:bg-base-200"}
                                            class:opacity-30={!store.shouldSpotlight(name)}
                                            onmouseenter={() => {
                                                store.setSpotlightNode(name)
                                                let nameString = store.getCurrentError().CriticalNodes[name].DisplayName
                                                let globalName = store.globalTypes.find(([n,_]) => decode(n)[1] === nameString)
                                                if (globalName) {
                                                    let elem = document.getElementById(globalName[0])
                                                    elem.scrollIntoView()
                                                    elem.classList.add('bg-base-200')
                                                }
                                            }}
                                            onmouseleave={() => {
                                                store.setSpotlightNode(null)
                                                Array.from(document.getElementById('globalTypes').children).forEach(elem => {
                                                    elem.classList.remove('bg-base-200')

                                                })
                                            }}>
                                            <td class="p-1.5 w-0">
                                        <pre class={store.getCurrentError().CriticalNodes[name].Class + " px-0.5 w-fit"}
                                             class:mark-active-node = {store.getCurrentFix().MCS.includes(+name)}
                                     >{store.getCurrentError().CriticalNodes[name].DisplayName}</pre>
                                            </td>
                                            <td class="p-1.5 w-0 font-bold text-base-300 mx-1"> ::</td>
                                            <td class="p-1.5 text-left">{type.replaceAll("[Char]", "String").replaceAll('list', '[]')}</td>
                                            <td class="p-1.5 w-0">
                                                <div class="align-middle badge badge-ghost hint--bottom-left hint--medium" aria-label="The type of this fragment changes based on which possible fix is chosen.">
                                                    <Branch></Branch>
                                                </div>
                                            </td>
                                        </tr>
                                    {/each}
                                {/if}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
                <Gutter direction="horizontal" bind:dom={gutterHorizontal}></Gutter>
                <section class="flex-1 flex flex-col">
                    <div class="flex justify-between items-center gap-4 py-4 px-2">
                        <Header text="Global Types">
                            <Global></Global>
                        </Header>
                    </div>
                    <div class="relative overflow-scroll h-full">
                        <div class="absolute w-full px-2 pb-2">
                            <table class="table bg-base-100 font-mono">
                                <tbody id="globalTypes">
                                {#if store.loading}
                                    <tr class=" border border-base-300">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                    <tr class=" border border-base-300">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>                                    </tr>
                                    <tr class=" border border-base-300">
                                        <td class="p-1.5 w-0">
                                            <div class="skeleton h-4 w-ful"></div>
                                        </td>
                                    </tr>
                                {:else}

                                    {#each store.globalTypes as [name, type]}
                                        <tr class=" border border-base-300" id={name}>
                                            <td class="p-1.5 w-0">
                                                <div>{decode(name)[1]}</div>
                                            </td>
                                            <td class="p-1.5 w-0 font-bold text-base-300 mx-1"> ::</td>
                                            <td class="p-1.5">{type.replaceAll("[Char]", "String").replaceAll('list', '[]')}</td>
                                            <td class="p-1.5 w-0">
                                                {#if keysWithChangedValues().includes(name)}
                                                    <div class="align-middle badge badge-ghost hint--bottom-left hint--medium" aria-label="The type of this variable changes based on which possible fix is chosen.">
                                                        <Branch class=""></Branch>
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
        <article class="flex flex-col">
            <span class="px-2 py-1 flex items-center gap-2 border-b border-base-300">
                <Haskell class="text-primary"></Haskell>
                <span class="mr-1">Main.hs</span>
                {#if store.loading || store.running}
                    <span class="loading loading-spinner loading-xs"></span>
                {/if}
                {#if store.typeErrors.length !== 0 && ! store.loading}
                {#each store.typeErrors as _, errorIndex}
                    <button class="btn btn-xs btn-error text-error-content"
                            class:btn-outline={errorIndex !== store.selectedError}
                            onclick={() => {
                        store.chooseError(errorIndex);
                    }}>
                        Type Error {errorIndex + 1}
                    </button>
                {/each}
                {/if}
                {#if store.parsingErrors.length !== 0}
                    <span class="badge  badge-error text-sm text-error-content">
                        Parsing Error
                    </span>
                {/if}
                {#if store.importErrors.length !== 0}
                    <span class="badge  badge-error text-sm text-error-content">
                        Import Error
                    </span>
                {/if}
                {#if store.typeErrors.length === 0 && store.parsingErrors.length === 0 && store.importErrors.length === 0 && !store.running && !store.loading}
                    <span class="badge badge-sm badge-success text-lg">
                        <CheckMark></CheckMark>
                    </span>
                {/if}
            </span>
            <div class="relative flex-1">
                <Editor></Editor>
            </div>
        </article>
    </section>
    <footer class="w-full flex flex-col justify-between border-t border-base-300" class:hidden={store.typeErrors.length === 0 || store.loading}>
        <div class="py-4 px-2">
            <Header text="Possible Fixes">
                <RoadSign></RoadSign>
            </Header>
        </div>
        <section class="splide px-2">
                <div class="splide__track">
                    <ul class="splide__list">
                            {#each store.getAvailableFixes() as fix, fixId}
                                <li class="splide__slide">
                                    <div class="min-w-72 bg-base-100 flex flex-col border rounded-sm cursor-pointer"
                                            class:border-base-300={fixId !== store.selectedFix}
                                            class:border-primary={fixId === store.selectedFix}
                                            style="width: fit-content"
                                    >
                                        <span class="w-full flex gap-2 items-center text-sm px-2 py-1">
                                            <span class="">{fixId + 1} / {store.getCurrentError().Fixes.length}</span>
                                            {#if store.selectedFix === fixId}
                                                <span class="badge badge-sm badge-primary">Selected</span>
                                            {/if}
                                        </span>

                                        <Fix lines={fix.Snapshot}></Fix>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    </div>
            </section>
        <section class="w-full flex gap-2 justify-center py-4">
            <button class="btn btn-sm" onclick={() => {
                 slider.go("'-1'")
                 store.chooseFix(slider.index)
            }}>
                <Left></Left>
            </button>

            {#each store.getAvailableFixes() as fix, fixId}
                <button
                        class="btn btn-sm"
                        class:btn-primary={fixId === store.selectedFix}
                        onclick={() => {
                            slider.go(fixId)
                            store.chooseFix(slider.index)
                        }}
                >
                    {fixId + 1}
                </button>
            {/each}

            <button class="btn btn-sm" onclick={() => {
                slider.go("'+1'")
                store.chooseFix(slider.index)

            }}>
                <Right></Right>
            </button>
        </section>
    </footer>


</main>
