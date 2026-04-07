from app.core.db import Base, engine
from app.models.document import Document
from app.models.job import Job
from app.models.result import Result

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
