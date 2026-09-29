# Hito 3 - Talent Pipeline Tracker

## Descripción

Talent Pipeline Tracker es una herramienta interna del área de Personas y Fuerza Laboral de HealthCore para gestionar el pipeline de candidaturas. Diane Foster es la responsable del área. HealthCore cuenta con aproximadamente 200 empleados distribuidos en 12 clínicas y la contratación de perfiles clínicos tarda alrededor de 47 días. La herramienta centraliza la información y simplifica el seguimiento de cada candidatura durante ese proceso.

## Objetivo

Permite visualizar candidaturas, buscar por nombre o email, filtrar por estado y etapa, consultar el detalle, cambiar el estado y la etapa, gestionar notas, registrar nuevas candidaturas y editar las existentes.

## Tecnologías

Next.js con App Router, React, TypeScript, Tailwind CSS, `fetch` nativo y una API REST. No se utilizan Redux, Zustand, Jotai, Axios ni SDKs externos.

## Estructura principal

```text
app/
  page.tsx                       Ruta principal del listado
  candidate-dashboard.tsx        Carga, búsqueda, filtros y paginación
  candidate-labels.ts            Etiquetas en español de estados y etapas
  candidates/[id]/              Detalle, cambios de estado/etapa y notas
  candidates/new/               Alta de candidaturas
  components/                   Filtros, listado, filas y formulario compartido
lib/
  api.ts                         Cliente REST y manejo de errores
types/
  candidate.ts                   Contratos TypeScript de datos y payloads
```

## Configuración

El proyecto necesita un archivo `.env.local` en esta carpeta con la variable:

```dotenv
NEXT_PUBLIC_API_URL=https://playground.4geeks.com/tracker/api/v1
```

`.env.local` no se versiona. El repositorio incluye `.env.example` con la variable necesaria como referencia. Al ser `NEXT_PUBLIC_`, la URL base queda disponible en el navegador; no debe contener secretos.

## Ejecución

Desde `uis/talent-pipeline-tracker/`:

```bash
npm install
npm run dev
```

La aplicación se abre normalmente en http://localhost:3000.

## API utilizada

