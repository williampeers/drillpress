#!/bin/bash

# python3 camera.py | ffmpeg -f rawvideo -pixel_format bgr24 -video_size 640x480 -re -framerate 10  -i - -f mpegts -preset ultrafast udp://192.168.0.90:1234

python3 camera.py | vlc -vvv stream:///dev/stdin --sout '#standard{access=http,mux=ts,dst=:8090}' :demux=h264