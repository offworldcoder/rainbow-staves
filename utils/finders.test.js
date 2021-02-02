const { test, expect } = require('@jest/globals');
const { cutoutNotesFromStaves } = require('./finders')

test('cut out one note on one stave', () => {
    let notes = [
        note(100, 200, 20, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2)
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200}
        ]
    )
})

test('cut out two notes on one stave', () => {
    let notes = [
        note(100, 200, 20, 20),
        note(300, 200, 20, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2)
    ]
    
    // ----------O----------O----------|
    //          100        300         1000
    //       100, 120 + 180, 320 + 680

    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 180, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 680, "x": 320, "y": 200}
        ]
    )
})

test('cut out two notes on one stave and second stave with no notes', () => {
    let notes = [
        note(100, 200, 20, 20),
        note(300, 200, 20, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2),
        stave(0, 220, 1000, 2)
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 180, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 680, "x": 320, "y": 200},
            {"height": 2, "width": 1000, "x": 0, "y": 220},
        ]
    )
})

test('cut out two notes on one stave and second,thirds staves with no notes', () => {
    let notes = [
        note(100, 200, 20, 20),
        note(300, 200, 20, 20)
    ]

    let staves = [
        stave(0, 180, 1000, 2),
        stave(0, 200, 1000, 2),
        stave(0, 220, 1000, 2)
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "width": 1000, "x": 0, "y": 180},
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 180, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 680, "x": 320, "y": 200},
            {"height": 2, "width": 1000, "x": 0, "y": 220},
        ]
    )
})

test('cut out one note on first stave and one note from second stave', () => {
    let notes = [
        note(100, 200, 20, 20),
        note(300, 220, 20, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2),
        stave(0, 220, 1000, 2),
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 300, "x": 0, "y": 220},
            {"height": 2, "real": true, "width": 680, "x": 320, "y": 220},
        ]
    )
})

test('cut out one note on first stave and one note from second stave from same positions', () => {
    let notes = [
        note(100, 200, 20, 20),
        note(100, 220, 20, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2),
        stave(0, 220, 1000, 2),
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 220},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 220},
        ]
    )
})

test('cut out note straddling note stave', () => {
    let notes = [
        note(100, 190, 20, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2)
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200}
        ]
    )
})

function note(x, y, cols, rows) {
    return {
        x: x,
        y: y,
        width: cols,
        height: rows,
      }
}

function stave(x, y, cols, rows) {
    return {
        x: x,
        y: y,
        width: cols,
        height: rows,
      }
}