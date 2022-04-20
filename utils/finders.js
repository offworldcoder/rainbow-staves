const DEBUG_DISPLAY = false;

/**
 * Sort the stave line contour output from opencv into vertical order.
 * We've already split the lines around the notes we found so the order of the
 * stave line in our list is all over the place.
 * 
 * @param {*} contours - contours output from opencv
 * @returns 
 */
function sortContours(contours) {
  let sortableContours = [];
  for (let i = 0; i < contours.size(); i++) {
    const rect = cv.boundingRect(contours.get(i));
    sortableContours.push({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }

  //Sort 'em
  sortableContours = sortableContours.sort((item1, item2) => {
    return item1.y < item2.y ? -1 : item1.y > item2.y ? 1 : 0;
  });

  return sortableContours;
}

function findTheStaves(thresh) {
  let horizontal_kernel = cv.Mat.ones(1, 40, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);

  detect_horizontal = new cv.Mat();
  cv.morphologyEx(
    thresh,
    detect_horizontal,
    cv.MORPH_OPEN,
    horizontal_kernel,
    anchor,
    2
  );

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(
    detect_horizontal,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );


  hierarchy.delete();

  const sortedContours = doTheSorting(contours)
  contours.delete();

  return sortedContours
}

function doTheSorting(contours) {
  const sortedContours = sortContours(contours);

  // work out how long the staves are (mostly)
  let maxLength = 0;
  let minLength = 9999;
  let total = 0;
  let counter = 0;
  let previousStave = { y: 0 }
  for (i in sortedContours) {
    counter += 1;
    const rect = sortedContours[i];
    maxLength = Math.max(maxLength, rect.width);
    minLength = Math.min(minLength, rect.width);
    total = total + rect.width;

    if (Math.abs(rect.y - previousStave.y) < 5) {
      console.log(`This stave [${i}] x ${rect.x} y ${rect.y} is too close to previous x ${previousStave.x} y ${previousStave.y}`)
    }
    previousStave = rect;
  }

  console.log(`sortedContours.length ${counter}`);
  const averageWidth = total / counter;
  console.log(
    `length min ${minLength} max ${maxLength} average ${averageWidth}`
  );
  return { maxLength, sortedContours };
}

function findTheVerticalsOnTheContours(src, contours) {
  let verticalsList = [];
  for (i in contours) {
    const rect = contours[i];
    console.log(`=> stave x ${rect.x} y ${rect.y} real ${rect.real}`);
    const verts = scanAlongStave(src, rect);
    for (l in verts) {
      verticalsList.push(verts[l]);
    }
  }

  for (l in verticalsList) {
    console.log(`>> vertical ${JSON.stringify(verticalsList[l])}`);
  }
  return verticalsList;
}

function likelySomething(color) {
  const result = color < 20;
  return result;
}

function scanAlongStave(src, rect) {
  const aboveY = rect.y - 1;
  const belowY = rect.y + rect.height + 1;
  let obstructionPositions = [];

  console.log(`rect is x ${rect.x}, y ${rect.y}, w ${rect.width}, h ${rect.height}`);
  for (let x = rect.x; x < rect.x + rect.width; x++) {
    const above = checkAndHighlight(src, x, aboveY, true);
    const below = checkAndHighlight(src, x, belowY, false);
    if (above || below) {
      obstructionPositions.push({
        x: x,
        y: rect.y - 2,
        width: 1,
        height: 4,
      });
    }
  }

  const cleanedList = tidyObstructions(obstructionPositions);
  console.log(`** original list count ${obstructionPositions.length}`);
  console.log(`** cleaned list length ${cleanedList.length}`);

  const markerColour = [0, 0, 255, 255];
  for (let i = 0; i < cleanedList.length; i++) {
    const rect = cleanedList[i];
    if (false) {
      cv.rectangle(
        src,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + 1, rect.y + rect.height),
        markerColour,
        -1
      );
      cv.rectangle(
        src,
        new cv.Point(rect.x + rect.width, rect.y),
        new cv.Point(rect.x + rect.width + 1, rect.y + rect.height),
        markerColour,
        -1
      );
    }
  }
  return cleanedList;
}

function tidyObstructions(positions) {
  if (positions.length === 0) {
    return positions;
  }

  const tidiedPositions = [];
  tidiedPositions.push(positions[0]);
  for (let p = 1; p < positions.length; p++) {
    const currentPosition = positions[p];
    const previous = tidiedPositions[tidiedPositions.length - 1];
    console.log(`\nprevious x ${previous.x}, w ${previous.width}`);
    console.log(`current x ${currentPosition.x}, w ${currentPosition.width} to list`);

    if (previous.x + previous.width >= currentPosition.x - 1) {
      console.log(`COMBINING previous x ${previous.x} next to position x ${currentPosition.x}`);
      previous.width += currentPosition.width;
    } else {
      console.log(`adding current x ${currentPosition.x}, w ${currentPosition.width} to list`);
      tidiedPositions.push(currentPosition);
    }
  }
  return tidiedPositions;
}

function checkAndHighlight(src, x, y, above) {
  const aboveMarkerColour = [100, 255, 100, 255];
  const belowMarkerColour = [255, 100, 100, 255];

  const colour = src.data[y * src.cols * src.channels() + x * src.channels()];
  if (likelySomething(colour)) {
    console.log("*** FOUND SOMETHING ***");
    if (false) {
      if (above) {
        cv.rectangle(
          src,
          new cv.Point(x, y - 4),
          new cv.Point(x + 1, y - 2),
          aboveMarkerColour,
          -1
        );
      } else {
        cv.rectangle(
          src,
          new cv.Point(x, y + 2),
          new cv.Point(x + 1, y + 4),
          belowMarkerColour,
          -1
        );
      }
    }
    return true;
  }
  return false;
}

function findTheNotes(gray, src, wholeNotes) {
  let mask = new cv.Mat();
  let threshold = 0.5;
  max_val = 1;
  counter = 0;
  let notePositions = [];

  for (note in wholeNotes) {
    console.log(`Looking for wholenotes [${note}]...`);
    let matched = new cv.Mat();
    cv.matchTemplate(
      gray,
      wholeNotes[note],
      matched,
      cv.TM_CCOEFF_NORMED
    );

    let maxVal = null;
    while (counter < (DEBUG_DISPLAY ? 1000 : 10000)) {
      counter = counter + 1;

      const minMax = cv.minMaxLoc(matched);
      const x = minMax.maxLoc.x;
      const y = minMax.maxLoc.y;

      if (maxVal === null) {
        maxVal = minMax.maxVal;
      }
      const value = minMax.maxVal;
      if (value < maxVal * 0.9) {
        console.log(
          `Match value is below threshold so stopping ${value}`
        );
        break;
      }

      notePositions.push({
        x: x,
        y: y,
        width: wholeNote2.cols,
        height: wholeNote2.rows,
      });

      const topLeft = new cv.Point(x - 5, y - 5);
      const bottomRight = new cv.Point(
        x + wholeNote2.cols + 10,
        y + wholeNote2.rows + 10
      );

      cv.rectangle(
        matched,
        topLeft,
        bottomRight,
        new cv.Scalar(0, 0, 0, 255),
        cv.FILLED,
        cv.LINE_8,
        0
      );
      cv.rectangle(
        gray,
        topLeft,
        bottomRight,
        new cv.Scalar(0, 0, 0, 255),
        cv.FILLED,
        cv.LINE_8,
        0
      );

      if (DEBUG_DISPLAY) {
        cv.rectangle(
          src,
          topLeft,
          bottomRight,
          new cv.Scalar(255, 0, 0, 255),
          2,
          cv.LINE_8,
          0
        );

        if (DEBUG_NOTE_TEXT) {
          cv.putText(
            src,
            `${y}`,
            new cv.Point(x, y - 5),
            cv.FONT_ITALIC,
            0.5,
            new cv.Scalar(255, 0, 0, 255),
            1
          );
        }
      }
      // cv.imshow("debugOutput", gray);
      // console.log(`debug output`)
    }
  }

  console.log(`Number of notes found on sheet ${notePositions.length}`);

  //Sort 'em
  sortedNotePositions = notePositions.sort((item1, item2) => {
    const first = `${item1.y}${item1.x}`;
    const second = `${item2.y}${item2.x}`;
    return Number(first) - Number(second);
  });

  if (DEBUG_NOTE_TEXT) {
    for (pos in sortedNotePositions) {
      cv.putText(
        src,
        `${pos}`,
        new cv.Point(
          sortedNotePositions[pos].x,
          sortedNotePositions[pos].y - 5
        ),
        cv.FONT_ITALIC,
        0.5,
        new cv.Scalar(255, 0, 0, 255),
        1
      );
      console.log(
        `note ${pos} x ${sortedNotePositions[pos].x} y ${sortedNotePositions[pos].y}`
      );
    }
  }

  return sortedNotePositions;
}

/**
 * Split the stave lines where the notes intersect
 * 
 * @param {*} sortedContours - stave position output from opencv
 * @param {*} notePositions - note position output from opencv
 * @param {*} src - the working canvas to draw onto
 * @returns 
 */
function cutoutNotesFromStaves(sortedContours, notePositions, src) {
  const EXTRA_HEIGHT = DEBUG_DISPLAY ? 2 : 0;
  let outputContours = [];
  console.log(`sortedContours length ${sortedContours.length}`);

  let counter = 0;
  for (i in sortedContours) {
    const staveRect = sortedContours[i];
    console.log(
      `NFS ------ [${i}] ${JSON.stringify(staveRect)}`
    );

    counter = counter + 1;
    // if (DEBUG_DISPLAY && counter > 5) {
    //   console.log(`reached counter limit so exiting`);
    //   break;
    // }

    let staveLeft = staveRect.x;
    let wasNoteOverlap = false;
    let verticalShift = 0;
    for (pos in notePositions) {
      const noteRect = notePositions[pos];
      if (noteRect.y + noteRect.height < staveRect.y) {
        console.log(`skipping...`);
        continue;
      }

      console.log(
        `NFS -----| ${staveLeft} noteRect [${pos}] ${JSON.stringify(
          noteRect
        )}`
      );

      //TODO: This shortcut doesn't work as the notes are numeric order(?)
      // if (noteRect.y > staveRect.y) {
      //   console.log(
      //     `NFS   note [${pos}] is below this stave [${i}], moving to next stave`
      //   );
      //   break;
      // }

      console.log(`>> noteRect x ${noteRect.x}, y ${noteRect.y}, w ${noteRect.width}, h ${noteRect.height}`);
      console.log(`>> Stave y ${staveRect.y}`);

      // Does this note overlap with the stave line?
      if (
        // noteRect.x > staveLeft && //TODO: shouldn't need to do this to catch rogue overlapping note
        noteRect.y - noteRect.height / 2 < staveRect.y &&
        noteRect.y + noteRect.height > staveRect.y
      ) {
        wasNoteOverlap = true;
        console.log(`NFS   *** overlap, splitting stave into two`);
        const leftStave = {
          x: staveLeft,
          y: staveRect.y + (DEBUG_DISPLAY ? verticalShift : 0),
          width: noteRect.x - staveLeft,
          height: staveRect.height + EXTRA_HEIGHT,
          real: true,
        };
        staveLeft = noteRect.x + noteRect.width;
        console.log(
          `NFS  -----| adding left stave section ${JSON.stringify(leftStave)}`
        );
        outputContours.push(leftStave);
        verticalShift += 2;
      }
    }

    if (wasNoteOverlap) {
      const rightStave = {
        x: staveLeft,
        y: staveRect.y,
        width: staveRect.x + staveRect.width - staveLeft,
        height: staveRect.height + EXTRA_HEIGHT + (DEBUG_DISPLAY ? 4 : 0),
        real: true,
      };

      console.log(`NFS |----- adding right ${JSON.stringify(rightStave)}`);
      outputContours.push(rightStave);
    } else {
      console.log(`NFS ------ keeping original stave`);
      outputContours.push(staveRect);
    }
  }
  return outputContours;
}

if (typeof module !== 'undefined') {
  module.exports = { findTheVerticalsOnTheContours, cutoutNotesFromStaves }
}