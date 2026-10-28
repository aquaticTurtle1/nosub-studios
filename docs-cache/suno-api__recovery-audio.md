# Recovery Audio

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
      summary: Recovery Audio
      deprecated: false
      description: >-
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/recovery-audio)

        :::

        Recover playable audio links for a music generation task that has
        already completed.


        Suno's original links (`source_audio_url`) are only valid for a limited
        period of time and are deprecated. Submit the `task_id` of the original
        music generation task and every track of that task will be recovered
        together.


        Submit with POST /api/v1/suno/recovery {"taskId": "<original task id>"}
        and poll GET /api/v1/suno/recovery/record-info.


        ## Query Task Status

        **This task is NOT queried through the generic Get Task Details
        endpoint.** Use the dedicated polling endpoint below, with the recovery
        `task_id` returned by this endpoint:


        ```

        GET /api/v1/suno/recovery/record-info?task_id={task_id}

        ```


        Polling rules:


        - A 2 second interval is recommended.

        - `code` = **201** means the task is still running (`data` is `null`) —
        keep polling.

        - `code` = **200** means the recovery finished and `data` carries one
        entry per track — stop polling.

        - `code` = **500** means every track failed to recover — stop polling.


        ::: tip[]

        In the production environment, it is recommended to use the
        `callBackUrl` parameter to receive the automatic notification upon
        completion, rather than polling the status endpoint.

        :::


        ## Callback

        When `callBackUrl` is provided, a `POST` request is sent to it once the
        recovery task finishes. The task level `code` is `200` when at least one
        track was recovered, and `500` when all of them failed. 
      operationId: recoveryAudio
      tags:
        - docs/en/Market/Music Models/Suno/Music Generation
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
                    - ai-music-api/suno-recovery-audio
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

                    - Alternatively, poll GET
                    /api/v1/suno/recovery/record-info?task_id={task_id}
                    (recovery tasks use this dedicated polling endpoint).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  format: uri
                input:
                  type: object
                  description: Input parameters for generating the task
                  properties:
                    task_id:
                      type: string
                      description: >-
                        The original music generation task ID for which the
                        audio link needs to be restored. 
                  x-apidog-orders:
                    - task_id
                  required:
                    - task_id
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              required:
                - model
                - input
            example:
              model: ai-music-api/suno-recovery-audio
              callBackUrl: https://pale-vibraphone.com/
              input:
                task_id: '25'
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - type: object
                    x-apidog-orders:
                      - code
                      - msg
                      - data
                    properties:
                      code:
                        type: integer
                        description: >-
                          Status code of the request. The HTTP status is 200
                          even when the request fails, so always check this
                          field: 200 means success; any other value means the
                          request failed and msg describes the reason. Common
                          values: 401 invalid or missing API key; 402
                          insufficient credits; 429 rate limit exceeded; 422 or
                          500 the request could not be processed (read msg and
                          check your parameters before retrying).
                        enum:
                          - 200
                          - 401
                          - 402
                          - 404
                          - 422
                          - 429
                          - 433
                          - 455
                          - 500
                          - 501
                          - 505
                      msg:
                        type: string
                        description: Response message, error description upon failure
                        examples:
                          - success
                      data:
                        type: object
                        required:
                          - taskId
                        properties:
                          taskId:
                            type: string
                            description: >-
                              The URL for callBackUrl notifications after the
                              recovery task is completed. Optional. If left
                              blank, please use `GET
                              /api/v1/suno/recovery/record-info` for polling
                              instead.
                            examples:
                              - dc1928bfcbc77cb6c85f3359a9c718b3
                        x-apidog-orders:
                          - taskId
                    required:
                      - data
              example:
                code: 200
                msg: success
                data:
                  taskId: dc1928bfcbc77cb6c85f3359a9c718b3
          headers: {}
          x-apidog-name: ''
      security: []
      x-apidog-folder: docs/en/Market/Music Models/Suno/Music Generation
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206433-run
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
