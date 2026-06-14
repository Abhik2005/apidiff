# Rules Reference

This document lists all the rules supported by `apidiff`. You can configure the severity (`breaking`, `warning`, `info`) of each rule using the `ruleSeverityOverrides` object, or disable rules using `disabledRules` in `apidiff.config.json`.

| Rule ID | Default Severity | Description | Trigger Example |
|---|---|---|---|
| `ENDPOINT_ADDED` | `info` | A new endpoint was added. | Adding `GET /users` |
| `ENDPOINT_REMOVED` | `breaking` | An existing endpoint was removed. | Deleting `GET /users` |
| `ENDPOINT_DEPRECATED` | `warning` | An endpoint was marked as deprecated. | Adding `deprecated: true` to `GET /users` |
| `PARAMETER_ADDED` | `info` | A new optional parameter was added. | Adding `?limit=10` |
| `PARAMETER_ADDED_REQUIRED` | `breaking` | A new required parameter was added (breaking change). | Adding `?api_key=xxx` as required |
| `PARAMETER_REMOVED` | `warning` | A parameter was removed. | Deleting `?limit` |
| `PARAMETER_MADE_REQUIRED` | `breaking` | An optional parameter was made required. | Changing `required: false` to `true` |
| `PARAMETER_MADE_OPTIONAL` | `info` | A required parameter was made optional. | Changing `required: true` to `false` |
| `PARAMETER_TYPE_CHANGED` | `breaking` | The type of a parameter changed. | Changing `string` to `integer` |
| `PARAMETER_DEPRECATED` | `warning` | A parameter was marked as deprecated. | Adding `deprecated: true` to a parameter |
| `RESPONSE_ADDED` | `info` | A new response status code was added. | Adding a `404` response |
| `RESPONSE_REMOVED` | `breaking` | A response status code was removed. | Deleting a `200` response |
| `RESPONSE_TYPE_CHANGED` | `breaking` | The schema type of a response changed. | Changing response from `string` to `object` |
| `PROPERTY_ADDED` | `info` | A new property was added to a response object. | Adding `email` to a User object response |
| `PROPERTY_ADDED_REQUIRED` | `breaking` | A new required property was added to a request object. | Adding required `password` to a CreateUser request |
| `PROPERTY_REMOVED` | `warning` | A property was removed from a response object. | Deleting `email` from a User object response |
| `PROPERTY_REMOVED_REQUIRED` | `breaking` | A required property was removed from a response object. | Deleting required `id` from a User object response |
| `PROPERTY_TYPE_CHANGED` | `breaking` | The type of a property changed. | Changing `id` from `integer` to `string` |
| `PROPERTY_MADE_REQUIRED` | `breaking` | An optional property was made required in a request. | Changing `email` to required |
| `PROPERTY_MADE_OPTIONAL` | `info` | A required property was made optional in a request. | Changing `email` to optional |
