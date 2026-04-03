from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POKEMON_PATH = ROOT / "public" / "data" / "pokemon.json"
OUTPUT_PATH = ROOT / "public" / "data" / "abilities.json"


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def ability_api_name(name: str) -> str:
    normalized = name.lower().replace("'", "").replace(".", "")
    normalized = normalized.replace(" ", "-")
    normalized = normalized.replace("%", "percent")
    return normalized


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "pokemon-xy-disruption-dex/1.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def pick_description(payload: dict) -> str | None:
    flavor_entries = payload.get("flavor_text_entries", [])

    for entry in flavor_entries:
        language = entry.get("language", {}).get("name")
        version_group = entry.get("version_group", {}).get("name")
        if language == "en" and version_group == "x-y":
            return " ".join((entry.get("flavor_text") or "").split())

    for entry in flavor_entries:
        language = entry.get("language", {}).get("name")
        if language == "en":
            return " ".join((entry.get("flavor_text") or "").split())

    effect_entries = payload.get("effect_entries", [])
    for entry in effect_entries:
        if entry.get("language", {}).get("name") == "en":
            return " ".join((entry.get("short_effect") or entry.get("effect") or "").split())

    return None


def main() -> None:
    pokemon = json.loads(POKEMON_PATH.read_text(encoding="utf-8"))
    ability_names = sorted(
        {
            ability.strip()
            for entry in pokemon
            for ability in entry.get("abilities", [])
            if isinstance(ability, str) and ability.strip()
        }
    )

    abilities: list[dict[str, str]] = []
    for name in ability_names:
        api_name = urllib.parse.quote(ability_api_name(name))
        payload = fetch_json(f"https://pokeapi.co/api/v2/ability/{api_name}")
        description = pick_description(payload) or "No Gen 6 ability description has been imported yet."
        abilities.append(
            {
                "id": f"ability-{slugify(name)}",
                "slug": slugify(name),
                "name": name,
                "description": description,
                "source": "vanilla",
            }
        )

    OUTPUT_PATH.write_text(json.dumps(abilities, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
