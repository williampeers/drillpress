from threading import Thread
import serial, time

import glob

class Drill(Thread):
    def __init__(self, port, get_next_block, block_drilled, emit_state):
        Thread.__init__(self)
        self.port = port
        self.current_block = None
        self.get_next_block = get_next_block
        self.block_drilled = block_drilled
        self.emit_state = emit_state
        self.drill_on = True
        self.ser = None
        self.baudrate = 9600
        self.connected = False

    def ser_send(self, command, arg=0):
        if arg == True:
            arg = 1
        elif arg == False:
            arg = 0
        self.connect()
        data = str(command) + str(arg)
        print("sending: " + data)
        self.ser.write(data.encode())


    def wait(self):
        while True:
            self.connect()
            try:
                data = self.ser.read(100)
            except serial.serialutil.SerialException:
                print("serial disconnected")
                continue
            if data != b'': 
                resp = str(data.decode())
                print(resp)
                if "done" in resp or "Ready" in resp:
                    return

    def connect(self):
        while not self.connected:
            for p in glob.glob(self.port):
                try:
                    self.ser = serial.Serial(p, baudrate=self.baudrate, timeout=0)
                    self.connected = True
                    
                except serial.serialutil.SerialException:
                    pass
            if not self.connected:
                print("not plugged in")

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
                self.complete_block()
                self.emit_state('waiting')
                self.block_drilled({'id' : self.current_block["id"]})
                self.current_block = None
                continue
        
            if self.current_block["drilled"] >= self.current_block["count"]:
                self.emit_state('idle')
                continue

            if not self.drill_on:
                continue
            self.emit_state('drilling')

            next_hole = self.current_block["holes"].pop(0)
            self.drill_hole_at(next_hole, self.current_block["depth"])


    def drill_hole(self, depth=10):
        print("drill hole")
        self.clamp(1)
        self.wait()
        self.ser_send(3)
        self.wait()
        self.clamp(0)

    
    def drill_hole_at(self, position, depth=10):
        print("drill hole")
        self.linear_moveto(position)
        self.wait()
        self.clamp(1)
        self.wait()
        self.ser_send(3)
        self.wait()
        self.clamp(0)

    def complete_block(self):
        self.linear_moveto(500)
        self.wait()
        self.air(1)
        self.wait()
        self.air(0)
        self.wait()
            
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
        self.ser_send(1, int(pos))
        print("linear moveto: " + str(int(pos)))

    def home_slide(self):
        self.ser_send(2)
        print("linear home")

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

    def clamp(self, value):
        self.ser_send(4, value)
        print("clamped: " + str(value))

    def air(self, value):
        self.ser_send(5, value)
        print("Block air: " + str(value))

    def power(self, value):
        self.ser_send(6, value)
        print('power: ' + str(value))


def get_next_block():
    print("get next block")

def block_drilled(arg):
    print("block drilled")

def emit_state(state):
    print("state: " + str(state))

if __name__ == "__main__":
    drill = Drill("/dev/ttyUSB*", get_next_block, block_drilled, emit_state)
    drill.connect()
    drill.wait()
    drill.power(1)
    drill.wait()
    drill.drill_hole_at(100)
    drill.wait()
    drill.air(1)
    drill.wait()
    drill.air(0)
    drill.wait()
    drill.power(0)
    drill.wait()
