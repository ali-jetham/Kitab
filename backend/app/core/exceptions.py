class DocumentNotFoundError(Exception):
    """Exception raised when a document is not found in the database."""

    def __init__(self, value) -> None:
        self.value = value
        super().__init__(f"Document not found: {value}")
