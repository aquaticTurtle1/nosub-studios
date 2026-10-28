# Suno Voice Create Custom Voice API

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
      summary: Suno Voice Create Custom Voice API
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/suno-voice-generate)

        :::

        Generate a custom Suno Voice after the user reads the validation phrase.


        Submit the original validation task ID, the user's verification audio
        URL, and optional voice metadata such as `voice_name`, `description`,
        and `style`. The system will validate the recording and create a
        reusable custom voice.


        For better results, upload or record a singing voice sample. Clean
        acapella vocals usually produce the most accurate voice profile.


        :::tip

        This endpoint is free.

        :::


        ## Query Task Status

        :::tip[]

        In the production environment, it is recommended to use the
        `callBackUrl` parameter to receive automatic notifications when the
        custom voice is generated, rather than polling the status endpoint.

        :::


        ## Use the Generated Voice


        Get the Voice ID: the Voice ID is the taskId of your validation-phrase
        task, which create-voice also returns in resultJson.resultUrls[0].
        create-voice returns success immediately; that only means the request
        was accepted. The voice is ready when the validation-phrase task changes
        to state "success" (usually within a minute). If it changes to "fail",
        the recording did not pass verification. Receive the result on the
        validation-phrase task's callBackUrl (data.status is "success" or
        "fail"), or poll Get Task Details with that taskId. To use the voice,
        pass the Voice ID as persona_id together with persona_model:
        "voice_persona" in Generate Music.


        Related resources


        <CardGroup cols={2}>
          <Card title="Check Voice Availability" icon="lucide-badge-check" href="/suno-api/suno-voice-check-voice"> Verify whether a generated voice is available for use </Card>
          <Card title="General API" icon="lucide-cog" href="/common-api/get-account-credits"> View account credits and usage </Card>
        </CardGroup>
      operationId: suno-voice-generate
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
                    - ai-music-api/create-voice
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
                    verify_url:
                      description: >-
                        Audio URL for the user's recording of the
                        server-returned `validateInfo` validation phrase. For
                        best voice generation results, recording the phrase in a
                        singing voice rather than plain speech is recommended.
                        [Required]
                      type: string
                    voice_name:
                      description: Voice name
                      type: string
                    description:
                      description: Voice description
                      type: string
                    style:
                      description: Voice style
                      type: string
                    singer_skill_level:
                      type: string
                      description: >-
                        Singer skill level. Supported: beginner, intermediate,
                        advanced, professional
                      default: beginner
                      enum:
                        - beginner
                        - intermediate
                        - advanced
                        - professional
                      x-apidog-enum:
                        - value: beginner
                          name: ''
                          description: ''
                        - value: intermediate
                          name: ''
                          description: ''
                        - value: advanced
                          name: ''
                          description: ''
                        - value: professional
                          name: ''
                          description: ''
                  required:
                    - task_id
                    - verify_url
                  x-apidog-orders:
                    - task_id
                    - verify_url
                    - voice_name
                    - description
                    - style
                    - singer_skill_level
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/create-voice
              callBackUrl: https://webbed-kit.name/
              input:
                task_id: '12'
                verify_url: https://vengeful-provider.org/
                voice_name: Doreen Murphy
                description: >-
                  Calco charisma cursus. Vulgus arbitro uberrime congregatio
                  assentator demoror conor velociter calculus crux. Deprimo
                  varius appello deputo voveo carus quas cohors corporis pel.
                  Sponte adinventitias bellicus veniam. Colligo angelus abscido
                  vos caveo. Aurum creber toties talio animi. Truculenter
                  exercitationem cena inventore. Blandior vereor verumtamen
                  demoror iure caries tonsor cruentus.
                style: laboris
                singer_skill_level: professional
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206409-run
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
