import cv2, imutils, sys

cam = cv2.VideoCapture(0)

while True:
    ret, img = cam.read()
    if ret:
        # frame = imutils.resize(img, width=300)
        print(img.shape)
        # sys.stdout.buffer.write(img.tostring())