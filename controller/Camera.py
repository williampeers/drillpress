import cv2, imutils, sys, time
from threading import Thread
from socketIO_client import SocketIO, LoggingNamespace
import numpy as np
from Field import ROI

kernel = np.ones((5,5),np.uint8)

class Camera(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.cam = cv2.VideoCapture(1)
        self.cam.set(cv2.CAP_PROP_FPS, 10)
        self.cam.set(cv2.CAP_PROP_BRIGHTNESS, 0.2)
        # self.cam.set(cv2.CAP_PROP_CONTRAST, 1)
        self.cam.set(cv2.CAP_PROP_SATURATION, 100)
        # self.cam.set(cv2.CAP_PROP_HUE, -8.58993)
        self.cam.set(cv2.CAP_PROP_GAIN, 0)
        self.cam.set(cv2.CAP_PROP_EXPOSURE, -3)
        self.cam.set(cv2.CAP_PROP_AUTOFOCUS, 0) 
        # self.cam.set(28, 10)
        # self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        # self.cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.img = None

        self.socket = SocketIO('192.168.0.100', 8000, LoggingNamespace)
        
        self.socket.on('connect', self.on_connect)
        self.socket.on('disconnect', self.on_disconnect)
        self.socket.on('reconnect', self.on_reconnect)
        self.block_found_at = 0
        self.start()
        self.roi = ROI(1000, 250)

    def on_connect(self):
        print('connect')
        self.socket.emit('drill_state')

    def on_disconnect(self):
        print('disconnect')

    def on_reconnect(self):
        print('reconnect')

    def emit_block(self, holes):
        self.socket.emit('checked_block', holes)

    def run(self):
        while True:
            ret, img = self.cam.read()
            if ret:
                blurred = cv2.GaussianBlur(img, (5,5), 0)
                gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
                edges = cv2.Canny(gray, 45, 50)
                cv2.imshow("edges", edges)
                _, contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_TC89_KCOS)
                blank = np.zeros(edges.shape, np.uint8)
                block = (0,)
                for cnt in contours:
                    rect = cv2.minAreaRect(cnt)
                    (x, y), (width, height), angle = rect
                    if width > height:
                        temp = width
                        width = height
                        height = temp
                        angle = (angle + 90) % 360
                    if 100 < width < 140 and 400 < height < 500 and 3.5 <= height / width <= 4.5:
                        for seg in range(40, 60, 5):
                            approx = cv2.approxPolyDP(cnt, seg, True)
                            cv2.drawContours(blank, [cnt], 0, 255)
                            print(len(approx))
                            if len(approx) == 4:
                                block = np.reshape(approx, (4,2))
                                break
                if len(block) > 3:
                    self.roi.border_points = block
                    self.roi.calculate_perspective_transform()
                    block_img = self.roi.transform(img)
                    if np.std(block_img) < 60:
                        print("found block")

                        cv2.imshow("block", block_img) 
                cv2.imshow("img", img)



                cv2.waitKey(1)


if __name__ == "__main__":
    cam = Camera()
    cam.socket.wait()