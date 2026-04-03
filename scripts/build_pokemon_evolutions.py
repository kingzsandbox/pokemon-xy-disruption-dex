from __future__ import annotations

import json
import re
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK_PATH = ROOT / "raw" / "source" / "Pokémon Stats & Evolutions (XY).xlsx"
POKEMON_PATH = ROOT / "public" / "data" / "pokemon.json"
OUTPUT_PATH = ROOT / "public" / "data" / "pokemon-evolutions.json"
XLSX_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_only.lower()).strip("-")


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def parse_workbook_rows() -> list[dict[str, str]]:
    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall(f"{XLSX_NS}si"):
                shared_strings.append(
                    "".join((node.text or "") for node in item.findall(f".//{XLSX_NS}t"))
                )

        sheet_root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows: list[dict[str, str]] = []
        for row in sheet_root.findall(f".//{XLSX_NS}sheetData/{XLSX_NS}row"):
            row_data: dict[str, str] = {}
            for cell in row.findall(f"{XLSX_NS}c"):
                ref = cell.attrib.get("r", "")
                column = re.sub(r"\d+", "", ref)
                cell_type = cell.attrib.get("t")
                value_node = cell.find(f"{XLSX_NS}v")
                if value_node is None:
                    value = "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))
                elif cell_type == "s":
                    value = shared_strings[int(value_node.text or "0")]
                else:
                    value = value_node.text or ""
                if value:
                    row_data[column] = value
            rows.append(row_data)
        return rows


def clean_name(name: str, form: str) -> str:
    base = normalize_space(name.replace("♂", " Male").replace("♀", " Female"))
    form = normalize_space(form)
    return f"{base} ({form})" if form else base


def build_lookup(pokemon: list[dict]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for entry in pokemon:
        lookup[slugify(entry["name"])] = entry["id"]
    return lookup


def parse_evolution_pairs(method_text: str) -> list[tuple[str, str]]:
    cleaned = method_text.replace("\n", " ")
    pairs = re.findall(r"([^()]+?)(?:↓|→)\s*\(([^)]+)\)", cleaned)
    return [(normalize_space(method), normalize_space(target)) for method, target in pairs]


def resolve_target_ids(target_text: str, lookup: dict[str, str]) -> list[str]:
    if "/" in target_text:
        parts = [normalize_space(part) for part in target_text.split("/") if normalize_space(part)]
    else:
        parts = [target_text]

    ids: list[str] = []
    for part in parts:
        candidate = part
        if candidate.startswith("Mega "):
            ids.extend(
                entry_id
                for key, entry_id in lookup.items()
                if key.endswith(slugify(candidate))
            )
            continue

        entry_id = lookup.get(slugify(candidate))
        if entry_id:
            ids.append(entry_id)
            continue

        matches = [
            entry_id
            for key, entry_id in lookup.items()
            if key.endswith(slugify(candidate)) or key == slugify(candidate)
        ]
        ids.extend(matches)

    seen: set[str] = set()
    result: list[str] = []
    for entry_id in ids:
        if entry_id not in seen:
            seen.add(entry_id)
            result.append(entry_id)
    return result


def main() -> None:
    pokemon = json.loads(POKEMON_PATH.read_text(encoding="utf-8"))
    pokemon_lookup = build_lookup(pokemon)
    rows = parse_workbook_rows()
    links: list[dict[str, str]] = []

    for row in rows[1:]:
        name = normalize_space(row.get("C", ""))
        if not name:
            continue

        current_name = clean_name(name, row.get("D", ""))
        current_id = pokemon_lookup.get(slugify(current_name))
        if not current_id:
            continue

        evolution_method = row.get("G", "")
        if not evolution_method or evolution_method == "---":
            continue

        for method, target_text in parse_evolution_pairs(evolution_method):
            for target_id in resolve_target_ids(target_text, pokemon_lookup):
                links.append(
                    {
                        "id": f"evolution-{current_id}-to-{target_id}",
                        "fromPokemonId": current_id,
                        "toPokemonId": target_id,
                        "method": method,
                    }
                )

    OUTPUT_PATH.write_text(json.dumps(links, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
