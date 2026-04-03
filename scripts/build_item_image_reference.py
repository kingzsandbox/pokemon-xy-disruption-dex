from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DATA = ROOT / "public" / "data"
ITEMS_PATH = PUBLIC_DATA / "items.json"
OUTPUT_PATH = PUBLIC_DATA / "item-images.json"

POKEAPI_ITEM_URL = "https://pokeapi.co/api/v2/item/{slug}"

CUSTOM_FALLBACK_SLUGS = {
    "box-link": "custom-mod-item",
    "mysterious-candy": "custom-mod-item",
}

ITEM_SLUG_ALIASES = {
    "wide-lenss": "wide-lens",
}


def normalize_name_to_slug(name: str) -> str:
    normalized = name.lower()
    normalized = re.sub(r"\[[^\]]+\]", "", normalized)
    normalized = normalized.replace("’", "'")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-")


def fetch_item_payload(slug: str) -> dict | None:
    request = Request(
        POKEAPI_ITEM_URL.format(slug=slug),
        headers={"User-Agent": "Mozilla/5.0"},
    )

    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code == 404:
            return None
        raise
    except URLError:
        return None


def build_reference() -> list[dict]:
    items = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    references: list[dict] = []

    for item in items:
        slug = item["slug"]
        name_candidate = normalize_name_to_slug(item["name"])

        if re.match(r"^(tm|hm|mt)\d+", slug):
            references.append(
                {
                    "itemId": item["id"],
                    "itemSlug": slug,
                    "resolvedImageSrc": None,
                    "resolutionType": "fallback",
                    "reason": "machine-item-no-safe-public-sprite",
                    "resolvedFrom": None,
                }
            )
            continue

        custom_reason = CUSTOM_FALLBACK_SLUGS.get(slug)
        if custom_reason:
            references.append(
                {
                    "itemId": item["id"],
                    "itemSlug": slug,
                    "resolvedImageSrc": None,
                    "resolutionType": "fallback",
                    "reason": custom_reason,
                    "resolvedFrom": None,
                }
            )
            continue

        candidates = [slug]
        alias_candidate = ITEM_SLUG_ALIASES.get(slug)
        if alias_candidate and alias_candidate not in candidates:
            candidates.append(alias_candidate)
        if name_candidate and name_candidate not in candidates:
            candidates.append(name_candidate)

        resolved_payload = None
        resolved_slug = None

        for candidate in candidates:
            payload = fetch_item_payload(candidate)
            if payload:
                resolved_payload = payload
                resolved_slug = candidate
                break
            time.sleep(0.05)

        if resolved_payload and resolved_payload.get("sprites", {}).get("default"):
            references.append(
                {
                    "itemId": item["id"],
                    "itemSlug": slug,
                    "resolvedImageSrc": resolved_payload["sprites"]["default"],
                    "resolutionType": "real" if resolved_slug == slug else "mapped",
                    "reason": "pokeapi-item-sprite",
                    "resolvedFrom": resolved_slug,
                }
            )
            continue

        references.append(
            {
                "itemId": item["id"],
                "itemSlug": slug,
                "resolvedImageSrc": None,
                "resolutionType": "fallback",
                "reason": "no-safe-public-item-sprite",
                "resolvedFrom": None,
            }
        )

    return references


def main() -> None:
    OUTPUT_PATH.write_text(
        json.dumps(build_reference(), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
