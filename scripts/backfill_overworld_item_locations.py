from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "public" / "data"
USER_AGENT = "Mozilla/5.0 (compatible; PokemonXYDisruptionDex/1.0)"

SOURCE_PAGES = [
    {
        "url": "https://www.serebii.net/pokearth/kalos/anistarcity.shtml",
        "source": "Serebii Pokéarth - Anistar City",
        "default_location_id": "location-anistar-city",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/azurebay.shtml",
        "source": "Serebii Pokéarth - Azure Bay",
        "default_location_id": "location-azure-bay",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/couriwaytown.shtml",
        "source": "Serebii Pokéarth - Couriway Town",
        "default_location_id": "location-couriway-town",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/frostcavern.shtml",
        "source": "Serebii Pokéarth - Frost Cavern",
        "default_location_id": "location-frost-cavern-outside",
        "sections": {
            "Outside": "location-frost-cavern-outside",
            "1F": "location-frost-cavern-1f",
            "1F Room 2": "location-frost-cavern-1f-r2",
            "2F": "location-frost-cavern-2f",
            "3F": "location-frost-cavern-3f",
        },
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/glitteringcave.shtml",
        "source": "Serebii Pokéarth - Glittering Cave",
        "default_location_id": "location-glittering-cave",
        "sections": {
            "3D Area": "location-glittering-cave-3d-area",
        },
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/losthotel.shtml",
        "source": "Serebii Pokéarth - Lost Hotel",
        "default_location_id": "location-lost-hotel",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/pokemonvillage.shtml",
        "source": "Serebii Pokéarth - Pokémon Village",
        "default_location_id": "location-pokemon-village",
        "sections": {
            "Unknown Dungeon": "location-pokemon-village-unknown-dungeon",
        },
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route12.shtml",
        "source": "Serebii Pokéarth - Route 12",
        "default_location_id": "location-route-12",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route13.shtml",
        "source": "Serebii Pokéarth - Route 13",
        "default_location_id": "location-route-13",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route14.shtml",
        "source": "Serebii Pokéarth - Route 14",
        "default_location_id": "location-route-14",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route15.shtml",
        "source": "Serebii Pokéarth - Route 15",
        "default_location_id": "location-route-15",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route16.shtml",
        "source": "Serebii Pokéarth - Route 16",
        "default_location_id": "location-route-16",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route17.shtml",
        "source": "Serebii Pokéarth - Route 17",
        "default_location_id": "location-route-17",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route18.shtml",
        "source": "Serebii Pokéarth - Route 18",
        "default_location_id": "location-route-18",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route19.shtml",
        "source": "Serebii Pokéarth - Route 19",
        "default_location_id": "location-route-19",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route2.shtml",
        "source": "Serebii Pokéarth - Route 2",
        "default_location_id": "location-route-2",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route20.shtml",
        "source": "Serebii Pokéarth - Route 20",
        "default_location_id": "location-route-20",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route21.shtml",
        "source": "Serebii Pokéarth - Route 21",
        "default_location_id": "location-route-21",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route22.shtml",
        "source": "Serebii Pokéarth - Route 22",
        "default_location_id": "location-route-22",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route3.shtml",
        "source": "Serebii Pokéarth - Route 3",
        "default_location_id": "location-route-3",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route7.shtml",
        "source": "Serebii Pokéarth - Route 7",
        "default_location_id": "location-route-7",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/route8.shtml",
        "source": "Serebii Pokéarth - Route 8",
        "default_location_id": "location-route-8",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/terminuscave.shtml",
        "source": "Serebii Pokéarth - Terminus Cave",
        "default_location_id": "location-terminus-cave-1f",
        "sections": {
            "1F": "location-terminus-cave-1f",
            "2F": "location-terminus-cave-2f",
            "2F Right": "location-terminus-cave-2f-right",
            "B1F": "location-terminus-cave-b1f",
            "B2F": "location-terminus-cave-b2f",
            "B3F": "location-terminus-cave-b3f",
        },
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/reflectioncave.shtml",
        "source": "Serebii Pokéarth - Reflection Cave",
        "default_location_id": None,
        "sections": {
            "1F": "location-reflection-cave-1f",
            "B1F": "location-reflection-cave-1bf",
            "B2F": "location-reflection-cave-b2f",
            "3BF": "location-reflection-cave-3bf",
        },
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/santaluneforest.shtml",
        "source": "Serebii Pokéarth - Santalune Forest",
        "default_location_id": "location-santalune-forest",
        "sections": {},
    },
    {
        "url": "https://www.serebii.net/pokearth/kalos/shalourcity.shtml",
        "source": "Serebii Pokéarth - Shalour City",
        "default_location_id": "location-shalour-city",
        "sections": {},
    },
]

EXCLUDED_METHOD_PATTERNS = [
    "given by",
    "taking control of berry field",
    "from composter",
    "from man",
    "from abomasnow",
    "from ",
    "shop",
    "trash can",
]


