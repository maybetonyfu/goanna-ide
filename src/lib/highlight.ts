import {EditorView, Decoration, DecorationSet} from "@codemirror/view";
import {StateEffect, StateField} from "@codemirror/state";

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

export const highlightEffect = StateEffect.define<{ from: number, to: number, mark: string }>({
    map: ({from, to, mark}, change) => ({from: change.mapPos(from), to: change.mapPos(to), mark})
})

export const clearHighlightEffect = StateEffect.define<boolean>({
    map: (clear, _) => clear
})

export const dispatchHighlights = (view: EditorView, highlights: any) => {
    if (!view) return;

    if (highlights.length === 0) {
        view.dispatch({effects: [clearHighlightEffect.of(true)]})
        return
    }
    highlights = highlights.sort((a: number[][], b: number[][]) => {
        let rowDiff = a[0][0] - b[0][0]
        if (rowDiff === 0) {
            return a[0][1] - b[0][1]
        } else {
            return rowDiff
        }
    })
    let effects: StateEffect<unknown>[] = []

    for (let hl of highlights) {
        let from = hl[0]
        let to = hl[1]
        let mark = hl[2]
        let fromPos = view.state.doc.line(from[0] + 1).from + from[1]
        let toPos = view.state.doc.line(to[0] + 1).from + to[1]
        effects.push(highlightEffect.of({from: fromPos, to: toPos, mark}))
    }
    view.dispatch({effects})
}

