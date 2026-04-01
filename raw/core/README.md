# Core Import Staging

Drop source JSON files for the first importer pass here:

- `pokemon.json`
- `locations.json`
- `items.json`
- `encounters.json`
- `item-locations.json`

The first importer intentionally supports only these five core domains.

Accepted mapping notes:

- Pokemon may use `baseStats` or `stats`
- Pokemon may use `dexNumber` or `dex_number`
- Encounters may use `minLevel`/`maxLevel`, `min_level`/`max_level`, or a single `level`
- Item locations may use `itemId`/`locationId` or snake_case equivalents

If a source file needs more complex mapping than that, update `scripts/import-core.ts` explicitly instead of guessing.
