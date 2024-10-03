import {EditorView, WidgetType, Decoration, DecorationSet} from "@codemirror/view"
import {StateEffect, StateField} from "@codemirror/state";

function htmlToElement(html: string): HTMLElement {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return (template.content.firstChild as HTMLElement);
}

class TypeHintWidget extends WidgetType {
    constructor(readonly type: string, readonly content: string, readonly is_fix: boolean) {
        super()
        this.type = type
        this.content = content
        this.is_fix = is_fix
    }

    toDOM() {
        return htmlToElement(`
            <div class="cm-type-hint relative inline-flex flex-col items-start" onclick="">
                <div class="type"> ${this.type} </div>
                <div class="original ${this.is_fix ? 'bg-red-600 text-white line-through' : 'bg-blue-200'}">${this.content}</div>
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
    update(typehints, tr) {
        if (tr.effects.some(e => e.is(clearHinttEffect))) {
            return Decoration.none
        }
        if (tr.effects.some(e => e.is(typeHintEffect))) {
            let decos = []
            for (let e of tr.effects) if (e.is(typeHintEffect)) {
                let deco = Decoration.widget({
                    widget: new TypeHintWidget(e.value.type, e.value.content, e.value.is_fix),
                    side: 1,
                })
                decos.push(Decoration.mark({class: 'cm-typehint-original'}).range(e.value.from, e.value.to))
                decos.push(deco.range(e.value.to))
            }
            return Decoration.set(decos)
        }

        if (!tr.changes.empty) {
            return Decoration.none
        }
        return typehints.map(tr.changes)
    },
    provide: f => EditorView.decorations.from(f)
})

export const typeHintEffect = StateEffect.define<{
    from: number,
    to: number,
    type: string,
    content: string,
    is_fix: boolean
}>({
    map: ({from, to, type, content, is_fix}, change) => ({
        from: change.mapPos(from),
        to: change.mapPos(to),
        type,
        content,
        is_fix
    })
})

const clearHinttEffect = StateEffect.define<string>({
    map: (clear, _) => clear
})


export let dispatchChanges = (view: EditorView, typeHints: any) => {
    if (!view) return;

    if (typeHints.length === 0) {
        view.dispatch({effects: [clearHinttEffect.of("Clear type hints")]})
        return
    }

    typeHints = typeHints.sort((a: number[][], b: number[][]): number => {
        let rowDiff = a[0][0] - b[0][0]
        if (rowDiff === 0) {
            return a[0][1] - b[0][1]
        } else {
            return rowDiff
        }
    })

    let effects: StateEffect<unknown>[] = []
    for (let hint of typeHints) {
        let type: string = hint[2]
        let content: string = hint[3]
        let from: number[] = hint[0]
        let to: number[] = hint[1]
        let is_fix: boolean = hint[4]
        let fromPos = view.state.doc.line(from[0] + 1).from + from[1]
        let toPos = view.state.doc.line(to[0] + 1).from + to[1]
        effects.push(typeHintEffect.of({from: fromPos, to: toPos, type, content, is_fix}))
    }

    view.dispatch({effects})
}

