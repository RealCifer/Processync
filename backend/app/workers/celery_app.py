from celery import Celery
import os
from ..core.config import settings

# Initialize Celery app
celery_app = Celery(
    "processync_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.tasks.document_tasks']
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
)
