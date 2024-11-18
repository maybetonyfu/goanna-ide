import {EditorView, Decoration, type DecorationSet} from "@codemirror/view";
import {StateEffect, StateField} from "@codemirror/state";


interface Highlight {
    from: number,
    to: number,
    mark: string
}

export const highlightField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },

    update(highlights, tr) {
        if (tr.effects.some(e => e.is(highlightEffect))) {
            let hl : any[] = []
            for (let e of tr.effects) if (e.is(highlightEffect)) {
                hl.push(Decoration.mark({class: e.value.mark}).range(e.value.from, e.value.to))
            }
            return Decoration.set(hl)
        }

        if (!tr.changes.empty) {
            return Decoration.none
        }

        if (tr.effects.some(e => e.is(clearHighlightEffect))) {
            return Decoration.none
        }

        return highlights.map(tr.changes)

    },
    provide: f => EditorView.decorations.from(f)
})

export const highlightEffect = StateEffect.define<Highlight>({
    map: ({from, to, mark}, change) => ({from: change.mapPos(from), to: change.mapPos(to), mark})
})

export const clearHighlightEffect = StateEffect.define<void>({
    map: () => {}
})

export const clearHighlights = (view: EditorView) => {
    if (!view) return;
    view.dispatch({effects: [clearHighlightEffect.of()]})
}
export const dispatchHighlights = (view: EditorView, highlights: Highlight[]) => {
    if (!view) return;
    let effects: StateEffect<Highlight>[] = []
    let _highlights = highlights.sort((a, b) => a.from - b.from)
    for (let highlight of _highlights) {
        effects.push(highlightEffect.of(highlight))
    }
    view.dispatch({effects})
}

