<script>
    import {onMount, untrack} from "svelte";
    import {EditorSelection, EditorState, SelectionRange} from "@codemirror/state"
    import {EditorView, lineNumbers, keymap} from "@codemirror/view"
    import {defaultKeymap, history, historyKeymap} from "@codemirror/commands"
    import {highlightField, dispatchHighlights, clearHighlights} from "./lib/highlight";
    import {spotlightField, clearSpotlights, dispatchSpotlights} from "./lib/spotlight";

    import {getStore} from "./Store.svelte";
    import examples from "./lib/examples";
    let store = getStore()
    let editorElement = $state(null)
    let editorView

    function getPosition(line, col) {
        return editorView.state.doc.line(line + 1).from + col
    }

    $effect(() => {
        if (store.selectedExample) {
            if (editorView === null || editorView === undefined ) return
            clearSpotlights(editorView)
            clearHighlights(editorView)
            editorView.dispatch({
                changes: {
                    from: 0, to: editorView.state.doc.length, insert: examples[store.selectedExample]
                }
            })
            untrack(() => {
                store.typeCheck()
            })

        }
    })

    $effect(() => {
        if (store.typeErrors.length > 0) {
            if (!editorView) return
            let fix = store.getCurrentFix()
            let mcs = fix.MCS
            if (mcs.length === 0) return
            let nodeRange = store.nodeRange
            let pos = mcs.map((n) => nodeRange[n]).map(l => getPosition(l.from_line, l.from_col))
            let from = Math.min(...pos)
            let to = Math.max(...pos)
            let selectionRange = EditorSelection.range(from, to)
            let effect = EditorView.scrollIntoView(selectionRange)
            editorView.dispatch({effects: [effect]})
        }
    })

    $effect(() => {
        let lighlights = $state.snapshot(store.highlights)
        if (editorView === null || editorView === undefined) return
        dispatchHighlights(editorView,lighlights.map(hl => {
            return {
                from: getPosition(hl.from[0], hl.from[1]),
                to: getPosition(hl.to[0], hl.to[1]),
                mark: hl.mark
            }
        }))

        if (store.spotlightRange === null) {
            clearSpotlights(editorView)
        } else  {
            dispatchSpotlights(editorView, {
                from: getPosition(store.spotlightRange.from_line, store.spotlightRange.from_col),
                to: getPosition(store.spotlightRange.to_line, store.spotlightRange.to_col)
            })
        }
    })

    onMount(() => {
        editorView = new EditorView({
            state: EditorState.create({
                doc: $state.snapshot(store.text),
                extensions: [
                    history(),
                    keymap.of(defaultKeymap),
                    keymap.of(historyKeymap),
                    lineNumbers(),
                    highlightField,
                    spotlightField,
                    EditorView.updateListener.of((viewUpdate) => {
                        if (viewUpdate.docChanged) {
                            store.text =  viewUpdate.state.doc.toString()
                            store.newInput()
                        }

                        if (viewUpdate.focusChanged && viewUpdate.view.hasFocus) {
                            clearHighlights(editorView)
                        }
                    })
                ]
            }),
            parent: editorElement
        })
    });


</script>
<style>
    :global(.cm-editor) {
        height: 100%;
        background-color: oklch(var(--b1));
        color: oklch(var(--bc));
    }

    :global(.cm-editor.cm-focused) {
        outline: none;
    }
    :global(.cm-content) {
        font-family: 'Roboto Mono', monospace;
        font-size: 14px;
        line-height: 24px;

    }
    :global(.cm-editor .cm-gutters) {
        background-color: oklch(var(--b2));
        border: none;
        color: oklch(var(--bc));
    }

    :global(.cm-gutter) {
        line-height: 24px;

    }

    :global(.cm-line) {
        position: relative;
        /*height: 24px;*/
    }

    :global(.cm-line:has(.cm-type-hint)) {
        top: -5px;
    }

    :global(.cm-type-hint) {
        height: 32px;
        cursor: pointer;
        vertical-align: text-bottom;

    }

    :global(.cm-type-hint .original) {
        flex-grow: 1;
        display: block;
        font-family: 'Roboto Mono', monospace;
        border-radius: 3px;
        height: 18px;
        line-height: 18px;
        text-decoration-color: black;
    }

    :global(.cm-type-hint .type) {
        display: block;
        line-height: 10px;
        font-size: 8px;
        font-family: 'Victor Mono', monospace;
        background-color: #ececec;
        padding: 2px 1px;
        border-radius: 1px;
    }

    :global(.cm-typehint-original) {
        position: absolute;
        opacity: 0;
    }


</style>
<div bind:this={editorElement} class="w-full absolute inset-0"></div>