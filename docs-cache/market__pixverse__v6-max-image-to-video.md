# PixVerse V6 Max Image-to-Video

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
      summary: PixVerse V6 Max Image-to-Video
      deprecated: false
      description: >
        PixVerse V6 Max image-to-video. Animate a single reference image as the
        first frame into cinematic video up to 15 seconds at up to 1080p, with
        optional native audio synchronized to the picture. The output aspect
        ratio follows the input image; do not send `aspect_ratio`.


        V6 Max is tuned for film, short drama, and advertising: stronger prompt
        following and camera control, more realistic lighting and materials,
        more stable subject consistency across shots, tighter music-beat sync,
        more accurate multi-character dialogue and lip-sync, and more reliable
        product appearance and on-screen text.


        ## Query Task Status


        After submitting a task, you can check its progress and retrieve the
        result through the unified query endpoint:


        <Card title="Get Task Details" icon="magnifying-glass"
        href="/market/common/get-task-detail">
          Learn how to check task status and retrieve the generated result
        </Card>


        ::: tip[]

        In production, we recommend using the `callBackUrl` parameter to receive
        an automatic notification when generation is complete instead of polling
        the status endpoint.

        :::

        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Market Overview" icon="store" href="/market/quickstart">
            Browse all available models
          </Card>
          <Card title="Common API" icon="gear" href="/common-api/get-account-credits">
            View account credits and usage
          </Card>
        </CardGroup>
      operationId: pixverse-v6-max-image-to-video
      tags:
        - docs/en/Market/Video Models/PixVerse
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
                  description: >-
                    The name of the model used for the generation task. Required
                    field. Used for PixVerse V6 Max image-to-video.
                  enum:
                    - pixverse-v6-max/image-to-video
                  default: pixverse-v6-max/image-to-video
                  x-apidog-enum:
                    - value: pixverse-v6-max/image-to-video
                      name: ''
                      description: ''
                  examples:
                    - pixverse-v6-max/image-to-video
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    The callback URL to receive the completion notification of
                    the generation task. Optional configuration, recommended for
                    production environments.


                    - After the task generation is completed, the system will
                    push the task status and results to this URL via POST

                    - The callback content includes the URL of the generated
                    content and task-related information

                    - Your callback interface must support receiving POST
                    requests and JSON-formatted request bodies

                    - You can also actively poll the task status by calling the
                    task details interface
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  description: Input parameters for the image-to-video task
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Generation prompt. Required. Cannot be empty. Maximum
                        5000 characters.
                      minLength: 1
                      maxLength: 5000
                      examples:
                        - >-
                          Use the supplied image as the exact first frame. The
                          subject slowly walks toward the camera in one
                          continuous shot, natural performance, subtle handheld
                          breathing, no cuts
                    image_urls:
                      type: array
                      minItems: 1
                      maxItems: 1
                      description: >-
                        Required. Input image used as the first frame. The array
                        must contain exactly 1 URL. HTTP, HTTPS, and OSS
                        addresses are supported. Formats: JPG, JPEG, PNG, and
                        WebP. Each side must be ≤ 10,000 px and the file size
                        must be ≤ 20 MB. The output aspect ratio follows this
                        image; do not send `aspect_ratio`.
                      items:
                        type: string
                        format: uri
                      examples:
                        - - https://example.com/first-frame.png
                    quality:
                      type: string
                      description: >-
                        Required. Output video resolution. Supports 360p, 540p,
                        720p, and 1080p. Case-insensitive.
                      enum:
                        - 360p
                        - 540p
                        - 720p
                        - 1080p
                      x-apidog-enum:
                        - value: 360p
                          name: ''
                          description: ''
                        - value: 540p
                          name: ''
                          description: ''
                        - value: 720p
                          name: ''
                          description: ''
                        - value: 1080p
                          name: ''
                          description: ''
                      examples:
                        - 720p
                    duration:
                      type: integer
                      description: >-
                        Required. Output video duration in seconds. PixVerse V6
                        Max supports 1–15 seconds.
                      minimum: 1
                      maximum: 15
                      examples:
                        - 5
                    generate_audio_switch:
                      type: boolean
                      description: >-
                        Whether to generate native audio synchronized with the
                        video. Default is false.
                      default: false
                      examples:
                        - false
                    seed:
                      type: integer
                      description: >-
                        Random seed, range 0–2147483647. Using the same
                        parameters and seed improves reproducibility. If
                        omitted, a random seed is used.
                      minimum: 0
                      maximum: 2147483647
                      examples:
                        - 123456789
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - quality
                    - duration
                    - generate_audio_switch
                    - seed
                  required:
                    - prompt
                    - image_urls
                    - quality
                    - duration
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: pixverse-v6-max/image-to-video
              input:
                prompt: >-
                  Use the supplied image as the exact first frame. The subject
                  slowly walks toward the camera in one continuous shot, natural
                  performance, subtle handheld breathing, no cuts
                image_urls:
                  - https://example.com/first-frame.png
                quality: 720p
                duration: 5
                generate_audio_switch: false
                seed: 123456
              callBackUrl: https://example.com/kie/callback
      responses:
        '200':
          description: Request successful.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
          headers: {}
          x-apidog-name: ''
      security:
        - BearerAuth: []
          x-apidog:
            schemeGroups:
              - id: e5215e147f1a4de49eeac
                schemeIds:
                  - BearerAuth
            required: true
            use:
              id: e5215e147f1a4de49eeac
            scopes:
              e5215e147f1a4de49eeac:
                undefined: []
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the
                `pixverse-v6-max/image-to-video` task succeeds or fails.
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
                            Callback business code: 200 for success, 501 for
                            failure.
                          enum:
                            - 200
                            - 501
                        data:
                          type: object
                          required:
                            - completeTime
                            - costTime
                            - createTime
                            - creditsConsumed
                            - model
                            - param
                            - state
                            - taskId
                            - updateTime
                          properties:
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, Unix timestamp in
                                milliseconds.
                            costTime:
                              type: integer
                              format: int64
                              description: Processing duration in seconds.
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, Unix timestamp in
                                milliseconds.
                            creditsConsumed:
                              type: number
                              description: Credits consumed by this task.
                            model:
                              type: string
                              description: The model used for the task.
                              enum:
                                - pixverse-v6-max/image-to-video
                            param:
                              type: string
                              description: >-
                                JSON string of the submitted task. `input`
                                inside it is itself a JSON string.
                            resultJson:
                              type: string
                              nullable: true
                              description: >-
                                JSON string with `resultUrls` when successful.
                                Present only when `state` is `success`.
                            state:
                              type: string
                              description: Terminal task state.
                              enum:
                                - success
                                - fail
                            taskId:
                              type: string
                              description: The unique task identifier.
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Last update time, Unix timestamp in
                                milliseconds. May equal `createTime`; use
                                `completeTime` as the completion time.
                            failCode:
                              type: string
                              nullable: true
                              description: >-
                                Failure code, a numeric string such as "400" or
                                "500". Present only when `state` is `fail`.
                            failMsg:
                              type: string
                              nullable: true
                              description: >-
                                Failure reason. Present only when `state` is
                                `fail`.
                          x-apidog-orders:
                            - completeTime
                            - costTime
                            - createTime
                            - creditsConsumed
                            - model
                            - param
                            - resultJson
                            - state
                            - taskId
                            - updateTime
                            - failCode
                            - failMsg
                        msg:
                          type: string
                          description: Callback message.
                          enum:
                            - Playground task completed successfully.
                            - Playground task failed.
                      x-apidog-orders:
                        - code
                        - data
                        - msg
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          data:
                            completeTime: 1792749587321
                            costTime: 112
                            createTime: 1792749475000
                            creditsConsumed: 44
                            model: pixverse-v6-max/image-to-video
                            param: >-
                              {"input":"{\"duration\":5,\"generate_audio_switch\":false,\"seed\":123456,\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1792430759523_Fbq69dva.jpg\"],\"prompt\":\"Use
                              the supplied image as the exact first frame. The
                              subject slowly walks toward the camera in one
                              continuous shot, natural performance, subtle
                              handheld breathing, no
                              cuts\",\"quality\":\"720p\"}","callBackUrl":"https://example.com/callback","model":"pixverse-v6-max/image-to-video"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/pixverse-v6/1792749586652-2tw5t2l0k4o.mp4"]}
                            state: success
                            taskId: 412f345309a8a3b784bb906fbb56d5c7
                            updateTime: 1792749475000
                          msg: Playground task completed successfully.
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          data:
                            completeTime: 1792749587321
                            costTime: 112
                            createTime: 1792749475000
                            creditsConsumed: 0
                            model: pixverse-v6-max/image-to-video
                            param: >-
                              {"input":"{\"duration\":5,\"generate_audio_switch\":false,\"seed\":123456,\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1792430759523_Fbq69dva.jpg\"],\"prompt\":\"Use
                              the supplied image as the exact first frame. The
                              subject slowly walks toward the camera in one
                              continuous shot, natural performance, subtle
                              handheld breathing, no
                              cuts\",\"quality\":\"720p\"}","callBackUrl":"https://example.com/callback","model":"pixverse-v6-max/image-to-video"}
                            state: fail
                            taskId: 412f345309a8a3b784bb906fbb56d5c7
                            updateTime: 1792749475000
                            failCode: '400'
                            failMsg: <error detail>
                          msg: Playground task failed.
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
      x-apidog-folder: docs/en/Market/Video Models/PixVerse
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-45776191-run
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
