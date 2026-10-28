# PixVerse V6 Text-to-Video

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
      summary: PixVerse V6 Text-to-Video
      deprecated: false
      description: >-
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


        :::tip

        Enabling audio costs more. For current prices, see
        [kie.ai/pricing](https://kie.ai/pricing).

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
      operationId: pixverse-v6-text-to-video
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
                    field.
                  enum:
                    - pixverse-v6/text-to-video
                  default: pixverse-v6/text-to-video
                  x-apidog-enum:
                    - value: pixverse-v6/text-to-video
                      name: ''
                      description: ''
                  examples:
                    - pixverse-v6/text-to-video
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
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Generate prompt, cannot be empty, length is limited to
                        3-5000 characters.
                      minLength: 3
                      maxLength: 5000
                      examples:
                        - >-
                          A cinematic sunrise illuminates a mist-shrouded
                          mountain lake; the camera slowly sweeps across the
                          water's surface as a flock of birds flies overhead.
                    aspect_ratio:
                      type: string
                      description: >-
                        Required. Output video aspect ratio. This parameter is
                        supported in text-to-video and Fusion multi-reference
                        image-to-video modes.
                      enum:
                        - '16:9'
                        - '4:3'
                        - '1:1'
                        - '3:4'
                        - '9:16'
                        - '2:3'
                        - '3:2'
                        - '21:9'
                      x-apidog-enum:
                        - value: '16:9'
                          name: ''
                          description: ''
                        - value: '4:3'
                          name: ''
                          description: ''
                        - value: '1:1'
                          name: ''
                          description: ''
                        - value: '3:4'
                          name: ''
                          description: ''
                        - value: '9:16'
                          name: ''
                          description: ''
                        - value: '2:3'
                          name: ''
                          description: ''
                        - value: '3:2'
                          name: ''
                          description: ''
                        - value: '21:9'
                          name: ''
                          description: ''
                      examples:
                        - '16:9'
                    quality:
                      type: string
                      description: >-
                        Required. Output video resolution. Supports 360p, 540p,
                        720p, and 1080p.
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
                        supports 1–15 seconds.
                      minimum: 1
                      maximum: 15
                      examples:
                        - 5
                    generate_audio_switch:
                      type: boolean
                      description: >-
                        Whether to generate audio synchronized with the video
                        content. 
                      default: false
                      examples:
                        - false
                    generate_multi_clip_switch:
                      type: boolean
                      description: 'Whether to generate a multi-clip video. '
                      default: false
                      examples:
                        - false
                    seed:
                      type: integer
                      description: >-
                        Random seed, value range is 0–2147483647. Using the same
                        parameters and seed helps improve result
                        reproducibility.
                      minimum: 0
                      maximum: 2147483647
                      examples:
                        - 123456789
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - quality
                    - duration
                    - generate_audio_switch
                    - generate_multi_clip_switch
                    - seed
                  required:
                    - prompt
                    - aspect_ratio
                    - quality
                    - duration
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: pixverse-v6/text-to-video
              input:
                prompt: >-
                  A cinematic aerial shot of a futuristic coastal city at
                  sunrise, smooth camera movement
                duration: 5
                quality: 720p
                aspect_ratio: '16:9'
                generate_audio_switch: false
                generate_multi_clip_switch: false
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
              - id: e5011825f4be4df6ad511
                schemeIds:
                  - BearerAuth
            required: true
            use:
              id: e5011825f4be4df6ad511
            scopes:
              e5011825f4be4df6ad511:
                undefined: []
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the
                `pixverse-v6/text-to-video` task succeeds or fails.
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
                                - pixverse-v6/text-to-video
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
                            model: pixverse-v6/text-to-video
                            state: success
                            param: >-
                              {"input":"{}","callBackUrl":"https://example.com/callback","model":"pixverse-v6/text-to-video"}
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
                            model: pixverse-v6/text-to-video
                            state: fail
                            param: >-
                              {"input":"{}","callBackUrl":"https://example.com/callback","model":"pixverse-v6/text-to-video"}
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
      x-apidog-folder: docs/en/Market/Video Models/PixVerse
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-40433689-run
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
