from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATH = PROJECT_ROOT / "scripts" / "stage-core-from-source.py"
OUTPUT_PATH = PROJECT_ROOT / "public" / "data" / "item-obtain-supplemental.json"


def load_stage_core():
    spec = importlib.util.spec_from_file_location("stage_core", SOURCE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load stage-core-from-source.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def column_to_index(column: str) -> int:
    index = 0
    for char in column:
        index = index * 26 + (ord(char) - 64)
    return index


def index_to_column(index: int) -> str:
    name = ""
    while index > 0:
        index, rem = divmod(index - 1, 26)
        name = chr(65 + rem) + name
    return name


def build_entries():
    stage_core = load_stage_core()
    items = json.loads((PROJECT_ROOT / "public" / "data" / "items.json").read_text(encoding="utf-8"))
    item_slug_lookup = {item["slug"]: item["name"] for item in items}
    item_name_lookup = {item["name"]: item["id"] for item in items}
    rows = stage_core.read_xlsx_rows(
        stage_core.SOURCE_DIR / "Shops, Stores & Trash Cans (XY).xlsx",
        "sheet1.xml",
    )

    header_row = rows[1]
    type_row = rows[2]
    entries: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()

    badge_columns = [
        column
        for column, value in header_row.items()
        if re.fullmatch(r"[A-Z]+", column) and "Gym Badge" in stage_core.normalize_space(value)
    ]
    location_columns = [
        column
        for column, value in header_row.items()
        if re.fullmatch(r"[A-Z]+", column) and "[" in value and "]" in value
    ]

    def append_entry(item_name: str, location_name: str, notes: str) -> None:
        item_id = item_name_lookup.get(item_name)
        if not item_id:
            return
        key = (item_id, location_name, stage_core.normalize_space(notes))
        if key in seen:
            return
        seen.add(key)
        entries.append(
            {
                "id": f"item-obtain-supplemental-{len(entries) + 1:03d}",
                "itemId": item_id,
                "itemName": item_name,
                "locationName": location_name,
                "notes": key[2],
                "source": "internal",
            }
        )

    for start_column in sorted(badge_columns, key=column_to_index):
        item_label = stage_core.normalize_space(type_row.get(start_column, ""))
        if item_label != "Item":
            continue

        value_column = index_to_column(column_to_index(start_column) + 1)
        value_label = stage_core.normalize_space(type_row.get(value_column, ""))
        badge_label = stage_core.normalize_space(header_row.get(start_column, ""))

        for row in rows[3:]:
            item_name = stage_core.normalize_space(row.get(start_column, ""))
            if not item_name:
                continue
            detail_value = stage_core.normalize_space(row.get(value_column, ""))
            notes = f"Shop - {badge_label}"
            if "Price" in value_label and detail_value:
                notes = f"{notes}; price {detail_value}"
            append_entry(item_name, "Poké Marts", notes)

    for start_column in sorted(location_columns, key=column_to_index):
        location_name, location_note = stage_core.parse_location_header(header_row[start_column])
        value_column = index_to_column(column_to_index(start_column) + 1)
        value_label = stage_core.normalize_space(type_row.get(value_column, ""))

        for row in rows[3:]:
            item_name = stage_core.normalize_space(row.get(start_column, ""))
            if not item_name:
                continue
            detail_value = stage_core.normalize_space(row.get(value_column, ""))
            notes = location_note
            if "Chance" in value_label and detail_value:
                notes = f"{notes}; {detail_value} chance"
            elif "Price" in value_label and detail_value:
                notes = f"{notes}; price {detail_value}"
            append_entry(item_name, location_name, notes)

    # Keep only rows that are not already represented in the current generated item names.
    # This preserves useful shop/facility obtain sources without duplicating current location data.
    return entries


def main() -> None:
    entries = build_entries()
    OUTPUT_PATH.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} supplemental item obtain entries to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
