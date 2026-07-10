# Typeform Clone API Contract

## Version

Version 1.1

---

## Table of Contents

- [Overview](#overview)
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [API Versioning](#api-versioning)
- [General Rules](#general-rules)
- [Enums](#enums)
- [Standard Response Wrappers](#standard-response-wrappers)
- [Entity Schemas](#entity-schemas)
- [Endpoint Reference](#endpoint-reference)
- [CSV Export](#csv-export)
- [HTTP Status Codes](#http-status-codes)
- [Changelog](#changelog)

---

## Overview

Typeform Clone is an API-first FastAPI backend that provides JSON endpoints for form building, public form delivery, response collection, response reporting, and analytics. Development is contract-first: frontend and backend consumers must follow this specification exactly.

## Base URLs

| Service | URL |
|---|---|
| Development Backend | `http://localhost:8000` |
| Swagger | `http://localhost:8000/docs` |
| API Prefix | `/api/v1` |

## Authentication

Creator endpoints currently operate on the default creator (`creator_id: 1`). Public endpoints require no authentication. Authentication is intentionally outside the scope of this assignment.

## API Versioning

Current version: `v1`. Breaking changes require a new API version.

## General Rules

- Endpoint paths, HTTP methods, JSON fields, enum values, wrappers, and pagination are immutable contract surface.
- JSON fields use `snake_case`.
- Timestamps are ISO 8601 UTC strings, for example `2026-07-10T12:30:00Z`.
- Questions are always ordered by `position ASC`. Answers and response previews are ordered by `question.position ASC`.
- CSV question columns are ordered by `question.position ASC`.
- API fields are `settings` and `value`; internal fields `settings_json` and `value_json` are never exposed.

## Enums

### FormStatus

- `draft`
- `published`

### QuestionType

- `short_text`
- `long_text`
- `multiple_choice`
- `dropdown`
- `email`
- `number`
- `yes_no`
- `rating`

## Standard Response Wrappers

Success:

```json
{"success":true,"message":"Meaningful success message","data":{}}
```

Error:

```json
{"success":false,"message":"Meaningful error message","errors":[]}
```

Validation Error:

```json
{"success":false,"message":"Validation failed","errors":[{"field":"answers.0.value","message":"Enter a valid email address"}]}
```

Pagination:

```json
{"page":1,"limit":20,"total":100,"total_pages":5}
```

# Entity Schemas

## Creator

```json
{"id":1,"name":"Default Creator","email":"creator@example.com","created_at":"2026-07-10T10:00:00Z"}
```

## Form Summary

```json
{"id":1,"title":"Customer Feedback","description":"Help us improve","slug":"customer-feedback-a8d21f","status":"published","version":3,"question_count":2,"response_count":24,"created_at":"2026-07-10T10:00:00Z","updated_at":"2026-07-10T12:30:00Z","published_at":"2026-07-10T11:00:00Z"}
```

## Form Detail

```json
{"id":1,"title":"Customer Feedback","description":"Help us improve","slug":"customer-feedback-a8d21f","status":"published","version":3,"question_count":1,"response_count":24,"thank_you_title":"Thank you!","thank_you_message":"Your response has been recorded.","questions":[],"created_at":"2026-07-10T10:00:00Z","updated_at":"2026-07-10T12:30:00Z","published_at":"2026-07-10T11:00:00Z"}
```

## Question Settings

```json
{"options":["Option A","Option B"],"min":1,"max":5,"placeholder":"Type your answer"}
```

Only settings applicable to the selected type are retained.

## Question

```json
{"id":10,"form_id":1,"type":"short_text","title":"What is your name?","description":null,"required":true,"position":0,"settings":{"placeholder":"Type your name"},"version":1,"created_at":"2026-07-10T10:00:00Z","updated_at":"2026-07-10T10:00:00Z"}
```

## Public Form

```json
{"id":1,"title":"Customer Feedback","description":"Help us improve","slug":"customer-feedback-a8d21f","version":3,"thank_you_title":"Thank you!","thank_you_message":"Your response has been recorded.","questions":[]}
```

## Public Question

```json
{"id":10,"type":"short_text","title":"What is your name?","description":null,"required":true,"position":0,"settings":{"placeholder":"Type your name"},"version":1}
```

## Form Theme

```json
{"id":1,"form_id":1,"name":"Default","colors":{"primary":"#262626","background":"#ffffff","surface":"#ffffff","text":"#1c1917","border":"#e7e5e4","accent":"#f59e0b"},"typography":{"font_family":"Inter","heading_weight":700,"body_weight":400},"background":{"type":"solid","value":"#ffffff"},"buttons":{"radius":8,"style":"filled"},"inputs":{"radius":8},"created_at":"2026-07-11T10:00:00Z","updated_at":"2026-07-11T10:00:00Z"}
```

Colors must use `#RRGGBB`; supported fonts are `Inter`, `Poppins`, `DM Sans`, `Manrope`, and `System`. Button and input radii are integers from 0 through 24, and button styles are `filled` or `outline`.

## Response Submission

```json
{"answers":[{"question_id":10,"value":"Raghav Singh"}],"completion_time_seconds":74,"form_version":3}
```

`form_version` is optional.

## Answer Submission

```json
{"question_id":10,"value":"Raghav Singh"}
```

Values are string, number, boolean, array of strings, or `null`.

## Form Response Summary

```json
{"id":100,"submitted_at":"2026-07-10T15:00:00Z","completion_time_seconds":74,"answer_count":2,"preview":[{"question_id":10,"question_title":"What is your name?","value":"Raghav Singh"}]}
```

## Individual Response

```json
{"id":100,"form":{"id":1,"title":"Customer Feedback"},"submitted_at":"2026-07-10T15:00:00Z","completion_time_seconds":74,"answers":[{"question_id":10,"question_title":"What is your name?","question_type":"short_text","value":"Raghav Singh"}]}
```

## Analytics

```json
{"form_id":1,"form_title":"Customer Feedback","total_responses":24,"average_completion_time_seconds":67.5,"questions":[{"question_id":11,"title":"Which service did you use?","type":"multiple_choice","answered_count":24,"skipped_count":0,"summary":{"counts":[{"label":"Delivery","count":12,"percentage":50.0},{"label":"Pickup","count":0,"percentage":0.0}]}}]}
```

## Pagination

```json
{"page":1,"limit":20,"total":24,"total_pages":2}
```

# Endpoint Reference

All endpoints return the standard error wrapper for failures. `422` uses the validation-error wrapper.

## Health

**Method:** GET  
**Path:** `/api/v1/health`  
**Purpose:** Service health check.  
**Authentication / Query Parameters / Request Body / Validation Rules:** None.  
**Status Codes:** `200`, `500`.  
**Example Request:** None.  
**Success Response:**

```json
{"success":true,"message":"API is healthy","data":{"status":"ok"}}
```

**Error Responses:** Standard error wrapper.

## Forms

### List Forms

**Method:** GET  
**Path:** `/api/v1/forms`  
**Purpose:** List forms for the default creator.  
**Authentication:** Default creator.  
**Query Parameters:** `status` (`draft|published`), `search`, `sort` (`created_at|updated_at|title|response_count`), `order` (`asc|desc`), `page` (>=1), `limit` (1–100).  
**Request Body / Validation Rules:** None; invalid query values return `422`.  
**Status Codes:** `200`, `422`, `500`.  
**Example Request:** `GET /api/v1/forms?page=1&limit=20`  
**Success Response:**

```json
{"success":true,"message":"Forms fetched successfully","data":{"items":[{"id":1,"title":"Customer Feedback","description":"Help us improve","slug":null,"status":"draft","version":1,"question_count":0,"response_count":0,"created_at":"2026-07-10T10:00:00Z","updated_at":"2026-07-10T10:00:00Z","published_at":null}],"pagination":{"page":1,"limit":20,"total":1,"total_pages":1}}}
```

**Error Responses:** Standard error/validation wrappers.

### Create Form

**Method:** POST  
**Path:** `/api/v1/forms`  
**Purpose:** Create a draft form.  
**Authentication / Query Parameters:** Default creator / None.  
**Request Body / Example Request:**

```json
{"title":"Untitled Form","description":null}
```

**Validation Rules:** `title` is trimmed and non-empty; `description`, `thank_you_title`, and `thank_you_message` are supported.  
**Status Codes:** `201`, `422`, `500`.  
**Success Response:** `Form created successfully` with Form Detail data.  
**Error Responses:** Standard error/validation wrappers.

### Get Form

**Method:** GET  
**Path:** `/api/v1/forms/{form_id}`  
**Purpose:** Fetch Form Detail for the builder.  
**Authentication / Query Parameters / Request Body / Validation Rules:** Default creator / None / None / None.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `GET /api/v1/forms/1`  
**Success Response:** `Form fetched successfully` with Form Detail data.  
**Error Responses:** Standard error wrapper.

### Update Form

**Method:** PATCH  
**Path:** `/api/v1/forms/{form_id}`  
**Purpose:** Partially update a form.  
**Authentication / Query Parameters:** Default creator / None.  
**Request Body / Example Request:**

```json
{"title":"Updated Feedback"}
```

**Validation Rules:** only `title`, `description`, `thank_you_title`, and `thank_you_message`; strings trim; title and thank-you title cannot be empty; changed forms increment `version`.  
**Status Codes:** `200`, `404`, `422`, `500`.  
**Success Response:** `Form updated successfully` with Form Detail data.  
**Error Responses:** Standard error/validation wrappers.

### Delete Form

**Method:** DELETE  
**Path:** `/api/v1/forms/{form_id}`  
**Purpose:** Delete a form, questions, responses, and answers.  
**Authentication / Query Parameters / Request Body / Validation Rules:** Default creator / None / None / None.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `DELETE /api/v1/forms/1`  
**Success Response:** `{"success":true,"message":"Form deleted successfully","data":null}`  
**Error Responses:** Standard error wrapper.

### Duplicate Form

**Method:** POST  
**Path:** `/api/v1/forms/{form_id}/duplicate`  
**Purpose:** Create a draft copy with questions only.  
**Authentication / Query Parameters:** Default creator / None.  
**Request Body / Example Request:** `{"title":"Customer Feedback Copy"}` (optional title).  
**Validation Rules:** provided title is trimmed; slug, responses, answers, and publication state are not copied.  
**Status Codes:** `201`, `404`, `422`, `500`.  
**Success Response:** `Form duplicated successfully` with draft Form Detail data.  
**Error Responses:** Standard error/validation wrappers.

### Publish Form

**Method:** POST  
**Path:** `/api/v1/forms/{form_id}/publish`  
**Purpose:** Publish a valid form.  
**Authentication / Query Parameters / Request Body:** Default creator / None / None.  
**Validation Rules:** requires questions and non-empty titles; choices require options; ratings require configured bounds; version increments and a slug is generated or preserved.  
**Status Codes:** `200`, `404`, `422`, `500`.  
**Example Request:** `POST /api/v1/forms/1/publish`  
**Success Response:**

```json
{"success":true,"message":"Form published successfully","data":{"id":1,"status":"published","slug":"customer-feedback-a8d21f","public_url":"http://localhost:3000/form/customer-feedback-a8d21f","published_at":"2026-07-10T11:00:00Z","version":2}}
```

**Error Responses:** Standard error/validation wrappers.

### Unpublish Form

**Method:** POST  
**Path:** `/api/v1/forms/{form_id}/unpublish`  
**Purpose:** Return a form to draft.  
**Authentication / Query Parameters / Request Body:** Default creator / None / None.  
**Validation Rules:** preserves slug, clears `published_at`, increments version.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `POST /api/v1/forms/1/unpublish`  
**Success Response:** `Form unpublished successfully` with `id`, `status`, `slug`, `published_at`, and `version`.  
**Error Responses:** Standard error wrapper.

## Questions

### Create Question

**Method:** POST  
**Path:** `/api/v1/forms/{form_id}/questions`  
**Purpose:** Add a question.  
**Authentication / Query Parameters:** Default creator / None.  
**Request Body / Example Request:**

```json
{"type":"short_text","title":"What is your name?","description":null,"required":false,"settings":{"placeholder":"Type your name"}}
```

**Validation Rules:** `position` is server assigned and is never accepted in create requests. Title is trimmed/non-empty; settings normalize by type; parent form version increments.  
**Status Codes:** `201`, `404`, `422`, `500`.  
**Success Response:** `Question created successfully` with Question data.  
**Error Responses:** Standard error/validation wrappers.

### Update Question

**Method:** PATCH  
**Path:** `/api/v1/questions/{question_id}`  
**Purpose:** Partially update a question.  
**Authentication / Query Parameters:** Default creator / None.  
**Request Body / Example Request:** `{"type":"rating","settings":{"min":1,"max":5}}`  
**Validation Rules:** optional `type`, `title`, `description`, `required`, `settings`; final type/settings state is normalized and validated; title cannot be empty; question and form versions increment.  
**Status Codes:** `200`, `404`, `422`, `500`.  
**Success Response:** `Question updated successfully` with Question data.  
**Error Responses:** Standard error/validation wrappers.

### Delete Question

**Method:** DELETE  
**Path:** `/api/v1/questions/{question_id}`  
**Purpose:** Delete a question and normalize positions.  
**Authentication / Query Parameters / Request Body:** Default creator / None / None.  
**Validation Rules:** remaining questions are renumbered contiguously; form version increments.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `DELETE /api/v1/questions/10`  
**Success Response:** `{"success":true,"message":"Question deleted successfully","data":null}`  
**Error Responses:** Standard error wrapper.

### Reorder Questions

**Method:** PATCH  
**Path:** `/api/v1/forms/{form_id}/questions/reorder`  
**Purpose:** Replace a form's complete question order.  
**Authentication / Query Parameters:** Default creator / None.  
**Request Body / Example Request:**

```json
{"question_ids":[14,10,12,11]}
```

**Validation Rules:** every current question appears exactly once; duplicates, missing IDs, and foreign/unknown IDs are rejected; changed question versions and form version increment.  
**Status Codes:** `200`, `404`, `422`, `500`.  
**Success Response:**

```json
{"success":true,"message":"Questions reordered successfully","data":{"questions":[{"id":14,"position":0,"version":2},{"id":10,"position":1,"version":3}],"form_version":7}}
```

**Error Responses:** Standard error/validation wrappers.

## Public Forms

### Get Public Form

**Method:** GET  
**Path:** `/api/v1/public/forms/{slug}`  
**Purpose:** Fetch a published Public Form.  
**Authentication / Query Parameters / Request Body:** None / None / None.  
**Validation Rules:** unpublished and missing forms return `404`.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `GET /api/v1/public/forms/customer-feedback-a8d21f`  
**Success Response:** `Public form fetched successfully` with Public Form data.  
**Error Responses:** Standard error wrapper.

### Submit Public Response

**Method:** POST  
**Path:** `/api/v1/public/forms/{slug}/responses`  
**Purpose:** Validate and persist a public response atomically.  
**Authentication / Query Parameters:** None / None.  
**Request Body / Example Request:** Response Submission.  
**Validation Rules:** published form, answer ownership/uniqueness, required answers, type/settings validation; optional stale `form_version` returns `409 Conflict`.  
**Status Codes:** `201`, `404`, `409`, `422`, `500`.  
**Success Response:**

```json
{"success":true,"message":"Response submitted successfully","data":{"response_id":100,"submitted_at":"2026-07-10T15:00:00Z","thank_you":{"title":"Thank you!","message":"Your response has been recorded."}}}
```

**Error Responses:** Standard error, validation, and conflict wrappers.

## Themes

### Get Form Theme

**Method:** GET  
**Path:** `/api/v1/forms/{form_id}/theme`  
**Request Body:** None.  
**Success Response:** `Theme fetched successfully` with Form Theme data.

### Update Form Theme

**Method:** PATCH  
**Path:** `/api/v1/forms/{form_id}/theme`  
**Request Body:** Any partial subset of `name`, `colors`, `typography`, `background`, `buttons`, and `inputs`.  
**Success Response:** `Theme updated successfully` with the updated Form Theme data. Invalid colors, font families, radii, and button styles return the standard `422` validation wrapper.

### Reset Form Theme

**Method:** POST  
**Path:** `/api/v1/forms/{form_id}/theme/reset`  
**Request Body:** None.  
**Success Response:** `Theme reset successfully` with the default Form Theme data.

## Logic Rules

A logic rule has `id`, `form_id`, `source_question_id`, `operator`, `value`, `action`, `target_question_id`, `priority`, `created_at`, and `updated_at`. Rules are ordered by ascending `priority`. The API stores and validates rules; the frontend evaluates them.

### List Logic Rules

**Method:** GET  
**Path:** `/api/v1/forms/{form_id}/logic-rules`  
**Success Response:** `Logic rules fetched successfully` with an ordered logic-rule array.

### Create Logic Rule

**Method:** POST  
**Path:** `/api/v1/forms/{form_id}/logic-rules`  
**Request Body:** `{source_question_id, operator, value, action, target_question_id}`  
**Success Response:** `Logic rule created successfully` with Logic Rule data.

### Update and Delete Logic Rule

**Methods:** PATCH, DELETE  
**Paths:** `/api/v1/logic-rules/{rule_id}`  
**Request Body:** PATCH accepts any partial subset of the create fields. DELETE has no body.  
**Success Responses:** Updated Logic Rule data; or `{id}` for deletion.

### Reorder Logic Rules

**Method:** PATCH  
**Path:** `/api/v1/forms/{form_id}/logic-rules/reorder`  
**Request Body:** `{ "rule_ids": [3, 1, 2] }` containing every rule for the form exactly once.  
**Success Response:** `{ "rule_ids": [3, 1, 2], "form_id": 1 }`.

## Responses and Analytics

### List Form Responses

**Method:** GET  
**Path:** `/api/v1/forms/{form_id}/responses`  
**Purpose:** List paginated response summaries.  
**Authentication:** Default creator.  
**Query Parameters:** `page` (>=1), `limit` (1–100), `sort=submitted_at`, `order` (`asc|desc`).  
**Request Body / Validation Rules:** None; invalid query values return `422`.  
**Status Codes:** `200`, `404`, `422`, `500`.  
**Example Request:** `GET /api/v1/forms/1/responses?page=1&limit=20&sort=submitted_at&order=desc`  
**Success Response:**

```json
{"success":true,"message":"Responses fetched successfully","data":{"form":{"id":1,"title":"Customer Feedback"},"items":[{"id":100,"submitted_at":"2026-07-10T15:00:00Z","completion_time_seconds":74,"answer_count":2,"preview":[{"question_id":10,"question_title":"What is your name?","value":"Raghav Singh"}]}],"pagination":{"page":1,"limit":20,"total":24,"total_pages":2}}}
```

**Error Responses:** Standard error/validation wrappers.

### Get Response

**Method:** GET  
**Path:** `/api/v1/responses/{response_id}`  
**Purpose:** Fetch an individual response.  
**Authentication / Query Parameters / Request Body / Validation Rules:** Default creator / None / None / None.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `GET /api/v1/responses/100`  
**Success Response:** `Response fetched successfully` with Individual Response data.  
**Error Responses:** Standard error wrapper.

### Delete Response

**Method:** DELETE  
**Path:** `/api/v1/responses/{response_id}`  
**Purpose:** Delete a response and its answers.  
**Authentication / Query Parameters / Request Body / Validation Rules:** Default creator / None / None / None.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `DELETE /api/v1/responses/100`  
**Success Response:** `{"success":true,"message":"Response deleted successfully","data":null}`  
**Error Responses:** Standard error wrapper.

### Get Form Analytics

**Method:** GET  
**Path:** `/api/v1/forms/{form_id}/analytics`  
**Purpose:** Fetch ordered analytics.  
**Authentication / Query Parameters / Request Body:** Default creator / None / None.  
**Validation Rules:** choice/dropdown summaries include configured options; rating includes configured distribution; text, email, and number summaries are `null`.  
**Status Codes:** `200`, `404`, `500`.  
**Example Request:** `GET /api/v1/forms/1/analytics`  
**Success Response:** `Analytics fetched successfully` with Analytics data.  
**Error Responses:** Standard error wrapper.

# CSV Export

**Method:** GET  
**Path:** `/api/v1/forms/{form_id}/responses/export`  
**Purpose:** Download form responses as CSV.  
**Authentication / Query Parameters / Request Body / Validation Rules:** Default creator / None / None / None.  
**Status Codes:** `200`, `404`, `500`.  
**Content-Type:** `text/csv` (UTF-8).  
**Filename:** `<form-title>-responses-YYYY-MM-DD.csv`.  
**Headers:** `response_id`, `submitted_at`, `completion_time_seconds`, then `<Question Title> [question_id]`. Headers use question position order and disambiguate duplicate titles with IDs.  
**Values:** booleans are `Yes`/`No`; arrays use `item1; item2; item3`; unanswered values are empty cells. Values beginning `=`, `+`, `-`, or `@` receive an apostrophe prefix for formula protection. Standard CSV escaping safely handles commas, quotes, and line breaks. Forms without responses return headers only.  
**Example Request:** `GET /api/v1/forms/1/responses/export`  
**Example Response:**

```csv
response_id,submitted_at,completion_time_seconds,What is your name? [10],Would you recommend us? [11]
100,2026-07-10T15:00:00.000000Z,74,"Raghav, Singh",Yes
101,2026-07-10T15:03:00.000000Z,62,'=safe text,No
```

**Error Responses:** Standard error wrapper.

# HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful GET, PATCH, DELETE, publish, unpublish, analytics, or CSV export |
| 201 | Form, question, duplication, or public response created |
| 204 | No Content; reserved, not currently returned by implemented endpoints |
| 400 | Bad Request; reserved for malformed client requests |
| 404 | Requested form, question, response, or public form is unavailable |
| 409 | Submitted public form version is stale |
| 422 | Request validation or business validation failed |
| 500 | Unexpected server or database error |

# Changelog

## Version 1.1

- Added CSV export endpoint documentation.
- Finalized analytics, response, and question payload documentation.
- Removed placeholders, duplicated descriptions, and historical wording.
