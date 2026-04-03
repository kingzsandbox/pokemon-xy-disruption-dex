from __future__ import annotations

import json
import re
import shutil
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "raw" / "source"
PUBLIC_DIR = ROOT / "public"
OUTPUT_DIR = PUBLIC_DIR / "sprites" / "trainers-workbook"
OUTPUT_DATA = PUBLIC_DIR / "data" / "trainer-images.json"
TRAINERS_DATA = PUBLIC_DIR / "data" / "trainers.json"

XLSX_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
DRAWING_NS = "{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}"
REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"
DOC_REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only).strip("-").lower() or "unknown"


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_lookup_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", normalize_space(value))
    return normalized.encode("ascii", "ignore").decode("ascii").lower()


def parse_trainer_name(raw_name: str) -> tuple[str, int | None]:
    normalized = normalize_space(raw_name)
    match = re.match(r"^(.*?)\s*\((\d+)\)\s*$", normalized)
    if not match:
        return normalized, None
    return normalize_space(match.group(1)), int(match.group(2))


CONTROL_ROW_HEADERS = {
    "trainer photo",
    "name (index no)",
    "pokemon in party",
    "battle type",
    "right side",
}


def is_location_header_row(row_data: dict[str, str]) -> bool:
    non_empty_cells = {column: normalize_space(value) for column, value in row_data.items() if normalize_space(value)}
    if set(non_empty_cells.keys()) != {"B"}:
        return False
    return normalize_lookup_key(non_empty_cells["B"]) not in CONTROL_ROW_HEADERS


def load_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return ["".join((node.text or "") for node in item.findall(f".//{XLSX_NS}t")) for item in root.findall(f"{XLSX_NS}si")]


def get_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))

    value_node = cell.find(f"{XLSX_NS}v")
    if value_node is None:
        return "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))

    if cell_type == "s":
        return shared_strings[int(value_node.text or "0")]

    return value_node.text or ""


def read_sheet_rows_with_numbers(archive: zipfile.ZipFile, sheet_file: str) -> list[tuple[int, dict[str, str]]]:
    shared_strings = load_shared_strings(archive)
    root = ET.fromstring(archive.read(f"xl/worksheets/{sheet_file}"))
    rows: list[tuple[int, dict[str, str]]] = []
    for row in root.findall(f".//{XLSX_NS}sheetData/{XLSX_NS}row"):
        row_number = int(row.attrib.get("r", "0"))
        row_data: dict[str, str] = {}
        for cell in row.findall(f"{XLSX_NS}c"):
            ref = cell.attrib.get("r", "")
            column = re.sub(r"\d+", "", ref)
            value = get_cell_value(cell, shared_strings)
            if value:
                row_data[column] = value
        rows.append((row_number, row_data))
    return rows


def load_drawing_media_map(archive: zipfile.ZipFile, drawing_file: str) -> dict[tuple[int, int], str]:
    drawing_root = ET.fromstring(archive.read(f"xl/drawings/{drawing_file}"))
    rel_root = ET.fromstring(archive.read(f"xl/drawings/_rels/{drawing_file}.rels"))
    rel_map = {
        rel.attrib["Id"]: rel.attrib["Target"].replace("../", "xl/")
        for rel in rel_root.findall(f"{REL_NS}Relationship")
        if rel.attrib.get("Target")
    }

    mapping: dict[tuple[int, int], str] = {}
    for anchor in drawing_root.findall(f"{DRAWING_NS}oneCellAnchor"):
        from_node = anchor.find(f"{DRAWING_NS}from")
        blip = anchor.find(f".//{{http://schemas.openxmlformats.org/drawingml/2006/main}}blip")
        if from_node is None or blip is None:
            continue
        row = int(from_node.findtext(f"{DRAWING_NS}row", "0")) + 1
        col = int(from_node.findtext(f"{DRAWING_NS}col", "0")) + 1
        rel_id = blip.attrib.get(f"{DOC_REL_NS}embed")
        target = rel_map.get(rel_id or "")
        if target:
            mapping[(row, col)] = target
    return mapping


