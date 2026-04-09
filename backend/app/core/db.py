import os
import platform
import sys

# Python 3.14 on some Windows hosts can block in platform WMI queries during
# SQLAlchemy import. Force a fast machine/uname path before importing SQLAlchemy.
if sys.platform == "win32" and sys.version_info >= (3, 14):
    _machine = os.getenv("PROCESSOR_ARCHITECTURE", "AMD64")

    def _fast_uname() -> platform.uname_result:
        return platform.uname_result(
            system="Windows",
            node=os.getenv("COMPUTERNAME", ""),
            release="",
            version="",
            machine=_machine,
            processor=_machine,
        )

    platform.uname = _fast_uname  # type: ignore[assignment]
    platform.machine = lambda: _machine  # type: ignore[assignment]

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine.url import URL
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy.orm import scoped_session
from fastapi import Depends
from typing import Generator

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base: DeclarativeMeta = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
