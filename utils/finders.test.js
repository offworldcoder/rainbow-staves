const { test, expect } = require('@jest/globals');
const { cutoutNotesFromStaves } = require('./finders')

test('cut out one note on one stave', () => {
    let notes = [
        _note(100, 200, 20, 20)
    ]

    let staves = [
        _stave(0, 200, 1000, 2)
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 100, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200}
        ]
    )
})

function _note(x, y, cols, rows) {
    return {
        x: x,
        y: y,
        width: cols,
        height: rows,
      }
}

function _stave(x, y, cols, rows) {
    return {
        x: x,
        y: y,
        width: cols,
        height: rows,
      }
}