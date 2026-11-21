"""
The new database model stores known languages on Character.known_languages,
so there is no standalone language table to populate.
"""


def add_languages():
    print("[INFO] Languages are stored as character JSON data; no language seed is required.")
    return True


if __name__ == "__main__":
    add_languages()
