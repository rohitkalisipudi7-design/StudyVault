import asyncio
from app.db.session import get_db_health

async def main():
    result = await get_db_health()
    print(f"DB health: {result}")

if __name__ == "__main__":
    asyncio.run(main())
