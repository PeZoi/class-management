import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    raw_host = (os.getenv("DB_HOST") or "localhost").strip()
    host = raw_host
    port = None
    # Support DB_HOST formats: "localhost", "localhost:3307"
    if ":" in raw_host and not raw_host.startswith("["):
        maybe_host, maybe_port = raw_host.rsplit(":", 1)
        if maybe_host and maybe_port.isdigit():
            host = maybe_host
            port = int(maybe_port)

    # Keep logs ASCII-only to avoid Windows console encoding issues.
    print(f"[db] connect host={host!r} port={port!r}")
    return mysql.connector.connect(
        host=host,
        port=port,
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

def execute_query(sql: str):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(sql)
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result