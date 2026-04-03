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

ENCOUNTER_METHOD_BY_FILL_RGB: dict[str, str] = {
    "FF93C47D": "Grass/Cave",
    "FFB3958F": "Rough Terrain",
    "FFFFE599": "Yellow Flowers",
    "FFEA9999": "Red Flowers",
    "FFB4A7D6": "Purple Flowers",
    "FFF9CB9C": "Horde",
    "FF999999": "Rock Smash",
    "FF9FC5E8": "Old Rod",
    "FF65A1DE": "Good Rod",
    "FF3881CA": "Super Rod",
    "FF1D6CEA": "Surf",
    "FF434343": "Ambush",
}

UNRESOLVED_ENCOUNTER_POLICIES: dict[str, str] = {
    "Pumpkaboo x5 (All Sizes)": "exclude: source aggregates multiple size forms and cannot be safely collapsed.",
    "Pumpkaboo x5 (All Sizes, except Average)": "exclude: source aggregates multiple size forms and cannot be safely collapsed.",
}

HELD_ITEM_NOTE_SNIPPETS = [
    "Consumables",
    "always have 100% Held Rate",
    "Non-Consumable",
    "always have 50% Held Rate",
    "If a Pokémon has 2 possible Held Items, the first one has 50% and the second one has 5% Held Rate",
    "The only Version Changes here are related to the Charmander Evolution Line and Mewtwo.",
]


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


def parse_cell_ref(ref: str) -> tuple[str, int]:
    column = re.sub(r"\d+", "", ref)
    row = int(re.sub(r"[A-Z]+", "", ref))
    return column, row


def load_xlsx_sheet(path: Path, sheet_name: str) -> tuple[list[str], ET.Element, ET.Element | None]:
    with zipfile.ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall(f"{XLSX_NS}si"):
                shared_strings.append("".join((node.text or "") for node in item.findall(f".//{XLSX_NS}t")))

        sheet_root = ET.fromstring(archive.read(f"xl/worksheets/{sheet_name}"))
        styles_root = (
            ET.fromstring(archive.read("xl/styles.xml"))
            if "xl/styles.xml" in archive.namelist()
            else None
        )
    return shared_strings, sheet_root, styles_root


def get_xlsx_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))

    value_node = cell.find(f"{XLSX_NS}v")
    if value_node is None:
        return "".join((node.text or "") for node in cell.findall(f".//{XLSX_NS}t"))

    if cell_type == "s":
        return shared_strings[int(value_node.text or "0")]

    return value_node.text or ""


def build_fill_palette(styles_root: ET.Element | None) -> tuple[list[ET.Element], list[ET.Element], dict[int, str | None]]:
    if styles_root is None:
        return [], [], {}

    fills = styles_root.find(f"{XLSX_NS}fills")
    cell_xfs = styles_root.find(f"{XLSX_NS}cellXfs")
    fill_elements = fills.findall(f"{XLSX_NS}fill") if fills is not None else []
    xf_elements = cell_xfs.findall(f"{XLSX_NS}xf") if cell_xfs is not None else []

    style_fill_rgb: dict[int, str | None] = {}
    for style_index, xf in enumerate(xf_elements):
        fill_id = int(xf.attrib.get("fillId", "0"))
        if fill_id >= len(fill_elements):
            style_fill_rgb[style_index] = None
            continue
        pattern_fill = fill_elements[fill_id].find(f"{XLSX_NS}patternFill")
        fg_color = pattern_fill.find(f"{XLSX_NS}fgColor") if pattern_fill is not None else None
        style_fill_rgb[style_index] = fg_color.attrib.get("rgb") if fg_color is not None else None

    return fill_elements, xf_elements, style_fill_rgb


