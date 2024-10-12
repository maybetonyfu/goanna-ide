let defaultText = localStorage.getItem("user:text:0")
if (!defaultText) {
    defaultText = "x :: Int\nx = 1.0"
}

let text = $state(defaultText)
let errors = $state([])
let nodeRange = $state({})
let selectedError = $state(null)
let selectedFixByError = $state({})
let selectedFix = $derived(selectedFixByError[selectedError])
let spotlightNode = $state(null)
let editingStroke = $state(null)


function assignColors(errors) {
    errors.forEach((error, i) => {
        Object.keys(error.CriticalNodes).forEach((key, j) => {
            errors[i].CriticalNodes[key].Class = "mark mark-" + j.toString()
        })
    })
}

export function  getStore() {
    return {
        get text() {
            return text
        },
        get spotlightNode() {
            return spotlightNode
        },
        get spotlightRange() {
          if (spotlightNode === null) {
              return null
          }
          if (nodeRange[spotlightNode] === undefined) {
              return null
          }
          return nodeRange[spotlightNode]
        },
        shouldSpotlight(node) {
            if (spotlightNode === null) {
                return true
            }
            if (typeof node === "string") {
                node = parseInt(node, 10)
            }
            return spotlightNode === node

        },
        setSpotlightNode(node) {
            if (typeof node === "string") {
                node = parseInt(node, 10)
            }
            spotlightNode = node
        },
        setText(newText) {
            text = newText
        },
        get errors() {
            return errors
        },
        setErrors(newErrors) {
            assignColors(newErrors)
            errors = newErrors
        },
        get nodeRange() {
            return nodeRange
        },
        setNodeRange(newNodeRange) {
            nodeRange = newNodeRange
        },
        get selectedError() {
            return selectedError
        },
        chooseError(newSelectedError) {
            selectedError = newSelectedError
            if (selectedFixByError[newSelectedError] === undefined) {
                selectedFixByError[newSelectedError] = 0
            }
        },
        getCurrentError() {
            return errors[selectedError]
        },
        get selectedFix() {
            return selectedFix
        },
        getCurrentFix() {
            return errors[selectedError].Fixes[selectedFix]
        },
        chooseFix(newSelectedFix) {
            selectedFixByError[selectedError] = newSelectedFix
        },
        hasErrorAndFix() {
            return selectedError !== null && selectedFix !== null && selectedFix !== undefined
        },
        resetErrorFix () {
            selectedError = null
            selectedFixByError = {}
        },
        setDefaultErrorFix() {
            selectedError = 0
            selectedFixByError = {0: 0}
        },
        get highlights() {
            if (selectedError === null || selectedFix === null || selectedFix === undefined) {
                return []
            }
            let criticalNodes = errors[selectedError].CriticalNodes
            let MCS = errors[selectedError].Fixes[selectedFix].MCS
            let hl = Object.entries(criticalNodes)
                .map(([key, value]) => {
                    let classes = value.Class
                    if (MCS.includes(+key)) {
                        classes += " mark-active-node"
                    }
                    return {
                        from : [value.Range.from_line, value.Range.from_col],
                        to:    [value.Range.to_line, value.Range.to_col],
                        mark: classes
                    }
                })
            return hl
        },
        newStroke() {
            editingStroke = performance.now()
        },
        clearStroke() {
            editingStroke = null
        },
        get editingStroke () {
            return editingStroke
        }
    }
}
