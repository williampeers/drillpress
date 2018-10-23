import cv2
import numpy as np
import json, os
from pathlib import Path

def order_points(pts):
    pts = np.array(pts)
    # initialzie a list of coordinates that will be ordered
    # such that the first entry in the list is the top-left,
    # the second entry is the top-right, the third is the
    # bottom-right, and the fourth is the bottom-left
    rect = np.zeros((4, 2), dtype="float32")

    # the top-left point will have the smallest sum, whereas
    # the bottom-right point will have the largest sum
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    # now, compute the difference between the points, the
    # top-right point will have the smallest difference,
    # whereas the bottom-left will have the largest difference
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]

    # return the ordered coordinates
    return rect


class ROI:
    def __init__(self, width, height):
        self.arena_width = width
        self.arena_height = height
        self.perspective_transform = None
        self.got_transform = False
        self.border_points = []
        self.original_shape = (1280, 840)
        self.offset = (0, 0)

    def transform(self, img):
        self.original_shape = img.shape[:2]
        if self.got_transform:
            img = cv2.warpPerspective(img, self.perspective_transform, (self.arena_width, self.arena_height))
        return img

    def reverse_transform(self, img, output_img = None):
        if self.got_transform:
            if type(output_img) is np.ndarray:
                shape = output_img.shape[:2]
            else:
                shape = self.original_shape
            img = cv2.warpPerspective(img, self.reverse_perspective_transform, (shape[1], shape[0]))
            if type(output_img) is np.ndarray:
                # gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
                mask = img > 0
                output_img[mask] = img[mask]
                # if len(self.border_points) is 4:
                #     cv2.drawContours(output_img, [np.array([self.border_points[0], self.border_points[2], self.border_points[3], self.border_points[1]])], 0, (0,0,155), 1)
                return output_img
            else:
                return img
        elif type(output_img) is np.ndarray:
            return output_img
        else:
            return img

    def calculate_perspective_transform(self):
        if np.array(self.border_points).shape != (4, 2):
            print("Invalid border points")
            return False
        roi_file = open("./roi.json", "w")
        json_points = []
        for p in self.border_points:
            json_points.append([int(p[0]), int(p[1])])
        roi_file.write(json.dumps(list(json_points)))
        roi_file.close()
        (tl, bl, br, tr) = order_points(self.border_points)
        self.offset = int(tl[0]), int(tl[1])
        rect = np.array([tl, tr, br, bl], np.float32)

        # compute the width of the new image, which will be the
        # maximum distance between bottom-right and bottom-left
        # x-coordiates or the top-right and top-left x-coordinates

        # width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        # width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        # self.transform_width = max(int(width_a), int(width_b))
        #
        # # compute the height of the new image, which will be the
        # # maximum distance between the top-right and bottom-right
        # # y-coordinates or the top-left and bottom-left y-coordinates
        # height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        # height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        # self.transform_height = max(int(height_a), int(height_b))

        # now that we have the dimensions of the new image, construct
        # the set of destination points to obtain a "birds eye view",
        # (i.e. top-down view) of the image, again specifying points
        # in the top-left, top-right, bottom-right, and bottom-left
        # order
        dst = np.array(
            [
                [0, 0],
                [0, self.arena_height - 1],
                [self.arena_width - 1, self.arena_height - 1],
                [self.arena_width - 1, 0]
            ],
                np.float32
            )

        # compute the perspective transform matrix and then apply it
        self.perspective_transform = cv2.getPerspectiveTransform(rect, dst)
        self.reverse_perspective_transform = cv2.getPerspectiveTransform(dst, rect)
        self.got_transform = True
        return True
