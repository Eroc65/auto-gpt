import os
import platform
import sys

# Python 3.14 on some Windows hosts can block in platform WMI queries that
# SQLAlchemy triggers during import. Normalize uname/machine early at package
# import time so all app modules inherit the fast path.
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
