# Suno Voice Check Availability API

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/jobs/createTask:
    post:
      summary: Suno Voice Check Availability API
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/suno-voice-check-voice)

        :::

        Check whether a generated Suno custom voice is available.


        Synchronous: the result is returned in data.isAvailable; no task is
        created. task_id: the taskId returned by Create Custom Voice.


        :::tip

        This endpoint is free.

        :::


        Related resources


        <CardGroup cols={2}>
          <Card title="Generate Voice" icon="lucide-mic" href="/suno-api/suno-voice-generate"> Create a custom voice from verification audio </Card>
          <Card title="General API" icon="lucide-cog" href="/common-api/get-account-credits"> View account credits and usage </Card>
        </CardGroup>
      operationId: suno-voice-check-voice
      tags:
        - docs/en/Market/Music Models/Suno/voice
        - Suno API/voice
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  description: The model name to use for generation. Required field.
                  examples:
                    - ai-music-api/check-voice
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    task_id:
                      description: Task ID that needs to be checked
                      type: string
                  required:
                    - task_id
                  x-apidog-orders:
                    - task_id
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - input
            example:
              model: ai-music-api/check-voice
              input:
                task_id: dsaa43209wejf0925904j29140sfs
      responses:
        '200':
          description: Request successful.
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    description: >-
                      Status code of the request. The HTTP status is 200 even
                      when the request fails, so always check this field: 200
                      means success; any other value means the request failed
                      and msg describes the reason. Common values: 401 invalid
                      or missing API key; 402 insufficient credits; 429 rate
                      limit exceeded; 422 or 500 the request could not be
                      processed (read msg and check your parameters before
                      retrying).
                  msg:
                    type: string
                  data:
                    type: object
                    properties:
                      isAvailable:
                        type: boolean
                    required:
                      - isAvailable
                    x-apidog-orders:
                      - isAvailable
                required:
                  - code
                  - msg
                  - data
                x-apidog-orders:
                  - code
                  - msg
                  - data
              example:
                code: 200
                msg: success
                data:
                  isAvailable: true
          headers: {}
          x-apidog-name: ''
      security:
        - BearerAuth: []
          x-apidog:
            schemeGroups:
              - id: kn8M4YUlc5i0A0179ezwx
                schemeIds:
                  - BearerAuth
            required: true
            use:
              id: kn8M4YUlc5i0A0179ezwx
            scopes:
              kn8M4YUlc5i0A0179ezwx:
                BearerAuth: []
      x-apidog-folder: docs/en/Market/Music Models/Suno/voice
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206417-run
components:
  schemas: {}
  securitySchemes:
    BearerAuth:
      type: bearer
      scheme: bearer
      bearerFormat: API Key
      description: >-
        All API requests require a Bearer Token. Add the header `Authorization:
        Bearer YOUR_API_KEY` to authenticate requests.
    BearerAuth1:
      type: bearer
      scheme: bearer
      bearerFormat: API Key
      description: >-
        所有 API 请求都需要 Bearer Token。请在请求头中添加 `Authorization: Bearer YOUR_API_KEY`
        进行身份验证。
servers:
  - url: https://api.kie.ai
    description: 正式环境
security:
  - BearerAuth: []
    x-apidog:
      schemeGroups:
        - id: kn8M4YUlc5i0A0179ezwx
          schemeIds:
            - BearerAuth
      required: true
      use:
        id: kn8M4YUlc5i0A0179ezwx
      scopes:
        kn8M4YUlc5i0A0179ezwx:
          BearerAuth: []

```
