const { test, expect } = require('@jest/globals');
const { findTheVerticalsOnTheContours, cutoutNotesFromStaves } = require('./finders')

test('find one vertical above one stave', () => {
    const  aStave = stave(0, 10, 1000, 2);
    aStave.real = true;
    let staves = [
       aStave,
    ]

    let src = {
        cols: 1000,
        channels: () => {
            return 1;
          },
        data: [1000, 20]
    };
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 20; y++) {
            src.data[y * src.cols * src.channels() + x * src.channels()] = 255;
        }
    }

    src.data[9 * src.cols * src.channels() + 20 * src.channels()] = 0

    expect(findTheVerticalsOnTheContours(src, staves)).toStrictEqual(
        [
            {"height": 4, "width": 1, "x": 20, "y": 8},
        ]
    )
})

test('find one vertical below one stave', () => {
    const  aStave = stave(0, 10, 1000, 2);
    aStave.real = true;
    let staves = [
       aStave,
    ]

    let src = {
        cols: 1000,
        channels: () => {
            return 1;
          },
        data: [1000, 20]
    };
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 20; y++) {
            src.data[y * src.cols * src.channels() + x * src.channels()] = 255;
        }
    }

    src.data[12 * src.cols * src.channels() + 30 * src.channels()] = 0

    expect(findTheVerticalsOnTheContours(src, staves)).toStrictEqual(
        [
            {"height": 4, "width": 1, "x": 30, "y": 8},
        ]
    )
})

test('find two non-touching verticals below one stave', () => {
    const  aStave = stave(0, 10, 1000, 2);
    aStave.real = true;
    let staves = [
       aStave,
    ]

    let src = {
        cols: 1000,
        channels: () => {
            return 1;
          },
        data: [1000, 20]
    };
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 20; y++) {
            src.data[y * src.cols * src.channels() + x * src.channels()] = 255;
        }
    }

    src.data[12 * src.cols * src.channels() + 30 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 40 * src.channels()] = 0

    expect(findTheVerticalsOnTheContours(src, staves)).toStrictEqual(
        [
            {"height": 4, "width": 1, "x": 30, "y": 8},
            {"height": 4, "width": 1, "x": 40, "y": 8},
        ]
    )
})

test('find two touching verticals below one stave', () => {
    const  aStave = stave(0, 10, 1000, 2);
    aStave.real = true;
    let staves = [
       aStave,
    ]

    let src = {
        cols: 1000,
        channels: () => {
            return 1;
          },
        data: [1000, 20]
    };
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 20; y++) {
            src.data[y * src.cols * src.channels() + x * src.channels()] = 255;
        }
    }

    src.data[12 * src.cols * src.channels() + 30 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 31 * src.channels()] = 0

    expect(findTheVerticalsOnTheContours(src, staves)).toStrictEqual(
        [
            {"height": 4, "width": 2, "x": 30, "y": 8},
        ]
    )
})

test('find two pairs of touching verticals below one stave', () => {
    const  aStave = stave(0, 10, 1000, 2);
    aStave.real = true;
    let staves = [
       aStave,
    ]

    let src = {
        cols: 1000,
        channels: () => {
            return 1;
          },
        data: [1000, 20]
    };
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 20; y++) {
            src.data[y * src.cols * src.channels() + x * src.channels()] = 255;
        }
    }

    src.data[12 * src.cols * src.channels() + 30 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 31 * src.channels()] = 0

    src.data[12 * src.cols * src.channels() + 40 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 41 * src.channels()] = 0

    expect(findTheVerticalsOnTheContours(src, staves)).toStrictEqual(
        [
            {"height": 4, "width": 2, "x": 30, "y": 8},
            {"height": 4, "width": 2, "x": 40, "y": 8},
        ]
    )
})

test('find two pairs of several touching verticals below one stave', () => {
    const  aStave = stave(0, 10, 1000, 2);
    aStave.real = true;
    let staves = [
       aStave,
    ]

    let src = {
        cols: 1000,
        channels: () => {
            return 1;
          },
        data: [1000, 20]
    };
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 20; y++) {
            src.data[y * src.cols * src.channels() + x * src.channels()] = 255;
        }
    }

    src.data[12 * src.cols * src.channels() + 30 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 31 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 32 * src.channels()] = 0

    src.data[12 * src.cols * src.channels() + 40 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 41 * src.channels()] = 0
    src.data[12 * src.cols * src.channels() + 42 * src.channels()] = 0

    expect(findTheVerticalsOnTheContours(src, staves)).toStrictEqual(
        [
            {"height": 4, "width": 3, "x": 30, "y": 8},
            {"height": 4, "width": 3, "x": 40, "y": 8},
        ]
    )
})

test('LM cut out one vertical on one stave', () => {
    let notes = [
        note(100, 200, 1, 20)
    ]

    let staves = [
        stave(0, 200, 1000, 2)
    ]
    
    let src = null
    expect(cutoutNotesFromStaves(staves, notes, src)).toStrictEqual(
        [
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 899, "x": 101, "y": 200}
        ]
    )
})

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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 179, "x": 120, "y": 200},
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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 179, "x": 120, "y": 200},
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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 179, "x": 120, "y": 200},
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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 299, "x": 0, "y": 220},
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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
            {"height": 2, "real": true, "width": 880, "x": 120, "y": 200},
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 220},
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
            {"height": 2, "real": true, "width": 99, "x": 0, "y": 200},
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