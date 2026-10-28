# Seedream4.0 - Edit

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
      summary: Seedream4.0 - Edit
      deprecated: false
      description: >
        Image editing by Seedream4.0


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
      operationId: bytedance-seedream-v4-edit
      tags:
        - docs/en/Market/Image    Models/Seedream
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: bytedance/seedream-v4-edit
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `bytedance/seedream-v4-edit` for this endpoint
                  enum:
                    - bytedance/seedream-v4-edit
                  examples:
                    - bytedance/seedream-v4-edit
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
                        The text prompt used to edit the image (Max length: 5000
                        characters)
                      examples:
                        - >-
                          Refer to this logo and create a single visual showcase
                          for an outdoor sports brand named ‘KIE AI’. Display
                          five branded items together in one image: a packaging
                          bag, a hat, a carton box, a wristband, and a lanyard.
                          Use blue as the main visual color, with a fun, simple,
                          and modern style.
                      maxLength: 5000
                      type: string
                    image_urls:
                      description: >-
                        List of URLs of input images for editing. Presently, up
                        to 10 image inputs are allowed. (File URL after upload,
                        not file content; Accepted types: image/jpeg, image/png,
                        image/webp; Max size: 30.0MB)
                      examples:
                        - - >-
                            https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png
                      items:
                        format: uri
                        type: string
                      maxItems: 10
                      type: array
                    image_size:
                      default: square_hd
                      description: 'The size of the generated image. '
                      enum:
                        - square
                        - square_hd
                        - portrait_4_3
                        - portrait_3_2
                        - portrait_16_9
                        - landscape_4_3
                        - landscape_3_2
                        - landscape_16_9
                        - landscape_21_9
                      examples:
                        - square_hd
                      type: string
                    image_resolution:
                      default: 1K
                      description: >-
                        Final image resolution is determined by combining
                        image_size (aspect ratio) and image_resolution (pixel
                        scale)..
                      enum:
                        - 1K
                        - 2K
                        - 4K
                      examples:
                        - 1K
                      type: string
                    max_images:
                      default: 1
                      description: >-
                        Set this value (1–6) to cap how many images a single
                        generation run can produce in one set—because they’re
                        created in one shot rather than separate requests, you
                        must also state the exact number you want in the prompt
                        so both settings align. (Min: 1, Max: 6, Step: 1) (step:
                        1)
                      examples:
                        - 1
                      maximum: 6
                      minimum: 1
                      type: number
                    seed:
                      description: >-
                        Random seed for reproducible results. Integer, up to
                        1000000. Omit for a random seed.
                      maximum: 1000000
                      type: integer
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - image_urls
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - image_size
                    - image_resolution
                    - max_images
                    - seed
                    - 01KWKKBVR7D6T2Z43EZTXTYWKX
                  x-apidog-refs:
                    01KWKKBVR7D6T2Z43EZTXTYWKX:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              required:
                - model
              type: object
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: bytedance/seedream-v4-edit
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Refer to this logo and create a single visual showcase for an
                  outdoor sports brand named ‘KIE AI’. Display five branded
                  items together in one image: a packaging bag, a hat, a carton
                  box, a wristband, and a lanyard. Use blue as the main visual
                  color, with a fun, simple, and modern style.
                image_urls:
                  - >-
                    https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png
                image_size: square_hd
                image_resolution: 1K
                max_images: 1
                seed: 42
                nsfw_checker: true
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
                  taskId: task_bytedance_1765176680149
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
                              example: 1786414494000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 33
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786414456000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 5
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: bytedance/seedream-v4-edit
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"seed\":900000,\"image_size\":\"square_hd\",\"image_resolution\":\"1K\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png\"],\"max_images\":1,\"prompt\":\"Create
                                avisual presentation for the outdoor sports
                                brand ‘KIE AI’ based on this logo. Present five
                                branded merchandise products in the same image:
                                apackaging bag, a hat, a cardboard box, a
                                wristband, and a lanyard. Use blue as the
                                primary visual color, with a lively, minimalist,
                                and
                                modernstyle.\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"bytedance/seedream-v4-edit"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains a list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/e5790bfbeb0009d0eb4a546513bd8865_1_1786414493_4712.jpg"]}
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
                              example: e5790bfbeb0009d0eb4a546513bd8865
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786414494000
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
                            taskId: e5790bfbeb0009d0eb4a546513bd8865
                            model: bytedance/seedream-v4-edit
                            state: success
                            param: >-
                              {"input":"{\"seed\":900000,\"image_size\":\"square_hd\",\"image_resolution\":\"1K\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png\"],\"max_images\":1,\"prompt\":\"Create
                              avisual presentation for the outdoor sports brand
                              ‘KIE AI’ based on this logo. Present five branded
                              merchandise products in the same image: apackaging
                              bag, a hat, a cardboard box, a wristband, and a
                              lanyard. Use blue as the primary visual color,
                              with a lively, minimalist, and
                              modernstyle.\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"bytedance/seedream-v4-edit"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/p/e5790bfbeb0009d0eb4a546513bd8865_1_1786414493_4712.jpg"]}
                            completeTime: 1786414494000
                            createTime: 1786414456000
                            costTime: 33
                            creditsConsumed: 5
                            updateTime: 1786414494000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: e5790bfbeb0009d0eb4a546513bd8865
                            model: bytedance/seedream-v4-edit
                            state: fail
                            param: >-
                              {"input":"{\"seed\":900000,\"image_size\":\"square_hd\",\"image_resolution\":\"1K\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png\"],\"max_images\":1,\"prompt\":\"Create
                              avisual presentation for the outdoor sports brand
                              ‘KIE AI’ based on this logo. Present five branded
                              merchandise products in the same image: apackaging
                              bag, a hat, a cardboard box, a wristband, and a
                              lanyard. Use blue as the primary visual color,
                              with a lively, minimalist, and
                              modernstyle.\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"bytedance/seedream-v4-edit"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786414494000
                            createTime: 1786414456000
                            costTime: 33
                            creditsConsumed: 0
                            updateTime: 1786414494000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Seedream
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506354-run
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
