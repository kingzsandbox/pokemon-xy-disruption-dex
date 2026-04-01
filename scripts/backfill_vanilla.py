from __future__ import annotations

import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "public" / "data"
USER_AGENT = "Mozilla/5.0 (compatible; PokemonXYDisruptionDex/1.0)"
API_BASE = "https://pokeapi.co/api/v2"
REQUEST_DELAY_SECONDS = 0.05
XY_VERSION_GROUP = "x-y"
MOVE_API_ALIASES = {
    "vise-grip": "vice-grip",
    "forest-s-curse": "forests-curse",
    "king-s-shield": "kings-shield",
    "land-s-wrath": "lands-wrath",
}
ITEM_API_ALIASES = {
    "wide-lenss": "wide-lens",
}


def read_json(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def fetch_json(url: str) -> dict[str, Any] | None:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=30) as response:
            time.sleep(REQUEST_DELAY_SECONDS)
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError):
        return None


def fetch_version_group_order_map() -> dict[str, int]:
    payload = fetch_json(f"{API_BASE}/version-group?limit=1000")
    if not payload:
        return {}
    return {entry["name"]: index for index, entry in enumerate(payload.get("results", []))}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\n", " ").replace("\f", " ")).strip()


def to_title_label(value: str | None) -> str | None:
    if not value:
        return None
    return " ".join(part.capitalize() for part in value.replace("-", " ").split())


def get_move_api_name(move: dict[str, Any]) -> str:
    slug = str(move["slug"])
    return MOVE_API_ALIASES.get(slug, slug)


def get_item_api_name(item: dict[str, Any]) -> str | None:
    name = str(item["name"])
    tm_match = re.match(r"^TM(\d+)\s+\[.+\]$", name)
    hm_match = re.match(r"^HM(\d+)\s+\[.+\]$", name)
    if tm_match:
        return None
    if hm_match:
        return None
    slug = str(item["slug"])
    if slug == "box-link":
        return None
    return ITEM_API_ALIASES.get(slug, slug)


def select_xy_item_description(payload: dict[str, Any]) -> str | None:
    flavor_entries = payload.get("flavor_text_entries", [])
    for entry in flavor_entries:
        language = entry.get("language", {}).get("name")
        version_group = entry.get("version_group", {}).get("name")
        text = entry.get("text") or entry.get("flavor_text")
        if language == "en" and version_group == "x-y" and text:
            return normalize_text(str(text))


def select_fallback_item_description(payload: dict[str, Any]) -> str | None:
    flavor_entries = payload.get("flavor_text_entries", [])
    for entry in flavor_entries:
        language = entry.get("language", {}).get("name")
        text = entry.get("text") or entry.get("flavor_text")
        if language == "en" and text:
            return normalize_text(str(text))

    for entry in payload.get("effect_entries", []):
        language = entry.get("language", {}).get("name")
        short_effect = entry.get("short_effect")
        effect = entry.get("effect")
        if language == "en" and short_effect:
            return normalize_text(str(short_effect))
        if language == "en" and effect:
            return normalize_text(str(effect))

    return None


