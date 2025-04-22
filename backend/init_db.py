#!/usr/bin/env python3
"""
Initialise the local MySQL database by running every statement in init_db.sql.

⚠️ Never commit real passwords to a public repo. This is fine for
short‑lived local experiments only.
"""

import mysql.connector
from mysql.connector import errorcode

# ────────────────────────── Connection settings ───────────────────────────────
DB_CONFIG = {
    "host":     "127.0.0.1",
    "port":     3306,
    "user":     "myproj_user",
    "password": "s0m3‑str0ng‑p4ss",
    "database": "myproject",
    # If you moved the user to the legacy auth plugin, uncomment the next line:
    # "auth_plugin": "mysql_native_password",
    "charset":  "utf8mb4",
    "use_unicode": True,
}

INIT_SQL_FILE = "init_db.sql"      # change path if the file lives elsewhere

# ───────────────────────────── Initialiser ────────────────────────────────────
def init_db() -> None:
    conn = cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        with open(INIT_SQL_FILE, encoding="utf-8") as f:
            sql_script = f.read()

        # MySQL Connector ≥ 9.2 handles entire scripts in one execute()
        cursor.execute(sql_script)
        # Consume any remaining result‑sets so every statement actually runs
        while cursor.nextset():
            pass

        conn.commit()
        print("✅  Database initialised!")

    except FileNotFoundError:
        print(f"❌  SQL file “{INIT_SQL_FILE}” not found.")
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("❌  Wrong user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("❌  The database specified in DB_CONFIG does not exist")
        else:
            print(f"❌  {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
