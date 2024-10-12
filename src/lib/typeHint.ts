import {EditorView, WidgetType, Decoration, type DecorationSet} from "@codemirror/view"
import {StateEffect, StateField} from "@codemirror/state";


interface TypeHint {
    from: number,
    to: number,
    type: string,
    content: string,
    isFix: boolean
}

function htmlToElement(html: string): HTMLElement {
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return (template.content.firstChild as HTMLElement);
}

class TypeHintWidget extends WidgetType {
    constructor(readonly type: string, readonly content: string, readonly isFix: boolean) {
        super()
        this.type = type
        this.content = content
        this.isFix = isFix
    }

    toDOM() {
        return htmlToElement(`
            <div class="cm-type-hint relative inline-flex flex-col items-start" onclick="">
                <div class="type"> ${this.type} </div>
                <div class="original ${this.isFix ? 'bg-red-600 text-white line-through' : 'bg-blue-200'}">${this.content}</div>
            </div>
        `)
    }

    ignoreEvent() {
        return false
    }
}

export const typeHintPlugin = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },
    update(decorationSet, tr) {
        if (tr.effects.some(e => e.is(clearHinttEffect))) {
            return Decoration.none
        }

        if (tr.effects.some(e => e.is(typeHintEffect))) {
            let decorations = []
            for (let e of tr.effects) if (e.is(typeHintEffect)) {
                let deco = Decoration.widget({
                    widget: new TypeHintWidget(e.value.type, e.value.content, e.value.isFix),
                    side: 1,
                })
                decorations.push(Decoration.mark({class: 'cm-typehint-original'}).range(e.value.from, e.value.to))
                decorations.push(deco.range(e.value.to))
            }
            return Decoration.set(decorations)
        }

        if (!tr.changes.empty) {
            return Decoration.none
        }

        return decorationSet.map(tr.changes)
    },
    provide: f => EditorView.decorations.from(f)
})

export const typeHintEffect = StateEffect.define<TypeHint>({
    map: ({from, to, type, content, isFix}, change) => ({
        from: change.mapPos(from),
        to: change.mapPos(to),
        type,
        content,
        isFix
    })
})

const clearHinttEffect = StateEffect.define<void>({
    map: (v, _) => {
    }
})

export function clearTypeHints(view: EditorView): void {
    if (!view) return;
    view.dispatch({effects: [clearHinttEffect.of()]})
}

export function dispatchTypeHints(view: EditorView, typeHints: TypeHint[]): void {
    if (!view) return;
    typeHints = typeHints.sort((a: TypeHint, b: TypeHint): number => a.from - b.from)
    let effects: StateEffect<TypeHint>[] = typeHints.map(typeHintEffect.of)
    view.dispatch({effects})
}

export function getPosition(view, line: number, col:number) :number{
    return view.state.doc.line(line + 1).from + col
}
