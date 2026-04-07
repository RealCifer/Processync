from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..core.redis import get_async_redis_client
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/progress/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time job progress tracking.
    Subscribes to Redis Pub/Sub channel for the specific job_id.
    """
    await websocket.accept()
    redis = get_async_redis_client()
    pubsub = redis.pubsub()
    channel = "progress_channel"
    
    await pubsub.subscribe(channel)
    logger.info(f"WebSocket connected for job {job_id}, subscribed to {channel}")
    
    try:
        # Initial message to confirm connection
        await websocket.send_json({
            "job_id": job_id,
            "status": "connected",
            "stage": "initializing",
            "message": "Successfully connected to progress stream"
        })

        while True:
            # Check for messages from Redis
            try:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message['type'] == 'message':
                    # Parse data string to JSON to perform job_id filtering
                    try:
                        data = json.loads(message['data'])
                        if str(data.get('job_id')) == str(job_id):
                            logger.debug(f"Matches Job {job_id}: Forwarding progress...")
                            await websocket.send_json(data)
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON from Redis on progress_channel: {message['data']}")
            except asyncio.CancelledError:
                logger.info(f"WebSocket tracking for job {job_id} was cancelled")
                raise
            except Exception as e:
                logger.error(f"Error in WebSocket loop for job {job_id}: {str(e)}")
            
            # Brief sleep to prevent tight loop if no message
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for job {job_id}")
    except asyncio.CancelledError:
        # Silently handle task cancellation during shutdown
        pass
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}")
    finally:
        try:
            await pubsub.unsubscribe(channel)
            await pubsub.close()
            await redis.close()
        except:
            pass
        logger.info(f"Cleaned up Redis subscription for job {job_id}")
