# Suno Voice Regenerate Verification Phrase

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
      summary: Suno Voice Regenerate Verification Phrase
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/suno-voice-regenerate)

        :::

        Regenerate the validation phrase for an existing Suno Voice task.


        Use this endpoint when the previous validation phrase failed, expired,
        or the user needs a new phrase to read. Regeneration updates the
        original validation task: keep polling the original task_id (or receive
        it on that task's callBackUrl) for the new phrase. The taskId returned
        here only confirms the request.


        :::tip

        This endpoint is free.

        :::


        ## Continue the Flow


        Once the regenerated phrase is ready, ask the user to read the new
        phrase and submit the verification audio to the voice generation
        endpoint.


        <Card
          title="Generate Voice"
          icon="lucide-mic"
          href="/suno-api/suno-voice-generate"
        >
          Continue custom voice generation with the newly recorded verification audio
        </Card>


        Related resources


        <CardGroup cols={2}>
          <Card title="Generate Validation Phrase" icon="lucide-file-audio" href="/suno-api/suno-voice-validate"> Start the validation phrase flow from source audio </Card>
        </CardGroup>
      operationId: suno-voice-regenerate
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
                    - ai-music-api/regenerate-phrase
                callBackUrl:
                  type: string
                  description: >-
                    The URL to receive generation task completion updates.
                    Optional but recommended for production use.


                    - System will POST task status and results to this URL when
                    generation completes

                    - Callback includes generated content URLs and task
                    information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing results

                    - Alternatively, use the Get Task Details endpoint to poll
                    task status

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  format: uri
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    task_id:
                      description: Task ID
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
                - callBackUrl
                - input
            example:
              model: ai-music-api/regenerate-phrase
              callBackUrl: https://api.example.com/callback
              input:
                task_id: xxxxxxx
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
                      taskId:
                        type: string
                    required:
                      - taskId
                    x-apidog-orders:
                      - taskId
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
                  taskId: xxx_task_id_xxx
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206414-run
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
