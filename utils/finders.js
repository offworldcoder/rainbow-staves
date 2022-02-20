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
    let previousStave = {y:0}
    for (i in sortedContours) {
      counter += 1;
      const rect = sortedContours[i];
      maxLength = Math.max(maxLength, rect.width);
      minLength = Math.min(minLength, rect.width);
      total = total + rect.width;

      if (Math.abs(rect.y - previousStave.y) < 5)
      {
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
    module.exports = { cutoutNotesFromStaves }
  }