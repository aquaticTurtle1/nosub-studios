# Generate Aleph Video

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
      summary: Generate Aleph Video
      deprecated: true
      description: >
        :::warning

        **Discontinued.** Runway Aleph is no longer available on Kie AI. For
        Runway video generation, see [Generate AI
        Video](https://docs.kie.ai/runway-api/generate-ai-video).

        :::


        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/runway-api/generate-aleph-video](https://docs.kie.ai/old-model/runway-api/generate-aleph-video).

        :::

        > Using Runway Aleph model for video-to-video conversion to create
        dynamic AI-generated videos


        ## Overview


        Transform existing videos into enhanced dynamic content using Runway's
        advanced Aleph AI model. This endpoint enables precise video-to-video
        generation through text-guided transformations, perfect for creating
        enhanced visual content from existing videos.


        :::highlight purple

        The Runway Aleph API requires a text prompt and reference video URL to
        generate transformed videos. The AI will modify and enhance the provided
        video based on your text description.

        :::
      operationId: generate-aleph-video
      tags:
        - docs/en/Market/Video Models/Runway API/Aleph
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
                  description: Model name
                  default: runway/gen4-aleph
                  examples:
                    - runway/gen4-aleph
                callBackUrl:
                  type: string
                  description: >-
                    The URL to receive AI video generation task completion
                    updates.


                    - System will POST task status and results to this URL when
                    video generation completes

                    - Callback includes generated video URLs, cover images, and
                    task information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing video results

                    - For detailed callback format and implementation guide, see
                    [Aleph Video Generation
                    Callbacks](https://docs.kie.ai/runway-api/generate-aleph-video-callbacks)

                    - Alternatively, poll Get Task Details
                    (/market/common/get-task-detail).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  examples:
                    - https://api.example.com/callback
                input:
                  type: object
                  required:
                    - prompt
                    - video_url
                  properties:
                    prompt:
                      type: string
                      description: Describes how to transform the input video.
                      examples:
                        - >-
                          A majestic eagle soaring through mountain clouds at
                          sunset with cinematic camera movement
                    video_url:
                      type: string
                      description: >-
                        Reference video URL to base the video-to-video
                        generation on. The AI will transform and enhance this
                        video according to the prompt.
                      examples:
                        - https://example.com/input-video.mp4
                    watermark:
                      type: string
                      description: >-
                        Optional watermark text content. An empty string
                        indicates no watermark, while a non-empty string will
                        display the specified text as a watermark in the video.
                      examples:
                        - kie.ai
                    upload_cn:
                      type: boolean
                      description: Optional. Defaults to false.
                      default: false
                      examples:
                        - false
                    aspect_ratio:
                      type: string
                      description: Video aspect ratio.
                      enum:
                        - '16:9'
                        - '9:16'
                        - '4:3'
                        - '3:4'
                        - '1:1'
                        - '21:9'
                      examples:
                        - '16:9'
                    seed:
                      type: integer
                      description: Random seed. Set for reproducible generation.
                      examples:
                        - 123456
                    reference_image:
                      type: string
                      format: uri
                      description: >-
                        Reference image URL to influence the style or content of
                        the output.
                      examples:
                        - https://example.com/reference.jpg
                  x-apidog-orders:
                    - prompt
                    - video_url
                    - watermark
                    - upload_cn
                    - aspect_ratio
                    - seed
                    - reference_image
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: runway/gen4-aleph
              callBackUrl: https://api.example.com/callback
              input:
                prompt: >-
                  A majestic eagle soaring through mountain clouds at sunset
                  with cinematic camera movement
                video_url: https://example.com/input-video.mp4
                watermark: kie.ai
                upload_cn: false
                aspect_ratio: '16:9'
                seed: 123456
                reference_image: https://example.com/reference.jpg
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - type: object
                    properties:
                      code:
                        type: integer
                        enum:
                          - 200
                          - 401
                          - 404
                          - 422
                          - 451
                          - 455
                          - 500
                        description: >-
                          Status code of the request. The HTTP status is 200
                          even when the request fails, so always check this
                          field: 200 means success; any other value means the
                          request failed and msg describes the reason. Common
                          values: 401 invalid or missing API key; 402
                          insufficient credits; 429 rate limit exceeded; 422 or
                          500 the request could not be processed (read msg and
                          check your parameters before retrying).
                      msg:
                        type: string
                        description: Error message when code != 200
                        examples:
                          - success
                    x-apidog-orders:
                      - code
                      - msg
                    x-apidog-ignore-properties: []
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          taskId:
                            type: string
                            description: >-
                              Unique identifier for the generation task, can be
                              used with `Get Aleph Video Details` to query task
                              status
                            examples:
                              - ee603959-debb-48d1-98c4-a6d1c717eba6
                        x-apidog-orders:
                          - taskId
                        x-apidog-ignore-properties: []
                    x-apidog-orders:
                      - data
                    x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: ee603959-debb-48d1-98c4-a6d1c717eba6
          headers: {}
          x-apidog-name: ''
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
        onVideoGenerated:
          '{$request.body#/callBackUrl}':
            post:
              summary: Aleph Video Generation Completion Callback
              description: >-
                When Aleph video generation is complete, the system will send a
                POST request to the provided callback URL to notify the result
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        code:
                          type: integer
                          enum:
                            - 200
                            - 501
                          description: >-
                            Status code


                            - **200**: Success - the task completed successfully

                            - **501**: Failed - the task failed; see
                            data.failCode and data.failMsg
                        msg:
                          type: string
                          description: Status message
                          example: Playground task completed successfully.
                        data:
                          type: object
                          properties:
                            taskId:
                              type: string
                              description: Task ID
                              example: 5d2e8b7c41f04a6f9e3b0c7a1d6f2e84
                            model:
                              type: string
                              description: Model used for the task
                              example: runway/gen4-aleph
                            state:
                              type: string
                              enum:
                                - success
                                - fail
                              description: Task status
                              example: success
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"prompt\":\"Turn the scene into a
                                snowy winter day, keep the cartoon fox and the
                                fence\",\"video_url\":\"https://example.com/input-video.mp4\"}","callBackUrl":"https://your-domain.com/api/callback","model":"runway/gen4-aleph"}
                            resultJson:
                              type: string
                              description: >-
                                Result in JSON string format (present when state
                                is success). resultUrls contains the generated
                                video URLs.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/xxxxxxxx.mp4"]}
                            failCode:
                              type: string
                              description: Failure code (present when state is fail)
                            failMsg:
                              type: string
                              description: Failure reason (present when state is fail)
                            costTime:
                              type: integer
                              description: Task duration in seconds
                            creditsConsumed:
                              type: number
                              format: double
                              description: Number of credits consumed by the task
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, Unix timestamp in
                                milliseconds
                              example: 1791218957000
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, Unix timestamp in
                                milliseconds
                              example: 1791219017000
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Last task update time, Unix timestamp in
                                milliseconds
                              example: 1791219017000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Video Models/Runway API/Aleph
      x-apidog-status: deprecated
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43159965-run
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
