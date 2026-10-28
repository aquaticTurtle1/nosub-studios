# MiniMax H3 Text-to-Video

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
      summary: MiniMax H3 Text-to-Video
      deprecated: false
      description: >-
        Output videos include a stereo audio track generated with the video;
        dialogue, music and sound effects can be described in the prompt. Audio
        cannot be turned off.


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
      operationId: minimax-h3-text-to-video
      tags:
        - docs/en/Market/Video Models/MiniMax H3
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
                    The name of the model used for the generation task. Used for
                    MiniMax H3 text-to-video.
                  enum:
                    - minimax-h3/text-to-video
                  default: minimax-h3/text-to-video
                  x-apidog-enum:
                    - value: minimax-h3/text-to-video
                      name: ''
                      description: ''
                callBackUrl:
                  type: string
                  description: The callback URL after the task is completed.
                  format: uri
                input:
                  type: object
                  required:
                    - prompt
                    - aspect_ratio
                    - duration
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Video generation prompt, length is between 1 and 7000
                        characters.
                      minLength: 1
                      maxLength: 7000
                      examples:
                        - >-
                          A cat walking slowly on the beach at sunset, cinematic
                          shot, waves gently lapping the shore
                    aspect_ratio:
                      type: string
                      description: >-
                        Video aspect ratio. Required for text-to-video, adaptive
                        is not supported.
                      enum:
                        - '21:9'
                        - '16:9'
                        - '4:3'
                        - '1:1'
                        - '3:4'
                        - '9:16'
                      x-apidog-enum:
                        - value: '21:9'
                          name: ''
                          description: ''
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
                    duration:
                      type: integer
                      description: >-
                        Generated video duration, supports integer values from 4
                        to 15 seconds.
                      enum:
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
                      default: 6
                      minimum: 4
                      maximum: 15
                      examples:
                        - 6
                    resolution:
                      type: string
                      description: Video resolution.
                      enum:
                        - 768P
                        - 2K
                      x-apidog-enum:
                        - value: 768P
                          name: ''
                          description: ''
                        - value: 2K
                          name: ''
                          description: ''
                      default: 2K
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - duration
                    - resolution
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              examples:
                - model: minimax-h3/text-to-video
                  callBackUrl: https://example.com/callback
                  input:
                    prompt: >-
                      A cat walking slowly on the beach at sunset, cinematic
                      shot
                    aspect_ratio: '16:9'
                    duration: 6
              x-apidog-ignore-properties: []
            examples: {}
      responses:
        '200':
          description: success
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
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the
                `minimax-h3/text-to-video` task succeeds or fails.
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
                                - minimax-h3/text-to-video
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
                            model: minimax-h3/text-to-video
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"A cat walking slowly on
                              the beach at sunset, cinematic
                              shot\",\"aspect_ratio\":\"16:9\",\"duration\":6}","callBackUrl":"https://example.com/callback","model":"minimax-h3/text-to-video"}
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
                            model: minimax-h3/text-to-video
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"A cat walking slowly on
                              the beach at sunset, cinematic
                              shot\",\"aspect_ratio\":\"16:9\",\"duration\":6}","callBackUrl":"https://example.com/callback","model":"minimax-h3/text-to-video"}
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
      x-apidog-folder: docs/en/Market/Video Models/MiniMax H3
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-41000884-run
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
