def normalize_pikepdf_value(value):
    """Converts non-serializable types into standard python types."""

    if value is None:
        return []
    
    if isinstance(value, str):
        return [value]

    if isinstance(value, set):
        if len(value) == 0:
            return []
        value = list(value)

    if isinstance(value, list) and all(x is None for x in value):
        return []
    else:
        return [str(x) for x in value]

def normalize_word(word: str) -> str:
    return "".join(c.lower() for c in word if c.isalnum())
