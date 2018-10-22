from threading import Thread
import serial, time
import cv2, imutils, sys


class Drill(Thread):
    def __init__(self, port, get_next_block, block_done, emit_state):
        Thread.__init__(self)
        self.port = port
        self.ser = serial.Serial(port)
        self.current_block = None
        self.get_next_block = get_next_block
        self.block_done = block_done
        self.emit_state = emit_state
        self.drill_on = False
        self.cam = cv2.VideoCapture(0)
        

    def run(self):
        while True:
            time.sleep(0.2)
            if not self.drill_on:
                continue

            if self.current_block == None:
                if not self.drill_on:
                    continue
                self.get_next_block()
                continue

            if not self.block_on_slide():
                if not self.drill_on:
                    self.emit_state('waiting')
                    continue

            if self.current_block["holes"] == []:
                self.emit_state('waiting')
                self.block_done({'id' : self.current_block["id"], 'success': self.check_holes()})
                self.current_block = None
                continue
        
            if not self.drill_on:
                continue
            self.emit_state('drilling')

            next_hole = self.current_block["holes"].pop(0)
            self.drill_hole(next_hole, self.current_block["depth"])


    def drill_hole(self, position, depth):
        print("drilled hole")
        pass

    def check_holes(self):
        ret, img = self.cam.read()
        if ret:
            cv2.imshow("", img)
            cv2.waitKey(1)
        return True
        
            
    def block_on_slide(self):
        return True
    
    def drill_extend(self):
        print("drill extend")

    def drill_retract(self):
        print("drill retract")

    def drill_moveto(self, pos):
        print("drill moveto " + str(pos))
    
    def linear_down(self):
        print("linear down")

    def linear_up(self):
        print("linear up")

    def linear_moveto(self, pos):
        print("linear moveto " + str(pos))

    def got_next_block(self, block):
        self.current_block = block

    def stop_drill(self):
        self.drill_on = False
        self.emit_state('stopped')
        print("stop drill")

    def start_drill(self):
        self.emit_state('idle')
        self.drill_on = True
        print("start drill")