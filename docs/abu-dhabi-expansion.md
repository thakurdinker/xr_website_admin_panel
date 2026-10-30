# Abu Dhabi expansion — admin panel notes

Branch **`feat/abu-dhabi-phase-0`**. Full handover: **`xr_client/docs/abu-dhabi-expansion.md`**; backend API notes: **`xr_backend_v1/docs/abu-dhabi-expansion.md`**.

## Changes
- **Areas** (`src/pages/Form/AddCommunity.jsx`): required **Emirate** dropdown (Dubai / Abu Dhabi) — decides `/area/` vs `/abu-dhabi/areas/`, and the area's properties follow it. **Noindex** checkbox. Schema URL uses the emirate's path.
- **Properties** (`src/pages/Form/AddProperty.jsx`): read-only **Emirate** field showing what the property inherits from its community (the backend sets it on save; it can't be edited here). Schema URL uses the emirate's path.
- **Developers** (`src/pages/Form/AddDeveloper.jsx`): **Noindex** checkbox, with a note that the page is shared by both emirates.
- **Area and property lists** (`src/pages/ManageCommunities/ManageCommunities.jsx`, `src/pages/ManageProperties/ManageProperties.jsx`): new **Emirate** column. A row with no `emirate` shows Dubai. The NAME column gave up one grid column to make room.
- Duplicate-slug errors come from the backend as `success:false` messages and show in the existing error toasts.

## Not done
- No SEO role exists yet, so every admin user sees the noindex toggles (the brief says only SEO should use them).
- Emirate filter (All / Dubai / Abu Dhabi) on the area and property lists. Both lists page on the server, so a filter over one page would be wrong. The admin list endpoints (`GET /admin/getAllForAdmin` and `GET /admin/properties`) have no `emirate` query param yet. Add it in the backend first (`controller/communityController.js` `getAllForAdmin`, `controller/propertiesController.js` `getAllProperties`). In these admin lists, "All" must mean no emirate filter. This differs from the public endpoints, which default to Dubai.

## Requires
The backend from the same branch (`emirate` / `noindex` fields). Against an older backend the new fields are silently dropped, so ship the backend first.
