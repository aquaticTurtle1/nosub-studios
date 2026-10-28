# Grok Imagine - Text to Image

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
      summary: Grok Imagine - Text to Image
      deprecated: false
      description: >
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
      operationId: grok-imagine-text-to-image
      tags:
        - docs/en/Market/Image    Models/Grok Imagine
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  enum:
                    - grok-imagine/text-to-image
                  default: grok-imagine/text-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `grok-imagine/text-to-image` for this endpoint
                  examples:
                    - grok-imagine/text-to-image
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    The URL to receive image generation task completion updates.
                    Optional but recommended for production use.


                    - System will POST task status and results to this URL when
                    image generation completes

                    - Callback includes generated image URLs and task
                    information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing image results

                    - Alternatively, use the Get Task Details endpoint to poll
                    task status

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  description: Input parameters for the image generation task
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Text prompt describing the desired image. Required
                        field.


                        - Should be detailed and specific about the desired
                        visual elements

                        - Describe composition, style, lighting, mood, and other
                        visual details

                        - Maximum length: 5000 characters

                        - Supports English language prompts
                      examples:
                        - >-
                          Cinematic portrait of a woman sitting by a vinyl
                          record player, retro living room background, soft
                          ambient lighting, warm earthy tones, nostalgic 1970s
                          wardrobe, reflective mood, gentle film grain texture,
                          shallow depth of field, vintage editorial photography
                          style.
                    aspect_ratio:
                      type: string
                      description: >-
                        Required. Aspect ratio of the output image: 2:3, 3:2,
                        1:1, 16:9, 9:16.
                      enum:
                        - '2:3'
                        - '3:2'
                        - '1:1'
                        - '16:9'
                        - '9:16'
                      examples:
                        - '3:2'
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                    enable_pro:
                      type: boolean
                      description: |-
                        Controls the request processing strategy.  
                          - `false`: Corresponds to **speed mode**. The system prioritizes response time and throughput, suitable for latency-sensitive scenarios.  
                          - `true`: Corresponds to **quality mode**. The system prioritizes processing quality and precision, suitable for scenarios requiring higher accuracy.
                  required:
                    - prompt
                    - aspect_ratio
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - 01KWKKNWENNX8AZBVKNVKCEVTM
                    - enable_pro
                  x-apidog-refs:
                    01KWKKNWENNX8AZBVKNVKCEVTM:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              examples:
                - model: grok-imagine/text-to-image
                  callBackUrl: https://your-domain.com/api/callback
                  input:
                    prompt: >-
                      Cinematic portrait of a woman sitting by a vinyl record
                      player, retro living room background, soft ambient
                      lighting, warm earthy tones, nostalgic 1970s wardrobe,
                      reflective mood, gentle film grain texture, shallow depth
                      of field, vintage editorial photography style.
                    aspect_ratio: '3:2'
              x-apidog-ignore-properties: []
            example:
              model: grok-imagine/text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Cinematic portrait of a woman sitting by a vinyl record
                  player, retro living room background, soft ambient lighting,
                  warm earthy tones, nostalgic 1970s wardrobe, reflective mood,
                  gentle film grain texture, shallow depth of field, vintage
                  editorial photography style.
                aspect_ratio: '3:2'
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
                  taskId: task_grok_12345678
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
        onImageGenerated:
          '{$request.body#/callBackUrl}':
            post:
              summary: Image Generation Callback
              description: Sent when the task succeeds or fails.
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        code:
                          type: integer
                          description: >-
                            200: success. 501: failure; see data.failCode and
                            data.failMsg.
                          enum:
                            - 200
                            - 501
                        msg:
                          type: string
                          description: Status message
                          example: Playground task completed successfully.
                        data:
                          type: object
                          properties:
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786431088000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 17
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786431068000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 4
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: grok-imagine/text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"3:2\",\"prompt\":\"Cinematic
                                portrait of a woman sitting by a vinyl record
                                player,retro living room background, soft
                                ambient lighting, warm earthy tones, nostalgic
                                1970s wardrobe, reflective mood, gentle film
                                grain texture,shallow depth of field, vintage
                                editorial photography
                                style.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine/text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/r/18f680df-66a2-4bab-8f2b-91b77ac31fa8.jpg","https://tempfile.aiquickdraw.com/r/80a6536a-43db-4d93-ba18-342bdb3de36b.jpg"]}
                            state:
                              type: string
                              description: Task status
                              enum:
                                - success
                                - fail
                              example: success
                            taskId:
                              type: string
                              description: Task ID
                              example: 91b9645a0c7d7aa063d18918204bd2ad
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786431088000
                            failCode:
                              type: string
                              description: >-
                                Failure code, a numeric string such as "400" or
                                "500". Present only when state is fail.
                              example: '500'
                            failMsg:
                              type: string
                              description: Failure reason. Present only when state is fail.
                              example: <error detail>
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          msg: Playground task completed successfully.
                          data:
                            taskId: 91b9645a0c7d7aa063d18918204bd2ad
                            model: grok-imagine/text-to-image
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"3:2\",\"prompt\":\"Cinematic
                              portrait of a woman sitting by a vinyl record
                              player,retro living room background, soft ambient
                              lighting, warm earthy tones, nostalgic 1970s
                              wardrobe, reflective mood, gentle film grain
                              texture,shallow depth of field, vintage editorial
                              photography
                              style.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine/text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/r/18f680df-66a2-4bab-8f2b-91b77ac31fa8.jpg","https://tempfile.aiquickdraw.com/r/80a6536a-43db-4d93-ba18-342bdb3de36b.jpg"]}
                            costTime: 17
                            createTime: 1786431068000
                            completeTime: 1786431088000
                            updateTime: 1786431088000
                            creditsConsumed: 4
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 91b9645a0c7d7aa063d18918204bd2ad
                            model: grok-imagine/text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"3:2\",\"prompt\":\"Cinematic
                              portrait of a woman sitting by a vinyl record
                              player,retro living room background, soft ambient
                              lighting, warm earthy tones, nostalgic 1970s
                              wardrobe, reflective mood, gentle film grain
                              texture,shallow depth of field, vintage editorial
                              photography
                              style.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine/text-to-image"}
                            costTime: 17
                            createTime: 1786431068000
                            completeTime: 1786431088000
                            updateTime: 1786431088000
                            creditsConsumed: 0
                            failCode: '500'
                            failMsg: <error detail>
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Grok Imagine
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506368-run
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