def extract_workbook_images() -> list[dict[str, str | int | None]]:
    trainer_records = json.loads(TRAINERS_DATA.read_text())
    trainer_key_to_ids: dict[tuple[str, str, str, int | None, str], list[str]] = {}
    trainer_index_key_to_ids: dict[tuple[str, str, int | None, str], list[str]] = {}
    for trainer in trainer_records:
        key = (
            trainer["ruleset"],
            trainer["source"],
            normalize_lookup_key(trainer["name"]),
            trainer.get("indexNumber"),
            normalize_lookup_key(trainer["location"]),
        )
        trainer_key_to_ids.setdefault(key, []).append(trainer["id"])
        index_key = (
            trainer["ruleset"],
            trainer["source"],
            trainer.get("indexNumber"),
            normalize_lookup_key(trainer["location"]),
        )
        trainer_index_key_to_ids.setdefault(index_key, []).append(trainer["id"])

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if OUTPUT_DIR.exists():
        for entry in OUTPUT_DIR.iterdir():
            if entry.is_file():
                entry.unlink()
            elif entry.is_dir():
                shutil.rmtree(entry)

    manifest: list[dict[str, str | int | None]] = []
    saved_media: dict[str, str] = {}

    workbook_specs = [
        ("singles", "(Singles) Trainers, Restaurants & Battle Chateau (XY).xlsx"),
        ("doubles", "(Doubles) Trainers, Restaurants & Battle Chateau (XY).xlsx"),
    ]
    sheet_specs = {
        "sheet2.xml": ("xy-trainers", "drawing2.xml"),
        "sheet3.xml": ("restaurants", "drawing3.xml"),
        "sheet4.xml": ("battle-chateau", "drawing4.xml"),
    }

    for ruleset, workbook_name in workbook_specs:
        workbook_path = SOURCE_DIR / workbook_name
        with zipfile.ZipFile(workbook_path) as archive:
            for sheet_file, (source, drawing_file) in sheet_specs.items():
                rows = read_sheet_rows_with_numbers(archive, sheet_file)
                drawing_media = load_drawing_media_map(archive, drawing_file)
                current_header = ""
                row_index = 0

                while row_index < len(rows):
                    row_number, row = rows[row_index]
                    header_value = normalize_space(row.get("B", ""))
                    if is_location_header_row(row):
                        current_header = header_value

                    if header_value != "Trainer Photo":
                        row_index += 1
                        continue

                    name_row = rows[row_index + 2][1] if row_index + 2 < len(rows) else {}
                    trainer_name, trainer_index = parse_trainer_name(name_row.get("C", "Unknown Trainer"))
                    location = "Battle Chateau" if source == "battle-chateau" else current_header or "Unknown Location"
                    media_target = drawing_media.get((row_number, 3))
                    if media_target:
                        output_name = saved_media.get(media_target)
                        if not output_name:
                            extension = Path(media_target).suffix or ".png"
                            output_slug = slugify(
                                f"{ruleset}-{source}-{trainer_name}-{trainer_index or 'na'}-{location}",
                            )
                            output_name = f"{output_slug}{extension}"
                            (OUTPUT_DIR / output_name).write_bytes(archive.read(media_target))
                            saved_media[media_target] = output_name

                        trainer_key = (
                            ruleset,
                            source,
                            normalize_lookup_key(trainer_name),
                            trainer_index,
                            normalize_lookup_key(location),
                        )
                        trainer_ids = trainer_key_to_ids.get(trainer_key, [])
                        if not trainer_ids:
                            trainer_ids = trainer_index_key_to_ids.get(
                                (
                                    ruleset,
                                    source,
                                    trainer_index,
                                    normalize_lookup_key(location),
                                ),
                                [],
                            )

                        for trainer_id in trainer_ids:
                            manifest.append(
                                {
                                    "trainerId": trainer_id,
                                    "src": f"/sprites/trainers-workbook/{output_name}",
                                    "ruleset": ruleset,
                                    "source": source,
                                    "trainerName": trainer_name,
                                    "indexNumber": trainer_index,
                                    "location": location,
                                }
                            )

                    row_index += 8

    manifest.sort(key=lambda entry: str(entry["trainerId"]))
    return manifest


def main() -> None:
    manifest = extract_workbook_images()
    OUTPUT_DATA.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Extracted {len(manifest)} trainer image mappings to {OUTPUT_DATA}")


if __name__ == "__main__":
    main()
