import json
import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..core.redis import get_redis_client

router = APIRouter(prefix="/ws", tags=["websockets"])
logger = logging.getLogger(__name__)

async def redis_listener(websocket: WebSocket, job_id: str):
    redis_client = get_redis_client()
    pubsub = redis_client.pubsub()
    channel_name = f"job_progress:{job_id}"
    
    await asyncio.to_thread(pubsub.subscribe, channel_name)
    
    try:
        while True:
            message = await asyncio.to_thread(
                pubsub.get_message, 
                ignore_subscribe_messages=True, 
                timeout=1.0
            )
            
            if message and message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)
                
                if data.get("status") in ["completed", "failed"]:
                    break
                    
            await asyncio.sleep(0.1)
            
    except asyncio.CancelledError:
        pass
    finally:
        await asyncio.to_thread(pubsub.unsubscribe, channel_name)
        await asyncio.to_thread(pubsub.close)

@router.websocket("/progress/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    
    try:
        listener_task = asyncio.create_task(redis_listener(websocket, job_id))
        
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}")
    finally:
        if 'listener_task' in locals():
            listener_task.cancel()
            try:
                await listener_task
            except asyncio.CancelledError:
                pass
        
        if not websocket.client_state.name == "DISCONNECTED":
            await websocket.close()