def backfill_moves(moves: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    version_group_order = fetch_version_group_order_map()
    xy_order = version_group_order.get(XY_VERSION_GROUP)
    missing_before = [
        move for move in moves if any(move.get(field) is None for field in ["type", "category", "power", "accuracy", "pp"])
    ]

    def fetch(move: dict[str, Any]) -> tuple[str, dict[str, Any] | None]:
        api_name = get_move_api_name(move)
        return move["id"], fetch_json(f"{API_BASE}/move/{api_name}")

    responses: dict[str, dict[str, Any] | None] = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch, move) for move in moves]
        for future in as_completed(futures):
            move_id, payload = future.result()
            responses[move_id] = payload

    corrected_moves = 0
    still_missing: list[str] = []

    for move in moves:
        payload = responses.get(move["id"])
        if not payload:
            still_missing.append(move["name"])
            continue

        xy_values = {
            "type": payload.get("type", {}).get("name"),
            "category": payload.get("damage_class", {}).get("name"),
            "power": payload.get("power"),
            "accuracy": payload.get("accuracy"),
            "pp": payload.get("pp"),
        }

        if xy_order is not None:
            later_past_values: list[tuple[int, dict[str, Any]]] = []
            for past_value in payload.get("past_values", []):
                version_group = past_value.get("version_group", {}).get("name")
                order = version_group_order.get(version_group)
                if order is not None and order > xy_order:
                    later_past_values.append((order, past_value))

            for _, past_value in sorted(later_past_values, key=lambda item: item[0], reverse=True):
                if past_value.get("type") is not None:
                    xy_values["type"] = past_value["type"]["name"]
                if past_value.get("power") is not None:
                    xy_values["power"] = past_value["power"]
                if past_value.get("accuracy") is not None:
                    xy_values["accuracy"] = past_value["accuracy"]
                if past_value.get("pp") is not None:
                    xy_values["pp"] = past_value["pp"]

        changed = False
        xy_type = to_title_label(str(xy_values["type"])) if xy_values["type"] is not None else None
        xy_category = to_title_label(str(xy_values["category"])) if xy_values["category"] is not None else None

        if xy_type is not None and move.get("type") != xy_type:
            move["type"] = xy_type
            changed = True
        if xy_category is not None and move.get("category") != xy_category:
            move["category"] = xy_category
            changed = True
        if xy_values["power"] is not None and move.get("power") != xy_values["power"]:
            move["power"] = xy_values["power"]
            changed = True
        if xy_values["accuracy"] is not None and move.get("accuracy") != xy_values["accuracy"]:
            move["accuracy"] = xy_values["accuracy"]
            changed = True
        if xy_values["pp"] is not None and move.get("pp") != xy_values["pp"]:
            move["pp"] = xy_values["pp"]
            changed = True

        if changed:
            corrected_moves += 1

        if any(move.get(field) is None for field in ["type", "category", "power", "accuracy", "pp"]):
            still_missing.append(move["name"])

    return moves, {
        "moves_missing_any_stat_before": len(missing_before),
        "moves_corrected_to_xy": corrected_moves,
        "moves_still_missing_any_stat": len(still_missing),
        "still_missing_move_names": sorted(set(still_missing)),
    }


def backfill_items(items: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    description_placeholders = {
        item["id"]
        for item in items
        if not str(item.get("description", "")).strip() or str(item.get("description", "")).startswith("Imported from ")
    }

    def fetch(item: dict[str, Any]) -> tuple[str, dict[str, Any] | None]:
        api_name = get_item_api_name(item)
        if not api_name:
            return item["id"], None
        return item["id"], fetch_json(f"{API_BASE}/item/{api_name}")

    responses: dict[str, dict[str, Any] | None] = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch, item) for item in items]
        for future in as_completed(futures):
            item_id, payload = future.result()
            responses[item_id] = payload

    updated_descriptions = 0
    corrected_to_xy_descriptions = 0
    still_missing: list[str] = []
    category_updates = 0

    for item in items:
        payload = responses.get(item["id"])
        current_description = str(item.get("description", ""))
        description_missing = not current_description.strip() or current_description.startswith("Imported from ")

        if payload:
            xy_description = select_xy_item_description(payload)
            fallback_description = select_fallback_item_description(payload)

            if xy_description and item.get("description") != xy_description:
                item["description"] = xy_description
                corrected_to_xy_descriptions += 1
                if description_missing:
                    updated_descriptions += 1
            elif description_missing and fallback_description:
                item["description"] = fallback_description
                updated_descriptions += 1

        category_missing = not str(item.get("category", "")).strip()
        current_category = str(item.get("category", "")).strip().lower()
        if payload and (category_missing or current_category in {"item", "other", "generic"}):
            category_name = payload.get("category", {}).get("name")
            if category_name:
                item["category"] = to_title_label(str(category_name)) or item["category"]
                category_updates += 1

        final_description = str(item.get("description", ""))
        if not final_description.strip() or final_description.startswith("Imported from "):
            still_missing.append(item["name"])

    return items, {
        "items_with_placeholder_descriptions_before": len(description_placeholders),
        "items_updated_with_real_descriptions": updated_descriptions,
        "items_corrected_to_xy_descriptions": corrected_to_xy_descriptions,
        "items_still_missing_real_descriptions": len(still_missing),
        "still_missing_item_names": sorted(still_missing),
        "item_categories_updated": category_updates,
    }


def main() -> None:
    moves_path = DATA_DIR / "moves.json"
    items_path = DATA_DIR / "items.json"

    moves = read_json(moves_path)
    items = read_json(items_path)

    moves, move_report = backfill_moves(moves)
    items, item_report = backfill_items(items)

    write_json(moves_path, moves)
    write_json(items_path, items)

    print(json.dumps({"moves": move_report, "items": item_report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
