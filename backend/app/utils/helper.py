def normalize_pikepdf_value(value):
    """Converts non-serializable types into standard python types."""
    if isinstance(value, set):
        if len(value) == 0:
            return None
        return list(value)

    if isinstance(value, list):
        if all(x is None for x in value):
            return None

    return value
