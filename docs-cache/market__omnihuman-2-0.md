# Omnihuman 2.0

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
      summary: Omnihuman 2.0
      deprecated: false
      description: >
        ## Create Task


        Use this endpoint to create an OmniHuman 2.0 video generation task.
        Provide an image, an audio file, and an optional text prompt. The model
        generates a video whose appearance matches the input image and whose
        motion is driven by the audio.


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          After submission, use the unified query endpoint to check task progress and retrieve results
        </Card>


        ::: tip[]

        For production use, we recommend providing the `callBackUrl` parameter
        so your service can receive completion notifications instead of polling
        for task status.

        :::


        ## File Upload


        ::: tip[]

        Need to upload files before calling this endpoint? See [File Upload API
        Quickstart](/file-upload-api/quickstart).

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Model Marketplace" icon="lucide-store" href="/market/quickstart">
            Explore all available models and capabilities
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check account credits and usage
          </Card>
        </CardGroup>
      operationId: omnihuman-2-0
      tags:
        - docs/en/Market/Video Models/OmniHuman
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
                - input
              properties:
                model:
                  type: string
                  description: |-
                    The model name used for generation. This field is required.

                    - This endpoint must use the `omnihuman-2-0` model
                  enum:
                    - omnihuman-2-0
                  default: omnihuman-2-0
                  x-apidog-enum:
                    - value: omnihuman-2-0
                      name: ''
                      description: ''
                  examples:
                    - omnihuman-2-0
                input:
                  type: object
                  description: >-
                    Input parameters for the OmniHuman 2.0 video generation
                    task.
                  required:
                    - image_urls
                    - audio_url
                  properties:
                    image_urls:
                      type: array
                      items:
                        type: string
                        format: uri
                      description: >-
                        Source image URL. Only **one** image is supported. Pass
                        it as a one-element array.


                        - Formats: jpeg, png, webp, bmp, tiff, gif, heic, heif
                        (`image/jpeg`, `image/png`, `image/webp`, `image/bmp`,
                        `image/tiff`, `image/gif`, `image/heic`, `image/heif`)

                        - Size: less than 30 MB

                        - Aspect ratio (width/height): `[0.4, 2.5]`

                        - Dimension: `[300, 6000]` px
                    audio_url:
                      type: string
                      format: uri
                      description: >-
                        Audio URL that drives motion and lip sync.


                        - Duration: `[4, 300]` seconds

                        - Formats: wav, mp3 (`audio/wav`, `audio/x-wav`,
                        `audio/mpeg`)

                        - Size: less than 15 MB
                    prompt:
                      type: string
                      maxLength: 300
                      description: >-
                        Optional text prompt for precise control of the scene,
                        character motion, and camera movement. Supported
                        languages: Chinese, English, Japanese, Korean, Spanish
                        (Mexican), Indonesian. Up to 300 characters.
                    enable_watermark:
                      type: boolean
                      default: true
                      description: >-
                        Whether to add a watermark to the output video. Default:
                        `true` (enabled).
                  x-apidog-orders:
                    - image_urls
                    - audio_url
                    - prompt
                    - enable_watermark
                  x-apidog-ignore-properties: []
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    The URL to receive generation task completion updates.
                    Optional but recommended for production use.


                    - The system POSTs task status and results to this URL when
                    generation completes (success or failure)

                    - On success, `data.resultJson` contains `resultUrls` with
                    the generated MP4 video URL

                    - `data.param` echoes the submitted OmniHuman 2.0 input
                    (`image_urls`, `audio_url`, `prompt`, `enable_watermark`)

                    - Your endpoint should accept POST requests with a JSON
                    payload

                    - Alternatively, poll task status with the Get Task Details
                    endpoint

                    - To verify callbacks, see [Webhook Verification
                    Guide](/common-api/webhook-verification)
              x-apidog-orders:
                - model
                - input
                - callBackUrl
              x-apidog-ignore-properties: []
            example:
              model: omnihuman-2-0
              input:
                image_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/1792734497529_2RcDODp8.png
                audio_url: >-
                  https://static.aiquickdraw.com/tools/example/1792734490067_FvBSDOOl.wav
                prompt: >-
                  A museum guide explains how starlight lets us look into the
                  universe’s past in a friendly, engaging manner.
                enable_watermark: true
              callBackUrl: https://your-domain.com/api/callback
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - type: object
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
                              The task ID can be used with the "Get Task
                              Details" endpoint to query the task status.
                            examples:
                              - dc1928bfcbc77cb6c85f3359a9c718b3
                        x-apidog-orders:
                          - taskId
                        x-apidog-ignore-properties: []
                    x-apidog-orders:
                      - 01KV7QY2EFNA3G5YVCSPGG8KCT
                    required:
                      - data
                    x-apidog-refs:
                      01KV7QY2EFNA3G5YVCSPGG8KCT:
                        $ref: '#/components/schemas/response%20not%20with%20recordId'
                    x-apidog-ignore-properties:
                      - code
                      - msg
                      - data
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
              wWHp9kT_eO6aY6FZDpn9d:
                undefined: []
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the `omnihuman-2-0` task
                succeeds or fails.
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      type: object
                      required:
                        - code
                        - msg
                        - data
                      properties:
                        code:
                          type: integer
                          description: >-
                            Unified callback code: 200 for success, 501 for
                            failure.
                          enum:
                            - 200
                            - 501
                        msg:
                          type: string
                          description: Unified callback message.
                          enum:
                            - Playground task completed successfully.
                            - Playground task failed.
                        data:
                          type: object
                          required:
                            - taskId
                            - model
                            - state
                            - param
                          properties:
                            taskId:
                              type: string
                              description: The unique task identifier.
                            model:
                              type: string
                              description: The model used for the task.
                              enum:
                                - omnihuman-2-0
                            state:
                              type: string
                              description: Terminal task state.
                              enum:
                                - success
                                - fail
                            param:
                              type: string
                              description: >-
                                JSON string containing the submitted task
                                parameters. The nested `input` object includes
                                `image_urls` (one image), `audio_url`, `prompt`,
                                and `enable_watermark`.
                            resultJson:
                              type: string
                              nullable: true
                              description: >-
                                JSON string containing `resultUrls` with the
                                generated MP4 video URL when successful. Present
                                only when state is success.
                            failCode:
                              type: string
                              nullable: true
                              description: >-
                                Failure code, a numeric string such as "400" or
                                "500". Present only when state is fail.
                            failMsg:
                              type: string
                              nullable: true
                              description: Failure reason. Present only when state is fail.
                            costTime:
                              type: integer
                              format: int64
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                            completeTime:
                              type: integer
                              format: int64
                              description: Task completion timestamp.
                            createTime:
                              type: integer
                              format: int64
                              description: Task creation timestamp.
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                            creditsConsumed:
                              type: number
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          msg: Playground task completed successfully.
                          data:
                            taskId: task_omnihuman-2-0_1234567890
                            model: omnihuman-2-0
                            state: success
                            param: >-
                              {"input":"{\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1792734497529_2RcDODp8.png\"],\"audio_url\":\"https://static.aiquickdraw.com/tools/example/1792734490067_FvBSDOOl.wav\",\"prompt\":\"A
                              museum guide explains how starlight lets us look
                              into the universe’s past in a friendly, engaging
                              manner.\",\"enable_watermark\":true}","callBackUrl":"https://your-domain.com/api/callback","model":"omnihuman-2-0"}
                            resultJson: >-
                              {"resultUrls":["https://static.aiquickdraw.com/tools/example/1792734516894_OplehJyL.mp4"]}
                            costTime: 12
                            completeTime: 1234567890
                            createTime: 1234560000
                            updateTime: 1234567890
                            creditsConsumed: 1.23
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: task_omnihuman-2-0_1234567890
                            model: omnihuman-2-0
                            state: fail
                            param: >-
                              {"input":"{\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1792734497529_2RcDODp8.png\"],\"audio_url\":\"https://static.aiquickdraw.com/tools/example/1792734490067_FvBSDOOl.wav\",\"prompt\":\"A
                              museum guide explains how starlight lets us look
                              into the universe’s past in a friendly, engaging
                              manner.\",\"enable_watermark\":true}","callBackUrl":"https://your-domain.com/api/callback","model":"omnihuman-2-0"}
                            failCode: '400'
                            failMsg: <error detail>
                            costTime: 12
                            creditsConsumed: 0
              responses:
                '200':
                  description: Callback received successfully.
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          code:
                            type: integer
                            example: 200
                          msg:
                            type: string
                            example: success
                      example:
                        code: 200
                        msg: success
      x-apidog-folder: docs/en/Market/Video Models/OmniHuman
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-45773856-run
components:
  schemas:
    response not with recordId:
      type: object
      required:
        - data
      properties:
        code:
          type: integer
          description: >-
            Status code of the request. The HTTP status is 200 even when the
            request fails, so always check this field: 200 means success; any
            other value means the request failed and msg describes the reason.
            Common values: 401 invalid or missing API key; 402 insufficient
            credits; 429 rate limit exceeded; 422 or 500 the request could not
            be processed (read msg and check your parameters before retrying).
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
                The task ID can be used with the "Get Task Details" endpoint to
                query the task status.
              examples:
                - dc1928bfcbc77cb6c85f3359a9c718b3
          x-apidog-orders:
            - taskId
          x-apidog-ignore-properties: []
      x-apidog-orders:
        - code
        - msg
        - data
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
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
