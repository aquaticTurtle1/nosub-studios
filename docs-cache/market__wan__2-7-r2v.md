# Wan 2.7 - Reference to Video

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
      summary: Wan 2.7 - Reference to Video
      deprecated: false
      description: >-
        ## Create Task


        Use this endpoint to create a new reference-to-video generation task.


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          After submission, use the unified query endpoint to check task progress and retrieve results
        </Card>


        ::: tip[]

        For production use, we recommend providing the `callBackUrl` parameter
        so your service can receive completion notifications instead of polling
        for task status.

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
      operationId: wan-2-7-r2v
      tags:
        - docs/en/Market/Video Models/Wan
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
                  enum:
                    - wan/2-7-r2v
                  default: wan/2-7-r2v
                  description: >-
                    The model name used for generation. This field is required.
                    This endpoint must use the `wan/2-7-r2v` model.
                  examples:
                    - wan/2-7-r2v
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent.
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  description: Input parameters for the reference-to-video task.
                  required:
                    - prompt
                  properties:
                    prompt:
                      type: string
                      maxLength: 5000
                      description: >-
                        Text prompt. Required. Describes the desired elements
                        and visual features in the generated video. Supports
                        Chinese and English. Maximum length: 5000 characters.
                      examples:
                        - >-
                          Image 1 is eating, while video 1 and image 2 are
                          singing beside it.
                    negative_prompt:
                      type: string
                      maxLength: 500
                      description: >-
                        Optional negative prompt describing what should not
                        appear in the video. Supports Chinese and English.
                        Maximum length: 500 characters.
                      examples:
                        - >-
                          low resolution, errors, worst quality, low quality,
                          malformed, extra fingers, bad proportions
                    reference_image:
                      type: array
                      maxItems: 5
                      items:
                        type: string
                        format: uri
                      description: >-
                        Array of reference image URLs. At least one of
                        `reference_image` or `reference_video` must be provided.
                        The total number of images and videos cannot exceed 5.
                      examples:
                        - - https://example.com/demo/ref-image-1.png
                          - https://example.com/demo/ref-image-2.png
                    reference_video:
                      type: array
                      maxItems: 5
                      items:
                        type: string
                        format: uri
                      description: >-
                        Array of reference video URLs. At least one of
                        `reference_image` or `reference_video` must be provided.
                        The total number of images and videos cannot exceed 5.
                      examples:
                        - - https://example.com/demo/ref-video-1.mp4
                    first_frame:
                      type: string
                      format: uri
                      description: >-
                        First frame image URL. At most one image can be
                        provided. If supplied, `aspect_ratio` is ignored and the
                        output uses a ratio close to the first frame image.
                      examples:
                        - https://example.com/demo/first-frame.png
                    reference_voice:
                      type: string
                      format: uri
                      description: >-
                        Audio URL used to specify the voice timbre of the
                        subject in the reference material.


                        Rules:

                        - If `reference_video` contains audio and
                        `reference_voice` is not provided, the original video
                        audio is used by default

                        - If both `reference_video` and `reference_voice` are
                        provided, `reference_voice` takes priority


                        Audio limits:

                        - Formats: `wav`, `mp3`

                        - Duration: `1` to `10` seconds

                        - File size: up to `30MB`
                      examples:
                        - https://example.com/demo/reference-voice.mp3
                    resolution:
                      type: string
                      enum:
                        - 720p
                        - 1080p
                      default: 1080p
                      description: >-
                        Output video resolution tier. Available values: `720p`,
                        `1080p`. Default value: `1080p`.
                      examples:
                        - 1080p
                    aspect_ratio:
                      type: string
                      enum:
                        - '16:9'
                        - '9:16'
                        - '1:1'
                        - '4:3'
                        - '3:4'
                      default: '16:9'
                      description: >-
                        Output video aspect ratio.


                        Effective logic:

                        - If `first_frame` is not provided: the video is
                        generated using the specified `aspect_ratio`

                        - If `first_frame` is provided: `aspect_ratio` is
                        ignored and the output uses a ratio close to the first
                        frame image
                      examples:
                        - '16:9'
                    duration:
                      type: integer
                      minimum: 2
                      maximum: 10
                      default: 5
                      description: >-
                        Output video duration in seconds. Valid range is an
                        integer from `2` to `10`. Default value: `5`.
                      examples:
                        - 5
                    prompt_extend:
                      type: boolean
                      default: true
                      description: >-
                        Whether to enable prompt rewriting. When enabled, the
                        model expands the input prompt. This usually works
                        better for short prompts but increases processing time.
                      examples:
                        - true
                    watermark:
                      type: boolean
                      default: false
                      description: >-
                        Whether to add a watermark. The watermark is placed in
                        the lower-right corner of the video with the fixed text
                        "AI generated".
                      examples:
                        - false
                    seed:
                      type: integer
                      minimum: 0
                      maximum: 2147483647
                      description: >-
                        Random seed. Range: `0-2147483647`. If omitted, the
                        system generates one automatically.
                      examples:
                        - 0
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  x-apidog-orders:
                    - prompt
                    - negative_prompt
                    - reference_image
                    - reference_video
                    - first_frame
                    - reference_voice
                    - resolution
                    - aspect_ratio
                    - duration
                    - prompt_extend
                    - watermark
                    - seed
                    - 01KWKP34KJ2B573MY75T2EBYCC
                  x-apidog-refs:
                    01KWKP34KJ2B573MY75T2EBYCC:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: wan/2-7-r2v
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Image 1 is eating, while video 1 and image 2 are singing
                  beside it.
                negative_prompt: >-
                  low resolution, errors, worst quality, low quality, malformed,
                  extra fingers, bad proportions
                reference_image:
                  - https://example.com/demo/ref-image-1.png
                  - https://example.com/demo/ref-image-2.png
                reference_video:
                  - https://example.com/demo/ref-video-1.mp4
                first_frame: https://example.com/demo/first-frame.png
                reference_voice: https://example.com/demo/reference-voice.mp3
                resolution: 1080p
                aspect_ratio: '16:9'
                duration: 5
                prompt_extend: true
                watermark: false
                seed: 0
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
              example:
                code: 200
                msg: success
                data:
                  taskId: task_wan_1765180586443
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
                The system sends this callback when the `wan/2-7-r2v` task
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
                                - wan/2-7-r2v
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
                                parameters.
                            resultJson:
                              type: string
                              nullable: true
                              description: >-
                                JSON string containing resultUrls,
                                firstFrameUrl, lastFrameUrl, or resultObject
                                when successful. Present only when state is
                                success.
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
                            taskId: task_example_video_webhook_001
                            model: wan/2-7-r2v
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"Image 1 is eating, while
                              video 1 and image 2 are singing beside
                              it.\",\"negative_prompt\":\"low resolution,
                              errors, worst quality, low quality, malformed,
                              extra fingers, bad
                              proportions\",\"reference_image\":[\"https://example.com/input-image.jpg\"],\"reference_video\":[\"https://example.com/input-video.mp4\"],\"first_frame\":\"https://example.com/input-image.jpg\",\"reference_voice\":\"https://example.com/input-audio.mp3\",\"resolution\":\"1080p\",\"aspect_ratio\":\"16:9\",\"duration\":5,\"prompt_extend\":true,\"watermark\":false,\"seed\":0}","callBackUrl":"https://example.com/callback","model":"wan/2-7-r2v"}
                            resultJson: >-
                              {"resultUrls":["https://example.com/generated-video.mp4"]}
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
                            taskId: task_example_video_webhook_001
                            model: wan/2-7-r2v
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"Image 1 is eating, while
                              video 1 and image 2 are singing beside
                              it.\",\"negative_prompt\":\"low resolution,
                              errors, worst quality, low quality, malformed,
                              extra fingers, bad
                              proportions\",\"reference_image\":[\"https://example.com/input-image.jpg\"],\"reference_video\":[\"https://example.com/input-video.mp4\"],\"first_frame\":\"https://example.com/input-image.jpg\",\"reference_voice\":\"https://example.com/input-audio.mp3\",\"resolution\":\"1080p\",\"aspect_ratio\":\"16:9\",\"duration\":5,\"prompt_extend\":true,\"watermark\":false,\"seed\":0}","callBackUrl":"https://example.com/callback","model":"wan/2-7-r2v"}
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
      x-apidog-folder: docs/en/Market/Video Models/Wan
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-32711851-run
components:
  schemas:
    nsfw_checker:
      type: object
      properties:
        nsfw_checker:
          type: boolean
          description: >-
            Defaults to false. When false, no additional content filtering is
            applied and results are returned directly by the model.
      x-apidog-orders:
        - nsfw_checker
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
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
