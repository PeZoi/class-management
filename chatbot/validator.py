FORBIDDEN = [
    "insert", "update", "delete",
    "drop", "alter", "truncate"
]

def validate_sql(sql: str):

    sql_clean = sql.lower().strip()

    if not sql_clean.startswith("select"):
        raise Exception("Only SELECT allowed")

    # Block only actual SQL keywords, not substrings in identifiers
    # (e.g. allow column name `is_deleted`).
    import re
    from schema import DB_SCHEMA

    # Known tables are sourced from schema.py (DB_SCHEMA). This prevents LLM hallucinations like fee_schedule.
    known_tables = set(re.findall(r"(?im)^\s*TABLE\s+([a-zA-Z_][\w]*)\s*\(", DB_SCHEMA))
    forbidden_pattern = r"\b(" + "|".join(map(re.escape, FORBIDDEN)) + r")\b"
    if re.search(forbidden_pattern, sql_clean):
        raise Exception("Unsafe SQL detected")

    # Reject queries referencing tables outside DB_SCHEMA.
    # Note: only checks FROM/JOIN table tokens (simple guard, not a full SQL parser).
    for m in re.finditer(r"(?is)\b(from|join)\b\s+(`?)([a-zA-Z_][\w]*)\2", sql_clean):
        table = m.group(3)
        if table not in known_tables:
            raise Exception(f"Unknown table referenced: {table}")

    if "limit" not in sql_clean:
        # Insert LIMIT before trailing semicolon if present.
        sql_stripped = sql.rstrip()
        if sql_stripped.endswith(";"):
            sql = sql_stripped[:-1].rstrip() + " LIMIT 20;"
        else:
            sql = sql_stripped + " LIMIT 20"

    return sql