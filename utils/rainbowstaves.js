function drawStaves(sortedContours, src, maxLength) {
    // draw contours
    const colours = [
      [245, 80, 87, 255],
      [237, 177, 231, 255],
      [67, 74, 220, 255],
      [165, 216, 180, 255],
      [223, 230, 100, 255],
      [252, 172, 60, 255],
      [245, 80, 87, 255],
      [213, 95, 204, 255],
      [67, 74, 220, 255],
      [165, 216, 180, 255],
    ];

    let colour_idx = 0;
    let colour = colours[colour_idx];

    let previousStaveY = 0;
    for (i in sortedContours) {
      const rect = sortedContours[i];
      console.log(`=> stave x ${rect.x} y ${rect.y} real ${rect.real}`);
      // if (Number(i) < 32 || Number(i) > 34) {
      //   console.log(`only interested in stave`);
      //   continue;
      // }

      // Only draw real (manually added) horizontal lines or those which are long enough to be considered part of the stave
      if (rect.real || rect.width > maxLength / 2) {
        if (rect.y != previousStaveY) {
          console.log(
            `changing colour as stave y has changed from ${previousStaveY} to x ${rect.x} y ${rect.y} real ${rect.real}`
          );

          previousStaveY = rect.y;
          colour_idx = colour_idx + 1;
          if (colour_idx == colours.length) {
            colour_idx = 0;
          }
          colour = colours[colour_idx];
        } else {
          console.log(`keeping colour`);
        }

        if (DEBUG_STAVE_TEXT) {
          cv.putText(
            src,
            `stave ${i}`,
            new cv.Point(rect.x, rect.y),
            cv.FONT_ITALIC,
            0.5,
            new cv.Scalar(255, 0, 0, 255),
            1
          );
        }

        if (rect.real) {
          cv.rectangle(
            src,
            new cv.Point(rect.x, rect.y),
            new cv.Point(rect.x + rect.width, rect.y + rect.height),
            colour,
            -1
          );
          if (true || DEBUG_STAVE_DISPLAY) {
            cv.rectangle(
              src,
              new cv.Point(rect.x, rect.y - 10),
              new cv.Point(rect.x, rect.y + rect.height + 20),
              new cv.Scalar(0, 255, 0, 255), //colour,
              -1
            );
            cv.rectangle(
              src,
              new cv.Point(rect.x + rect.width, rect.y - 10),
              new cv.Point(rect.x + rect.width, rect.y + rect.height + 20),
              new cv.Scalar(0, 0, 0, 255), //colour,
              -1
            );
          }
        } else {
          cv.rectangle(
            src,
            new cv.Point(rect.x, rect.y),
            new cv.Point(rect.x + rect.width, rect.y + rect.height),
            colour,
            1
          );
        }
      }
    }
  }