def read_json(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def fetch_html(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("latin-1", errors="ignore")


def normalize_name(value: str) -> str:
    lowered = unescape(value).replace("Poké", "Poke").lower()
    lowered = lowered.replace("'", "").replace(".", "").replace(":", "")
    lowered = lowered.replace("♀", "f").replace("♂", "m")
    return re.sub(r"[^a-z0-9]+", "", lowered)


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", unescape(value)).strip()


def normalize_item_name(raw_name: str) -> str:
    name = strip_tags(raw_name)
    replacements = {
        "Poke Ball": "Poké Ball",
        "SilverPowder": "Silver Powder",
        "Never-Melt Ice": "Never-Melt Ice",
        "Deep Sea Tooth": "Deep Sea Tooth",
        "Deep Sea Scale": "Deep Sea Scale",
        "X Sp. Def": "X Sp. Def",
        "X Sp. Atk": "X Sp. Atk",
        "X Attack": "X Attack",
        "X Defend": "X Defend",
        "X Accuracy": "X Accuracy",
        "X Speed": "X Speed",
        "Guard Spec": "Guard Spec.",
        "Kings Rock": "King's Rock",
    }
    if re.fullmatch(r"TM\d+", name):
        return name
    return replacements.get(name, name)


def should_keep_method(method: str) -> bool:
    lowered = method.lower()
    return not any(pattern in lowered for pattern in EXCLUDED_METHOD_PATTERNS)


def clean_method(method: str) -> str:
    cleaned = re.sub(r"\s+", " ", method).strip(" -")
    cleaned = cleaned.replace(" - Dowsing Machine", "; hidden item")
    cleaned = cleaned.replace("Dowsing Machine", "hidden item")
    return cleaned


def extract_item_tables(html: str) -> list[tuple[str | None, str]]:
    title_matches = [
        (match.start(), strip_tags(match.group(1)))
        for match in re.finditer(r'<a name="xy-[^"]+"><font size="4"><b><u>([^<]+)</u></b></font>', html)
    ]
    sections: list[tuple[str | None, str]] = []
    for match in re.finditer(
        r'<p><a name="items"><font size="4"><b><u>Items - X & Y</u></b></font></a></p><table width="580" align="center">(.*?)</table>',
        html,
        re.S,
    ):
        title: str | None = None
        for position, candidate in title_matches:
            if position < match.start():
                title = candidate
            else:
                break
        sections.append((title, match.group(1)))
    return sections


def parse_rows(table_html: str) -> list[tuple[str, str]]:
    rows = re.findall(
        r'<tr>\s*<td[^>]*>.*?</td>\s*<td[^>]*class="fooinfo">(.*?)</td><td[^>]*class="fooinfo"><font size="1">(.*?)</td></tr>',
        table_html,
        re.S,
    )
    parsed: list[tuple[str, str]] = []
    for raw_name, raw_method in rows:
        item_name = normalize_item_name(raw_name)
        method = strip_tags(raw_method)
        parsed.append((item_name, method))
    return parsed


def build_item_id_maps(items: list[dict[str, Any]], machines: list[dict[str, Any]]) -> tuple[dict[str, str], dict[str, str]]:
    item_name_map = {normalize_name(item["name"]): item["id"] for item in items}
    machine_code_map: dict[str, str] = {}
    for machine in machines:
        code = machine["code"]
        matching_item = next((item for item in items if item["name"].startswith(f"{code} [")), None)
        if matching_item:
            machine_code_map[code] = matching_item["id"]
    return item_name_map, machine_code_map


def main() -> None:
    items = read_json(DATA_DIR / "items.json")
    locations = read_json(DATA_DIR / "locations.json")
    machines = read_json(DATA_DIR / "machines.json")
    item_locations_path = DATA_DIR / "item-locations.json"
    item_locations = read_json(item_locations_path)

    location_ids = {location["id"] for location in locations}
    item_name_map, machine_code_map = build_item_id_maps(items, machines)

    existing_pairs = {(entry["itemId"], entry["locationId"]) for entry in item_locations}
    next_index = max(int(entry["id"].split("-")[-1]) for entry in item_locations) + 1

    added: list[dict[str, Any]] = []
    skipped_conflicts = 0
    skipped_unclear: list[dict[str, str]] = []

    for source_page in SOURCE_PAGES:
        html = fetch_html(source_page["url"])
        for section_title, table_html in extract_item_tables(html):
            location_id = source_page["sections"].get(section_title) if section_title else source_page["default_location_id"]
            if not location_id or location_id not in location_ids:
                continue

            for item_name, method in parse_rows(table_html):
                if not method or not should_keep_method(method):
                    continue

                if re.fullmatch(r"TM\d+", item_name):
                    item_id = machine_code_map.get(item_name)
                else:
                    item_id = item_name_map.get(normalize_name(item_name))

                if not item_id:
                    skipped_unclear.append(
                        {
                            "source": source_page["source"],
                            "locationId": location_id,
                            "itemName": item_name,
                            "reason": "No existing item match",
                        }
                    )
                    continue

                pair = (item_id, location_id)
                if pair in existing_pairs:
                    skipped_conflicts += 1
                    continue

                existing_pairs.add(pair)
                added.append(
                    {
                        "id": f"item-location-{next_index:03d}",
                        "itemId": item_id,
                        "locationId": location_id,
                        "notes": clean_method(method),
                    }
                )
                next_index += 1

    final_item_locations = item_locations + added
    write_json(item_locations_path, final_item_locations)

    print(
        json.dumps(
            {
                "before": len(item_locations),
                "after": len(final_item_locations),
                "added": len(added),
                "skipped_conflicts": skipped_conflicts,
                "skipped_unclear": len(skipped_unclear),
                "skipped_unclear_examples": skipped_unclear[:25],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
