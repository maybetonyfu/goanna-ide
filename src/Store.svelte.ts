let defaultText: string = localStorage.getItem("user:text:0")
if (!defaultText) {
    defaultText = "x :: Int\nx = 1.0"
}

interface Range {
    from_line: number,
    to_line: number,
    from_col: number,
    to_col: number
}

type NodeRange = {
    [key: number]: Range
}

type ErrorFixTable = {
    [key: number]: number
}

type TypeError = {
    CriticalNodes: CriticalNodes,
    Fixes: Fix[]
}

type Fix = {
    LocalType: LocalType
    GlobalType: GlobalType
    MCS: number[]
    Snapshot: Line[]
}

type Line = {
    LineNumber: number
    Spans: Span[]
}
type Span = {
    Tag: `normal` | `critical` | `error`
    Text: string
    From: number
    To: number
    Node: number
    Type: string
}
type LocalType = {
    [key: number]: string
}
type GlobalType = {
    [key: string]: string
}


type CriticalNodes = {
    [key: number]: NodeDetail
}

type NodeDetail = {
    DisplayName: string,
    Range: Range
    Class: string
}
type Highlight = {
    from: [number, number],
    to: [number, number],
    mark: string
}

type Identifier = {
    node_id: number
    name: string
    node_range: Range
    is_type: boolean
    is_term: boolean
}

let text = $state<string>(defaultText)
let typeErrors = $state<TypeError[]>([])
let parsingErrors = $state<Range[]>([])
let importErrors = $state<Identifier[]>([])
let nodeRange = $state<NodeRange>({})
let selectedError = $state<number | null>(null)
let selectedFixByError = $state<ErrorFixTable>({})
let selectedFix = $derived(selectedFixByError[selectedError])
let spotlightNode = $state<number>(null)
let editingInput = $state<number | null>(null) // for automatically running type-check in the background


function assignColors(errors) {
    errors.forEach((error, i) => {
        Object.keys(error.CriticalNodes).forEach((key, j) => {
            errors[i].CriticalNodes[key].Class = "mark mark-" + j.toString()
        })
    })
}

export function getStore() {
    return {
        get text(): string {
            return text
        },
        set text(newText: string) {
            text = newText
        },
        get parsingErrors(): Range[] {
            return parsingErrors
        },
        set parsingErrors(pErrors: Range[]) {
            parsingErrors = pErrors
        },

        get importErrors(): Identifier[] {
            return importErrors
        },
        set importErrors(iErrors: Identifier[]) {
            importErrors = iErrors
        },
        get spotlightRange(): Range {
            if (spotlightNode === null) {
                return null
            }
            if (nodeRange[spotlightNode] === undefined) {
                return null
            }
            return nodeRange[spotlightNode]
        },

        shouldSpotlight(node: string | number): boolean {
            if (spotlightNode === null) {
                return true
            }
            if (typeof node === "string") {
                let nodeNumber = parseInt(node, 10)
                return nodeNumber === spotlightNode
            } else {
                return node === spotlightNode
            }

        },
        setSpotlightNode(node: string | number) {
            if (typeof node === "string") {
                node = parseInt(node, 10)
            }
            spotlightNode = node
        },

        get typeErrors(): TypeError[] {
            return typeErrors
        },

        set typeErrors(tErrors: TypeError[]) {
            assignColors(tErrors)
            typeErrors = tErrors
        },

        set nodeRange(newNodeRange: NodeRange) {
            nodeRange = newNodeRange
        },
        get selectedError(): number {
            return selectedError
        },
        chooseError(newSelectedError) {
            selectedError = newSelectedError
            if (selectedFixByError[newSelectedError] === undefined) {
                selectedFixByError[newSelectedError] = 0
            }
        },
        getCurrentError(): TypeError {
            return typeErrors[selectedError]
        },
        get selectedFix(): number {
            return selectedFix
        },
        getCurrentFix(): Fix {
            return typeErrors[selectedError].Fixes[selectedFix]
        },
        chooseFix(newSelectedFix: number) {
            selectedFixByError[selectedError] = newSelectedFix
        },
        hasErrorAndFix(): boolean {
            return selectedError !== null && selectedFix !== null && selectedFix !== undefined
        },
        resetErrorFix() {
            selectedError = null
            selectedFixByError = {}
        },
        setDefaultErrorFix() {
            selectedError = 0
            selectedFixByError = {0: 0}
        },
        get highlights(): Highlight[] {
            if (parsingErrors.length > 0) {
                return parsingErrors.map(h => {
                    let classes = "bg-red-200"
                    return {
                        from: [h.from_line, h.from_col],
                        to: [h.to_line, h.to_col],
                        mark: classes
                    }
                })
            }

            if (importErrors.length > 0) {
                return importErrors.map(ident => {
                    let classes = "bg-red-200"
                    return {
                        from: [ident.node_range.from_line, ident.node_range.from_col],
                        to: [ident.node_range.to_line, ident.node_range.to_col],
                        mark: classes
                    }
                })
            }


            if (selectedError === null || selectedFix === null || selectedFix === undefined) {
                return []
            }
            let criticalNodes = typeErrors[selectedError].CriticalNodes
            let MCS = typeErrors[selectedError].Fixes[selectedFix].MCS
            return Object.entries(criticalNodes)
                .map(([key, value]) => {
                    let classes = value.Class
                    if (MCS.includes(+key)) {
                        classes += " mark-active-node"
                    }
                    return {
                        from: [value.Range.from_line, value.Range.from_col],
                        to: [value.Range.to_line, value.Range.to_col],
                        mark: classes
                    }
                })
        },
        newInput() {
            editingInput = performance.now()
        },
        clearInput() {
            editingInput = null
        },
        get editingInput(): number {
            return editingInput
        },
        get message(): string {
            if (parsingErrors.length > 0) {
                return "The program doesn't look like valid Haskell."
            }
            if (importErrors.length > 0) {
                return "Variable is not defined."
            }
            if (typeErrors.length > 0) {
                return "The program contains type error"
            }
            return "The code looks good"
        }
    }
}
