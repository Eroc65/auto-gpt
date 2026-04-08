from fastapi import APIRouter

from . import auth, customers, estimates, invoices, jobs, leads, marketing, platform, protected, reminders, reports, technicians, voice


router = APIRouter()
router.include_router(auth.router, prefix="/api/auth", tags=["auth"])
router.include_router(leads.router, prefix="/api", tags=["leads"])
router.include_router(protected.router, prefix="/api", tags=["protected"])
router.include_router(customers.router, prefix="/api", tags=["customers"])
router.include_router(jobs.router, prefix="/api", tags=["jobs"])
router.include_router(technicians.router, prefix="/api", tags=["technicians"])
router.include_router(reminders.router, prefix="/api", tags=["reminders"])
router.include_router(invoices.router, prefix="/api", tags=["invoices"])
router.include_router(reports.router, prefix="/api", tags=["reports"])
router.include_router(estimates.router, prefix="/api", tags=["estimates"])
router.include_router(marketing.router, prefix="/api", tags=["marketing"])
router.include_router(platform.router, prefix="/api", tags=["platform"])
router.include_router(voice.router, prefix="/api", tags=["voice"])