URL base: https://playground.4geeks.com/tracker/api/v1

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/records` | Listar, buscar, filtrar y paginar candidaturas |
| GET | `/records/:id` | Consultar el detalle |
| POST | `/records` | Crear una candidatura |
| PUT | `/records/:id` | Editar los datos de una candidatura |
| PATCH | `/records/:id` | Cambiar estado o etapa |
| GET | `/records/:id/notes` | Consultar notas |
| POST | `/records/:id/notes` | Crear una nota |
| DELETE | `/records/:id/notes/:note_id` | Eliminar una nota |

No se añade autenticación en el cliente.

## Estados válidos

| Valor de API | Etiqueta |
| --- | --- |
| `received` | Recibida |
| `in_progress` | En proceso |
| `selected` | Seleccionada |
| `discarded` | Descartada |

## Etapas válidas

| Valor de API | Etiqueta |
| --- | --- |
| `pending` | Pendiente |
| `review` | Revisión |
| `personal_interview` | Entrevista personal |
| `technical_interview` | Entrevista técnica |
| `offer_presented` | Oferta presentada |

Estos valores proceden del contrato OpenAPI oficial de la API.

## Listado de candidaturas

La ruta `/` obtiene los datos con `GET /records` y ofrece paginación. Cada fila muestra nombre, email, puesto, estado, etapa y acceso al detalle. Se presenta el total devuelto por la API, un estado de carga, errores visibles y el mensaje «No se encontraron candidaturas.» cuando la lista está vacía.

## Búsqueda y filtros

El parámetro `search` busca por `full_name` o email; `status` y `stage` filtran por estado y etapa. Se pueden combinar. La búsqueda se envía con el botón «Buscar» para evitar peticiones en cada pulsación. Los parámetros se construyen con `URLSearchParams`; `useSearchParams` lee la URL y `useRouter` junto con `usePathname` la actualizan sin recargar la página completa. Así, los filtros permanecen al recargar o compartir el enlace.

## Detalle de candidatura

La ruta `/candidates/[id]` obtiene el registro con `GET /records/:id` y muestra `full_name`, `email`, `phone`, `position`, `linkedin_url`, `cv_url`, `experience_years`, `status`, `stage` y `applied_at`. Dispone de un enlace para volver al listado.

## Cambio de estado y etapa

Los controles de estado y etapa envían cambios independientes mediante `PATCH /records/:id`. La interfaz adopta la respuesta sin F5, deshabilita los controles durante la operación y muestra carga y feedback de éxito o error.

## Gestión de notas

Las notas se cargan mediante GET, se crean mediante POST y se eliminan mediante DELETE en los endpoints de notas. No se envían notas vacías. Después de crear o eliminar se vuelve a consultar la lista, sin recarga completa; las operaciones muestran carga y feedback de éxito o error.

## Crear candidatura

La ruta `/candidates/new` utiliza `POST /records`. El formulario exige `full_name`, `email`, `phone`, `position` y `experience_years`; `linkedin_url` y `cv_url` son opcionales. Valida los campos requeridos, un formato razonable de email, experiencia numérica mayor o igual a 0 y, cuando se facilitan, URLs `http` o `https`. Si hay errores, no envía la petición. Tras guardar, navega al detalle y muestra confirmación. `status` y `stage` no se envían en POST porque no forman parte de `RecordCreate`.

## Editar candidatura

El detalle permite editar los datos mediante `PUT /records/:id`. El formulario se precarga con el registro actual y valida los mismos campos que el alta. PUT envía el esquema `RecordCreate` completo: los cinco campos obligatorios y las URLs opcionales. No incluye `id`, `status`, `stage`, fechas ni notas. Estado y etapa siguen gestionándose por PATCH. Tras guardar, la interfaz utiliza la respuesta del PUT sin recargar la página completa.

## Manejo asíncrono

Todas las peticiones del cliente utilizan `async/await`. Las cargas y escrituras muestran estados visibles; los errores llegan al usuario y las operaciones no fallan silenciosamente. Los formularios deshabilitan el envío mientras guardan.

## Tipado TypeScript

`types/candidate.ts` define `Candidate`, `CandidateNote`, `CandidateStatus`, `CandidateStage`, `CandidatesResponse`, `NotesResponse`, `CreateCandidatePayload`, `UpdateCandidatePayload` y `PatchCandidatePayload`, además del payload de creación de notas. El proyecto no usa `any` en estos contratos ni en el cliente API.

## Decisiones técnicas

1. `lib/api.ts` centraliza llamadas REST y errores HTTP para evitar duplicación.
2. `types/candidate.ts` mantiene separados los contratos de datos y la lógica de interfaz.
3. Los filtros viven en query params para conservarlos al recargar o compartir la URL.
4. La navegación usa `Link` y `router` en vez de `window.location`, sin reload completo.
5. POST/PUT y PATCH se mantienen separados porque la API utiliza contratos distintos: `RecordCreate` frente a cambios de estado/etapa.
6. El estado local con hooks es suficiente para el alcance de este hito.
7. La identidad HealthCore y el contexto de Personas y Fuerza Laboral guían una interfaz interna legible, no una plantilla genérica.

## Pruebas realizadas

Se realizaron y validaron manualmente en navegador:

- Carga del listado real con `GET /records`, búsqueda por nombre o email, filtros por `status` y `stage` (por separado y combinados) y paginación.
- Navegación al detalle con App Router y carga de la candidatura mediante `GET /records/:id`.
- Cambio de `status` y de `stage` mediante `PATCH /records/:id`.
- Carga de notas con GET, creación con POST y eliminación con DELETE, incluida la validación de nota vacía.
- Creación real de una candidatura con `POST /records`, validación del formulario vacío y edición real con `PUT /records/:id`.
- Actualización de la interfaz sin F5, regreso al listado y búsqueda de la candidatura creada, y persistencia de parámetros en la URL.

También se ejecutaron `npm run lint`, `npm run build` y `git diff --check`.

## Historial de implementación

| Commit | Descripción |
| --- | --- |
| `d5dee5a` | chore: initialize Talent Pipeline Tracker |
| `b66d817` | feat: add Talent Pipeline API types and services |
| `495bd2e` | feat: add HealthCore candidate listing and filters |
| `2871d9e` | feat: add candidate detail and notes management |
| `0569d91` | feat: add candidate creation and editing |

## Estado final

El Hito 3 cubre los requisitos funcionales solicitados. El diseño prioriza claridad y usabilidad para el equipo de HealthCore; la evaluación del hito no incluye formalmente el diseño visual.
