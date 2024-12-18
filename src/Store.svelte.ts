import retry from './lib/retry';
import examples from "./lib/examples";

let defaultText: string = `
message = "hello" + " world"

main = print message
`.trim()

let backendUrl = import.meta.env.DEV ? "http://localhost:8080" : "https://goanna-api.fly.dev"
let defaultExample = new URLSearchParams(window.location.search).get('example');

if (!Object.keys(examples).includes(defaultExample) || defaultExample === null) {
    defaultExample = "default"
}


if (defaultExample !== "default") {
    defaultText = examples[defaultExample]
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
let runStatus = $state<boolean>(false)
let runError = $state<string | null>(null)
let runOutput = $state<string | null>(null)
let running =  $state<boolean>(false)
let nodeRange = $state<NodeRange>({})
let selectedError = $state<number | null>(null)
let selectedFixByError = $state<ErrorFixTable>({})
let spotlightNode = $state<number>(null)
let editingInput = $state<number | null>(null) // for automatically running type-check in the background
let inferredTypes = $state <GlobalType>({})
let declarations = $state<string[]>([])
let topLevels = $state<string[]>([])
let selectedExample = $state<string | null>(defaultExample)
let loading = $state<boolean>(false)

let selectedFix = $derived(selectedFixByError[selectedError])

function assignColors(errors) {
    errors.forEach((error, i) => {
        Object.keys(error.CriticalNodes).forEach((key, j) => {
            errors[i].CriticalNodes[key].Class = "mark mark-" + (j % 8).toString()
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
        get runError(): string|null {
          return runError
        },
        set runError(e) {
          runError = e
        },
        get runStatus(): boolean {
            return runStatus
        },
        set runStatus(s) {
            runStatus = s
        },
        get runOutput () :string|null {
            return runOutput
        },
        set runOutput (output) {
          runOutput = output
        },
        resetRunResult() {
            runError = null
            runOutput = null
            runStatus = false
        },
        get running ():boolean {
          return running
        },
        set running(r) {
          running = r
        },
        get canRun() {
            return (
                !running &&
                typeErrors.length === 0 &&
                parsingErrors.length === 0 &&
                importErrors.length === 0 &&
                topLevels.includes('m0_main')) &&
                this.globalTypes.find(([a,_]:[string, string]):boolean => a === "m0_main")[1] === "IO ()"
        },
        set declarations(ds : string[]) {
            declarations = ds
        },
        set topLevels(ts: string[]) {
            topLevels = ts
        },
        get topLevels(): string[] {
            return topLevels
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
        setSpotlightNode(node: string | number | null) {
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
        get nodeRange() {
          return nodeRange
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
        getCurrentError(): TypeError  | null{
            if (selectedError === null) {
                return null
            }
            if (typeErrors.length === 0) {
                return null
            }
            return typeErrors[selectedError]
        },
        get selectedFix(): number | null {
            return selectedFix
        },
        getAvailableFixes(): Fix[] {
            if (selectedError === null) {
                return []
            }
            if (typeErrors.length === 0) {
                return []
            }
            return typeErrors[selectedError].Fixes
        },
        getCurrentFix(): Fix {
            return typeErrors[selectedError].Fixes[selectedFix]
        },
        chooseFix(newSelectedFix: number) {
            selectedFixByError[selectedError] = newSelectedFix
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

        set inferredTypes(newGlobalType: GlobalType) {
            inferredTypes = newGlobalType
        },

        get globalTypes() : [string, string][] {
            let globalType;
            if (selectedError !== null && selectedFix !== null && selectedFix !== undefined) {
                globalType =  typeErrors[selectedError].Fixes[selectedFix].GlobalType
            } else {
                globalType = inferredTypes
            }
            return topLevels
                .map(d => ([d, globalType[d]] as [string, string]))
                .filter(([name, type]) =>  !name.startsWith('p_'))
        },
        get localTypes() : [string, string][] {
            if (selectedError === null || selectedFix === null || selectedFix === undefined) {
                return []
            }
            return Object.entries(this.getCurrentFix().LocalType)
        },
        get message(): string {
            if (parsingErrors.length > 0) {
                return "Main.hs contains invalid Haskell syntax."
            }
            if (importErrors.length == 1) {
                return `</div>Variable <span class="badge">${importErrors[0].name}</span> is not defined.`
            }
            if (importErrors.length > 1) {
                let variables = importErrors.map(ident => "<span class='badge'>" + ident.name + "</span>").join(", ")
                return `Variables ${variables} are not defined.`
            }
            if (typeErrors.length == 1) {
                return `Main.hs contains 1 type error.`
            }
            if (typeErrors.length > 1) {
                return `Main.hs contains ${typeErrors.length} type errors.`
            }
            if (runOutput !== null) {
                return `Output: ${runOutput}`
            }
            if (runError !== null) {
                return `Output: ${runError}`
            }
            return "Main.hs is well-typed."
        },
        get selectedExample(): string | null {
            return selectedExample
        },
        set selectedExample(newSelectedExample: string | null) {
            selectedExample = newSelectedExample
        },
        get loading(): boolean {
            return loading
        },
        typeCheck: async function () {
            if (loading) {
                return
            }
            this.resetRunResult()
            loading = true
            let buffer = $state.snapshot(text)
            if (buffer.length === 0) {
                buffer = "\n"
            }
            let request = await  fetch(backendUrl+"/typecheck", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: buffer
            })
            loading = false
            let response = await request.json()
            this.nodeRange = response.NodeRange
            this.parsingErrors = response.ParsingErrors
            this.typeErrors = response.TypeErrors
            this.importErrors = response.ImportErrors
            this.inferredTypes = response.InferredTypes
            this.declarations = response.Declarations
            this.topLevels = response.TopLevels

            if (response.TypeErrors.length > 0) {
                this.setDefaultErrorFix()
            } else {
                this.resetErrorFix()
            }
            this.clearInput()
        },
        prolog: async function() {
            let buffer = $state.snapshot(text)
            if (buffer.length === 0) {
                buffer = "\n"
            }
            let request = await retry(() => fetch(backendUrl +"/prolog", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: buffer
            }), 3, 1000)

            let prolog = await request.text()
            console.log(prolog)
        },
        run: async function() {
            if (running) {
                return
            }
            running = true
            let buffer = $state.snapshot(text)
            if (buffer.length === 0) {
                buffer = "\n"
            }
            let request = await fetch("https://runhaskell.fly.dev", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: buffer
            })
            running = false
            let response: {success: boolean, output: string|null, error: string|null} = await request.json()
            if (response.success) {
                runStatus = true
                runOutput = response.output
            } else {
                runStatus = false
                runError = response.error
            }
        }
    }
}
