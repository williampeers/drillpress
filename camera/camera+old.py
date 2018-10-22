from socketIO_client import SocketIO
import cv2, imutils
import base64, json

print("starting")
cam = cv2.VideoCapture(0)
print("got camera")
while True:
    try:
        print("connecting")
        with SocketIO('localhost', 8888) as socketIO:
            while True:

                print("reading")
                ret, img = cam.read()
                if ret:
                    print("jpg encoding")
                    img = imutils.resize(img, width=300)
                    ret, data = cv2.imencode(".jpg", img)
                    if ret:
                        try:
                            print("64 encoding")
                            final = str(base64.b64encode(data))
                            final = final[2:-1]
                            while final[-1] == "=":
                                final = final[:-2]
                            print("sending")
                            socketIO.emit('video', final)
                            print("sent")
                        except Exception as exc:
                            print(exc)
                socketIO.wait(seconds=2)
    except KeyboardInterrupt:
        break
    except Exception as exc:
        print(exc)