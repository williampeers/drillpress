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
        self.holes = []
        self.block_active = False

    def on_connect(self):
        print('connect')
        self.socket.emit('drill_state')

    def on_disconnect(self):
        print('disconnect')

    def on_reconnect(self):
        print('reconnect')

    def emit_block(self, holes):
        self.socket.emit('checked_block', {'holes': holes})
        print({'holes': holes})

    def found_block(self, img):
        self.block_active = True
        self.block_found_at = time.time()
        cv2.imshow("block", img)
        # find holes and append positions to self.holes

    def block_gone(self):
        self.block_active = False
        avg_holes = [100]
        if len(self.holes) > 0:
            number_holes = 0
            for holes in self.holes:
                number_holes += len(holes)
            number_holes = int(number_holes / len(self.holes))

            temp_holes = [0] * number_holes
            for holes in self.holes:
                if len(holes) == number_holes:
                    for i in range(number_holes):
                        temp_holes[i] += holes[i]
            for hole in temp_holes:
                avg_holes.append(hole/len(self.holes))
            self.holes = []
        self.emit_block(avg_holes)

    def run(self):
        while True:
            ret, img = self.cam.read()
            if ret:
                found_block = False
                # blurred = cv2.GaussianBlur(img, (7,7), 0)
                # gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
                # edges = cv2.Canny(gray, 40, 60)
                hsv_img = cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
                edges = cv2.inRange(hsv_img, (0, 254, 50), (255, 255, 100))
                edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
                cv2.imshow("edges", edges)
                _, contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
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
                        peri = cv2.arcLength(cnt, True)
                        approx = cv2.approxPolyDP(cnt,5, True)
                        cv2.drawContours(blank, [cnt], 0, 255)
                        if len(approx) == 4:
                            block = np.reshape(approx, (4,2))
                            break
                if len(block) > 3:
                    self.roi.border_points = block
                    self.roi.calculate_perspective_transform()
                    block_img = self.roi.transform(img)
                    if np.std(block_img) < 60:
                        cv2.polylines(img,[block],True,(0,255,255))
                        found_block = True
                        self.found_block(block_img)
                if not found_block:
                    if self.block_active and time.time() > self.block_found_at + 2:
                        self.block_gone()
                cv2.imshow("img", img)



                cv2.waitKey(1)


if __name__ == "__main__":
    cam = Camera()
    cam.socket.wait()