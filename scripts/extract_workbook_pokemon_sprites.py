from __future__ import annotations

import json
import shutil
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK_PATH = ROOT / "raw" / "source" / "Pokémon Stats & Evolutions (XY).xlsx"
POKEMON_PATH = ROOT / "public" / "data" / "pokemon.json"
OUTPUT_DIR = ROOT / "public" / "sprites" / "pokemon-workbook"
OUTPUT_INDEX_PATH = ROOT / "public" / "data" / "pokemon-sprites.json"

XDR_NS = {"xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"}
REL_NS = {"rel": "http://schemas.openxmlformats.org/package/2006/relationships"}


def main() -> None:
    pokemon = json.loads(POKEMON_PATH.read_text(encoding="utf-8"))
    workbook_pokemon = pokemon[:786]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for existing in OUTPUT_DIR.glob("*"):
        if existing.is_file():
            existing.unlink()

    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        drawing_root = ET.fromstring(archive.read("xl/drawings/drawing1.xml"))
        relationships_root = ET.fromstring(archive.read("xl/drawings/_rels/drawing1.xml.rels"))

        target_by_rid = {
            relationship.attrib["Id"]: relationship.attrib["Target"].removeprefix("../")
            for relationship in relationships_root.findall("rel:Relationship", REL_NS)
        }

        sprite_index: list[dict[str, str]] = []
        for anchor in drawing_root.findall("xdr:oneCellAnchor", XDR_NS):
            row_node = anchor.find("xdr:from/xdr:row", XDR_NS)
            blip = anchor.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}blip")

            if row_node is None or blip is None:
                continue

            workbook_row_index = int(row_node.text or "0") - 1
            if workbook_row_index < 0 or workbook_row_index >= len(workbook_pokemon):
                continue

            rid = blip.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
            target = target_by_rid.get(rid or "")
            if not target:
                continue

            source_path = Path("xl") / target
            if str(source_path).replace("\\", "/") not in archive.namelist():
                continue

            pokemon_entry = workbook_pokemon[workbook_row_index]
            extension = Path(target).suffix.lower() or ".png"
            output_name = f"{pokemon_entry['slug']}{extension}"
            output_path = OUTPUT_DIR / output_name

            with archive.open(str(source_path).replace("\\", "/")) as source_file:
                with output_path.open("wb") as destination_file:
                    shutil.copyfileobj(source_file, destination_file)

            sprite_index.append(
                {
                    "pokemonId": pokemon_entry["id"],
                    "slug": pokemon_entry["slug"],
                    "src": f"/sprites/pokemon-workbook/{output_name}",
                }
            )

    OUTPUT_INDEX_PATH.write_text(
        json.dumps(sorted(sprite_index, key=lambda entry: entry["slug"]), indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
