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
    forbidden_pattern = r"\b(" + "|".join(map(re.escape, FORBIDDEN)) + r")\b"
    if re.search(forbidden_pattern, sql_clean):
        raise Exception("Unsafe SQL detected")

    if "limit" not in sql_clean:
        # Insert LIMIT before trailing semicolon if present.
        sql_stripped = sql.rstrip()
        if sql_stripped.endswith(";"):
            sql = sql_stripped[:-1].rstrip() + " LIMIT 20;"
        else:
            sql = sql_stripped + " LIMIT 20"

    return sql