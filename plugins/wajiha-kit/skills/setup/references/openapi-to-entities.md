# OpenAPI to entities (dashboard and the admin of fullstack)

The contract lives at `docs/api/openapi.json` in the user's project (JSON, 3.x or Swagger 2.0). It is the single source for
entities, fields, filters, permissions, auth and mock data. The website foundation has no backend: skip this file for it
(only its contact form talks to `CONTACT_WEBHOOK_URL`).

## 1. Get the file into `docs/api/openapi.json`

| The user gave | Do |
| --- | --- |
| A file already at `docs/api/openapi.json` | Use it. |
| Another JSON file path | `mkdir -p docs/api` and copy it there. Say so. |
| A URL to JSON | `curl -fsSL --max-time 30 -o docs/api/openapi.json "<url>"`. Say so. |
| A Swagger UI page (`.../swagger-ui/...`) | Try, in order, next to its host: `/v3/api-docs`, `/openapi.json`, `/swagger.json`, `/api-docs`. Use the first that answers JSON; say which. |
| A YAML file or URL | Fetch it to a temp file, then after `npm install`: `node -e "const Y=require('yaml'),f=require('fs');f.writeFileSync('docs/api/openapi.json',JSON.stringify(Y.parse(f.readFileSync(process.argv[1],'utf8')),null,2)+'\n')" <file.yaml>` (`yaml` is already in the lockfile of every foundation). Say it was converted. |
| A URL that needs a login or a token | Do not ask for the token. Ask the user to download the file and drop it in `docs/api/openapi.json`. |

Check it parses and has the right kind: `jq -e '.openapi // .swagger' docs/api/openapi.json`. If not, tell the user what came back
and ask for another link. Nothing else is installed for this (no `openapi-typescript`) unless the user says yes: write the DTOs by hand
from the schemas, as the foundation's recipe does.
A big spec: do not read it whole. `jq -r '.paths | keys[]'` lists the resources, `jq '.components.schemas.<Name>'` (Swagger 2.0: `.definitions.<Name>`) reads one.

## 2. Choose the entities

An entity is a collection path (`/x`, `/x/{id}`) with at least a list `GET`. Take the ones the user's answer to "tell me about your project" names
or implies. If the spec has more resources than the description covers, build the ones that are clearly the project's own, at most 8 in the
first build, and list the rest in the final report as "not built yet, say which". Skip health, metrics, auth and admin-internals paths.

## 3. Read each entity

| From the spec | Becomes |
| --- | --- |
| List item schema, create body (`POST`), update body (`PUT`/`PATCH`) | DTOs in the foundation's types file; columns; the form schema |
| `required`, `minLength`, `maxLength`, `pattern`, `minimum` | zod rules in `validations.ts` |
| `enum` | a select, a status badge, filter options (labels in both locale files) |
| `format: date` / `date-time`; `boolean`; numbers | date field and column; switch or status; number field |
| A `$ref` or `...Id` to another entity | a lookup/combobox (dashboard: `src/hooks/lookups`) |
| `readOnly` properties (`id`, timestamps, audit) | columns or details only, never in the form |
| List `GET` query parameters other than page, size, sort | the filter bar: a text parameter (`q`, `search`, `name`) is the search field, an enum or boolean is a select |
| `sort` parameter and sortable fields | sortable columns |
| `DELETE` present / absent, `PUT` / `PATCH` present / absent | delete action / edit action (leave the action out when the backend has none) |
| Operation `security`, `x-permissions`, or permission names written in descriptions | permission strings, exactly as the backend writes them |
| Nothing about permissions | the default set (below), said once in the summary as "assumed" |

Permission defaults: dashboard `PERMS.<entity>` with `view` `<resource>:read`, `create` `<resource>:create`, `update` `<resource>:update`, `delete` `<resource>:delete`
(keys in `src/constants/permissions.ts`; the `SUPERADMIN` role passes every check). Fullstack admin: `read`, `write`, `delete` as in its `permissions.ts`.
Every page gets its row in `PERMISSIONS.md` (dashboard).

## 4. Shape differences to fix once, not per entity

- Pagination: the dashboard assumes `page` (1-based in the UI, 0-based on the wire), `size`, `sort=name,asc` and the answer
  `{content,totalElements,totalPages,number,size}` (`src/types/api/page.ts`). Fullstack admin assumes `items` and a total (`features/admin/types/api.ts`).
  If the spec differs, change that one type and the shared conversion (`to*ListQuery` in the entity services, `src/mocks/core.ts` helpers) first, then build the entities.
- Errors: validation as `422` with `errors: { field: [..] }` (problem+json) lands under the input (`src/api/error/field-errors.ts`). A different error body: adapt
  that parser once.
- Auth: login, refresh and logout paths go in `endpoints.auth` of `src/constants/api.ts` (dashboard) or `features/admin/api/endpoints.ts` (fullstack). The login answer the
  foundation reads is: dashboard, a JWT access token whose claims carry `roles` and `permissions` (`src/types/auth.ts`, decoded in the session code) plus `/me`, with an
  optional separate auth service (`VITE_AUTH_BASE_URL`); fullstack, `{ accessToken, user, roles, permissions }`. Read the `securitySchemes` and the login operation, and adapt
  `src/api/auth/` and the permission store (dashboard) or `features/admin/store/auth-store.ts` (fullstack) when the backend differs.

## 5. Connect it

- Base URL: `servers[0].url` (or the host of the link the user gave). Claude cannot write `.env*` files (the kit denies it). Tell the user the exact lines:
  dashboard `.env.development.local`: `VITE_USE_MOCK="false"`, `VITE_API_BASE_URL="<url>"`, `VITE_AUTH_REFRESH="cookie"` (or `"session"` when the backend does not set an HttpOnly refresh cookie);
  production: `.env.production.local` or CI variables. Fullstack: `.env.local`: `VITE_ADMIN_API_MOCK=false`, `VITE_ADMIN_API_URL=<url>`, run `npm run dev:api`.
  Until then the project runs on the mock backend, which has the same shapes.
- Mock data: for each entity write handlers and seed rows from the spec (`example` values, enum values, property names), 20 to 30 rows, in the user's language(s), no real people, companies or hosts. Dashboard: copy `src/mocks/handlers/suppliers.ts`
  and `src/mocks/seed/suppliers.ts`, register in `src/mocks/index.ts`. Fullstack: `seed.ts`, `db.ts`, `suppliers.ts` copy, `handlers.ts`.
- Build each entity with the foundation's own recipe (`foundations.md`, row "Own recipes"), one entity at a time: types, endpoints, query keys, permissions,
  feature folder (copy of the reference entity, renamed), route, nav item, locale keys in both files, mock handlers, tests. The `dash-create-crud` skill does the same for one
  entity later; follow the recipe here because the strip of the demo needs the whole list of touched files.

## 6. No OpenAPI

Ask "does it need sign-in?" and, only if the description did not say, "what are the main things it manages?" (orders, customers, products...).
Write a draft `docs/api/openapi.json` (OpenAPI 3.0, `info.title` ending in `(draft, written by the kit)`) with a login operation when sign-in is needed
and a list/create/update/delete set per entity with the fields the description implies, then build from it exactly as above. Say in the summary that the shape is
a guess: when the real file arrives, replace `docs/api/openapi.json` and ask Claude to update the entities from it.
