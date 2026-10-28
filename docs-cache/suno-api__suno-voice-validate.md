# Suno Voice Generate Verification Phrase API

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
      summary: Suno Voice Generate Verification Phrase API
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/suno-voice-validate)

        :::


        Generate a validation phrase for the Suno Voice custom voice workflow.


        Submit the source audio URL and the selected vocal segment. The system
        will analyze the source voice and create a validation phrase that the
        user needs to read in the next step.


        :::tip

        This endpoint is free.

        :::


        ## Query Task Status

        :::tip[]

        In the production environment, it is recommended to use the
        `callBackUrl` parameter to receive automatic notifications when the
        validation phrase is ready, rather than polling the status endpoint.

        :::


        ## Next Step


        After the validation phrase is ready, ask the user to read the phrase
        and upload the recorded verification audio to continue creating the
        voice.


        <Card
          title="Generate Voice"
          icon="lucide-mic"
          href="/suno-api/suno-voice-generate"
        >
          Submit the verification audio and generate the final custom voice
        </Card>


        Related resources


        <CardGroup cols={2}>
          <Card title="Regenerate Validation Phrase" icon="lucide-refresh-cw" href="/suno-api/suno-voice-regenerate"> Generate a new validation phrase for an existing task </Card>
          <Card title="General API" icon="lucide-cog" href="/common-api/get-account-credits"> View account credits and usage </Card>
        </CardGroup>
      operationId: ai-music-api-validation-phrase
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
                    - ai-music-api/validation-phrase
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
                    voice_url:
                      description: >-
                        The original recording URL uploaded by the user
                        [Required]
                      type: string
                    vocal_start_s:
                      description: >-
                        Start time (in seconds) for extracting the vocal segment
                        [Required]
                      type: integer
                    vocal_end_s:
                      description: >-
                        End time (in seconds) for extracting the vocal segment,
                        must be greater than vocal_start_s [Required]
                      type: integer
                    language:
                      description: >-
                        Verify the language of the short phrase. Supported
                        languages ​​include: English (en), Chinese (zh), Spanish
                        (es), French (fr), Portuguese (pt), German (de),
                        Japanese (ja), Korean (ko), Hindi (hi), and Russian
                        (ru).
                      type: string
                  required:
                    - voice_url
                    - vocal_start_s
                    - vocal_end_s
                  x-apidog-orders:
                    - voice_url
                    - vocal_start_s
                    - vocal_end_s
                    - language
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/validation-phrase
              callBackUrl: https://example.com/callback/suno/voice_prepare
              input:
                voice_url: https://example.com/audio/user_voice.mp3
                vocal_start_s: 0
                vocal_end_s: 10
                language: en
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
                        description: Task ID
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206405-run
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
