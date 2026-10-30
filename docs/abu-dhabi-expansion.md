# Abu Dhabi expansion — admin panel notes

Branch **`feat/abu-dhabi-phase-0`**. Full handover: **`xr_client/docs/abu-dhabi-expansion.md`**; backend API notes: **`xr_backend_v1/docs/abu-dhabi-expansion.md`**.

## Changes
- **Areas** (`src/pages/Form/AddCommunity.jsx`): required **Emirate** dropdown (Dubai / Abu Dhabi) — decides `/area/` vs `/abu-dhabi/areas/`, and the area's properties follow it. **Noindex** checkbox. Schema URL uses the emirate's path.
- **Properties** (`src/pages/Form/AddProperty.jsx`): read-only **Emirate** field showing what the property inherits from its community (the backend sets it on save; it can't be edited here). Schema URL uses the emirate's path.
- **Developers** (`src/pages/Form/AddDeveloper.jsx`): **Noindex** checkbox, with a note that the page is shared by both emirates.
- Duplicate-slug errors come from the backend as `success:false` messages and show in the existing error toasts.

## Not done
- No SEO role exists yet, so every admin user sees the noindex toggles (the brief says only SEO should use them).
- Emirate column/filter on the area and property lists (nice to have).

## Requires
The backend from the same branch (`emirate` / `noindex` fields). Against an older backend the new fields are silently dropped, so ship the backend first.
