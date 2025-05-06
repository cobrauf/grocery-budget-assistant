from pathlib import Path
import os

def find_project_root() -> Path:
    """
    Searches upwards from the current file's directory until it finds
    the directory that contains the 'backend' directory. This is the root.
    """
    current_file = Path(__file__).resolve() # Get absolute path of current file
    current_dir = current_file.parent       # Get the directory containing the current file

    # Iterate through all parent directories, starting from the current file's parent
    for parent in current_dir.parents:
        # Check if a directory named 'backend' exists directly within this parent
        if (parent / "backend").is_dir():
            # If it does, this 'parent' directory is our project root
            return parent

    # If we reach here, it means we searched all the way up to the filesystem root
    # without finding a directory containing 'backend'.
    raise FileNotFoundError(
        f"Project root not found. Could not locate a directory containing "
        f"a 'backend' sub-directory by searching upwards from {current_file}"
    )