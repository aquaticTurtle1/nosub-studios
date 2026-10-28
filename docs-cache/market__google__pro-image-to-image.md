# Google - Nano Banana Pro

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
      summary: Google - Nano Banana Pro
      deprecated: false
      description: >
        Image generation using Google's Pro Image to Image model


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
      operationId: nano-banana-pro
      tags:
        - docs/en/Market/Image    Models/Google
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: nano-banana-pro
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `nano-banana-pro` for this endpoint
                  enum:
                    - nano-banana-pro
                  examples:
                    - nano-banana-pro
                  type: string
                callBackUrl:
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
                  format: uri
                  type: string
                input:
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      description: >-
                        A text description of the image you want to generate
                        (Max length: 20000 characters)
                      examples:
                        - >-
                          Comic poster: cool banana hero in shades leaps from
                          sci-fi pad. Six panels: 1) 4K mountain landscape, 2)
                          banana holds page of long multilingual text with auto
                          translation, 3) Gemini 3 hologram for
                          search/knowledge/reasoning, 4) camera UI sliders for
                          angle focus color, 5) frame trio 1:1-9:16, 6)
                          consistent banana poses. Footer shows Google icons.
                          Tagline: Nano Banana Pro now on Kie AI.
                      maxLength: 20000
                      type: string
                    image_input:
                      description: >-
                        Input images to transform or use as reference (supports
                        up to 8 images) (File URL after upload, not file
                        content; Accepted types: image/jpeg, image/png,
                        image/webp; Max size: 30.0MB)
                      examples:
                        - []
                      items:
                        format: uri
                        type: string
                      maxItems: 8
                      type: array
                    aspect_ratio:
                      default: '1:1'
                      description: Aspect ratio of the generated image
                      enum:
                        - '1:1'
                        - '2:3'
                        - '3:2'
                        - '3:4'
                        - '4:3'
                        - '4:5'
                        - '5:4'
                        - '9:16'
                        - '16:9'
                        - '21:9'
                        - auto
                      examples:
                        - '1:1'
                      type: string
                    resolution:
                      default: 1K
                      description: Resolution of the generated image
                      enum:
                        - 1K
                        - 2K
                        - 4K
                      examples:
                        - 1K
                      type: string
                    output_format:
                      description: >-
                        Output image format: png or jpg. Set this field
                        explicitly.
                      enum:
                        - png
                        - jpg
                      examples:
                        - png
                      type: string
                  required:
                    - prompt
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_input
                    - aspect_ratio
                    - resolution
                    - output_format
                  x-apidog-ignore-properties: []
              required:
                - model
              type: object
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: nano-banana-pro
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Comic poster: cool banana hero in shades leaps from sci-fi
                  pad. Six panels: 1) 4K mountain landscape, 2) banana holds
                  page of long multilingual text with auto translation, 3)
                  Gemini 3 hologram for search/knowledge/reasoning, 4) camera UI
                  sliders for angle focus color, 5) frame trio 1:1-9:16, 6)
                  consistent banana poses. Footer shows Google icons. Tagline:
                  Nano Banana Pro now on Kie AI.
                image_input: []
                aspect_ratio: '1:1'
                resolution: 1K
                output_format: png
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
                  taskId: task_nano-banana-pro_1765178625768
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
            required: true
            schemeGroups:
              - id: xhRgE6kaPcisqoiB3MO4D
                schemeIds:
                  - BearerAuth
            use:
              id: xhRgE6kaPcisqoiB3MO4D
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
                              example: 1786428982000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 29
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786428952000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 8
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: nano-banana-pro
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"image_input\":[],\"aspect_ratio\":\"1:1\",\"output_format\":\"png\",\"prompt\":\"Comic
                                poster: A cool banana hero wearing sunglasses
                                leaps from a sci-fi platform. The poster
                                contains six panels: 1) a mountain landscape in
                                4K resolution, 2) the banana holding a page
                                containing extensive multilingual text with
                                automatic translation support, 3) a Gemini 3
                                holographic interface featuring search,
                                knowledge Q&A, and logical reasoning
                                capabilities, 4) camera UI adjustment sliders
                                for angle, focal length, and color, 5) three
                                aspect ratio demonstrations ranging from 1:1 to
                                9:16, and 6) consistent action poses for the
                                banana. Display the Google icon at the bottom of
                                the poster with the slogan: Nano Banana Pro is
                                now available on Kie
                                AI.\",\"resolution\":\"1K\"}","callBackUrl":
                                "https://your-domain.com/api/callback","model":"nano-banana-pro"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/image_b700b7f77f13b79cd2ee5bf1d39a104f.png"]}
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
                              example: 5659c84dcf183f0805e9cfdf746af2cf
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786428982000
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
                            taskId: 5659c84dcf183f0805e9cfdf746af2cf
                            model: nano-banana-pro
                            state: success
                            param: >-
                              {"input":"{\"image_input\":[],\"aspect_ratio\":\"1:1\",\"output_format\":\"png\",\"prompt\":\"Comic
                              poster: A cool banana hero wearing sunglasses
                              leaps from a sci-fi platform. The poster contains
                              six panels: 1) a mountain landscape in 4K
                              resolution, 2) the banana holding a page
                              containing extensive multilingual text with
                              automatic translation support, 3) a Gemini 3
                              holographic interface featuring search, knowledge
                              Q&A, and logical reasoning capabilities, 4) camera
                              UI adjustment sliders for angle, focal length, and
                              color, 5) three aspect ratio demonstrations
                              ranging from 1:1 to 9:16, and 6) consistent action
                              poses for the banana. Display the Google icon at
                              the bottom of the poster with the slogan: Nano
                              Banana Pro is now available on Kie
                              AI.\",\"resolution\":\"1K\"}","callBackUrl":
                              "https://your-domain.com/api/callback","model":"nano-banana-pro"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/image_b700b7f77f13b79cd2ee5bf1d39a104f.png"]}
                            completeTime: 1786428982000
                            createTime: 1786428952000
                            costTime: 29
                            creditsConsumed: 8
                            updateTime: 1786428982000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 5659c84dcf183f0805e9cfdf746af2cf
                            model: nano-banana-pro
                            state: fail
                            param: >-
                              {"input":"{\"image_input\":[],\"aspect_ratio\":\"1:1\",\"output_format\":\"png\",\"prompt\":\"Comic
                              poster: A cool banana hero wearing sunglasses
                              leaps from a sci-fi platform. The poster contains
                              six panels: 1) a mountain landscape in 4K
                              resolution, 2) the banana holding a page
                              containing extensive multilingual text with
                              automatic translation support, 3) a Gemini 3
                              holographic interface featuring search, knowledge
                              Q&A, and logical reasoning capabilities, 4) camera
                              UI adjustment sliders for angle, focal length, and
                              color, 5) three aspect ratio demonstrations
                              ranging from 1:1 to 9:16, and 6) consistent action
                              poses for the banana. Display the Google icon at
                              the bottom of the poster with the slogan: Nano
                              Banana Pro is now available on Kie
                              AI.\",\"resolution\":\"1K\"}","callBackUrl":
                              "https://your-domain.com/api/callback","model":"nano-banana-pro"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786428982000
                            createTime: 1786428952000
                            costTime: 29
                            creditsConsumed: 0
                            updateTime: 1786428982000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Google
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506363-run
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
