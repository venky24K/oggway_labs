import sys
import selectors
import asyncio
from pathlib import Path

# Add project root to sys.path
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# On Windows, set SelectorEventLoop for psycopg compatibility
if sys.platform == "win32":
    loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
    asyncio.set_event_loop(loop)

import uvicorn

if __name__ == "__main__":
    config = uvicorn.Config(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        loop="none" if sys.platform == "win32" else "auto",
        reload=False
    )
    server = uvicorn.Server(config)
    if sys.platform == "win32":
        loop.run_until_complete(server.serve())
    else:
        server.run()
