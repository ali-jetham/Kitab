def normalize_pikepdf_value(value):
    """Converts non-serializable types into standard python types."""
    if isinstance(value, set):
        return list(value)

    return value
