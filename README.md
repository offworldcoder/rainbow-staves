# Getting Started with Rainbow-Staves

## Overview
Alissa to describe what this webpage is doing to the sheet music and why. We are adding colours to the stave lines to make them more readable to people with dyslexia.

Rainbow Staves is currently available for use at it's current temporary location - https://offworldcoder.github.io/rainbow-staves/ (previously http://rainbowstaves.infinityfreeapp.com/dist/)

## How it works
We use the opencv.js library to find the stave positions in the sheet music image. At this point we could draw coloured lines over the staves but this will also draw the line ontop of the notes which makes the music less readable. To improve readability we find the quarter notes and try to draw the coloured stave lines around them.

![alt text](sheetmusic/readme%20example.jpg)


### External Resources
Javascript OpenCV examples: https://docs.opencv.org/3.4/dc/de6/tutorial_js_nodejs.html

Python OpenCv example on stackoverflow to find horizontal lines in image: https://stackoverflow.com/questions/7227074/horizontal-line-detection-with-opencv

Official OpenCv tutorial on morph lines which happens to be an example of finding and removing stave lines from sheet music: https://docs.opencv.org/master/dd/dd7/tutorial_morph_lines_detection.html
