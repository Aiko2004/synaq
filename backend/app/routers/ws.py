from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.redis import redis_client
import json

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.organizers: dict[str, list[WebSocket]] = {}

    async def connect(self, quiz_id: str, websocket: WebSocket):
        await websocket.accept()
        if quiz_id not in self.organizers:
            self.organizers[quiz_id] = []

        self.organizers[quiz_id].append(websocket)

    def disconnect(self, quiz_id: str, websocket: WebSocket):
        if quiz_id in self.organizers:
            self.organizers[quiz_id].remove(websocket)

    async def broadcast(self, quiz_id: str, message: dict):
        if quiz_id in self.organizers:
            for ws in self.organizers[quiz_id]:
                await ws.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/quiz/{quiz_id}")
async def quiz_websocket(websocket: WebSocket, quiz_id: str):
    await manager.connect(quiz_id, websocket)
    try:
        participants = redis_client.lrange(f"quiz:{quiz_id}:participants", 0, -1)
        await websocket.send_json({
            "event": "current_participants",
            "count": len(participants),
            "names": participants
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(quiz_id, websocket)