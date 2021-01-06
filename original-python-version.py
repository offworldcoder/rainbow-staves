import cv2
import array as arr
import random
import numpy as np
import argparse

def sort_contours(cnts, method="left-to-right"):
	# initialize the reverse flag and sort index
	reverse = False
	i = 0
	# handle if we need to sort in reverse
	if method == "right-to-left" or method == "bottom-to-top":
		reverse = True
	# handle if we are sorting against the y-coordinate rather than
	# the x-coordinate of the bounding box
	if method == "top-to-bottom" or method == "bottom-to-top":
		i = 1
	# construct the list of bounding boxes and sort them from top to
	# bottom
	boundingBoxes = [cv2.boundingRect(c) for c in cnts]
	(cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),
		key=lambda b:b[1][i], reverse=reverse))
	# return the list of sorted contours and bounding boxes
	return (cnts, boundingBoxes)

# Load image, convert to grayscale, Otsu's threshold
image = cv2.imread('./sheet1.png')
result = image.copy()
gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

# Detect horizontal lines
import numpy as np  
horizontal_kernel = np.array([
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
], dtype = np.uint8)

detect_horizontal = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
cnts = cv2.findContours(detect_horizontal, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
cnts = cnts[0] if len(cnts) == 2 else cnts[1]
(cnts, boundingBoxes) = sort_contours(cnts, method="top-to-bottom")
color_idx = 0
colors = [
(87, 80, 245),   # red (line 1)
(231, 177, 237),  # 
(220, 74, 67),
(180, 216, 165),
(100, 230, 223),

(60, 172, 252),
(87, 80, 245),
(204, 95, 213),
(220, 74, 67),
(180, 216, 165),
]

for c in cnts:
    cv2.drawContours(result, [c], -1, colors[color_idx], 2)
    color_idx += 1
    if color_idx == len(colors):
        color_idx = 0

edge_kernel = np.array([[ 0.0, -1, 0], 
                        [ -1, 4, -1], 
                        [ 0, -1, 0]], dtype=np.uint8)
detect_edge = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, edge_kernel, iterations=2)
cnts = cv2.findContours(detect_edge, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
cnts = cnts[0] if len(cnts) == 2 else cnts[1]
for c in cnts:
    cv2.fillPoly(result, [c], (0,0,0))

cv2.imwrite("./sheet1-col.png", result)
#cv2.imshow('result', result)
#cv2.waitKey()
