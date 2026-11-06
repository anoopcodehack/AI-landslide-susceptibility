import pathlib
import pytest

@pytest.fixture
def tmp_dir(tmp_path: pathlib.Path) -> pathlib.Path:
    """Fixture providing a temporary directory Path object."""
    return tmp_path
