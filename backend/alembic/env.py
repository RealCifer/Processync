import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Setup path so we can import our app
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

# We need to import the Base metadata so Alembic can read our models
from app.core.db import Base
from app.core.config import settings

# Important: ensure all models are imported before this point.
from app.models import *

config = context.config

if getattr(config, 'config_file_name', None) is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    # Attempt to use DATABASE_URL from settings
    config_ini_section = config.get_section(config.config_ini_section)
    if 'sqlalchemy.url' not in config_ini_section or config_ini_section['sqlalchemy.url'] == 'postgresql://user:password@db:5432/processync':
        config_ini_section['sqlalchemy.url'] = settings.DATABASE_URL

    connectable = engine_from_config(
        config_ini_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
