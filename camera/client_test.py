
import asyncio
import websockets

async def hello():
    async with websockets.connect(
            'ws://localhost:8888') as websocket:
        name = input("What's your name? ")

        await websocket.send(name)
        print("> " + str(name))

        greeting = await websocket.recv()
        print("< " + str(greeting))

asyncio.get_event_loop().run_until_complete(hello())