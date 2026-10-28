# Kling 4.0 Reference To Video

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
      summary: Kling 4.0 Reference To Video
      deprecated: false
      description: >-
        Generate videos with Kling 4.0 from reference images, reference videos,
        elements, and voices. Reference your materials in the prompt using
        `@image_1`, `@video_1`, or custom `@name` tags.


        ## Materials and References


        All four material types are optional. When none are provided, the
        request behaves as plain text-to-video. Once provided, reference them in
        `prompt` as shown below:


        | Material | Reference syntax | Limit |

        |---|---|---|

        | Reference images `images` | `@image_1`, `@image_2`, … | 10 images |

        | Reference videos `videos` | `@video_1`, `@video_2`, … | 5 videos, each
        2–30 seconds |

        | Elements `elements` |

        - Reference videos and video elements combined are limited to 5; all
        four material types combined are limited to 15.

        - An image element requires 2–4 images, with the first one as the
        primary shot; a video element requires one 3–8 second single-shot
        character video.

        - Custom names must be 1–20 characters of Chinese characters, letters,
        digits, or underscores, must be unique (case-insensitive), and must not
        use reserved names such as `image_N`, `video_N`, `first_frame`, or
        `last_frame`.

        - Referencing an undeclared material returns a parameter error and the
        task is not created.


        ::: tip[]

        When `aspect_ratio` is omitted, the ratio adapts to your materials if
        any are provided, and falls back to `16:9` when none are. When `videos`
        is provided, `keep_original_sound` controls whether the original audio
        is kept; when `videos` is omitted, native audio is enabled by default.

        :::


        ## Check Task Status


        After submitting a task, use the unified query endpoint to track
        progress and retrieve results:


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          Learn how to query task status and retrieve generation results
        </Card>


        ::: tip[]

        For production, use the `callBackUrl` parameter to receive automatic
        notifications when generation completes, rather than polling the status
        endpoint.

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Model Market Overview" icon="lucide-store" href="/market/quickstart">
            Browse all available models
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check account credits and usage
          </Card>
        </CardGroup>
      operationId: kling-4.0-reference-to-video
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
                  description: >-
                    The name of the model used to generate the task. This field
                    is required.


                    - This endpoint requires the `kling-4.0/reference-to-video`
                    model
                  enum:
                    - kling-4.0/reference-to-video
                  default: kling-4.0/reference-to-video
                  examples:
                    - kling-4.0/reference-to-video
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


                        Use `@` to mention assets uploaded in this request:

                        - `@image_1`, `@image_2`, … map to `image_urls` in order
                        (1-based)

                        - `@video_1`, `@video_2`, … map to `video_urls`

                        - `@name` maps to the `name` of an item in `elements` or
                        `voices`


                        Every `@` mention must match an asset included in this
                        request, otherwise the request is rejected. Mentions use
                        longest-match against declared names. If the matched
                        name ends with a letter, digit, or underscore, the next
                        character cannot be a letter, digit, or underscore.
                      minLength: 1
                      maxLength: 8000
                      examples:
                        - >-
                          @Hero sits at the desk in @video_1, picks up the doll
                          from @image_1, and greets using @Narrator
                    duration:
                      type: integer
                      minimum: 3
                      maximum: 30
                      default: 5
                      description: >-
                        Output video duration in seconds. Integer from 3 to 30.
                        Default: `5`.
                    resolution:
                      type: string
                      enum:
                        - 720p
                        - 1080p
                      default: 720p
                      description: 'Output resolution. `720p` or `1080p`. Default: `720p`.'
                    aspect_ratio:
                      type: string
                      enum:
                        - auto
                        - '16:9'
                        - '9:16'
                        - '1:1'
                        - '21:9'
                      description: >-
                        Output aspect ratio. Optional.


                        - If omitted and any reference asset is provided, the
                        model uses `auto`

                        - If omitted and no reference asset is provided, the
                        model uses `16:9`
                    image_urls:
                      type: array
                      maxItems: 10
                      default: []
                      items:
                        type: string
                        format: uri
                        pattern: ^https?://
                      description: >-
                        Reference images, up to 10 publicly accessible URLs.
                        Mention them in the prompt as `@image_1`, `@image_2`, …
                        in array order. Each side must be 300–65536 pixels;
                        aspect ratio 0.40–2.5.
                    video_urls:
                      type: array
                      maxItems: 5
                      default: []
                      items:
                        type: string
                        format: uri
                        pattern: ^https?://
                      description: >-
                        Reference videos, up to 5 clips, each 2–30 seconds.
                        Mention them in the prompt as `@video_1`, `@video_2`, ….
                        Reference videos plus video subjects in `elements`
                        cannot exceed 5 in total. 
                    keep_original_sound:
                      type: boolean
                      default: false
                      description: >-
                        Whether to keep the original audio of the reference
                        videos. Only takes effect when `video_urls` is provided.
                        Default: `false`. If no reference video is provided,
                        native audio is always generated.
                    elements:
                      type: array
                      maxItems: 7
                      default: []
                      items:
                        type: object
                        additionalProperties: false
                        required:
                          - name
                        properties:
                          name:
                            type: string
                            pattern: ^[一-龥A-Za-z0-9_]{1,20}$
                            description: >-
                              The name used in the prompt as `@Hero`. 1–20
                              characters; Chinese, letters, digits, and
                              underscore only. Must be unique across `elements`
                              and `voices` (case-insensitive). Reserved names
                              (case-insensitive, N is a number) cannot be used:
                              `image_N`, `video_N`, `keyframe_N`, `object_N`,
                              `audio_N`, `first_frame`, `last_frame`.
                            examples:
                              - Hero
                          image_urls:
                            type: array
                            minItems: 2
                            maxItems: 4
                            items:
                              type: string
                              format: uri
                              pattern: ^https?://
                            description: >-
                              2–4 publicly accessible image URLs for an image
                              subject. Cannot be used together with `video_url`.
                              The first image is the primary view (front face or
                              main angle); the rest are supporting views.
                          video_url:
                            type: string
                            format: uri
                            pattern: ^https?://
                            description: >-
                              Character video URL for a video subject. Cannot be
                              used together with `image_urls`. One video, 3–8
                              seconds, a single continuous shot (no cuts),
                              shortest side at least 700 pixels.
                          tag:
                            type: string
                            enum:
                              - character
                              - animal
                              - prop
                              - costume
                              - scene
                              - effect
                              - others
                            description: >-
                              Subject category. Optional for image subjects — if
                              omitted, it is inferred from the primary image.
                              Video subjects are always `character`; any other
                              value is rejected.
                          description:
                            type: string
                            maxLength: 100
                            description: >-
                              Optional subject description. Maximum 100
                              characters.
                          voice_url:
                            type: string
                            format: uri
                            pattern: ^https?://
                            description: >-
                              Optional reference audio bound to this subject. It
                              cannot be mentioned with `@` on its own and does
                              not count toward the `voices` quota. Only
                              character subjects can bind audio: for image
                              subjects `tag` must be `character` or omitted; for
                              video subjects, if omitted and the video contains
                              speech, that speech is used automatically.
                        x-apidog-orders:
                          - name
                          - image_urls
                          - video_url
                          - tag
                          - description
                          - voice_url
                      description: >-
                        Subjects used only for this task. Up to 7 items, of
                        which at most 3 can be video subjects. Mention them in
                        the prompt as `@name`. `image_urls`, `video_urls`,
                        `elements`, and `voices` together cannot exceed 15
                        items.
                    voices:
                      type: array
                      maxItems: 3
                      default: []
                      items:
                        type: object
                        additionalProperties: false
                        required:
                          - name
                          - audio_url
                        properties:
                          name:
                            type: string
                            pattern: ^[一-龥A-Za-z0-9_]{1,20}$
                            description: >-
                              The name used in the prompt as `@Narrator`. 1–20
                              characters; Chinese, letters, digits, and
                              underscore only. Must be unique across `elements`
                              and `voices` (case-insensitive). Reserved names
                              (case-insensitive, N is a number) cannot be used:
                              `image_N`, `video_N`, `keyframe_N`, `object_N`,
                              `audio_N`, `first_frame`, `last_frame`.
                            examples:
                              - Narrator
                          audio_url:
                            type: string
                            format: uri
                            pattern: ^https?://
                            description: >-
                              Publicly accessible reference audio URL. Required.
                              The task fails if no usable voice can be detected.
                        x-apidog-orders:
                          - name
                          - audio_url
                      description: >-
                        Standalone voice references used only for this task. Up
                        to 3 items. Mention them in the prompt as `@name`. Audio
                        bound on a subject via `voice_url` is separate and does
                        not count toward this quota.
                  x-apidog-orders:
                    - prompt
                    - duration
                    - resolution
                    - aspect_ratio
                    - image_urls
                    - video_urls
                    - keep_original_sound
                    - elements
                    - voices
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: kling-4.0/reference-to-video
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  @Hero sits at the desk in @video_1, picks up the doll from
                  @image_1, and greets using @Narrator
                duration: 10
                resolution: 1080p
                image_urls:
                  - https://example.com/doll.png
                video_urls:
                  - https://example.com/room.mp4
                keep_original_sound: false
                elements:
                  - name: Hero
                    image_urls:
                      - https://example.com/hero-front.jpg
                      - https://example.com/hero-side.jpg
                    tag: character
                    description: Young man in a red jacket
                voices:
                  - name: Narrator
                    audio_url: https://example.com/narrator.mp3
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
                  taskId: task_kling-4.0-reference-to-video_abc123
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
                `kling-4.0/reference-to-video` task succeeds or fails.
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
                                - kling-4.0/reference-to-video
                            param:
                              type: string
                              description: >-
                                JSON string of the submitted task: `model`,
                                `callBackUrl`, and `input`. `input` matches this
                                endpoint's parameters (`prompt`, `duration`,
                                `resolution`, `aspect_ratio`, `image_urls`,
                                `video_urls`, `keep_original_sound`, `elements`,
                                `voices`).
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
                                `fail`. For this model this may be a
                                reference-video duration error (`video_1
                                duration must be between 2 and 30 seconds, got
                                45`), an element/voice creation error, or an
                                upstream original message.
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
                            completeTime: 1792669219001
                            costTime: 315
                            createTime: 1792668903000
                            creditsConsumed: 425
                            model: kling-4.0/reference-to-video
                            param: >-
                              {"input":"{\"duration\":10,\"aspect_ratio\":\"9:16\",\"keep_original_sound\":false,\"elements\":[],\"voices\":[],\"image_urls\":[],\"video_urls\":[],\"prompt\":\"sits
                              at the desk
                              in\",\"resolution\":\"1080p\"}","callBackUrl":"https://webhook.uutool.cn/bfa7de80-8dd8-4844-9e34-4032ddbbf3c1","model":"kling-4.0/reference-to-video"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/k/1f0176644624b187c7f6add97986875d_1_1792669217_8488.mp4"]}
                            state: success
                            taskId: 1f0176644624b187c7f6add97986875d
                            updateTime: 1792668903000
                          msg: Playground task completed successfully.
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          data:
                            completeTime: 1792669219001
                            costTime: 315
                            createTime: 1792668903000
                            creditsConsumed: 0
                            failCode: '400'
                            failMsg: >-
                              video_1 duration must be between 2 and 30 seconds,
                              got 45
                            model: kling-4.0/reference-to-video
                            param: >-
                              {"input":"{\"duration\":10,\"aspect_ratio\":\"9:16\",\"keep_original_sound\":false,\"elements\":[],\"voices\":[],\"image_urls\":[],\"video_urls\":[\"https://example.com/room.mp4\"],\"prompt\":\"sits
                              at the desk in
                              @video_1\",\"resolution\":\"1080p\"}","callBackUrl":"https://webhook.uutool.cn/bfa7de80-8dd8-4844-9e34-4032ddbbf3c1","model":"kling-4.0/reference-to-video"}
                            state: fail
                            taskId: 1f0176644624b187c7f6add97986875d
                            updateTime: 1792668903000
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-45712192-run
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
