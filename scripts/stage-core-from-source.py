from __future__ import annotations

import json
import re
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "raw" / "source"
CORE_DIR = ROOT / "raw" / "core"

XLSX_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
DOCX_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

UNRESOLVED_ENCOUNTER_POLICIES: dict[str, str] = {
    "Pumpkaboo x5 (All Sizes)": "exclude: source aggregates multiple size forms and cannot be safely collapsed.",
    "Pumpkaboo x5 (All Sizes, except Average)": "exclude: source aggregates multiple size forms and cannot be safely collapsed.",
}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    collapsed = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only).strip("-").lower()
    return collapsed or "unknown"


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def unique_preserve(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def read_xlsx_rows(path: Path, sheet_name: str) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall(f"{XLSX_NS}si"):
                shared_strings.append("".join((node.text or "") for node in item.findall(f".//{XLSX_NS}t")))

        sheet_root = ET.fromstring(archive.read(f"xl/worksheets/{sheet_name}"))
        rows: list[dict[str, str]] = []
        for row in sheet_root.findall(f".//{XLSX_NS}sheetData/{XLSX_NS}row"):
            row_data: dict[str, str] = {}
            for cell in row.findall(f"{XLSX_NS}c"):
                ref = cell.attrib.get("r", "")
                col = re.sub(r"\d+", "", ref)
                cell_type = cell.attrib.get("t")
                if cell_type == "inlineStr":
                    value = "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))
                else:
                    value_node = cell.find(f"{XLSX_NS}v")
                    if value_node is None:
                        value = "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))
                    elif cell_type == "s":
                        value = shared_strings[int(value_node.text or "0")]
                    else:
                        value = value_node.text or ""
                if value:
                    row_data[col] = value
            rows.append(row_data)
        return rows


def read_docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    paragraphs: list[str] = []
    for paragraph in root.findall(f".//{DOCX_NS}p"):
        text = "".join((node.text or "") for node in paragraph.findall(f".//{DOCX_NS}t"))
        text = normalize_space(text)
        if text:
            paragraphs.append(text)
    return paragraphs


def numeric(value: str) -> int:
    return int(float(value))


def split_multiline_items(value: str) -> list[str]:
    return [normalize_space(part) for part in re.split(r"[\n\r]+", value) if normalize_space(part)]


def derive_item_category(name: str) -> str:
    if re.match(r"TM\d+", name):
        return "TM"
    if name == "Air Balloon":
        return "Held Item"
    if name.endswith(" Wing"):
        return "Vitamin"
    if "Ball" in name:
        return "Poke Ball"
    if name.endswith(" Berry") or name in {"Liechi Berry", "Starf Berry", "Enigma Berry"}:
        return "Berry"
    if name.endswith(" Gem"):
        return "Gem"
    if "ite" in name:
        return "Mega Stone"
    if name.endswith(" Stone") or name in {"Magmarizer", "Protector", "Reaper Cloth", "Prism Scale", "Sachet", "Whipped Dream", "Razor Fang", "Razor Claw", "Dragon Scale"}:
        return "Evolution Item"
    if name in {"HP Up", "Protein", "Iron", "Carbos", "Calcium", "Zinc", "PP Max"}:
        return "Vitamin"
    if name.startswith("X ") or name in {"Guard Spec.", "Dire Hit"}:
        return "Battle Item"
    if any(token in name for token in ["Incense", "Herb", "Powder", "Lens", "Scarf", "Band", "Specs", "Orb", "Powder", "Button", "Policy", "Moss", "Vest"]):
        return "Held Item"
    if name in {"Potion", "Super Potion", "Hyper Potion", "Max Potion", "Full Restore", "Full Heal", "Revive", "Max Revive", "Moomoo Milk", "Energy Powder", "Energy Root", "Revival Herb", "Heal Powder", "Elixir", "Max Ether", "Max Elixir"}:
        return "Medicine"
    if any(token in name for token in ["Nugget", "Shard", "Mushroom", "Relic", "Coupon", "Candy"]):
        return "Valuable"
    return "Held Item"


def build_pokemon() -> list[dict]:
    rows = read_xlsx_rows(SOURCE_DIR / "Pokémon Stats & Evolutions (XY).xlsx", "sheet1.xml")
    pokemon: list[dict] = []
    for row in rows[1:]:
        name = normalize_space(row.get("C", ""))
        if not name:
            continue
        canonical_name = name.replace("♂", " Male").replace("♀", " Female")
        form = normalize_space(row.get("D", ""))
        display_name = f"{canonical_name} ({form})" if form else canonical_name
        type_2 = normalize_space(row.get("F", ""))
        abilities = unique_preserve(
            [
                normalize_space(row.get("O", "")),
                normalize_space(row.get("P", "")),
                normalize_space(row.get("Q", "")),
            ]
        )
        pokemon.append(
            {
                "id": f"pokemon-{numeric(row['A']):04d}" if not form else f"pokemon-{numeric(row['A']):04d}-{slugify(form)}",
                "slug": slugify(display_name),
                "name": display_name,
                "dexNumber": numeric(row["A"]),
                "types": [normalize_space(row["E"])] + ([type_2] if type_2 else []),
                "baseStats": {
                    "hp": numeric(row["H"]),
                    "attack": numeric(row["I"]),
                    "defense": numeric(row["J"]),
                    "specialAttack": numeric(row["K"]),
                    "specialDefense": numeric(row["L"]),
                    "speed": numeric(row["M"]),
                },
                "abilities": abilities,
                "changeSummary": "Imported from Pokémon Stats & Evolutions (XY); disruption-specific review still needed.",
            }
        )
    pokemon_by_id = {entry["id"]: entry for entry in pokemon}

    def append_stub(entry: dict) -> None:
        if entry["id"] in pokemon_by_id:
            return
        pokemon.append(entry)
        pokemon_by_id[entry["id"]] = entry

    deoxys_normal = pokemon_by_id.get("pokemon-0386-normal-forme")
    if deoxys_normal:
        append_stub(
            {
                "id": "pokemon-0386",
                "slug": "deoxys",
                "name": "Deoxys",
                "dexNumber": 386,
                "types": list(deoxys_normal["types"]),
                "baseStats": dict(deoxys_normal["baseStats"]),
                "abilities": list(deoxys_normal["abilities"]),
                "changeSummary": "Temporary species-level stub derived from Deoxys Normal Forme for encounter import reconciliation.",
            }
        )

    meowstic_female = pokemon_by_id.get("pokemon-0678-female")
    meowstic_male = pokemon_by_id.get("pokemon-0678-male")
    if meowstic_female and meowstic_male:
        shared_abilities = [
            ability for ability in meowstic_male["abilities"] if ability in meowstic_female["abilities"]
        ]
        append_stub(
            {
                "id": "pokemon-0678",
                "slug": "meowstic",
                "name": "Meowstic",
                "dexNumber": 678,
                "types": list(meowstic_male["types"]),
                "baseStats": dict(meowstic_male["baseStats"]),
                "abilities": shared_abilities or list(meowstic_male["abilities"]),
                "changeSummary": "Temporary species-level stub derived from Meowstic form data for encounter import reconciliation.",
            }
        )

    return pokemon


def canonical_location_name(value: str) -> str:
    value = normalize_space(value)
    replacements = {
        "Victory Road - Room 3": "Victory Road Room 3",
        "Reflection Cave": "Reflection Cave 1BF",
        "Terminus Cave": "Terminus Cave B1F",
        "Route 8 - Cliffside area": "Route 8",
    }
    return replacements.get(value, value)


def parse_location_header(value: str) -> tuple[str, str]:
    normalized = normalize_space(value)
    match = re.match(r"^(.*?)\s*\[([^\]]+)\]\s*$", normalized)
    if not match:
        return canonical_location_name(normalized), "Location"

    location_name = canonical_location_name(match.group(1))
    label = normalize_space(match.group(2))

    if "Trash Cans" in label:
        prefix = label.replace("Trash Cans", "").strip()
        notes = f"Trash Can - {prefix}" if prefix else "Trash Can"
    elif "Attendant" in label:
        notes = f"Vendor - {label}"
    else:
        notes = f"Shop - {label}"

    return location_name, notes


def build_locations() -> list[dict]:
    encounter_rows = read_xlsx_rows(SOURCE_DIR / "Wild Encounters + Held Items (XY).xlsx", "sheet1.xml")
    header_row = encounter_rows[0]
    names: set[str] = set()
    for column, value in header_row.items():
        if re.fullmatch(r"[A-Z]+", column) and value and column >= "E":
            names.add(canonical_location_name(value))

    for paragraph in read_docx_paragraphs(SOURCE_DIR / "Box Link Locations.docx"):
        for match in re.finditer(r"\d+\.\s+([^(]+)", paragraph):
            names.add(canonical_location_name(match.group(1)))

    sorted_names = sorted(names)
    return [
        {
            "id": f"location-{slugify(name)}",
            "slug": slugify(name),
            "name": name,
            "region": "Kalos",
            "description": f"Imported location record from source materials for {name}.",
        }
        for name in sorted_names
    ]


def build_pokemon_lookup(pokemon: list[dict]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for entry in pokemon:
        raw_name = entry["name"]
        lookup[slugify(raw_name)] = entry["id"]
        base_name = re.sub(r"\s*\(.*?\)\s*$", "", raw_name).strip()
        lookup.setdefault(slugify(base_name), entry["id"])
    extra = {
        "nidoran-m": "pokemon-0032",
        "nidoran-f": "pokemon-0029",
        "mr-mime": "pokemon-0122",
        "mime-jr": "pokemon-0439",
        "farfetchd": "pokemon-0083",
        "flabebe": "pokemon-0669",
        "basculin-red": "pokemon-0550-red-striped-form",
        "basculin-blue": "pokemon-0550-blue-striped-form",
        "shellos-east-west": "pokemon-0422",
        "gastrodon-east": "pokemon-0423",
        "gastrodon-west": "pokemon-0423",
        "rotom-fan": "pokemon-0479",
        "rotom-frost": "pokemon-0479",
        "darmanitan": "pokemon-0555-standard-mode",
        "deoxys": "pokemon-0386",
        "giratina": "pokemon-0487-altered-forme",
        "keldeo": "pokemon-0647-ordinary-form",
        "meloetta": "pokemon-0648-aria-forme",
        "meowstic": "pokemon-0678",
        "hoopa": "pokemon-0720-hoopa-confined",
        "shaymin": "pokemon-0492-land-forme",
        "thundurus": "pokemon-0642-incarnate-forme",
        "unown-a": "pokemon-0201",
        "unown-h": "pokemon-0201",
        "unown-m": "pokemon-0201",
        "unown-q": "pokemon-0201",
        "unown-v": "pokemon-0201",
        "unown-y": "pokemon-0201",
        "unown-z": "pokemon-0201",
        "wormadam-grass": "pokemon-0413-plant-cloak",
        "zygarde": "pokemon-0718-50-forme",
        "gourgeist-average": "pokemon-0711-average-size",
    }
    lookup.update({key: value for key, value in extra.items() if value})
    return lookup


def normalize_species_name(value: str) -> str:
    value = value.replace("\n", " ")
    value = value.replace("♂", " Male").replace("♀", " Female")
    value = value.replace("*", "")
    value = re.sub(r"\bx\d+\b", "", value, flags=re.IGNORECASE)
    value = value.replace("(All Sizes, except Average)", "")
    value = value.replace("(All Sizes)", "")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def map_species_to_id(species: str, pokemon_lookup: dict[str, str]) -> str | None:
    normalized = normalize_species_name(species)
    candidates = [
        normalized,
        re.sub(r"\s*\(.*?\)", "", normalized).strip(),
        normalized.replace(" Male", "").replace(" Female", "").strip(),
        normalized.replace(" Red", "").replace(" Blue", "").strip(),
    ]
    for candidate in candidates:
        key = slugify(candidate)
        if key in pokemon_lookup:
            return pokemon_lookup[key]
    return None


def parse_level_range(value: str) -> tuple[int, int] | None:
    matches = re.findall(r"\d+(?:\.\d+)?", value)
    numbers = [int(float(number)) for number in matches]
    if not numbers:
        return None
    if len(numbers) == 1:
        return numbers[0], numbers[0]
    return min(numbers[0], numbers[1]), max(numbers[0], numbers[1])


def parse_rate(value: str) -> float | None:
    match = re.search(r"\d+(?:\.\d+)?", value)
    if not match:
        return None
    return float(match.group(0))


def build_encounters(pokemon: list[dict], locations: list[dict]) -> list[dict]:
    rows = read_xlsx_rows(SOURCE_DIR / "Wild Encounters + Held Items (XY).xlsx", "sheet1.xml")
    header_row = rows[0]
    location_by_column: dict[str, str] = {}
    for column, value in header_row.items():
        if value and column >= "E":
            location_by_column[column] = f"location-{slugify(canonical_location_name(value))}"

    pokemon_lookup = build_pokemon_lookup(pokemon)
    encounters: list[dict] = []
    skipped_species: set[str] = set()
    unresolved_policy_hits: dict[str, str] = {}
    encounter_index = 1
    ordered_location_columns = sorted(location_by_column.keys(), key=lambda col: (len(col), col))
    for row_number, row in enumerate(rows[3:], start=4):
        left_label = normalize_space(row.get("B", ""))
        right_label = normalize_space(row.get("C", ""))
        labels = [label for label in [left_label, right_label] if label]
        row_method = " / ".join(labels) if labels else "Wild Encounter"

        for start_column in ordered_location_columns:
            match = re.fullmatch(r"([A-Z]+)", start_column)
            if not match:
                continue
            base_ord = 0
            for char in start_column:
                base_ord = base_ord * 26 + (ord(char) - 64)
            species_col = ""
            level_col = ""
            rate_col = start_column
            if base_ord + 2 <= 26 * 26 + 26:
                def col_name(index: int) -> str:
                    name = ""
                    while index > 0:
                        index, rem = divmod(index - 1, 26)
                        name = chr(65 + rem) + name
                    return name
                species_col = col_name(base_ord + 2)
                level_col = col_name(base_ord + 3)
            species = normalize_space(row.get(species_col, ""))
            level = normalize_space(row.get(level_col, ""))
            rate = normalize_space(row.get(rate_col, ""))
            if not species or not level or not rate:
                continue
            pokemon_id = map_species_to_id(species, pokemon_lookup)
            level_range = parse_level_range(level)
            parsed_rate = parse_rate(rate)
            if not pokemon_id or level_range is None or parsed_rate is None:
                if species in UNRESOLVED_ENCOUNTER_POLICIES:
                    unresolved_policy_hits[species] = UNRESOLVED_ENCOUNTER_POLICIES[species]
                skipped_species.add(species)
                continue
            encounters.append(
                {
                    "id": f"encounter-{encounter_index:05d}",
                    "locationId": location_by_column[start_column],
                    "pokemonId": pokemon_id,
                    "method": row_method,
                    "minLevel": level_range[0],
                    "maxLevel": level_range[1],
                    "rate": parsed_rate,
                }
            )
            encounter_index += 1

    if skipped_species:
        print("Skipped unmapped encounter species:", ", ".join(sorted(skipped_species)[:25]))
    if unresolved_policy_hits:
        print("Encounter exclusion policies:")
        for species in sorted(unresolved_policy_hits):
            print(f"  - {species}: {unresolved_policy_hits[species]}")
    return encounters


def build_items() -> list[dict]:
    items: dict[str, dict] = {}
    pokemon_slugs = {slugify(entry["name"]) for entry in build_pokemon()}

    item_tokens = (
        "Berry",
        "Stone",
        "Orb",
        "Gem",
        "ite",
        "Ball",
        "Powder",
        "Herb",
        "Scale",
        "Club",
        "Band",
        "Specs",
        "Scarf",
        "Tag",
        "Incense",
        "Punch",
        "Mushroom",
        "Egg",
        "Lens",
        "Vest",
        "Claw",
        "Coat",
        "Wing",
        "Coupon",
        "Root",
        "Ash",
        "Juice",
    )

    def add_item(name: str, source: str) -> None:
        item_name = normalize_space(name)
        if not item_name:
            return
        if item_name.startswith("(") or re.search(r"\bx\d+\b", item_name, flags=re.IGNORECASE):
            return
        if slugify(item_name) in pokemon_slugs:
            return
        if not re.match(r"TM\d+", item_name) and not any(token in item_name for token in item_tokens) and item_name not in {
            "Potion",
            "Super Potion",
            "Hyper Potion",
            "Max Potion",
            "Full Restore",
            "Full Heal",
            "Revive",
            "Max Revive",
            "Elixir",
            "Max Ether",
            "Max Elixir",
            "PP Up",
            "PP Max",
            "Protein",
            "Iron",
            "Carbos",
            "Calcium",
            "Zinc",
            "HP Up",
            "Box Link",
            "Guard Spec.",
            "Dire Hit",
            "Honey",
            "Moomoo Milk",
            "Rare Candy",
            "Mysterious Candy",
            "Ability Capsule",
        }:
            return
        slug = slugify(item_name)
        items.setdefault(
            slug,
            {
                "id": f"item-{slug}",
                "slug": slug,
                "name": item_name,
                "category": derive_item_category(item_name),
                "description": f"Imported from {source}; review final in-game description later.",
            },
        )

    encounter_rows = read_xlsx_rows(SOURCE_DIR / "Wild Encounters + Held Items (XY).xlsx", "sheet1.xml")
    for row in encounter_rows[3:]:
        for value in row.values():
            if "\n" in value and any(token in value for token in item_tokens):
                for item_name in split_multiline_items(value):
                    add_item(item_name, "Wild Encounters + Held Items (XY).xlsx")

    for row in encounter_rows[3:]:
        for column, value in row.items():
            if re.fullmatch(r"[A-Z]+", column) and normalize_space(value):
                if any(token in value for token in item_tokens):
                    for item_name in split_multiline_items(value):
                        add_item(item_name, "Wild Encounters + Held Items (XY).xlsx")

    shop_rows = read_xlsx_rows(SOURCE_DIR / "Shops, Stores & Trash Cans (XY).xlsx", "sheet1.xml")
    for row in shop_rows[3:]:
        for column, value in row.items():
            if normalize_space(value) and re.fullmatch(r"[A-Z]+", column):
                next_column = chr(ord(column[-1]) + 1) if len(column) == 1 else ""
                if value and not re.fullmatch(r"\d+(\.\d+)?", value) and "Price" not in value and value not in {"Common", "Sometimes", "Rare"}:
                    if not value.startswith("No Gym Badges"):
                        add_item(value, "Shops, Stores & Trash Cans (XY).xlsx")

    pickup_lines = read_docx_paragraphs(SOURCE_DIR / "Pickup Items Table (XY).docx")
    for line in pickup_lines:
        if "Table" in line:
            continue
        add_item(line, "Pickup Items Table (XY).docx")

    add_item("Box Link", "Box Link Locations.docx")
    return list(items.values())


def build_item_locations(locations: list[dict], items: list[dict]) -> list[dict]:
    location_lookup = {entry["name"]: entry["id"] for entry in locations}
    item_lookup = {entry["slug"]: entry["id"] for entry in items}
    box_link_id = item_lookup.get(slugify("Box Link"), f"item-{slugify('Box Link')}")
    item_locations: list[dict] = []
    seen: set[tuple[str, str, str]] = set()

    def append_item_location(item_id: str | None, location_id: str | None, notes: str) -> None:
        if not item_id or not location_id:
            return
        key = (item_id, location_id, normalize_space(notes))
        if key in seen:
            return
        seen.add(key)
        item_locations.append(
            {
                "id": f"item-location-{len(item_locations) + 1:03d}",
                "itemId": item_id,
                "locationId": location_id,
                "notes": key[2],
            }
        )

    paragraphs = read_docx_paragraphs(SOURCE_DIR / "Box Link Locations.docx")
    combined = " ".join(paragraphs)
    for match in re.finditer(r"(\d+)\.\s+([^(]+)\(([^)]+)\)", combined):
        raw_location = normalize_space(match.group(2))
        location_name = canonical_location_name(raw_location)
        location_id = location_lookup.get(location_name)
        append_item_location(box_link_id, location_id, normalize_space(match.group(3)))

    shop_rows = read_xlsx_rows(SOURCE_DIR / "Shops, Stores & Trash Cans (XY).xlsx", "sheet1.xml")
    if len(shop_rows) >= 3:
        header_row = shop_rows[1]
        type_row = shop_rows[2]
        location_columns = [
            column
            for column, value in header_row.items()
            if re.fullmatch(r"[A-Z]+", column) and "[" in value and "]" in value
        ]

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

        for start_column in sorted(location_columns, key=column_to_index):
            location_name, location_note = parse_location_header(header_row[start_column])
            location_id = location_lookup.get(location_name)
            if not location_id:
                continue

            start_index = column_to_index(start_column)
            value_column = index_to_column(start_index + 1)
            value_label = normalize_space(type_row.get(value_column, ""))

            for row in shop_rows[3:]:
                item_name = normalize_space(row.get(start_column, ""))
                if not item_name:
                    continue
                item_id = item_lookup.get(slugify(item_name))
                if not item_id:
                    continue

                detail_value = normalize_space(row.get(value_column, ""))
                notes = location_note
                if "Chance" in value_label and detail_value:
                    notes = f"{location_note}; {detail_value} chance"
                elif "Price" in value_label and detail_value:
                    notes = f"{location_note}; price {detail_value}"

                append_item_location(item_id, location_id, notes)

    return item_locations


def write_json(path: Path, payload: list[dict]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    CORE_DIR.mkdir(parents=True, exist_ok=True)
    pokemon = build_pokemon()
    locations = build_locations()
    items = build_items()
    encounters = build_encounters(pokemon, locations)
    item_locations = build_item_locations(locations, items)

    write_json(CORE_DIR / "pokemon.json", pokemon)
    write_json(CORE_DIR / "locations.json", locations)
    write_json(CORE_DIR / "items.json", items)
    write_json(CORE_DIR / "encounters.json", encounters)
    write_json(CORE_DIR / "item-locations.json", item_locations)

    print(f"Staged {len(pokemon)} pokemon")
    print(f"Staged {len(locations)} locations")
    print(f"Staged {len(items)} items")
    print(f"Staged {len(encounters)} encounters")
    print(f"Staged {len(item_locations)} item locations")


if __name__ == "__main__":
    main()
