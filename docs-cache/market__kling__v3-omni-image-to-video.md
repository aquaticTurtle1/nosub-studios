# Kling 3.0 Omni  Image To Video

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
      summary: Kling 3.0 Omni  Image To Video
      deprecated: false
      description: >-
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
      operationId: kling-3.0-omni-image-to-video
      tags:
        - docs/en/Market/Video Models/Kling
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
              properties:
                model:
                  type: string
                  enum:
                    - kling-3.0-omni/image-to-video
                  default: kling-3.0-omni/image-to-video
                  description: >-
                    The name of the model used to generate the task. This field
                    is required.


                    - This endpoint requires the `kling-3.0-omni/image-to-video`
                    model
                  examples:
                    - kling-3.0-omni/image-to-video
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
                  description: >-
                    Input parameters for the generation task. Rules: (1)
                    customize_multi_shots and prefer_multi_shots cannot both be
                    true; (2) customize_multi_shots = true requires 1–6
                    multi_prompt shots (each 1–12 s, total ≤ 15 s); (3)
                    otherwise omit multi_prompt; (4) for image-to-video
                    single-shot, aspect_ratio must be "auto".
                  oneOf:
                    - title: Single First Frame
                      type: object
                      required:
                        - prompt
                        - image_urls
                      properties:
                        prompt:
                          type: string
                          maxLength: 3072
                          pattern: ^.*\S.*$
                          description: >-
                            Video description. It must not be empty after
                            leading and trailing whitespace is removed. Maximum
                            length: 3,072 characters.
                          examples:
                            - >-
                              A happy golden retriever running across a grassy
                              field
                        image_urls:
                          type: array
                          description: >-
                            Array of first-frame image URLs. Exactly 1 image is
                            required. HTTP, HTTPS, and OSS URLs are supported.
                            Images must be in JPG, JPEG, or PNG format; each
                            file must not exceed 50 MB; both width and height
                            must be at least 300 px; and the aspect ratio must
                            be between 0.4 and 2.5.
                          minItems: 1
                          maxItems: 1
                          items:
                            type: string
                            format: uri
                            pattern: ^(https?|oss)://
                            examples:
                              - https://example.com/first-frame.jpg
                          examples:
                            - - https://example.com/first-frame.jpg
                        duration:
                          type: integer
                          description: >-
                            Total video duration in seconds. Optional; the
                            default is 5 seconds. Supports integer values from 3
                            to 15.
                          enum:
                            - 3
                            - 4
                            - 5
                            - 6
                            - 7
                            - 8
                            - 9
                            - 10
                            - 11
                            - 12
                            - 13
                            - 14
                            - 15
                          default: 5
                          minimum: 3
                          maximum: 15
                          examples:
                            - 5
                        resolution:
                          type: string
                          description: >-
                            Video resolution. `720p` outputs a 720p video,
                            `1080p` outputs a 1080p video, and `4k` outputs a 4K
                            video.
                          enum:
                            - 720p
                            - 1080p
                            - 4k
                          default: 720p
                          x-apidog-enum:
                            - value: 720p
                              name: ''
                              description: ''
                            - value: 1080p
                              name: ''
                              description: ''
                            - value: 4k
                              name: ''
                              description: ''
                          examples:
                            - 720p
                        aspect_ratio:
                          type: string
                          description: >-
                            Video aspect ratio. `16:9`, `9:16`, and `1:1` can be
                            selected only when custom multi-shot mode is enabled
                            through `customize_multi_shots`; otherwise, use
                            `auto`.
                          enum:
                            - '16:9'
                            - '9:16'
                            - '1:1'
                            - auto
                          default: auto
                          x-apidog-enum:
                            - value: '16:9'
                              name: ''
                              description: ''
                            - value: '9:16'
                              name: ''
                              description: ''
                            - value: '1:1'
                              name: ''
                              description: ''
                            - value: auto
                              name: ''
                              description: ''
                          examples:
                            - auto
                        audio:
                          type: boolean
                          description: >-
                            Whether to enable audio. Passing this value
                            explicitly is recommended. `true` enables audio;
                            `false` disables audio.
                          examples:
                            - false
                        customize_multi_shots:
                          type: boolean
                          description: >-
                            Optional, default false. Set true for custom
                            multi-shot (multi_prompt required).
                          examples:
                            - true
                          default: false
                        prefer_multi_shots:
                          type: boolean
                          description: >-
                            Whether to enable intelligent shot planning. This
                            field is mutually exclusive with
                            `customize_multi_shots`.
                          examples:
                            - true
                        multi_prompt:
                          type: array
                          description: >-
                            List of custom shots. When
                            `customize_multi_shots=true`, this field is required
                            and may contain up to 6 shots. When
                            `customize_multi_shots=false`, it must be an empty
                            array or omitted.
                          minItems: 1
                          maxItems: 6
                          items:
                            type: object
                            required:
                              - duration
                              - prompt
                            properties:
                              duration:
                                type: integer
                                description: >-
                                  Duration of this shot in seconds, 1–12. The
                                  sum of all shots must not exceed 15.
                                minimum: 1
                                maximum: 12
                                examples:
                                  - 2
                              prompt:
                                type: string
                                description: >-
                                  Video description for the current shot.
                                  Maximum length: 512 characters.
                                minLength: 1
                                maxLength: 512
                                examples:
                                  - >-
                                    A wide shot of the fox entering the snowy
                                    forest.
                            x-apidog-orders:
                              - duration
                              - prompt
                            x-apidog-ignore-properties: []
                          examples:
                            - - duration: 2
                                prompt: >-
                                  A wide shot of the fox entering the snowy
                                  forest.
                              - duration: 3
                                prompt: >-
                                  A wide shot of the fox entering the snowy
                                  forest.
                        elements:
                          type: array
                          description: >-
                            List of one-time subject assets. The default is an
                            empty array, with up to 3 subjects. The subject is
                            automatically identified as a multi-image subject or
                            video character subject based on
                            `element_input_urls`.
                          maxItems: 3
                          default: []
                          items:
                            type: object
                            required:
                              - name
                              - description
                              - element_input_urls
                            properties:
                              name:
                                type: string
                                description: >-
                                  Subject name. It must be unique within the
                                  same request and can be referenced in the
                                  prompt using `@name`.
                                examples:
                                  - element_dog
                              description:
                                type: string
                                description: Subject description.
                                examples:
                                  - A happy golden retriever
                              element_input_urls:
                                type: array
                                description: >-
                                  For a multi-image subject, provide 2 to 4
                                  images. For a video character subject, provide
                                  exactly 1 video. Images and videos cannot be
                                  mixed. HTTP, HTTPS, and OSS URLs are
                                  supported.
                                minItems: 1
                                maxItems: 4
                                items:
                                  type: string
                                  format: uri
                                  pattern: ^(https?|oss)://
                                examples:
                                  - - https://example.com/dog-front.png
                                    - https://example.com/dog-side.png
                              element_input_audio_urls:
                                type: array
                                description: >-
                                  Optional list of subject reference audio URLs.
                                  It may be omitted or passed as an empty array.
                                  If the audio duration can be determined, it
                                  must be between 5 and 30 seconds.
                                default: []
                                items:
                                  type: string
                                  format: uri
                                  pattern: ^(https?|oss)://
                                examples:
                                  - []
                              start_time:
                                type: integer
                                description: >-
                                  Start time for trimming the video character
                                  subject, in milliseconds. The default is 0.
                                  This applies only when a video is provided in
                                  `element_input_urls`.
                                default: 0
                                minimum: 0
                                examples:
                                  - 0
                              end_time:
                                type: integer
                                description: >-
                                  End time for trimming the video character
                                  subject, in milliseconds. The default is
                                  8,000. It must be greater than `start_time`,
                                  and the trimmed duration must be between 3,000
                                  and 8,000 milliseconds.
                                default: 8000
                                minimum: 3000
                                examples:
                                  - 8000
                            x-apidog-orders:
                              - name
                              - description
                              - element_input_urls
                              - element_input_audio_urls
                              - start_time
                              - end_time
                            x-apidog-ignore-properties: []
                      allOf:
                        - type: string
                        - type: string
                        - type: string
                      additionalProperties: false
                      x-apidog-orders:
                        - prompt
                        - image_urls
                        - duration
                        - resolution
                        - aspect_ratio
                        - audio
                        - customize_multi_shots
                        - prefer_multi_shots
                        - multi_prompt
                        - elements
                      x-apidog-ignore-properties: []
                    - title: First and Last Frames
                      type: object
                      required:
                        - prompt
                        - image_urls
                      properties:
                        prompt:
                          type: string
                          maxLength: 3072
                          pattern: ^.*\S.*$
                          description: >-
                            Video description. It must not be empty after
                            leading and trailing whitespace is removed. Maximum
                            length: 3,072 characters.
                          examples:
                            - >-
                              A happy golden retriever running across a grassy
                              field
                        image_urls:
                          type: array
                          description: >-
                            Array of first-frame and last-frame image URLs.
                            Exactly 2 images are required: index 0 is the first
                            frame and index 1 is the last frame. HTTP, HTTPS,
                            and OSS URLs are supported. Images must be in JPG,
                            JPEG, or PNG format; each file must not exceed 50
                            MB; both width and height must be at least 300 px;
                            and the aspect ratio must be between 0.4 and 2.5.
                          minItems: 2
                          maxItems: 2
                          items:
                            type: string
                            format: uri
                            pattern: ^(https?|oss)://
                          examples:
                            - - https://example.com/first-frame.jpg
                              - https://example.com/last-frame.jpg
                        duration:
                          type: integer
                          description: >-
                            Total video duration in seconds. Optional; the
                            default is 5 seconds. Supports integer values from 3
                            to 15.
                          enum:
                            - 3
                            - 4
                            - 5
                            - 6
                            - 7
                            - 8
                            - 9
                            - 10
                            - 11
                            - 12
                            - 13
                            - 14
                            - 15
                          default: 5
                          minimum: 3
                          maximum: 15
                          examples:
                            - 5
                        resolution:
                          type: string
                          description: >-
                            Video resolution. `720p` outputs a 720p video,
                            `1080p` outputs a 1080p video, and `4k` outputs a 4K
                            video.
                          enum:
                            - 720p
                            - 1080p
                            - 4k
                          default: 720p
                          x-apidog-enum:
                            - value: 720p
                              name: ''
                              description: ''
                            - value: 1080p
                              name: ''
                              description: ''
                            - value: 4k
                              name: ''
                              description: ''
                          examples:
                            - 720p
                        aspect_ratio:
                          type: string
                          description: >-
                            Video aspect ratio. `16:9`, `9:16`, and `1:1` can be
                            selected only when custom multi-shot mode is enabled
                            through `customize_multi_shots`; otherwise, use
                            `auto`.
                          enum:
                            - '16:9'
                            - '9:16'
                            - '1:1'
                            - auto
                          default: auto
                          x-apidog-enum:
                            - value: '16:9'
                              name: ''
                              description: ''
                            - value: '9:16'
                              name: ''
                              description: ''
                            - value: '1:1'
                              name: ''
                              description: ''
                            - value: auto
                              name: ''
                              description: ''
                          examples:
                            - auto
                        audio:
                          type: boolean
                          description: >-
                            Whether to enable audio. `true` enables audio;
                            `false` disables audio.
                          examples:
                            - false
                        customize_multi_shots:
                          type: boolean
                          description: >-
                            Optional, default false. Set true for custom
                            multi-shot (multi_prompt required).
                          default: false
                          examples:
                            - false
                        prefer_multi_shots:
                          type: boolean
                          description: >-
                            Whether to enable intelligent shot planning. This
                            field is mutually exclusive with
                            `customize_multi_shots`.
                          examples:
                            - true
                        multi_prompt:
                          type: array
                          description: >-
                            List of custom shots. When
                            `customize_multi_shots=true`, this field is required
                            and may contain up to 6 shots. When
                            `customize_multi_shots=false`, it must be an empty
                            array or omitted.
                          minItems: 1
                          maxItems: 6
                          items:
                            type: object
                            required:
                              - duration
                              - prompt
                            properties:
                              duration:
                                type: integer
                                description: >-
                                  Duration of this shot in seconds, 1–12. The
                                  sum of all shots must not exceed 15.
                                minimum: 1
                                maximum: 12
                                examples:
                                  - 2
                              prompt:
                                type: string
                                description: >-
                                  Video description for the current shot.
                                  Maximum length: 512 characters.
                                minLength: 1
                                maxLength: 512
                                examples:
                                  - >-
                                    A wide shot of the fox entering the snowy
                                    forest.
                            x-apidog-orders:
                              - duration
                              - prompt
                            x-apidog-ignore-properties: []
                          examples:
                            - - duration: 2
                                prompt: >-
                                  A wide shot of the fox entering the snowy
                                  forest.
                              - duration: 3
                                prompt: >-
                                  A wide shot of the fox entering the snowy
                                  forest.
                        elements:
                          type: array
                          description: >-
                            List of one-time subject assets. The default is an
                            empty array, with up to 3 subjects.
                          maxItems: 3
                          default: []
                          items:
                            type: object
                            required:
                              - name
                              - description
                              - element_input_urls
                            properties:
                              name:
                                type: string
                                description: Subject name.
                                examples:
                                  - element_dog
                              description:
                                type: string
                                description: Subject description.
                                examples:
                                  - A happy golden retriever
                              element_input_urls:
                                type: array
                                description: >-
                                  For a multi-image subject, provide 2 to 4
                                  images. For a video character subject, provide
                                  exactly 1 video. Images and videos cannot be
                                  mixed. HTTP, HTTPS, and OSS URLs are
                                  supported.
                                minItems: 1
                                maxItems: 4
                                items:
                                  type: string
                                  format: uri
                                  pattern: ^(https?|oss)://
                                examples:
                                  - - https://example.com/dog-front.png
                                    - https://example.com/dog-side.png
                              element_input_audio_urls:
                                type: array
                                description: Optional list of subject reference audio URLs.
                                default: []
                                items:
                                  type: string
                                  format: uri
                                  pattern: ^(https?|oss)://
                                examples:
                                  - []
                              start_time:
                                type: integer
                                description: >-
                                  Start time for trimming the video character
                                  subject, in milliseconds. The default is 0.
                                default: 0
                              end_time:
                                type: integer
                                description: >-
                                  End time for trimming the video character
                                  subject, in milliseconds. The default is
                                  8,000.
                                default: 8000
                            x-apidog-orders:
                              - name
                              - description
                              - element_input_urls
                              - element_input_audio_urls
                              - start_time
                              - end_time
                            x-apidog-ignore-properties: []
                      allOf:
                        - type: string
                        - type: string
                        - type: string
                      additionalProperties: false
                      x-apidog-orders:
                        - prompt
                        - image_urls
                        - duration
                        - resolution
                        - aspect_ratio
                        - audio
                        - customize_multi_shots
                        - prefer_multi_shots
                        - multi_prompt
                        - elements
                      x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              examples:
                - model: kling-3.0-omni/image-to-video
                  callBackUrl: https://your-domain.com/api/callback
                  input:
                    prompt: A happy golden retriever running across a grassy field
                    image_urls:
                      - https://example.com/first-frame.jpg
                    customize_multi_shots: false
                    audio: false
                    resolution: 720p
                    aspect_ratio: auto
                    duration: 5
                    elements: []
                - model: kling-3.0-omni/image-to-video
                  callBackUrl: https://your-domain.com/api/callback
                  input:
                    prompt: A happy golden retriever running across a grassy field
                    image_urls:
                      - https://example.com/first-frame.jpg
                      - https://example.com/last-frame.jpg
                    customize_multi_shots: false
                    audio: false
                    resolution: 720p
                    aspect_ratio: auto
                    duration: 5
                    elements: []
              x-apidog-ignore-properties: []
            examples: {}
      responses:
        '200':
          description: Request Successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
              example:
                code: 200
                msg: success
                data:
                  taskId: task_kling-2.6_1765182425861
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
                The system sends this callback when the
                `kling-3.0-omni/image-to-video` task succeeds or fails.
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
                                - kling-3.0-omni/image-to-video
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
                            model: kling-3.0-omni/image-to-video
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"A happy golden retriever
                              running across a grassy
                              field\",\"image_urls\":[\"https://example.com/first-frame.jpg\"],\"customize_multi_shots\":false,\"audio\":false,\"resolution\":\"720p\",\"aspect_ratio\":\"auto\",\"duration\":5,\"elements\":[]}","callBackUrl":"https://example.com/callback","model":"kling-3.0-omni/image-to-video"}
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
                            model: kling-3.0-omni/image-to-video
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"A happy golden retriever
                              running across a grassy
                              field\",\"image_urls\":[\"https://example.com/first-frame.jpg\"],\"customize_multi_shots\":false,\"audio\":false,\"resolution\":\"720p\",\"aspect_ratio\":\"auto\",\"duration\":5,\"elements\":[]}","callBackUrl":"https://example.com/callback","model":"kling-3.0-omni/image-to-video"}
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
      x-apidog-folder: docs/en/Market/Video Models/Kling
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-41795697-run
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
