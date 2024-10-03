<script>
    import {onMount} from "svelte";
    import {EditorState} from "@codemirror/state"
    import {EditorView, lineNumbers, keymap} from "@codemirror/view"
    import {defaultKeymap} from "@codemirror/commands"

    /** @type {{ updateText: (string)=>void }} */
    let {updateText} = $props()
    let initialText = "hello world"
    let editorElement, editorView = null

    onMount(() => {
        updateText(initialText)
        editorView = new EditorView({
            state: EditorState.create({
                doc: "hello world",
                extensions: [
                    keymap.of(defaultKeymap),
                    lineNumbers(),
                    EditorView.updateListener.of((viewUpdate) => {
                        if (viewUpdate.docChanged) {
                            let newDoc = viewUpdate.state.doc.toString()
                            updateText(newDoc)
                        }

                        if (viewUpdate.focusChanged && viewUpdate.view.hasFocus) {
                            // dispatchChanges(viewUpdate.view, [])
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
        background-color: white;
    }
    :global(.cm-editor.cm-focused) {
        outline: none;
    }
    :global(.cm-content) {
        font-family: 'Roboto Mono', monospace;
        font-size: 16px;
        line-height: 32px;
    }
    :global(.cm-gutter) {
        line-height: 32px;
    }
    :global(.cm-line) {
        position: relative;
        height: 32px;
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