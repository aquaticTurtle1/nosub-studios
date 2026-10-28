# Kling 4.0 Keyframe To Video

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
      summary: Kling 4.0 Keyframe To Video
      deprecated: false
      description: >
        Generate a video from first, middle, and last keyframe images with Kling
        4.0. Mention frames in the prompt using `@first_frame`, `@keyframe_1`,
        and `@last_frame`.


        ## Query Task Status


        After submitting a task, you can check the task progress and retrieve
        generation results via the unified query endpoint:


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          Learn how to query task status and obtain generation results
        </Card>


        ::: tip[]

        For production use, we recommend using the `callBackUrl` parameter to
        receive automatic notifications when generation completes, rather than
        polling the status endpoint.

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Market Overview" icon="lucide-store" href="/market/quickstart">
            Browse all available models
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check account credits and usage status
          </Card>
        </CardGroup>
      operationId: kling-4.0-keyframe-to-video
      tags:
        - docs/en/Market/Video Models/Kling
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              additionalProperties: false
              required:
                - model
                - input
              properties:
                model:
                  type: string
                  enum:
                    - kling-4.0/keyframe-to-video
                  default: kling-4.0/keyframe-to-video
                  description: >-
                    The name of the model used to generate the task. This field
                    is required.


                    - This endpoint requires the `kling-4.0/keyframe-to-video`
                    model
                  examples:
                    - kling-4.0/keyframe-to-video
                callBackUrl:
                  type: string
                  format: uri
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
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  additionalProperties: false
                  description: Input parameters for the generation task.
                  required:
                    - prompt
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Video description. Required. Maximum 8000 characters.


                        Use `@first_frame`, `@keyframe_1`, `@keyframe_2`, …,
                        `@last_frame` to mention frames that you uploaded in
                        this request. You can only mention frames that are
                        actually provided.


                        Every `@` mention must match an asset included in this
                        request, otherwise the request is rejected. Mentions use
                        longest-match against declared names. If the matched
                        name ends with a letter, digit, or underscore, the next
                        character cannot be a letter, digit, or underscore.
                      minLength: 1
                      maxLength: 8000
                      examples:
                        - >-
                          The girl in @first_frame walks out, passes the street
                          in @keyframe_1, and arrives at the party in
                          @last_frame
                    duration:
                      type: integer
                      minimum: 3
                      maximum: 30
                      default: 5
                      description: >-
                        Output video duration in seconds. Integer from 3 to 30.
                        Default: `5`.


                        Also caps the total number of frames (first + middle +
                        last):

                        - 3 s → 4 frames

                        - 4 s → 5 frames

                        - 5 s → 6 frames

                        - 6 s → 7 frames

                        - 7 s → 8 frames

                        - 8 s → 9 frames

                        - 9 s or longer → 10 frames
                    resolution:
                      type: string
                      enum:
                        - 720p
                        - 1080p
                      default: 720p
                      description: 'Output resolution. `720p` or `1080p`. Default: `720p`. '
                    aspect_ratio:
                      type: string
                      enum:
                        - auto
                        - '16:9'
                        - '9:16'
                        - '1:1'
                        - '21:9'
                      description: >-
                        Output aspect ratio. Only used when no frame is provided
                        (text-to-video); default is `16:9`. If any frame is
                        provided, the output follows the first frame's aspect
                        ratio.
                    first_frame_url:
                      type: string
                      format: uri
                      pattern: ^https?://
                      description: >-
                        First-frame image URL. Mention it in the prompt as
                        `@first_frame`.
                    keyframe_urls:
                      type: array
                      maxItems: 8
                      default: []
                      items:
                        type: string
                        format: uri
                        pattern: ^https?://
                      description: >-
                        Middle-frame image URLs, in chronological order. Up to 8
                        images, also limited by `duration`. Mention them in the
                        prompt as `@keyframe_1`, `@keyframe_2`, ….
                    last_frame_url:
                      type: string
                      format: uri
                      pattern: ^https?://
                      description: >-
                        Last-frame image URL. Mention it in the prompt as
                        `@last_frame`.
                  x-apidog-orders:
                    - prompt
                    - duration
                    - resolution
                    - aspect_ratio
                    - first_frame_url
                    - keyframe_urls
                    - last_frame_url
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: kling-4.0/keyframe-to-video
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  The girl in @first_frame walks out, passes the street in
                  @keyframe_1, and arrives at the party in @last_frame
                duration: 10
                resolution: 720p
                first_frame_url: https://example.com/first.png
                keyframe_urls:
                  - https://example.com/street.png
                last_frame_url: https://example.com/party.png
      responses:
        '200':
          description: Request Successful
          content:
            application/json:
              schema:
                type: object
                required:
                  - data
                properties:
                  code:
                    type: integer
                    description: >-
                      Response status code


                      - **200**: Success - Request has been processed
                      successfully

                      - **401**: Unauthorized - Authentication credentials are
                      missing or invalid

                      - **402**: Insufficient Credits - Account does not have
                      enough credits to perform the operation

                      - **404**: Not Found - The requested resource or endpoint
                      does not exist

                      - **422**: Validation Error - The request parameters
                      failed validation checks

                      - **429**: Rate Limited - Request limit has been exceeded
                      for this resource

                      - **433**: Request Limit - Sub-key Usage Exceeds Limit

                      - **455**: Service Unavailable - System is currently
                      undergoing maintenance

                      - **500**: Server Error - An unexpected error occurred
                      while processing the request

                      - **501**: Generation Failed - Content generation task
                      failed

                      - **505**: Feature Disabled - The requested feature is
                      currently disabled
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
                    description: Response message, error description when failed
                    example: success
                  data:
                    type: object
                    required:
                      - taskId
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Task ID, can be used with Get Task Details endpoint to
                          query task status
                    x-apidog-orders:
                      - taskId
                x-apidog-orders:
                  - code
                  - msg
                  - data
              example:
                code: 200
                msg: success
                data:
                  taskId: task_kling-4.0-keyframe-to-video_abc123
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
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system POSTs this callback to `callBackUrl` when the
                `kling-4.0/keyframe-to-video` task succeeds or fails.
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
                            Unified callback code: `200` for success, `501` for
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
                          description: >-
                            Task result. On success, `resultJson` contains
                            `resultUrls`. On failure, `failCode` and `failMsg`
                            are present and `resultJson` is omitted.
                          required:
                            - taskId
                            - model
                            - state
                            - param
                          properties:
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion timestamp in milliseconds. Use
                                this as the completion time.
                            costTime:
                              type: integer
                              format: int64
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                            createTime:
                              type: integer
                              format: int64
                              description: Task creation timestamp in milliseconds.
                            creditsConsumed:
                              type: number
                              description: >-
                                Credits consumed by the task. `0` for failed
                                tasks.
                            model:
                              type: string
                              description: The model used for the task.
                              enum:
                                - kling-4.0/keyframe-to-video
                            param:
                              type: string
                              description: >-
                                JSON string of the submitted task: `model`,
                                `callBackUrl`, and `input`. `input` matches this
                                endpoint's parameters (`prompt`, `duration`,
                                `resolution`, `aspect_ratio`, `first_frame_url`,
                                `keyframe_urls`, `last_frame_url`).
                            resultJson:
                              type: string
                              nullable: true
                              description: >-
                                JSON string of the generation result. Present
                                only when `state` is `success`. For this model
                                it contains `resultUrls`, an array of `.mp4`
                                URLs.
                            state:
                              type: string
                              description: Terminal task state.
                              enum:
                                - success
                                - fail
                            taskId:
                              type: string
                              description: >-
                                The unique task identifier. Same as
                                `data.taskId` returned by Create Task.
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Task update timestamp in milliseconds. May equal
                                `createTime`; use `completeTime` as the
                                completion time.
                            failCode:
                              type: string
                              nullable: true
                              description: >-
                                Failure code, a numeric string such as `"400"`
                                or `"500"`. Present only when `state` is `fail`.
                            failMsg:
                              type: string
                              nullable: true
                              description: >-
                                Failure reason. Present only when `state` is
                                `fail`. For this model this may be a frame-count
                                error (`duration 5s allows at most 6 frames
                                (first + keyframes + last), got 7`), a missing
                                `first_frame_url`, an undeclared `@first_frame`
                                / `@keyframe_N` / `@last_frame` mention, or an
                                upstream original message about image
                                fetch/moderation/size.
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
                      x-apidog-orders:
                        - code
                        - msg
                        - data
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          data:
                            completeTime: 1792670085074
                            costTime: 718
                            createTime: 1792669367000
                            creditsConsumed: 285
                            model: kling-4.0/keyframe-to-video
                            param: >-
                              {"input":"{\"duration\":10,\"keyframe_urls\":[],\"prompt\":\"女孩出门\",\"resolution\":\"720p\"}","callBackUrl":"https://webhook.uutool.cn/bfa7de80-8dd8-4844-9e34-4032ddbbf3c1","model":"kling-4.0/keyframe-to-video"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/k/ce115adfa78260a99009eebddac1d187_1_1792670083_1582.mp4"]}
                            state: success
                            taskId: ce115adfa78260a99009eebddac1d187
                            updateTime: 1792669367000
                          msg: Playground task completed successfully.
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          data:
                            completeTime: 1792670085074
                            costTime: 718
                            createTime: 1792669367000
                            creditsConsumed: 0
                            failCode: '400'
                            failMsg: >-
                              duration 5s allows at most 6 frames (first +
                              keyframes + last), got 7
                            model: kling-4.0/keyframe-to-video
                            param: >-
                              {"input":"{\"duration\":5,\"first_frame_url\":\"https://example.com/first.png\",\"keyframe_urls\":[\"https://example.com/k1.png\",\"https://example.com/k2.png\",\"https://example.com/k3.png\",\"https://example.com/k4.png\",\"https://example.com/k5.png\"],\"last_frame_url\":\"https://example.com/last.png\",\"prompt\":\"女孩出门\",\"resolution\":\"720p\"}","callBackUrl":"https://webhook.uutool.cn/bfa7de80-8dd8-4844-9e34-4032ddbbf3c1","model":"kling-4.0/keyframe-to-video"}
                            state: fail
                            taskId: ce115adfa78260a99009eebddac1d187
                            updateTime: 1792669367000
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
      x-apidog-folder: docs/en/Market/Video Models/Kling
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-45724593-run
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
