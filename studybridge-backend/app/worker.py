from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "studybridge",
    broker=settings.redis_url,
    backend=settings.redis_url,
)


@celery_app.task
def ingest_resource(resource_id: str):
    # TODO: implement ingestion pipeline: parse, chunk, embed, index
    return resource_id


@celery_app.task
def check_links():
    # TODO: implement periodic link health checking
    return "ok"

