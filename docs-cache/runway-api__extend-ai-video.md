# Extend AI Video

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
      summary: Extend AI Video
      deprecated: false
      description: >-
        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/runway-api/extend-ai-video](https://docs.kie.ai/old-model/runway-api/extend-ai-video).

        :::

        Extend existing AI-generated videos to create longer sequences. The
        result is a single video containing the original clip followed by the
        continuation (about 5 seconds longer than the source).


        ### Usage Guide

        - Add additional segments to your AI-generated videos

        - Maintain visual consistency while extending narratives

        - Create longer sequences for storytelling or demonstrations



        ### Parameter Details

        - `task_id` identifies the original video to extend

        - `prompt` guides how the video should continue

        - `quality` video resolution, optional values are 720p or 1080p. 

        - `watermark` video watermark text content, empty string means no
        watermark


        ### Developer Notes

        - Extended videos are stored for 14 days before automatic deletion

        - Extension maintains the same aspect ratio as the original video

        - Extension works best when continuing the same subject/theme as the
        original video
      operationId: extend-ai-video
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
                  description: 'Model name. Fixed: runway/extend-ai-video.'
                  default: runway/extend-ai-video
                  examples:
                    - runway/extend-ai-video
                callBackUrl:
                  type: string
                  description: >-
                    The URL to receive AI video extension task completion
                    updates. Required for all video extension requests.


                    - System will POST task status and results to this URL when
                    video extension completes

                    - Callback includes extended video URLs, cover images, and
                    task information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing extension results

                    - For detailed callback format and implementation guide, see
                    [Video Extension
                    Callbacks](https://docs.kie.ai/runway-api/extend-ai-video-callbacks)

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
                    - task_id
                    - prompt
                    - quality
                  properties:
                    task_id:
                      type: string
                      description: >-
                        Unique identifier of the original video generation task.
                        Must be a valid task ID from a previously generated
                        video.
                      examples:
                        - ee603959-debb-48d1-98c4-a6d1c717eba6
                    prompt:
                      type: string
                      description: >-
                        Descriptive text that guides the continuation of the
                        video. Explain what actions, movements, or developments
                        should happen next. Be specific but maintain consistency
                        with the original video content.
                      examples:
                        - >-
                          The cat continues dancing with more energy and
                          excitement, spinning around with colorful light
                          effects intensifying
                    quality:
                      type: string
                      description: 'Video resolution, optional values are 720p or 1080p. '
                      examples:
                        - 720p
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
                    - task_id
                    - prompt
                    - quality
                    - watermark
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: runway/extend-ai-video
              callBackUrl: https://api.example.com/callback
              input:
                task_id: ee603959-debb-48d1-98c4-a6d1c717eba6
                prompt: >-
                  The cat continues dancing with more energy and excitement,
                  spinning around with colorful light effects intensifying
                quality: 720p
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
                          - 429
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
                        description: Status message
                        examples:
                          - success
                      data:
                        type: object
                        properties:
                          taskId:
                            type: string
                            description: >-
                              Task ID for tracking task status. Use this ID with
                              the "Get AI Video Details" endpoint to query
                              extension task details and results.
                            examples:
                              - 5c79****be8e
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
        onVideoExtended:
          '{$request.body#/callBackUrl}':
            post:
              summary: Video Extension Completion Callback
              description: >-
                When video extension is complete, the system will send a POST
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
                              example: d6cf9fc7968af5ccd85688083f565757
                            model:
                              type: string
                              description: Model used for the task
                              example: runway/extend-ai-video
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
                                {"input":"{\"task_id\":\"94bbfeaa1383c296cd61ba5dfcbfe30e\",\"prompt\":\"The
                                cartoon fox steps back and admires the finished
                                rainbow\",\"quality\":\"720p\"}","callBackUrl":"https://your-domain.com/api/callback","model":"runway/extend-ai-video"}
                            resultJson:
                              type: string
                              description: >-
                                Result in JSON string format (present when state
                                is success). resultUrls contains the generated
                                video URLs.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/d6cf9fc7968af5ccd85688083f565757_1_1791218886_3642.mp4"]}
                            failCode:
                              type: string
                              description: Failure code (present when state is fail)
                            failMsg:
                              type: string
                              description: Failure reason (present when state is fail)
                            costTime:
                              type: integer
                              description: Task duration in seconds
                              example: 85
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
                              example: 1791218802000
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, Unix timestamp in
                                milliseconds
                              example: 1791218887652
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Last task update time, Unix timestamp in
                                milliseconds
                              example: 1791218887652
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Video Models/Runway API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43159964-run
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
