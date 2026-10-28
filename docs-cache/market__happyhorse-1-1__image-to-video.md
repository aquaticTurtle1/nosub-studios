# HappyHorse-1-1 image-to-video

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
      summary: HappyHorse-1-1 image-to-video
      deprecated: false
      description: >-

        ## Query Task Status

        After submitting the task, you can check the progress of the task and
        obtain the generated results through the unified query endpoint: 

        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
         Learn how to check the task status and obtain the generated results 
        </Card> 


        ::: tip[]

        In the production environment, it is recommended to use the
        "callBackUrl" parameter to receive the automatic notification upon
        completion of the generation, rather than polling the status endpoint. 

        :::


        Related resources

        <CardGroup cols={2}>
          <Card title="Market Overview" icon="lucide-store" href="/market/quickstart"> View all available models </Card>
          <Card title="General API" icon="lucide-cog" href="/common-api/get-account-credits"> View account credits and usage </Card>
        </CardGroup>
      operationId: playground_252
      tags:
        - docs/en/Market/Video Models/HappyHorse
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
                    - happyhorse-1-1/image-to-video
                  default: happyhorse-1-1/image-to-video
                  description: >-
                    The model name used for generation. This endpoint must use
                    `happyhorse-1-1/image-to-video`.
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
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Describes the video content to generate. Supports any
                        language. Maximum: 5,000 non-Chinese characters or 2,500
                        Chinese
                      maxLength: 5000
                      default: ''
                      examples:
                        - ''
                    image_urls:
                      type: array
                      items:
                        type: string
                        format: uri
                      description: >-
                        The URL of the first frame image. 

                        Image constraints: 

                        1. Formats: JPEG, JPG, PNG, WEBP. 

                        2. Resolution: Width and height must both be at least
                        300 pixels. 

                        3. Aspect ratio: Between 1:2.5 and 2.5:1. 

                        4. File size: Up to 20 MB.
                      maxItems: 1
                      examples:
                        - - >-
                            https://static.aiquickdraw.com/tools/example/1782114387854_IufKnPxR.png
                    resolution:
                      type: string
                      enum:
                        - 720p
                        - 1080p
                      description: >-
                        The resolution of the generated video.

                        Options: 720p; 1080p

                        The output keeps the aspect ratio of the input image;
                        720p / 1080p set the resolution tier.
                      default: 1080p
                      examples:
                        - 1080p
                    duration:
                      type: number
                      description: >-
                        The duration of the generated video, in seconds.  The
                        value must be an integer in the range [3, 15]. Default:
                        5
                      minimum: 3
                      maximum: 15
                      multipleOf: 1
                      default: 5
                      examples:
                        - 5
                  required:
                    - image_urls
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - resolution
                    - duration
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: happyhorse-1-1/image-to-video
              callBackUrl: https://your-domain.com/api/callback
              input:
                image_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/1782114387854_IufKnPxR.png
                prompt: A cat running on the grass
                resolution: 1080p
                duration: 5
      responses:
        '200':
          description: Request Successful
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
                      - 01KVQ4XDW4JED4JP570Q3RYR1D
                    required:
                      - data
                    x-apidog-refs:
                      01KVQ4XDW4JED4JP570Q3RYR1D:
                        $ref: '#/components/schemas/response%20not%20with%20recordId'
                    x-apidog-ignore-properties:
                      - code
                      - msg
                      - data
              example:
                code: 200
                msg: success
                data:
                  taskId: task_252_abc123
          headers: {}
          x-apidog-name: ''
      security:
        - BearerAuth: []
          x-apidog:
            schemeGroups:
              - id: ifvrQegtvClZy-mqqr4HP
                schemeIds:
                  - BearerAuth
            required: true
            use:
              id: ifvrQegtvClZy-mqqr4HP
            scopes:
              ifvrQegtvClZy-mqqr4HP:
                undefined: []
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the
                `happyhorse-1-1/image-to-video` task succeeds or fails.
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
                                - happyhorse-1-1/image-to-video
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
                            model: happyhorse-1-1/image-to-video
                            state: success
                            param: >-
                              {"input":"{\"image_urls\":[\"https://example.com/input-image.jpg\"],\"prompt\":\"A
                              cat running on the
                              grass\",\"resolution\":\"1080p\",\"duration\":5}","callBackUrl":"https://example.com/callback","model":"happyhorse-1-1/image-to-video"}
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
                            model: happyhorse-1-1/image-to-video
                            state: fail
                            param: >-
                              {"input":"{\"image_urls\":[\"https://example.com/input-image.jpg\"],\"prompt\":\"A
                              cat running on the
                              grass\",\"resolution\":\"1080p\",\"duration\":5}","callBackUrl":"https://example.com/callback","model":"happyhorse-1-1/image-to-video"}
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
      x-apidog-folder: docs/en/Market/Video Models/HappyHorse
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-38307880-run
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
