# Wan 2.5 - Text to Video

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
      summary: Wan 2.5 - Text to Video
      deprecated: false
      description: >
        Video generation by wan/2-5-text-to-video


        ## Create Task


        Use this endpoint to create a new text-to-video generation task.


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          After submission, use the unified query endpoint to check task progress and retrieve results
        </Card>


        ::: tip[]

        For production use, we recommend providing the `callBackUrl` parameter
        so your service can receive completion notifications instead of polling
        for task status.

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Model Marketplace" icon="lucide-store" href="/market/quickstart">
            Explore all available models and capabilities
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check account credits and usage
          </Card>
        </CardGroup>
      operationId: wan-2-5-text-to-video
      tags:
        - docs/en/Market/Video Models/Wan
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
                    - wan/2-5-text-to-video
                  default: wan/2-5-text-to-video
                  description: |-
                    The model name used for generation. This field is required.

                    - This endpoint must use the `wan/2-5-text-to-video` model
                  examples:
                    - wan/2-5-text-to-video
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent.
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  description: Input parameters for the text-to-video task.
                  required:
                    - prompt
                    - duration
                    - resolution
                  properties:
                    prompt:
                      type: string
                      maxLength: 800
                      description: >-
                        The text prompt for video generation. Supports Chinese
                        and English. Maximum length: 800 characters.
                      examples:
                        - >-
                          A dimly lit jazz bar at night, wooden tables glowing
                          under warm pendant lights. Patrons sip drinks and chat
                          quietly while a three-piece band performs on stage.
                          The saxophone player stands under a spotlight,
                          gleaming instrument reflecting the light. No dialogue.
                          Ambient audio: smooth live jazz music with saxophone
                          and piano, clinking glasses, low murmur of audience
                          conversations, occasional burst of laughter from a
                          nearby table. Camera: slow pan across the crowd, then
                          gentle zoom toward the saxophone player's solo,
                          focusing on expressive hand movements.
                    duration:
                      type: string
                      enum:
                        - '5'
                        - '10'
                      description: |-
                        The duration of the generated video in seconds.

                        - `5`: 5 seconds
                        - `10`: 10 seconds
                      examples:
                        - '5'
                    aspect_ratio:
                      type: string
                      enum:
                        - '16:9'
                        - '9:16'
                        - '1:1'
                      description: |-
                        The aspect ratio of the generated video.

                        - `16:9`: Landscape
                        - `9:16`: Portrait
                        - `1:1`: Square
                      examples:
                        - '16:9'
                    resolution:
                      type: string
                      enum:
                        - 720p
                        - 1080p
                      description: Required. 720p or 1080p.
                      examples:
                        - 1080p
                    negative_prompt:
                      type: string
                      maxLength: 500
                      description: >-
                        Negative prompt used to describe content to avoid.
                        Maximum length: 500 characters.
                    enable_prompt_expansion:
                      type: boolean
                      description: >-
                        Whether to enable prompt rewriting using LLM. Improves
                        results for short prompts but increases processing time.


                        - Boolean value: `true` / `false`
                      examples:
                        - true
                    seed:
                      type: integer
                      description: >-
                        Random seed for reproducibility. If omitted, a random
                        seed is chosen.
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  x-apidog-orders:
                    - prompt
                    - duration
                    - aspect_ratio
                    - resolution
                    - negative_prompt
                    - enable_prompt_expansion
                    - seed
                    - 01KWKP14GYA0FDMPW5FPH0FZJN
                  x-apidog-refs:
                    01KWKP14GYA0FDMPW5FPH0FZJN:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: wan/2-5-text-to-video
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A dimly lit jazz bar at night, wooden tables glowing under
                  warm pendant lights. Patrons sip drinks and chat quietly while
                  a three-piece band performs on stage. The saxophone player
                  stands under a spotlight, gleaming instrument reflecting the
                  light. No dialogue. Ambient audio: smooth live jazz music with
                  saxophone and piano, clinking glasses, low murmur of audience
                  conversations, occasional burst of laughter from a nearby
                  table. Camera: slow pan across the crowd, then gentle zoom
                  toward the saxophone player's solo, focusing on expressive
                  hand movements.
                duration: '5'
                aspect_ratio: '16:9'
                resolution: 1080p
                negative_prompt: blurry, flicker, low quality, distorted people, camera shake
                enable_prompt_expansion: true
                seed: 123456
                nsfw_checker: false
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          taskId:
                            type: string
                            description: >-
                              Task ID, which can be used to query task status
                              through the task detail endpoint.
                            examples:
                              - task_wan_1765180586443
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
                  taskId: task_wan_1765180586443
          headers: {}
          x-apidog-name: ''
        '500':
          description: Server error.
          content:
            application/json:
              schema:
                type: object
                properties: {}
                x-apidog-orders: []
                x-apidog-ignore-properties: []
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
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the `wan/2-5-text-to-video`
                task succeeds or fails.
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
                                - wan/2-5-text-to-video
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
                            model: wan/2-5-text-to-video
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"A dimly lit jazz bar at
                              night, wooden tables glowing under warm pendant
                              lights. Patrons sip drinks and chat quietly
                              w...\",\"duration\":\"5\",\"aspect_ratio\":\"16:9\",\"resolution\":\"1080p\",\"negative_prompt\":\"blurry,
                              flicker, low quality, distorted people, camera
                              shake\",\"enable_prompt_expansion\":true,\"seed\":123456,\"nsfw_checker\":false}","callBackUrl":"https://example.com/callback","model":"wan/2-5-text-to-video"}
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
                            model: wan/2-5-text-to-video
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"A dimly lit jazz bar at
                              night, wooden tables glowing under warm pendant
                              lights. Patrons sip drinks and chat quietly
                              w...\",\"duration\":\"5\",\"aspect_ratio\":\"16:9\",\"resolution\":\"1080p\",\"negative_prompt\":\"blurry,
                              flicker, low quality, distorted people, camera
                              shake\",\"enable_prompt_expansion\":true,\"seed\":123456,\"nsfw_checker\":false}","callBackUrl":"https://example.com/callback","model":"wan/2-5-text-to-video"}
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
      x-apidog-folder: docs/en/Market/Video Models/Wan
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-31160822-run
components:
  schemas:
    nsfw_checker:
      type: object
      properties:
        nsfw_checker:
          type: boolean
          description: >-
            Defaults to false. When false, no additional content filtering is
            applied and results are returned directly by the model.
      x-apidog-orders:
        - nsfw_checker
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
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
