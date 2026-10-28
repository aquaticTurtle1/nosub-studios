# Vidu Q4 Reference To Video

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
      summary: Vidu Q4 Reference To Video
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
      operationId: vidu-q4-reference-to-video
      tags:
        - docs/en/Market/Video Models/Vidu
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
                    - vidu-q4/reference-to-video
                  default: vidu-q4/reference-to-video
                  description: >-
                    The model name used for generation. This endpoint must use
                    `vidu-q4/reference-to-video`.
                callBackUrl:
                  type: string
                  format: uri
                  examples:
                    - https://your-domain.com/api/callback
                  description: >-
                    The URL to receive generation task completion updates.
                    Optional but recommended for production use. The system
                    POSTs the task status and results to this URL when
                    generation completes.
                input:
                  type: object
                  additionalProperties: false
                  description: Input parameters for the generation task.
                  properties:
                    prompt:
                      type: string
                      minLength: 1
                      maxLength: 20000
                      description: >-
                        Text description of the video. Refer to inputs by order,
                        e.g. "the man in reference image 2 says ... using
                        reference audio 1". Up to 20,000 characters.
                    duration:
                      type: integer
                      minimum: 3
                      maximum: 16
                      default: 5
                      description: 'Video length in seconds. Integer from 3 to 16. '
                    resolution:
                      type: string
                      enum:
                        - 540p
                        - 720p
                        - 1080p
                        - 2k
                        - 4k
                      default: 720p
                      description: 'Output resolution. '
                    audio:
                      type: boolean
                      default: true
                      description: >-
                        Generate synchronized audio (dialogue and sound
                        effects). Set false for a silent video.
                    reference_image_urls:
                      type: array
                      minItems: 1
                      maxItems: 15
                      items:
                        type: string
                        pattern: ^https?://.+
                      description: >-
                        Reference image URLs (http/https), 1 to 15. JPG, JPEG,
                        PNG or WEBP.
                    reference_audio_urls:
                      type: array
                      maxItems: 3
                      items:
                        type: string
                        pattern: ^https?://.+
                      description: >-
                        Optional reference audio URLs (http/https), up to 3. MP3
                        only, each 3-12 seconds and up to 50 MB.
                    aspect_ratio:
                      type: string
                      enum:
                        - '16:9'
                        - '9:16'
                        - '1:1'
                        - '4:3'
                        - '3:4'
                      default: '16:9'
                      description: Output aspect ratio.
                  required:
                    - prompt
                    - reference_image_urls
                  x-apidog-orders:
                    - prompt
                    - duration
                    - resolution
                    - audio
                    - reference_image_urls
                    - reference_audio_urls
                    - aspect_ratio
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: vidu-q4/reference-to-video
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  In the scene of reference image 1, the person in reference
                  image 2 turns to the person in reference image 3 and says:
                  "What are you doing?"
                reference_image_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/vidu-q4-ref-1.png
                  - >-
                    https://static.aiquickdraw.com/tools/example/vidu-q4-ref-2.png
                  - >-
                    https://static.aiquickdraw.com/tools/example/vidu-q4-ref-3.png
                duration: 5
                resolution: 1080p
                aspect_ratio: '16:9'
                audio: true
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    enum:
                      - 200
                      - 400
                      - 401
                      - 402
                      - 404
                      - 422
                      - 429
                      - 455
                      - 500
                      - 501
                      - 505
                    description: >-
                      Status code of the request. The HTTP status is 200 even
                      when the request fails, so always check this field: 200
                      means success; any other value means the request failed
                      and msg describes the reason. Common values: 401 invalid
                      or missing API key; 402 insufficient credits; 429 rate
                      limit exceeded; 422 or 500 the request could not be
                      processed (read msg and check your parameters before
                      retrying).
                  msg:
                    type: string
                    description: Error message when code != 200
                    examples:
                      - success
                  data:
                    type: object
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Task ID, can be used with [Get Task
                          Details](/market/common/get-task-detail) endpoint to
                          query task status
                        examples:
                          - task_abcdef123456
                    x-apidog-orders:
                      - taskId
                    x-apidog-ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: task_abcdef123456
          headers: {}
          x-apidog-name: success
        '500':
          description: Server error.
          content:
            application/json:
              schema:
                type: object
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

                      - **408**: Timeout - No result has been returned for over
                      10 minutes.

                      - **422**: Validation Error - The request parameters
                      failed validation checks

                      - **429**: Rate Limited - Request limit has been exceeded
                      for this resource

                      - **455**: Service Unavailable - System is currently
                      undergoing maintenance

                      - **500**: Server Error - An unexpected error occurred
                      while processing the request

                      - **501**: Generation Failed - Content generation task
                      failed

                      - **505**: Feature Disabled - The requested feature is
                      currently disabled
                  msg:
                    type: string
                    description: Response message, error description when failed
                  data:
                    type: object
                    properties: {}
                    x-apidog-orders: []
                    x-apidog-ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                required:
                  - code
                  - msg
                  - data
                x-apidog-ignore-properties: []
              example:
                code: 500
                msg: >-
                  Server Error - An unexpected error occurred while processing
                  the request
                data: null
          headers: {}
          x-apidog-name: Error
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
          '{$request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the
                `vidu-q4/reference-to-video` task succeeds or fails.
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
                          enum:
                            - 200
                            - 501
                          description: >-
                            Unified callback code: 200 for success, 501 for
                            failure.
                        msg:
                          type: string
                          description: Unified callback message.
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
                              enum:
                                - vidu-q4/reference-to-video
                              description: The model used for the task.
                            state:
                              type: string
                              enum:
                                - success
                                - fail
                              description: Terminal task state.
                            param:
                              type: string
                              description: >-
                                JSON string containing the submitted task
                                parameters.
                            resultJson:
                              type:
                                - string
                                - 'null'
                              description: >-
                                JSON string containing resultUrls when
                                successful. Present only when state is success.
                            failCode:
                              type:
                                - string
                                - 'null'
                              description: Failure code. Present only when state is fail.
                            failMsg:
                              type:
                                - string
                                - 'null'
                              description: Failure reason. Present only when state is fail.
                            costTime:
                              type: integer
                              format: int64
                              description: Processing time in seconds.
                            completeTime:
                              type: integer
                              format: int64
                              description: Task completion timestamp.
                            createTime:
                              type: integer
                              format: int64
                              description: Task creation timestamp.
              responses:
                '200':
                  description: Return 200 to acknowledge.
      x-apidog-folder: docs/en/Market/Video Models/Vidu
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-45127146-run
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
