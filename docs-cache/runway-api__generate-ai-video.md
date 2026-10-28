# Generate AI Video

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
      summary: Generate AI Video
      deprecated: false
      description: >-
        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/runway-api/generate-ai-video](https://docs.kie.ai/old-model/runway-api/generate-ai-video).

        :::

        Create dynamic AI-generated videos from text prompts or image
        references.


        ### Usage Guide

        - Create short videos (5-10 seconds) using AI visualization

        - Generate videos based on text descriptions or reference images

        - Suitable for social media content, digital art, or concept
        visualization



        ### Parameter Details

        - `prompt` describes what you want to show in the video

        - `image_url` provides visual reference for AI

        - `aspect_ratio` determines video orientation (vertical or horizontal)

        - `duration` control the video duration (5 or 10 seconds), where if a
        10-second video is selected, 1080p resolution cannot be selected 

        - `quality` video resolution (720p or 1080p), where if 1080p is
        selected, 10-second video cannot be generated

        - `watermark` video watermark text content, empty string means no
        watermark


        ### Developer Notes

        - Generated videos are stored for 14 days before automatic deletion

        -  For text-only generation, aspect ratio must be explicitly specified
      operationId: generate-ai-video
      tags:
        - docs/en/Market/Video Models/Runway API
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
                  description: Model version to use for generation.
                  default: runway
                  examples:
                    - runway
                callBackUrl:
                  type: string
                  description: >-
                    The URL to receive AI video generation task completion
                    updates. Required for all video generation requests.


                    - System will POST task status and results to this URL when
                    video generation completes

                    - Callback includes generated video URLs, cover images, and
                    task information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing video results

                    - For detailed callback format and implementation guide, see
                    [Video Generation
                    Callbacks](https://docs.kie.ai/runway-api/generate-ai-video-callbacks)

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
                    - duration
                    - quality
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Descriptive text that guides the AI video generation. Be
                        specific about subject, action, style, and setting. When
                        used with an image, describes how to animate or modify
                        the image content. Maximum length is 1800 characters.
                      examples:
                        - >-
                          A fluffy orange cat dancing energetically in a
                          colorful room with disco lights
                    image_url:
                      type: string
                      description: >-
                        Optional reference image URL to base the video on. When
                        provided, the AI will create a video animating or
                        extending this image.
                      examples:
                        - https://example.com/cat-image.jpg
                    duration:
                      type: number
                      description: >-
                        Video duration, optional values are 5 or 10. If
                        10-second video is selected, 1080p resolution cannot be
                        used
                      examples:
                        - '5'
                    quality:
                      type: string
                      description: >-
                        Video resolution, optional values are 720p or 1080p. If
                        1080p is selected, 10-second video cannot be generated
                      examples:
                        - 720p
                    aspect_ratio:
                      type: string
                      enum:
                        - '16:9'
                        - '4:3'
                        - '1:1'
                        - '3:4'
                        - '9:16'
                      description: >-
                        Video aspect ratio parameter. **Required parameter for
                        text-to-video generation requests. This parameter is
                        invalid when image_url is passed, and the aspect ratio
                        will ultimately be determined by the provided image.**
                      examples:
                        - '9:16'
                    watermark:
                      type: string
                      description: >-
                        Video watermark text content. An empty string indicates
                        no watermark, while a non-empty string will display the
                        specified text as a watermark in the bottom right corner
                        of the video.
                      examples:
                        - kie.ai
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - duration
                    - quality
                    - aspect_ratio
                    - watermark
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: runway
              callBackUrl: https://api.example.com/callback
              input:
                prompt: >-
                  A fluffy orange cat dancing energetically in a colorful room
                  with disco lights
                image_url: https://example.com/cat-image.jpg
                duration: 5
                quality: 720p
                aspect_ratio: '9:16'
                watermark: kie.ai
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
                              used with `Get AI Video Details` to query task
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
              summary: Video Generation Completion Callback
              description: >-
                When video generation is complete, the system will send a POST
                request to the provided callback URL to notify the result
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
                              example: 94bbfeaa1383c296cd61ba5dfcbfe30e
                            model:
                              type: string
                              description: Model used for the task
                              example: runway
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
                                {"input":"{\"prompt\":\"A cartoon fox paints a
                                rainbow on a wooden fence, colorful 3D
                                animation\",\"duration\":5,\"quality\":\"720p\",\"aspect_ratio\":\"16:9\"}","callBackUrl":"https://your-domain.com/api/callback","model":"runway"}
                            resultJson:
                              type: string
                              description: >-
                                Result in JSON string format (present when state
                                is success). resultUrls contains the generated
                                video URLs.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/c03630ba7484476a905fc14625b7304a_1_1791218754_8541.mp4"]}
                            failCode:
                              type: string
                              description: Failure code (present when state is fail)
                            failMsg:
                              type: string
                              description: Failure reason (present when state is fail)
                            costTime:
                              type: integer
                              description: Task duration in seconds
                              example: 68
                            creditsConsumed:
                              type: number
                              format: double
                              description: Number of credits consumed by the task
                              example: 12
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, Unix timestamp in
                                milliseconds
                              example: 1791218688000
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, Unix timestamp in
                                milliseconds
                              example: 1791218756020
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Last task update time, Unix timestamp in
                                milliseconds
                              example: 1791218756020
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Video Models/Runway API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43159962-run
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
