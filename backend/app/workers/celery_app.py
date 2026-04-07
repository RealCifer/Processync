from celery import Celery
from ..core.config import settings

# Initialize Celery app
celery_app = Celery(
    "processync_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.document_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    # Resilience settings for production
    task_acks_late=True,                 # Don't acknowledge until task is finished
    task_reject_on_worker_lost=True,      # Return task to queue if worker process dies
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,        # Don't hog tasks; better for parallel reliability
    
    # Retry broker connection at startup instead of crashing
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
)