def read_xlsx_cells(
    path: Path,
    sheet_name: str,
    *,
    apply_merged_cells: bool = False,
) -> tuple[dict[tuple[int, str], dict[str, str | int | None]], list[str]]:
    shared_strings, sheet_root, styles_root = load_xlsx_sheet(path, sheet_name)
    _, _, style_fill_rgb = build_fill_palette(styles_root)

    cells: dict[tuple[int, str], dict[str, str | int | None]] = {}
    for row in sheet_root.findall(f".//{XLSX_NS}sheetData/{XLSX_NS}row"):
        row_number = int(row.attrib.get("r", "0"))
        for cell in row.findall(f"{XLSX_NS}c"):
            ref = cell.attrib.get("r", "")
            column = re.sub(r"\d+", "", ref)
            style_id = int(cell.attrib.get("s", "0"))
            cells[(row_number, column)] = {
                "value": get_xlsx_cell_value(cell, shared_strings),
                "styleId": style_id,
                "fillRgb": style_fill_rgb.get(style_id),
            }

    if apply_merged_cells:
        merge_root = sheet_root.find(f"{XLSX_NS}mergeCells")
        if merge_root is not None:
            for merge_cell in merge_root.findall(f"{XLSX_NS}mergeCell"):
                ref = merge_cell.attrib.get("ref", "")
                if ":" not in ref:
                    continue
                start_ref, end_ref = ref.split(":", 1)
                start_col, start_row = parse_cell_ref(start_ref)
                end_col, end_row = parse_cell_ref(end_ref)
                top_left = cells.get((start_row, start_col))
                if not top_left:
                    continue
                for row_number in range(start_row, end_row + 1):
                    for column_index in range(column_to_index(start_col), column_to_index(end_col) + 1):
                        column = index_to_column(column_index)
                        cells[(row_number, column)] = {
                            "value": top_left["value"],
                            "styleId": top_left["styleId"],
                            "fillRgb": top_left["fillRgb"],
                        }

    return cells, shared_strings


