# Kling 2.6 motion-control

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
      summary: Kling 2.6 motion-control
      deprecated: false
      description: >
        ## Overview


        The output may keep the audio track of the reference video.


        ## File Upload Requirements


        Before using the Motion Control API, you need to upload your image and
        video files:


        <Steps>

        <Step title="Upload Reference Image">
          Use the File Upload API to upload your reference image showing the subject.

          <Card title="File Upload API" icon="lucide-upload" href="/file-upload-api/quickstart">
            Learn how to upload images and get file URLs
          </Card>

          **Requirements:**
          - **File Type**: JPEG, PNG, or JPG format
          - **Max File Size**: 10MB per file
          - **Content**: Clear image showing the subject's head, shoulders, and torso
        </Step>


        <Step title="Upload Motion Video">
          Upload a video that defines the motion pattern you want to apply.

          **Requirements:**
          - **File Type**: MP4 or QuickTime format
          - **Duration**: Between 3-30 seconds per video
          - **Max File Size**: 100MB per file
          - **Content**: Video clearly showing the subject's head, shoulders, and torso
        </Step>


        <Step title="Get File URLs">
          After upload, you'll receive file URLs that you can use in the `input_urls` and `video_urls` parameters.
        </Step>

        </Steps>


        ::: warning[]

        - Supported image formats: JPEG, PNG, JPG (Max: 10MB)

        - Supported video formats: MP4, QuickTime (Max: 100MB, 3-30 seconds)

        - Videos must clearly show the subject's head, shoulders, and torso

        - Maximum one image and one video per request

        :::


        ## Query Task Status


        After submitting a task, use the unified query endpoint to check
        progress and retrieve results:


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          Learn how to query task status and retrieve generation results
        </Card>


        ::: tip[]

        For production use, we recommend using the `callBackUrl` parameter to
        receive automatic notifications when generation completes, rather than
        polling the status endpoint.

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Market Overview" icon="lucide-store" href="/market/quickstart">
            Explore all available models
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check credits and account usage
          </Card>
        </CardGroup>
      operationId: kling-2-6-motion-control
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
                    - kling-2.6/motion-control
                  default: kling-2.6/motion-control
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `kling-2.6/motion-control` for this endpoint
                  examples:
                    - kling-2.6/motion-control
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
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      description: >-
                        A text description of the desired output. Maximum length
                        is 2500 characters. (Max length: 2500 characters)
                      type: string
                      maxLength: 2500
                      examples:
                        - The cartoon character is dancing.
                    input_urls:
                      description: >-
                        An array containing a single image URL. The photo must
                        clearly show the subject's head, shoulders, and torso.
                        (File URL after upload, not file content; Accepted
                        types: image/jpeg, image/png, image/jpg; Max size:
                        10.0MB,size needs to be greater than 300px, aspect ratio
                        2:5 to 5:2.)
                      type: array
                      items:
                        type: string
                        format: uri
                      maxItems: 1
                      examples:
                        - - https://example.com/your-image.png
                    video_urls:
                      description: >-
                        An array containing a single video URL. The duration
                        must be between 3 to 30 seconds, and the video must
                        clearly show the subject's head, shoulders, and torso.
                        (File URL after upload, not file content; Accepted
                        types: video/mp4, video/quicktime; Max size: 100.0MB)
                      type: array
                      items:
                        type: string
                        format: uri
                      maxItems: 1
                      examples:
                        - - >-
                            https://static.aiquickdraw.com/tools/example/1767525918769_QyvTNib2.mp4
                    character_orientation:
                      description: >-
                        Required. Generate the orientation of the characters in
                        the video. 'image': same orientation as the person in
                        the picture (max 10s video). 'video': consistent with
                        the orientation of the characters in the video (max 30s
                        video).
                      type: string
                      enum:
                        - image
                        - video
                      examples:
                        - video
                    mode:
                      description: 'Required. Output resolution: "720p" or "1080p".'
                      type: string
                      enum:
                        - 720p
                        - 1080p
                      examples:
                        - 720p
                  required:
                    - input_urls
                    - video_urls
                    - character_orientation
                    - mode
                  x-apidog-orders:
                    - prompt
                    - input_urls
                    - video_urls
                    - character_orientation
                    - mode
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: kling-2.6/motion-control
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: The cartoon character is dancing.
                input_urls:
                  - https://example.com/your-image.png
                video_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/1767525918769_QyvTNib2.mp4
                mode: 720p
                character_orientation: image
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
                  taskId: task_kling-2.6_1767693973938
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
                `kling-2.6/motion-control` task succeeds or fails.
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
                                - kling-2.6/motion-control
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
                            model: kling-2.6/motion-control
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"The cartoon character is
                              dancing.\",\"input_urls\":[\"https://example.com/input-image.jpg\"],\"video_urls\":[\"https://example.com/input-video.mp4\"],\"mode\":\"720p\",\"character_orientation\":\"image\"}","callBackUrl":"https://example.com/callback","model":"kling-2.6/motion-control"}
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
                            model: kling-2.6/motion-control
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"The cartoon character is
                              dancing.\",\"input_urls\":[\"https://example.com/input-image.jpg\"],\"video_urls\":[\"https://example.com/input-video.mp4\"],\"mode\":\"720p\",\"character_orientation\":\"image\"}","callBackUrl":"https://example.com/callback","model":"kling-2.6/motion-control"}
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506391-run
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
