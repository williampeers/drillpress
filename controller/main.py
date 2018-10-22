from socketIO_client import SocketIO, LoggingNamespace
import json
from Drill import Drill

def on_connect():
    print('connect')

def on_disconnect():
    print('disconnect')

def on_reconnect():
    print('reconnect')

socketIO = SocketIO('192.168.0.100', 8000, LoggingNamespace)

socketIO.on('connect', on_connect)
socketIO.on('disconnect', on_disconnect)
socketIO.on('reconnect', on_reconnect)



def get_next_block():
    socketIO.emit('next_block')

def block_done(arg):
    print("block done")
    socketIO.emit('block_done', arg)

def emit_state(state):
    socketIO.emit('set_drill_state', state)

drill = Drill("/dev/ttyAMA0", get_next_block, block_done, emit_state)

socketIO.on('next_block', drill.got_next_block)

socketIO.on('drill_extend', drill.drill_extend)
socketIO.on('drill_retract', drill.drill_retract)
socketIO.on('drill_moveto', drill.drill_moveto)

socketIO.on('linear_down', drill.linear_down)
socketIO.on('linear_up', drill.linear_up)
socketIO.on('linear_moveto', drill.linear_moveto)

socketIO.on('drill_start', drill.start_drill)
socketIO.on('drill_stop', drill.stop_drill)

drill.start()
socketIO.wait()
