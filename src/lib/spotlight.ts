import {EditorView, Decoration, type DecorationSet} from "@codemirror/view";
import {StateEffect, StateField} from "@codemirror/state";


interface Spotlight {
    from: number,
    to: number
}

export const spotlightField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },

    update(decorationSets, tr) {
        if (tr.effects.some(e => e.is(spotlightEffect))) {
            let hl: any[] = []
            for (let e of tr.effects) if (e.is(spotlightEffect)) {
                hl.push(Decoration.mark({class: 'mark-spotlight'}).range(e.value.from, e.value.to))
            }
            return Decoration.set(hl)
        }

        if (!tr.changes.empty) {
            return Decoration.none
        }

        if (tr.effects.some(e => e.is(clearSpotlightEffect))) {
            return Decoration.none
        }

        return decorationSets.map(tr.changes)

    },
    provide: f => EditorView.decorations.from(f)
})

const spotlightEffect = StateEffect.define<Spotlight>({
    map: ({from, to}, change) => ({from: change.mapPos(from), to: change.mapPos(to)})
})

const clearSpotlightEffect = StateEffect.define<void>({
    map: () => {
    }
})

export const clearSpotlights = (view: EditorView) => {
    if (!view) return;
    view.dispatch({effects: [clearSpotlightEffect.of()]})
}

export const dispatchSpotlights = (view: EditorView, spotlight: Spotlight) => {
    if (!view) return;
    let effects: StateEffect<Spotlight>[] = [spotlightEffect.of(spotlight)]
    view.dispatch({effects, scrollIntoView: true, selection: {anchor: spotlight.from}})
}