def read_xlsx_rows(path: Path, sheet_name: str, *, apply_merged_cells: bool = False) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall(f"{XLSX_NS}si"):
                shared_strings.append("".join((node.text or "") for node in item.findall(f".//{XLSX_NS}t")))

        sheet_root = ET.fromstring(archive.read(f"xl/worksheets/{sheet_name}"))
        rows: list[dict[str, str]] = []
        rows_by_number: dict[int, dict[str, str]] = {}
        for row in sheet_root.findall(f".//{XLSX_NS}sheetData/{XLSX_NS}row"):
            row_data: dict[str, str] = {}
            row_number = int(row.attrib.get("r", str(len(rows) + 1)))
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
            rows_by_number[row_number] = row_data

        if apply_merged_cells:
            merge_root = sheet_root.find(f"{XLSX_NS}mergeCells")
            if merge_root is not None:
                for merge_cell in merge_root.findall(f"{XLSX_NS}mergeCell"):
                    ref = merge_cell.attrib.get("ref", "")
                    if ":" not in ref:
                        continue
                    start_ref, end_ref = ref.split(":", 1)
                    start_col, start_row = parse_cell_ref(start_ref)
                    end_col, end_row = parse_cell_ref(end_ref)
                    top_left_value = rows_by_number.get(start_row, {}).get(start_col, "")
                    if not top_left_value:
                        continue
                    for row_number in range(start_row, end_row + 1):
                        row_data = rows_by_number.setdefault(row_number, {})
                        for column_index in range(column_to_index(start_col), column_to_index(end_col) + 1):
                            row_data[index_to_column(column_index)] = top_left_value
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
    rows = read_xlsx_rows(
        SOURCE_DIR / "Pokémon Stats & Evolutions (XY).xlsx",
        "sheet1.xml",
        apply_merged_cells=True,
    )
    pokemon: list[dict] = []
    for row in rows[1:]:
        name = normalize_space(row.get("C", ""))
        if not name:
            continue
        canonical_name = name.replace("♂", " Male").replace("♀", " Female")
        form = normalize_space(row.get("D", ""))
        display_name = f"{canonical_name} ({form})" if form else canonical_name
        type_2 = normalize_space(row.get("F", ""))
        ability_slots = {
            "ability1": normalize_space(row.get("O", "")) or None,
            "ability2": normalize_space(row.get("P", "")) or None,
            "hiddenAbility": normalize_space(row.get("Q", "")) or None,
        }
        abilities = unique_preserve(
            [
                ability_slots["ability1"] or "",
                ability_slots["ability2"] or "",
                ability_slots["hiddenAbility"] or "",
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
                "abilitySlots": ability_slots,
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
    names: set[str] = {block["locationName"] for block in get_encounter_location_blocks()}

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
        "rotom-fan": "pokemon-0479-fan-rotom",
        "rotom-frost": "pokemon-0479-frost-rotom",
        "rotom-heat": "pokemon-0479-heat-rotom",
        "rotom-mow": "pokemon-0479-mow-rotom",
        "rotom-wash": "pokemon-0479-wash-rotom",
        "darmanitan": "pokemon-0555-standard-mode",
        "deoxys": "pokemon-0386",
        "giratina": "pokemon-0487-altered-forme",
        "keldeo": "pokemon-0647-ordinary-form",
        "meloetta": "pokemon-0648-aria-forme",
        "meowstic": "pokemon-0678",
        "meowstic-male": "pokemon-0678-male",
        "meowstic-female": "pokemon-0678-female",
        "hoopa": "pokemon-0720-hoopa-confined",
        "shaymin": "pokemon-0492-land-forme",
        "thundurus": "pokemon-0642-incarnate-forme",
        "thundurus-th": "pokemon-0642-therian-forme",
        "landorus-th": "pokemon-0645-therian-forme",
        "tornadus-th": "pokemon-0641-therian-forme",
        "wormadam-grass": "pokemon-0413-plant-cloak",
        "wormadam-p": "pokemon-0413-plant-cloak",
        "wormadam-s": "pokemon-0413-sandy-cloak",
        "wormadam-t": "pokemon-0413-trash-cloak",
        "zygarde": "pokemon-0718-50-forme",
        "gourgeist-average": "pokemon-0711-average-size",
        "gourgeist-large": "pokemon-0711-large-size",
        "gourgeist-huge": "pokemon-0711-super-size",
        "gourgeist-super": "pokemon-0711-super-size",
        "pumpkaboo-huge": "pokemon-0710-super-size",
        "pumpkaboo-super": "pokemon-0710-super-size",
        "clawtizer": "pokemon-0693",
        "vanniluxe": "pokemon-0584",
        "black-kyurem": "pokemon-0646-black-kyurem",
        "white-kyurem": "pokemon-0646-white-kyurem",
    }
    for letter in "abcdefghijklmnopqrstuvwxyz":
        extra[f"unown-{letter}"] = "pokemon-0201"
    extra["unown-exclamation"] = "pokemon-0201"
    extra["unown-question"] = "pokemon-0201"
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


def map_trainer_species_to_id(species: str, gender: str | None, pokemon_lookup: dict[str, str]) -> str | None:
    if gender in {"M", "F"}:
        gender_candidate = f"{species} {'Male' if gender == 'M' else 'Female'}"
        gender_id = map_species_to_id(gender_candidate, pokemon_lookup)
        if gender_id:
            return gender_id
    return map_species_to_id(species, pokemon_lookup)


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


def get_encounter_held_item_note(cells: dict[tuple[int, str], dict[str, str | int | None]]) -> str:
    note = str(cells.get((3, "A"), {}).get("value", ""))
    if not note:
        raise ValueError("Held item chance note is missing from Wild Encounters sheet cell A3.")
    if not all(snippet in note for snippet in HELD_ITEM_NOTE_SNIPPETS):
        raise ValueError("Held item chance note in Wild Encounters sheet no longer matches the imported rules.")
    return note


def get_single_item_held_rate(item_name: str) -> int:
    category = derive_item_category(item_name)
    if category in {"Berry", "Battle Item", "Gem", "Medicine", "Vitamin", "Poke Ball"}:
        return 100
    return 50


def build_held_item_details(raw_held_item: str | None) -> list[dict[str, str | int | None]]:
    if not raw_held_item:
        return []

    item_names = split_multiline_items(raw_held_item)
    if not item_names:
        return []

    if len(item_names) == 1:
        chance = get_single_item_held_rate(item_names[0])
        return [
            {
                "itemName": item_names[0],
                "chanceLabel": f"{chance}%",
                "chanceValue": chance,
            }
        ]

    if len(item_names) == 2:
        if item_names == ["Charizardite X", "Charizardite Y"] or item_names == [
            "Mewtwonite X",
            "Mewtwonite Y",
        ]:
            return [
                {
                    "itemName": item_names[0],
                    "chanceLabel": "50% (X) / 5% (Y)",
                    "chanceValue": None,
                },
                {
                    "itemName": item_names[1],
                    "chanceLabel": "5% (X) / 50% (Y)",
                    "chanceValue": None,
                },
            ]

        return [
            {
                "itemName": item_names[0],
                "chanceLabel": "50%",
                "chanceValue": 50,
            },
            {
                "itemName": item_names[1],
                "chanceLabel": "5%",
                "chanceValue": 5,
            },
        ]

    raise ValueError(f"Unsupported held item count in encounter row: {raw_held_item!r}")


def get_encounter_location_blocks() -> list[dict[str, str]]:
    shared_strings, sheet_root, _ = load_xlsx_sheet(
        SOURCE_DIR / "Wild Encounters + Held Items (XY).xlsx",
        "sheet1.xml",
    )
    location_blocks: list[dict[str, str]] = []

    merge_root = sheet_root.find(f"{XLSX_NS}mergeCells")
    if merge_root is None:
        return location_blocks

    cells, _ = read_xlsx_cells(
        SOURCE_DIR / "Wild Encounters + Held Items (XY).xlsx",
        "sheet1.xml",
        apply_merged_cells=True,
    )

    for merge_cell in merge_root.findall(f"{XLSX_NS}mergeCell"):
        ref = merge_cell.attrib.get("ref", "")
        if ":" not in ref:
            continue
        start_ref, end_ref = ref.split(":", 1)
        start_col, start_row = parse_cell_ref(start_ref)
        end_col, end_row = parse_cell_ref(end_ref)
        if start_row != 1 or end_row != 1:
            continue
        if column_to_index(end_col) - column_to_index(start_col) != 4:
            continue

        header_value = normalize_space(str(cells.get((1, start_col), {}).get("value", "")))
        if not header_value:
            continue

        location_blocks.append(
            {
                "locationName": canonical_location_name(header_value),
                "startColumn": start_col,
                "endColumn": end_col,
                "rateColumn": start_col,
                "iconColumn": index_to_column(column_to_index(start_col) + 1),
                "speciesColumn": index_to_column(column_to_index(start_col) + 2),
                "levelColumn": index_to_column(column_to_index(start_col) + 3),
                "heldItemColumn": index_to_column(column_to_index(start_col) + 4),
                "rateHeader": normalize_space(
                    str(cells.get((3, start_col), {}).get("value", ""))
                ),
                "speciesHeader": normalize_space(
                    str(
                        cells.get(
                            (3, index_to_column(column_to_index(start_col) + 2)),
                            {},
                        ).get("value", "")
                    )
                ),
                "levelHeader": normalize_space(
                    str(
                        cells.get(
                            (3, index_to_column(column_to_index(start_col) + 3)),
                            {},
                        ).get("value", "")
                    )
                ),
            }
        )

    return location_blocks


def build_encounters(pokemon: list[dict], locations: list[dict]) -> list[dict]:
    cells, _ = read_xlsx_cells(
        SOURCE_DIR / "Wild Encounters + Held Items (XY).xlsx",
        "sheet1.xml",
        apply_merged_cells=True,
    )
    get_encounter_held_item_note(cells)
    location_lookup = {entry["name"]: entry["id"] for entry in locations}
    location_blocks = get_encounter_location_blocks()
    pokemon_lookup = build_pokemon_lookup(pokemon)
    encounters: list[dict] = []
    skipped_species: set[str] = set()
    unresolved_policy_hits: dict[str, str] = {}
    encounter_index = 1
    max_row = max((row_number for row_number, _ in cells.keys()), default=0)

    for block in location_blocks:
        location_id = location_lookup.get(block["locationName"])
        if not location_id:
            continue
        if (
            block["rateHeader"] != "Rate"
            or block["speciesHeader"] != "Species"
            or block["levelHeader"] != "Level"
        ):
            continue

        previous_rate: str | None = None
        previous_fill_rgb: str | None = None

        for row_number in range(4, max_row + 1):
            species_cell = cells.get((row_number, block["speciesColumn"]), {})
            level_cell = cells.get((row_number, block["levelColumn"]), {})
            rate_cell = cells.get((row_number, block["rateColumn"]), {})
            held_item_cell = cells.get((row_number, block["heldItemColumn"]), {})

            raw_species = normalize_space(str(species_cell.get("value", "")))
            raw_level = normalize_space(str(level_cell.get("value", "")))
            raw_rate = normalize_space(str(rate_cell.get("value", "")))
            raw_held_item = str(held_item_cell.get("value", "")).strip() or None
            held_item_details = build_held_item_details(raw_held_item)

            if not raw_species or not raw_level:
                continue

            if not raw_rate:
                raw_rate = previous_rate or ""
            if not raw_rate:
                continue

            fill_rgb = rate_cell.get("fillRgb")
            if not fill_rgb:
                fill_rgb = previous_fill_rgb
            if not fill_rgb:
                raise ValueError(
                    f"Encounter method fill is missing for {block['locationName']} row {row_number}."
                )

            method = ENCOUNTER_METHOD_BY_FILL_RGB.get(str(fill_rgb))
            if not method:
                raise ValueError(
                    f"Encounter method fill {fill_rgb} is unmapped for {block['locationName']} row {row_number}."
                )

            pokemon_id = map_species_to_id(raw_species, pokemon_lookup)
            level_range = parse_level_range(raw_level)
            parsed_rate = parse_rate(raw_rate)
            if not pokemon_id or level_range is None or parsed_rate is None:
                if raw_species in UNRESOLVED_ENCOUNTER_POLICIES:
                    unresolved_policy_hits[raw_species] = UNRESOLVED_ENCOUNTER_POLICIES[raw_species]
                skipped_species.add(raw_species)
                continue

            encounters.append(
                {
                    "id": f"encounter-{encounter_index:05d}",
                    "locationId": location_id,
                    "pokemonId": pokemon_id,
                    "method": method,
                    "minLevel": level_range[0],
                    "maxLevel": level_range[1],
                    "rate": parsed_rate,
                    "rawSpecies": raw_species,
                    "heldItem": raw_held_item,
                    "heldItems": held_item_details,
                    "sourceReference": f"{block['startColumn']}:{block['endColumn']} row {row_number}",
                    "sourceMethodFill": fill_rgb,
                }
            )
            encounter_index += 1
            previous_rate = raw_rate
            previous_fill_rgb = str(fill_rgb)

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


def build_moves() -> list[dict]:
    rows = read_xlsx_rows(SOURCE_DIR / "Usable_Reduced_Removed Moves (XY).xlsx", "sheet1.xml")
    moves_by_slug: dict[str, dict] = {}
    status_priority = {"removed": 0, "reduced": 1, "usable": 2}

    def append_move(name: str, status: str, notes: str | None = None) -> None:
        move_name = normalize_space(name)
        if not move_name:
            return

        slug = slugify(move_name)
        incoming = {
            "id": f"move-{slug}",
            "slug": slug,
            "name": move_name,
            "type": None,
            "category": None,
            "power": None,
            "accuracy": None,
            "pp": None,
            "status": status,
            "notes": normalize_space(notes) if notes else None,
        }
        existing = moves_by_slug.get(slug)
        if not existing or status_priority[status] >= status_priority[existing["status"]]:
            moves_by_slug[slug] = incoming

    for row in rows[2:]:
        usable_name = normalize_space(row.get("A", ""))
        reduced_name = normalize_space(row.get("C", ""))
        reduced_notes = normalize_space(row.get("D", ""))
        removed_name = normalize_space(row.get("F", ""))
        removed_tm = normalize_space(row.get("G", ""))
        removed_gen = normalize_space(row.get("H", ""))

        if usable_name:
            append_move(usable_name, "usable")

        if reduced_name:
            append_move(reduced_name, "reduced", reduced_notes or None)

        if removed_name:
            removed_notes_parts = []
            if removed_tm in {"0", "1"}:
                removed_notes_parts.append(
                    "Eligible for TM or special move support." if removed_tm == "1" else "Not eligible for TM or special move support."
                )
            if removed_gen:
                removed_notes_parts.append(f"Introduced in {removed_gen}.")
            append_move(
                removed_name,
                "removed",
                " ".join(removed_notes_parts) or None,
            )

    return list(moves_by_slug.values())


def normalize_compatibility_pokemon_name(value: str) -> str:
    name = normalize_space(re.sub(r"^#\d+\s*", "", value).replace("\n", " "))
    name = name.replace("♂", " Male").replace("♀", " Female")
    return re.sub(r"\s+", " ", name).strip()


def parse_machine_label(value: str) -> tuple[str, str, str] | None:
    match = re.match(r"^(TM|HM|MT)\s*(\d+)\s*-\s*(.+)$", normalize_space(value))
    if not match:
        return None
    prefix = match.group(1)
    number = match.group(2).zfill(2)
    move_name = normalize_space(match.group(3))
    return f"{prefix}{number}", prefix.lower(), move_name


def col_to_index(column: str) -> int:
    index = 0
    for char in column:
        index = index * 26 + (ord(char) - 64)
    return index


def index_to_col(index: int) -> str:
    name = ""
    while index > 0:
        index, rem = divmod(index - 1, 26)
        name = chr(65 + rem) + name
    return name


def normalize_learnset_pokemon_name(value: str) -> str:
    text = normalize_space(re.sub(r"^#\d+\s*", "", value).replace("\n", " "))
    text = text.replace("♂", " Male").replace("♀", " Female")
    text = re.sub(r"\s+", " ", text).strip()
    match = re.match(r"^(.*?)\s*\((.*?)\)\s*$", text)
    if match:
        return f"{normalize_space(match.group(1))} ({normalize_space(match.group(2))})"
    return text


def build_machines_and_compatibility(
    pokemon: list[dict], moves: list[dict]
) -> tuple[list[dict], list[dict]]:
    move_lookup = {slugify(entry["name"]): entry["id"] for entry in moves}
    pokemon_exact_lookup = {slugify(entry["name"]): entry["id"] for entry in pokemon}
    pokemon_fallback_lookup = build_pokemon_lookup(pokemon)

    machines: dict[str, dict] = {}

    location_rows = read_xlsx_rows(SOURCE_DIR / "Learnsets & TM_HM_MT Compatibility (XY).xlsx", "sheet3.xml")
    if location_rows:
        for row in location_rows[1:]:
            for code_column, location_column in [("A", "B"), ("C", "D"), ("F", "G")]:
                machine_label = normalize_space(row.get(code_column, ""))
                if not machine_label:
                    continue
                parsed = parse_machine_label(machine_label)
                if not parsed:
                    continue
                code, kind, move_name = parsed
                move_id = move_lookup.get(slugify(move_name))
                location = normalize_space(row.get(location_column, "")) or None
                machine_id = f"machine-{code.lower()}"
                machines.setdefault(
                    code,
                    {
                        "id": machine_id,
                        "slug": slugify(f"{code} {move_name}"),
                        "name": f"{code} - {move_name}",
                        "code": code,
                        "kind": kind,
                        "moveId": move_id,
                        "location": location,
                    },
                )

    compatibility_rows = read_xlsx_rows(
        SOURCE_DIR / "Learnsets & TM_HM_MT Compatibility (XY).xlsx", "sheet2.xml"
    )
    compatibility: list[dict] = []
    if compatibility_rows:
        header_row = compatibility_rows[0]
        pokemon_columns = [
            column
            for column, value in header_row.items()
            if re.fullmatch(r"[A-Z]+", column) and normalize_space(value)
        ]

        for column in pokemon_columns:
            raw_header = normalize_compatibility_pokemon_name(header_row[column])
            pokemon_id = pokemon_exact_lookup.get(slugify(raw_header)) or pokemon_fallback_lookup.get(
                slugify(raw_header)
            )
            if not pokemon_id:
                continue

            for row in compatibility_rows[1:]:
                machine_label = normalize_space(row.get(column, ""))
                parsed = parse_machine_label(machine_label)
                if not parsed:
                    continue
                code, kind, move_name = parsed
                machine = machines.get(code)
                if not machine:
                    move_id = move_lookup.get(slugify(move_name))
                    machine = {
                        "id": f"machine-{code.lower()}",
                        "slug": slugify(f"{code} {move_name}"),
                        "name": f"{code} - {move_name}",
                        "code": code,
                        "kind": kind,
                        "moveId": move_id,
                        "location": None,
                    }
                    machines[code] = machine

                compatibility.append(
                    {
                        "id": f"move-compatibility-{len(compatibility) + 1:05d}",
                        "pokemonId": pokemon_id,
                        "machineId": machine["id"],
                        "moveId": machine["moveId"],
                    }
                )

    return list(machines.values()), compatibility


def build_learnsets(pokemon: list[dict], moves: list[dict]) -> list[dict]:
    rows = read_xlsx_rows(SOURCE_DIR / "Learnsets & TM_HM_MT Compatibility (XY).xlsx", "sheet1.xml")
    if not rows:
        return []

    pokemon_exact_lookup = {slugify(entry["name"]): entry["id"] for entry in pokemon}
    pokemon_fallback_lookup = build_pokemon_lookup(pokemon)
    move_lookup = {slugify(entry["name"]): entry["id"] for entry in moves}
    header_row = rows[0]

    pokemon_columns: list[tuple[str, str, str]] = []
    for column, value in header_row.items():
        header_value = normalize_space(value)
        if not header_value or header_value == "Unused Moves":
            continue

        pokemon_name = normalize_learnset_pokemon_name(header_value)
        pokemon_id = pokemon_exact_lookup.get(slugify(pokemon_name)) or pokemon_fallback_lookup.get(
            slugify(pokemon_name)
        )
        if not pokemon_id:
            continue

        level_column = column
        move_column = index_to_col(col_to_index(column) + 1)
        pokemon_columns.append((pokemon_id, level_column, move_column))

    learnsets: list[dict] = []
    for row in rows[1:]:
        for pokemon_id, level_column, move_column in pokemon_columns:
            level_value = normalize_space(row.get(level_column, ""))
            move_name = normalize_space(row.get(move_column, ""))
            if not move_name:
                continue

            level = int(level_value) if re.fullmatch(r"\d+", level_value) else None
            learnsets.append(
                {
                    "id": f"learnset-{len(learnsets) + 1:05d}",
                    "pokemonId": pokemon_id,
                    "moveId": move_lookup.get(slugify(move_name)),
                    "moveName": move_name,
                    "method": "level-up",
                    "level": level,
                }
            )

    return learnsets


def parse_trainer_name(raw_name: str) -> tuple[str, int | None]:
    normalized = normalize_space(raw_name)
    match = re.match(r"^(.*?)\s*\((\d+)\)\s*$", normalized)
    if not match:
        return normalized, None
    return normalize_space(match.group(1)), int(match.group(2))


def parse_trainer_pokemon(value: str) -> tuple[str, int | None, str | None]:
    normalized = normalize_space(value)
    match = re.match(r"^(.*?)\s*\(Lv\.\s*(\d+)\s*\)(?:\s*([MFG]))?$", normalized)
    if not match:
        return normalized, None, None
    gender = normalize_space(match.group(3) or "") or None
    if gender == "G":
        gender = None
    return normalize_space(match.group(1)), int(match.group(2)), gender


def detect_trainer_class(name: str) -> str | None:
    return None


def build_trainers(pokemon: list[dict]) -> list[dict]:
    pokemon_lookup = build_pokemon_lookup(pokemon)
    trainers: list[dict] = []
    seen_ids: dict[str, int] = {}
    seen_slugs: dict[str, int] = {}
    sheet_sources = {
        "sheet2.xml": "xy-trainers",
        "sheet3.xml": "restaurants",
        "sheet4.xml": "battle-chateau",
    }

    for ruleset, filename in [
        ("singles", "(Singles) Trainers, Restaurants & Battle Chateau (XY).xlsx"),
        ("doubles", "(Doubles) Trainers, Restaurants & Battle Chateau (XY).xlsx"),
    ]:
        path = SOURCE_DIR / filename
        for sheet_file, source in sheet_sources.items():
            rows = read_xlsx_rows(path, sheet_file)
            current_header = ""
            row_index = 0

            while row_index < len(rows):
                row = rows[row_index]
                header_value = normalize_space(row.get("B", ""))
                if header_value and header_value != "Trainer Photo":
                    current_header = header_value

                if header_value != "Trainer Photo":
                    row_index += 1
                    continue

                species_row = rows[row_index + 1] if row_index + 1 < len(rows) else {}
                name_row = rows[row_index + 2] if row_index + 2 < len(rows) else {}
                party_row = rows[row_index + 3] if row_index + 3 < len(rows) else {}
                battle_row = rows[row_index + 4] if row_index + 4 < len(rows) else {}
                move_rows = rows[row_index + 4 : row_index + 8]

                trainer_name, trainer_index = parse_trainer_name(name_row.get("C", "Unknown Trainer"))
                battle_type_value = normalize_space(battle_row.get("C", ""))
                battle_format = battle_type_value.lower() if battle_type_value in {"Single", "Double"} else None

                team_columns = sorted(
                    [
                        column
                        for column, value in species_row.items()
                        if re.fullmatch(r"[A-Z]+", column) and column >= "E" and normalize_space(value)
                    ],
                    key=lambda col: (len(col), col),
                )

                team: list[dict] = []
                for slot, column in enumerate(team_columns, start=1):
                    species_name, level, gender = parse_trainer_pokemon(species_row.get(column, ""))
                    pokemon_id = map_trainer_species_to_id(species_name, gender, pokemon_lookup)
                    held_item = normalize_space(party_row.get(column, ""))
                    moves = [
                        normalize_space(move_row.get(column, ""))
                        for move_row in move_rows
                        if normalize_space(move_row.get(column, "")) and normalize_space(move_row.get(column, "")) != "---"
                    ]
                    ability = normalize_space(name_row.get(column, ""))

                    team.append(
                        {
                            "slot": slot,
                            "pokemonId": pokemon_id,
                            "pokemonName": species_name,
                            "level": level,
                            "gender": gender,
                            "ability": ability or None,
                            "heldItem": held_item if held_item and held_item != "---" else None,
                            "moves": moves,
                        }
                    )

                if team:
                    if source == "battle-chateau":
                        location = "Battle Chateau"
                        section = current_header or None
                    else:
                        location = current_header or "Unknown Location"
                        section = None

                    slug_parts = [trainer_name]
                    if trainer_index is not None:
                        slug_parts.append(str(trainer_index))
                    slug_parts.extend([ruleset, source])

                    trainer_id_suffix = f"{trainer_index:04d}" if trainer_index is not None else f"{len(trainers) + 1:04d}"
                    base_id = f"trainer-{ruleset}-{source}-{trainer_id_suffix}"
                    base_slug = slugify("-".join(slug_parts))
                    id_count = seen_ids.get(base_id, 0) + 1
                    slug_count = seen_slugs.get(base_slug, 0) + 1
                    seen_ids[base_id] = id_count
                    seen_slugs[base_slug] = slug_count

                    trainers.append(
                        {
                            "id": base_id if id_count == 1 else f"{base_id}-{id_count}",
                            "slug": base_slug if slug_count == 1 else f"{base_slug}-{slug_count}",
                            "name": trainer_name,
                            "indexNumber": trainer_index,
                            "location": location,
                            "section": section,
                            "source": source,
                            "ruleset": ruleset,
                            "format": battle_format,
                            "trainerClass": detect_trainer_class(trainer_name),
                            "team": team,
                        }
                    )

                row_index += 8

    return trainers


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


def build_level_caps() -> list[dict]:
    rows = read_xlsx_rows(SOURCE_DIR / "Blind Level Caps (XY).xlsx", "sheet1.xml")
    level_caps: list[dict] = []

    for row in rows[1:]:
        trainer = normalize_space(row.get("A", ""))
        location = normalize_space(row.get("B", ""))
        level_value = normalize_space(row.get("C", ""))
        pokemon_count = normalize_space(row.get("D", ""))
        if not trainer or not location or not level_value:
            continue

        level = numeric(level_value)
        if re.fullmatch(r"\d+(?:\.0+)?", pokemon_count):
            pokemon_count = str(int(float(pokemon_count)))
        slug_base = f"{trainer} {location} {level}"
        level_caps.append(
            {
                "id": f"level-cap-{len(level_caps) + 1:03d}",
                "slug": slugify(slug_base),
                "name": trainer,
                "trainer": trainer,
                "location": location,
                "level": level,
                "pokemonCount": pokemon_count or "Not listed",
            }
        )

    return level_caps


def build_pickup_entries(items: list[dict]) -> list[dict]:
    item_lookup = {entry["name"]: entry["id"] for entry in items}
    pickup_entries: list[dict] = []
    current_table: str | None = None
    current_rate = ""

    for paragraph in read_docx_paragraphs(SOURCE_DIR / "Pickup Items Table (XY).docx"):
        if paragraph.startswith("Common Table"):
            current_table = "common"
            current_rate = paragraph
            continue
        if paragraph.startswith("Rare Table"):
            current_table = "rare"
            current_rate = paragraph
            continue
        if not current_table:
            continue

        pickup_entries.append(
            {
                "id": f"pickup-entry-{len(pickup_entries) + 1:03d}",
                "slug": slugify(f"{current_table} {paragraph}"),
                "name": paragraph,
                "table": current_table,
                "rateLabel": current_rate,
                "itemId": item_lookup.get(paragraph),
                "itemName": paragraph,
            }
        )

    return pickup_entries


def write_json(path: Path, payload: list[dict]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    CORE_DIR.mkdir(parents=True, exist_ok=True)
    pokemon = build_pokemon()
    locations = build_locations()
    items = build_items()
    moves = build_moves()
    machines, move_compatibility = build_machines_and_compatibility(pokemon, moves)
    learnsets = build_learnsets(pokemon, moves)
    encounters = build_encounters(pokemon, locations)
    item_locations = build_item_locations(locations, items)
    trainers = build_trainers(pokemon)
    level_caps = build_level_caps()
    pickup_entries = build_pickup_entries(items)

    write_json(CORE_DIR / "pokemon.json", pokemon)
    write_json(CORE_DIR / "locations.json", locations)
    write_json(CORE_DIR / "items.json", items)
    write_json(CORE_DIR / "moves.json", moves)
    write_json(CORE_DIR / "machines.json", machines)
    write_json(CORE_DIR / "move-compatibility.json", move_compatibility)
    write_json(CORE_DIR / "learnsets.json", learnsets)
    write_json(CORE_DIR / "encounters.json", encounters)
    write_json(CORE_DIR / "item-locations.json", item_locations)
    write_json(CORE_DIR / "trainers.json", trainers)
    write_json(CORE_DIR / "level-caps.json", level_caps)
    write_json(CORE_DIR / "pickup-entries.json", pickup_entries)

    print(f"Staged {len(pokemon)} pokemon")
    print(f"Staged {len(locations)} locations")
    print(f"Staged {len(items)} items")
    print(f"Staged {len(moves)} moves")
    print(f"Staged {len(machines)} machines")
    print(f"Staged {len(move_compatibility)} move compatibility records")
    print(f"Staged {len(learnsets)} learnset records")
    print(f"Staged {len(encounters)} encounters")
    print(f"Staged {len(item_locations)} item locations")
    print(f"Staged {len(trainers)} trainers")
    print(f"Staged {len(level_caps)} level caps")
    print(f"Staged {len(pickup_entries)} pickup entries")


if __name__ == "__main__":
    main()
