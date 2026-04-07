import redis
import redis.asyncio as async_redis
from .config import settings

def get_redis_client():
    """Returns a synchronous Redis client."""
    return redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_async_redis_client():
    """Returns an asynchronous Redis client."""
    return async_redis.from_url(settings.REDIS_URL, decode_responses=True)
