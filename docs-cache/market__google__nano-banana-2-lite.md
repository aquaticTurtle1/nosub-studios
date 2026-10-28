# Google - Nano Banana 2 Lite

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
      summary: Google - Nano Banana 2 Lite
      deprecated: false
      description: >-
        ## Create Task


        Use this endpoint to create a new image generation task. Provide a text
        prompt, and optionally include image URLs as visual references.


        Output: one JPEG image per task. The output format cannot be set; do not
        rely on the file extension in the result URL.


        - Set `image_urls` to an empty array or omit it for pure text-to-image
        generation. Up to 10 images are supported.

        - Supported aspect ratios: `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`,
        `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`, `auto`.


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
      operationId: nano-banana-2-lite
      tags:
        - docs/en/Market/Image    Models/Google
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: nano-banana-2-lite
                  description: >-
                    The model name used for generation. This field is required.
                    This endpoint must use the `nano-banana-2-lite` model.
                  enum:
                    - nano-banana-2-lite
                  examples:
                    - nano-banana-2-lite
                  type: string
                callBackUrl:
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent. To
                    ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification).
                  examples:
                    - https://your-domain.com/api/callback
                  format: uri
                  type: string
                input:
                  description: Input parameters for the image generation task.
                  properties:
                    image_urls:
                      default: []
                      description: >-
                        Input image URL array. Optional parameter. Set to an
                        empty array or omit it for pure text-to-image
                        generation. Supports up to 10 images.


                        - Please provide uploaded file URLs, not raw file
                        content

                        - Accepted types: `image/jpeg`, `image/png`,
                        `image/webp`

                        - Max size: 30.0MB
                      examples:
                        - - >-
                            https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png
                      items:
                        format: uri
                        type: string
                      maxItems: 10
                      type: array
                    prompt:
                      description: >-
                        Text prompt used to generate the image. Required.
                        Maximum length: 20000 characters.
                      examples:
                        - Generate a pig on the grass, cinematic light
                      maxLength: 20000
                      type: string
                    aspect_ratio:
                      description: >-
                        Required. Aspect ratio of the output image. Use "auto"
                        to let the model decide.
                      enum:
                        - '1:1'
                        - '1:4'
                        - '1:8'
                        - '2:3'
                        - '3:2'
                        - '3:4'
                        - '4:1'
                        - '4:3'
                        - '4:5'
                        - '5:4'
                        - '8:1'
                        - '9:16'
                        - '16:9'
                        - '21:9'
                        - auto
                      examples:
                        - auto
                      type: string
                  required:
                    - prompt
                    - aspect_ratio
                  type: object
                  x-apidog-orders:
                    - image_urls
                    - prompt
                    - aspect_ratio
                  x-apidog-ignore-properties: []
              required:
                - model
                - input
              type: object
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: nano-banana-2-lite
              callBackUrl: https://your-domain.com/api/callback
              input:
                image_urls:
                  - >-
                    https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png
                prompt: Generate a pig on the grass, cinematic light
                aspect_ratio: auto
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
                  taskId: task_nanobanana_1765180586443
          headers: {}
          x-apidog-name: ''
      security:
        - BearerAuth: []
          x-apidog:
            required: true
            schemeGroups:
              - id: Wc7OEyHo3dCGMyxVPjC6O
                schemeIds:
                  - BearerAuth
            use:
              id: Wc7OEyHo3dCGMyxVPjC6O
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
                              example: 1786429387000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 135
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786429251000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 3
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: nano-banana-2-lite
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"auto\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png\"],\"prompt\":\"Generate
                                a pig on the grass, cinematic
                                light\"}","callBackUrl":"https://your-domain.com/api/callback","model":"nano-banana-2-lite"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/ggc/226095d9935c83a8a0b4f0e50c235219_1786429384006.jpeg"]}
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
                              example: 226095d9935c83a8a0b4f0e50c235219
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786429387000
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
                        summary: Success
                        value:
                          code: 200
                          msg: Playground task completed successfully.
                          data:
                            taskId: 226095d9935c83a8a0b4f0e50c235219
                            model: nano-banana-2-lite
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"auto\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png\"],\"prompt\":\"Generate
                              a pig on the grass, cinematic
                              light\"}","callBackUrl":"https://your-domain.com/api/callback","model":"nano-banana-2-lite"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/ggc/226095d9935c83a8a0b4f0e50c235219_1786429384006.jpeg"]}
                            completeTime: 1786429387000
                            createTime: 1786429251000
                            costTime: 135
                            creditsConsumed: 3
                            updateTime: 1786429387000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 226095d9935c83a8a0b4f0e50c235219
                            model: nano-banana-2-lite
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"auto\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png\"],\"prompt\":\"Generate
                              a pig on the grass, cinematic
                              light\"}","callBackUrl":"https://your-domain.com/api/callback","model":"nano-banana-2-lite"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786429387000
                            createTime: 1786429251000
                            costTime: 135
                            creditsConsumed: 0
                            updateTime: 1786429387000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Google
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-39045655-run
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
