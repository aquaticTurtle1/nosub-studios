# Kling 3.0 Omni Text to Video

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
      summary: Kling 3.0 Omni Text to Video
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
      operationId: kling-3.0-omni-text-to-video
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
                - input
              properties:
                model:
                  type: string
                  enum:
                    - kling-3.0-omni/text-to-video
                  default: kling-3.0-omni/text-to-video
                  description: >-
                    The name of the model used to generate the task. This field
                    is required.


                    - This endpoint requires the `kling-3.0-omni/text-to-video`
                    model
                  examples:
                    - kling-3.0-omni/text-to-video
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
                  description: >-
                    Input parameter configuration for the generation task.
                    Rules: (1) customize_multi_shots and prefer_multi_shots
                    cannot both be true; (2) customize_multi_shots = true
                    requires 1–6 multi_prompt shots (each 1–12 s, total ≤ 15 s);
                    (3) otherwise omit multi_prompt.
                  required:
                    - prompt
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Text description of the video. It must not be empty
                        after leading and trailing whitespace is removed, and
                        must not exceed 3,072 characters.
                      minLength: 1
                      maxLength: 3072
                    customize_multi_shots:
                      type: boolean
                      description: >-
                        Optional, default false. Set true for custom multi-shot
                        (multi_prompt required).
                      default: false
                      examples:
                        - true
                    prefer_multi_shots:
                      type: boolean
                      description: >-
                        Whether to enable intelligent shot planning. This field
                        is mutually exclusive with `customize_multi_shots`.


                        Both fields may be `false`, but they cannot both be
                        `true`.
                      examples:
                        - true
                    multi_prompt:
                      type: array
                      description: >-
                        List of custom shots. When `customize_multi_shots` is
                        `true`, this field is required, must not be empty, and
                        supports up to 6 shots. When `customize_multi_shots` is
                        `false`, it must be an empty array or omitted.
                      maxItems: 6
                      default: []
                      items:
                        type: object
                        required:
                          - prompt
                          - duration
                        properties:
                          prompt:
                            type: string
                            description: >-
                              Video description for the current shot. Maximum
                              length: 512 characters.
                            minLength: 1
                            maxLength: 512
                            examples:
                              - >-
                                A wide shot of the fox entering the snowy
                                forest.
                          duration:
                            type: integer
                            description: >-
                              Duration of this shot in seconds, 1–12. The sum of
                              all shots must not exceed 15.
                            minimum: 1
                            maximum: 12
                            examples:
                              - 2
                        x-apidog-orders:
                          - prompt
                          - duration
                        x-apidog-ignore-properties: []
                      examples:
                        - - prompt: A wide shot of the fox entering the snowy forest.
                            duration: 2
                          - prompt: >-
                              A cinematic close-up of the fox looking toward the
                              sunrise.
                            duration: 3
                    elements:
                      type: array
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
                              Subject name. It must be unique within the same
                              request and can be referenced in the `prompt`
                              field using `@name`.
                            minLength: 1
                            examples:
                              - element_dog
                          description:
                            type: string
                            description: Text description of the subject asset.
                            minLength: 1
                            examples:
                              - A happy golden retriever
                          element_input_urls:
                            type: array
                            description: >-
                              List of image URLs for a multi-image subject
                              (provide 2 to 4 images), or a video URL for a
                              video character subject (provide exactly 1 video).
                              Images and videos cannot be mixed. HTTP, HTTPS,
                              and OSS URLs are supported.
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
                              Optional list of subject audio asset URLs. HTTP,
                              HTTPS, and OSS URLs are supported.
                            default: []
                            items:
                              type: string
                              format: uri
                              pattern: ^(https?|oss)://
                            examples:
                              - []
                        x-apidog-orders:
                          - name
                          - description
                          - element_input_urls
                          - element_input_audio_urls
                        x-apidog-ignore-properties: []
                      description: >-
                        List of one-time subject assets. The default is an empty
                        array.

                        When using only multi-image subjects, up to 7 subjects
                        can be uploaded.

                        When using only video character subjects, the number of
                        video character subjects must not exceed 3.

                        When using both video character and multi-image
                        subjects, the number of video character subjects must
                        not exceed 3, and the number of multi-image subjects
                        must not exceed 4.
                      default: []
                    audio:
                      type: boolean
                      description: >-
                        Whether to add audio to the generated video. `true`
                        enables audio; `false` disables audio.
                      default: false
                      examples:
                        - false
                    resolution:
                      type: string
                      description: >-
                        Resolution of the generated video. Available values are
                        `720p` (outputs a 720p video), `1080p` (outputs a 1080p
                        video), and `4k` (outputs a 4K video).
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
                        Aspect ratio of the generated video. Supported values
                        are `16:9`, `9:16`, and `1:1`.
                      enum:
                        - '16:9'
                        - '9:16'
                        - '1:1'
                      default: '16:9'
                      examples:
                        - '16:9'
                    duration:
                      type: integer
                      description: >-
                        Total video duration in seconds. The supported range is
                        3 to 15 seconds, and the default is 5 seconds.
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
                  allOf:
                    - type: string
                    - type: string
                    - type: string
                    - type: string
                  x-apidog-orders:
                    - prompt
                    - customize_multi_shots
                    - prefer_multi_shots
                    - multi_prompt
                    - elements
                    - audio
                    - resolution
                    - aspect_ratio
                    - duration
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              examples:
                - model: kling-3.0-omni/text-to-video
                  callBackUrl: https://your-domain.com/api/callback
                  input:
                    prompt: A wide shot of the fox entering the snowy forest.
                    customize_multi_shots: true
                    multi_prompt:
                      - prompt: A wide shot of the fox entering the snowy forest.
                        duration: 2
                      - prompt: >-
                          A cinematic close-up of the fox looking toward the
                          sunrise.
                        duration: 3
                    audio: false
                    resolution: 720p
                    aspect_ratio: '16:9'
                    duration: 5
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
                `kling-3.0-omni/text-to-video` task succeeds or fails.
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
                                - kling-3.0-omni/text-to-video
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
                            model: kling-3.0-omni/text-to-video
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"A wide shot of the fox
                              entering the snowy
                              forest.\",\"customize_multi_shots\":true,\"multi_prompt\":[{\"prompt\":\"A
                              wide shot of the fox entering the snowy
                              forest.\",\"duration\":2},{\"prompt\":\"A
                              cinematic close-up of the fox looking toward the
                              sunrise.\",\"duration\":3}],\"audio\":false,\"resolution\":\"720p\",\"aspect_ratio\":\"16:9\",\"duration\":5}","callBackUrl":"https://example.com/callback","model":"kling-3.0-omni/text-to-video"}
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
                            model: kling-3.0-omni/text-to-video
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"A wide shot of the fox
                              entering the snowy
                              forest.\",\"customize_multi_shots\":true,\"multi_prompt\":[{\"prompt\":\"A
                              wide shot of the fox entering the snowy
                              forest.\",\"duration\":2},{\"prompt\":\"A
                              cinematic close-up of the fox looking toward the
                              sunrise.\",\"duration\":3}],\"audio\":false,\"resolution\":\"720p\",\"aspect_ratio\":\"16:9\",\"duration\":5}","callBackUrl":"https://example.com/callback","model":"kling-3.0-omni/text-to-video"}
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-41795696-run
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
