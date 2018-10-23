from threading import Thread
import cv2, imutils, sys, time


class Camera(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.cam = cv2.VideoCapture(0)
        self.cam.set(cv2.CAP_PROP_FPS , 60)
        self.img = None
        # self.start()
        
    def run(self):
        while True:
            time.sleep(1/60)
            ret, img = self.cam.read()
            if ret:
                self.img = img

    def check_block(self):
        return True
        blurred = cv2.GaussianBlur(self.img, (9, 9), 0)
        edges = cv2.Canny(blurred, 50, 80)
        cv2.imshow("", edges)
        cv2.waitKey(1)
        return True