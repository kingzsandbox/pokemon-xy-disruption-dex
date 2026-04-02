from __future__ import annotations

import html
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "public" / "data"
USER_AGENT = "Mozilla/5.0 (compatible; PokemonXYDisruptionDex/1.0)"
POKEAPI_BASE = "https://pokeapi.co/api/v2"
SEREBII_ATTACKDEX_INDEX = "https://www.serebii.net/attackdex-xy/"
REQUEST_DELAY_SECONDS = 0.05


def read_json(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        time.sleep(REQUEST_DELAY_SECONDS)
        return response.read().decode("utf-8", errors="ignore")


def fetch_json(url: str) -> dict[str, Any]:
    return json.loads(fetch_text(url))


def normalize_name_fragment(value: str) -> str:
    lowered = value.lower()
    replacements = {
        "♀": "-f",
        "♂": "-m",
        ".": "",
        "%": "",
        ":": "",
        ",": "",
    }

    for old, new in replacements.items():
        lowered = lowered.replace(old, new)

    lowered = lowered.replace("’", "'")
    lowered = re.sub(r"[^a-z0-9'\-\s]", "", lowered)
    lowered = lowered.replace("'s", "s")
    lowered = lowered.replace("'", "")
    lowered = re.sub(r"\s+", "-", lowered.strip())
    return lowered


def base_species_slug(name: str) -> str:
    base = name.split(" (", 1)[0]
    return normalize_name_fragment(base)


def pokemon_api_name_candidates(entry: dict[str, Any]) -> list[str]:
    name = str(entry["name"])
    slug = str(entry["slug"])
    candidates: list[str] = [slug]
    exact_name_map = {
        "Nidoran Female": "nidoran-f",
        "Nidoran Male": "nidoran-m",
        "Frillish": "frillish-male",
        "Jellicent": "jellicent-male",
        "Pyroar": "pyroar-male",
        "Deoxys": "deoxys-normal",
        "Meowstic": "meowstic-male",
    }

    if name in exact_name_map:
        candidates.append(exact_name_map[name])

    if " (" not in name:
        candidates.append(normalize_name_fragment(name))
        return dedupe(candidates)

    base_name, form_label = name[:-1].split(" (", 1)
    base_slug = normalize_name_fragment(base_name)

    mega_match = re.fullmatch(r"Mega .+?(?: ([XY]))?", form_label)
    if mega_match:
        suffix = mega_match.group(1)
        candidates.append(f"{base_slug}-mega-{suffix.lower()}") if suffix else candidates.append(
            f"{base_slug}-mega"
        )

    exact_form_map = {
        "Attack Forme": "attack",
        "Defense Forme": "defense",
        "Normal Forme": "normal",
        "Speed Forme": "speed",
        "Sunny Form": "sunny",
        "Snowy Form": "snowy",
        "Rainy Form": "rainy",
        "Plant Cloak": "plant",
        "Sandy Cloak": "sandy",
        "Trash Cloak": "trash",
        "Fan Rotom": "fan",
        "Frost Rotom": "frost",
        "Heat Rotom": "heat",
        "Mow Rotom": "mow",
        "Wash Rotom": "wash",
        "Altered Forme": "altered",
        "Origin Forme": "origin",
        "Land Forme": "land",
        "Sky Forme": "sky",
        "Blue-Striped Form": "blue-striped",
        "Red-Striped Form": "red-striped",
        "Standard Mode": "standard",
        "Zen Mode": "zen",
        "Incarnate Forme": "incarnate",
        "Therian Forme": "therian",
        "Black Kyurem": "black",
        "White Kyurem": "white",
        "Ordinary Form": "ordinary",
        "Resolute Form": "resolute",
        "Aria Forme": "aria",
        "Pirouette Forme": "pirouette",
        "Eternal Floette": "eternal",
        "Female": "female",
        "Male": "male",
        "Blade Forme": "blade",
        "Shield Forme": "shield",
        "Average Size": "average",
        "Large Size": "large",
        "Small Size": "small",
        "Super Size": "super",
        "50% Forme": "50",
        "Hoopa Confined": "",
    }

    if form_label in exact_form_map:
        suffix = exact_form_map[form_label]
        candidates.append(base_slug if suffix == "" else f"{base_slug}-{suffix}")

    if form_label.startswith("Mega ") and not mega_match:
        normalized_form = normalize_name_fragment(form_label.replace("Mega ", "mega "))
        candidates.append(f"{base_slug}-{normalized_form}")

    candidates.append(base_slug)
    return dedupe(candidates)


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def parse_move_urls() -> dict[str, str]:
    html_text = fetch_text(SEREBII_ATTACKDEX_INDEX)
    matches = re.findall(r'<option value="(/attackdex-xy/[^"]+\.shtml)">(.*?)</option>', html_text)
    move_urls: dict[str, str] = {}
    for relative_url, label in matches:
        move_urls[html.unescape(label).strip().lower()] = f"https://www.serebii.net{relative_url}"
    return move_urls


def extract_between(text: str, start_marker: str, end_marker: str) -> str | None:
    start = text.find(start_marker)
    if start == -1:
        return None
    start += len(start_marker)
    end = text.find(end_marker, start)
    if end == -1:
        return None
    raw = text[start:end]
    cleaned = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned or None


def build_move_effect_summary(page_html: str) -> str | None:
    battle_effect = extract_between(
        page_html,
        "Battle Effect:</td></tr>",
        "</td>\r\n\t</tr>\r\n\t<tr>\r\n\t\t<td colspan=\"2\" class=\"fooleft\">Secondary Effect:",
    )

    if battle_effect is None:
        battle_effect = extract_between(
            page_html,
            "Battle Effect:</td></tr>",
            "</td>\r\n\t</tr>\r\n\t<tr>\r\n\t\t<td class=\"fooevo\">",
        )

    secondary_effect = extract_between(
        page_html,
        "Secondary Effect:</td>\r\n\t\t<td align=\"center\" class=\"fooevo\">Effect Rate:</td>\r\n\t</tr>\r\n\t<tr>\r\n\t\t<td colspan=\"2\" class=\"fooinfo\">\r\n\t\t",
        "</td>\r\n\t\t<td class=\"cen\">",
    )
    effect_rate = extract_between(
        page_html,
        "</td>\r\n\t\t<td class=\"cen\">\r\n\t\t",
        "%\t</td>",
    )

    if not battle_effect and not secondary_effect:
        return None

    if secondary_effect and battle_effect and secondary_effect.lower() not in battle_effect.lower():
        rate_label = None
        if effect_rate and effect_rate.strip("- ").isdigit():
            rate_label = f"{effect_rate.strip()}%"
        secondary_suffix = f" Secondary: {secondary_effect}"
        if rate_label:
            secondary_suffix += f" ({rate_label})."
        else:
            secondary_suffix += "."
        return f"{battle_effect}{secondary_suffix}"

    return battle_effect or secondary_effect


def build_pokemon_reference() -> list[dict[str, Any]]:
    pokemon = read_json(DATA_DIR / "pokemon.json")

    def fetch(entry: dict[str, Any]) -> tuple[str, dict[str, Any] | None, str | None]:
        candidates = pokemon_api_name_candidates(entry)
        for candidate in candidates:
            try:
                payload = fetch_json(f"{POKEAPI_BASE}/pokemon/{candidate}")
                return entry["id"], payload, candidate
            except Exception:
                continue
        return entry["id"], None, None

    responses: dict[str, tuple[dict[str, Any] | None, str | None]] = {}
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = [executor.submit(fetch, entry) for entry in pokemon]
        for future in as_completed(futures):
            pokemon_id, payload, matched_name = future.result()
            responses[pokemon_id] = (payload, matched_name)

    references: list[dict[str, Any]] = []
    unresolved: list[str] = []

    for entry in pokemon:
        payload, matched_name = responses.get(entry["id"], (None, None))
        if not payload:
            unresolved.append(entry["name"])
            continue

        stats = {item["stat"]["name"]: item["base_stat"] for item in payload.get("stats", [])}
        abilities = payload.get("abilities", [])
        slot_map = {item.get("slot"): item.get("ability", {}).get("name") for item in abilities}
        hidden_name = next(
            (item.get("ability", {}).get("name") for item in abilities if item.get("is_hidden")),
            None,
        )

        references.append(
            {
                "pokemonId": entry["id"],
                "sourceName": matched_name,
                "baseStats": {
                    "hp": stats.get("hp"),
                    "attack": stats.get("attack"),
                    "defense": stats.get("defense"),
                    "specialAttack": stats.get("special-attack"),
                    "specialDefense": stats.get("special-defense"),
                    "speed": stats.get("speed"),
                },
                "abilitySlots": {
                    "ability1": title_case(slot_map.get(1)),
                    "ability2": title_case(slot_map.get(2)),
                    "hiddenAbility": title_case(hidden_name),
                },
            }
        )

    if unresolved:
        print(json.dumps({"unresolvedPokemon": unresolved}, ensure_ascii=False, indent=2))

    return sorted(references, key=lambda entry: entry["pokemonId"])


def title_case(value: str | None) -> str | None:
    if not value:
        return None
    return " ".join(part.capitalize() for part in value.replace("-", " ").split())


def build_move_reference() -> list[dict[str, Any]]:
    moves = read_json(DATA_DIR / "moves.json")
    move_urls = parse_move_urls()
    aliases = {
        "vice-grip": "Vice Grip",
        "vise-grip": "Vice Grip",
        "Vise Grip": "Vice Grip",
        "forests-curse": "Forest's Curse",
        "kings-shield": "King's Shield",
        "lands-wrath": "Land's Wrath",
    }

    def fetch(entry: dict[str, Any]) -> tuple[str, str | None, str | None]:
        move_name = aliases.get(str(entry["slug"]), str(entry["name"]))
        url = move_urls.get(move_name.lower())
        if not url:
            return entry["id"], None, None
        try:
            page_html = fetch_text(url)
        except Exception:
            return entry["id"], None, url
        return entry["id"], build_move_effect_summary(page_html), url

    responses: dict[str, tuple[str | None, str | None]] = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch, entry) for entry in moves]
        for future in as_completed(futures):
            move_id, effect_summary, source_url = future.result()
            responses[move_id] = (effect_summary, source_url)

    references: list[dict[str, Any]] = []
    unresolved: list[str] = []
    for entry in moves:
        effect_summary, source_url = responses.get(entry["id"], (None, None))
        if effect_summary is None:
            unresolved.append(entry["name"])
        references.append(
            {
                "moveId": entry["id"],
                "effectSummary": effect_summary,
                "sourceUrl": source_url,
            }
        )

    if unresolved:
        print(json.dumps({"unresolvedMoveEffects": unresolved[:50], "unresolvedCount": len(unresolved)}, ensure_ascii=False, indent=2))

    return sorted(references, key=lambda entry: entry["moveId"])


def main() -> None:
    pokemon_reference = build_pokemon_reference()
    move_reference = build_move_reference()
    write_json(DATA_DIR / "vanilla-pokemon-reference.json", pokemon_reference)
    write_json(DATA_DIR / "vanilla-move-reference.json", move_reference)
    print(
        json.dumps(
            {
                "pokemonReferenceCount": len(pokemon_reference),
                "moveReferenceCount": len(move_reference),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
