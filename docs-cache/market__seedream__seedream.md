# Seedream3.0 - Text to Image

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
      summary: Seedream3.0 - Text to Image
      deprecated: false
      description: >
        Image generation by Seedream3.0


        Output format: WebP.


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
      operationId: bytedance-seedream
      tags:
        - docs/en/Market/Image    Models/Seedream
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: bytedance/seedream
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `bytedance/seedream` for this endpoint
                  enum:
                    - bytedance/seedream
                  examples:
                    - bytedance/seedream
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
                        The text prompt used to generate the image (Max length:
                        5000 characters)
                      examples:
                        - >-
                          A 2D flat art style campsite poster with the text “Kie
                          AI Seedream 3.0 API”. The scene includes mountains,
                          brown tents under a sunny sky, a rabbit, a deer, some
                          birds, green grass, and a flowing river, all
                          illustrated in clean vector art.
                      maxLength: 5000
                      type: string
                    image_size:
                      default: square_hd
                      description: >-
                        Output size preset. One of square, square_hd,
                        portrait_4_3, portrait_16_9, landscape_4_3,
                        landscape_16_9.
                      enum:
                        - square
                        - square_hd
                        - portrait_4_3
                        - portrait_16_9
                        - landscape_4_3
                        - landscape_16_9
                      examples:
                        - square_hd
                      type: string
                    guidance_scale:
                      default: 2.5
                      description: >-
                        Controls how closely the output image aligns with the
                        input prompt. Higher values mean stronger prompt
                        correlation. (Min: 1, Max: 10, Step: 0.1) (step: 0.1)
                      examples:
                        - 2.5
                      maximum: 10
                      minimum: 1
                      type: number
                    seed:
                      description: >-
                        Random seed to control the stochasticity of image
                        generation.
                      type: integer
                  required:
                    - prompt
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_size
                    - guidance_scale
                    - seed
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
              model: bytedance/seedream
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A 2D flat art style campsite poster with the text “Kie AI
                  Seedream 3.0 API”. The scene includes mountains, brown tents
                  under a sunny sky, a rabbit, a deer, some birds, green grass,
                  and a flowing river, all illustrated in clean vector art.
                image_size: square_hd
                guidance_scale: 2.5
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - type: object
                    x-apidog-refs:
                      01KMD3FHWR37JBBV9JM39DYGST:
                        $ref: '#/components/schemas/response%20not%20with%20recordId'
                    x-apidog-orders:
                      - 01KMD3FHWR37JBBV9JM39DYGST
                    properties:
                      code:
                        type: integer
                        description: >-
                          Status code of the request. The HTTP status is 200
                          even when the request fails, so always check this
                          field: 200 means success; any other value means the
                          request failed and msg describes the reason. Common
                          values: 401 invalid or missing API key; 402
                          insufficient credits; 429 rate limit exceeded; 422 or
                          500 the request could not be processed (read msg and
                          check your parameters before retrying).
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
                              The task ID can be used with the "Get Task
                              Details" endpoint to query the task status.
                            examples:
                              - dc1928bfcbc77cb6c85f3359a9c718b3
                        x-apidog-orders:
                          - taskId
                        x-apidog-ignore-properties: []
                    required:
                      - data
                    x-apidog-ignore-properties:
                      - code
                      - msg
                      - data
              example:
                code: 200
                msg: success
                data:
                  taskId: task_bytedance_1765177777132
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
      security: []
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
                              example: 1786413282000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 21
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786413258000
                            creditsConsumed:
                              type: number
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 3.5
                              format: double
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: bytedance/seedream
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"image_size\":\"square_hd\",\"guidance_scale\":\"2.5\",\"prompt\":\"A
                                campsite poster in a 2Dflat art style featuring
                                the text ‘Kie AI Seedream 3.0 API’. The scene
                                includes mountains, a brown tent beneath a clear
                                sky, a rabbit, a deer,several small birds, green
                                grass, and a flowing stream, all presented in a
                                clean vector illustration
                                style.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"bytedance/seedream"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/558a0e58d58a6cb69e5c6a55170398da_1_1786413281_4092.jpg"]}
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
                              example: 558a0e58d58a6cb69e5c6a55170398da
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786413282000
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
                            taskId: 558a0e58d58a6cb69e5c6a55170398da
                            model: bytedance/seedream
                            state: success
                            param: >-
                              {"input":"{\"image_size\":\"square_hd\",\"guidance_scale\":\"2.5\",\"prompt\":\"A
                              campsite poster in a 2Dflat art style featuring
                              the text ‘Kie AI Seedream 3.0 API’. The scene
                              includes mountains, a brown tent beneath a clear
                              sky, a rabbit, a deer,several small birds, green
                              grass, and a flowing stream, all presented in a
                              clean vector illustration
                              style.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"bytedance/seedream"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/p/558a0e58d58a6cb69e5c6a55170398da_1_1786413281_4092.jpg"]}
                            completeTime: 1786413282000
                            createTime: 1786413258000
                            costTime: 21
                            creditsConsumed: 3.5
                            updateTime: 1786413282000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 558a0e58d58a6cb69e5c6a55170398da
                            model: bytedance/seedream
                            state: fail
                            param: >-
                              {"input":"{\"image_size\":\"square_hd\",\"guidance_scale\":\"2.5\",\"prompt\":\"A
                              campsite poster in a 2Dflat art style featuring
                              the text ‘Kie AI Seedream 3.0 API’. The scene
                              includes mountains, a brown tent beneath a clear
                              sky, a rabbit, a deer,several small birds, green
                              grass, and a flowing stream, all presented in a
                              clean vector illustration
                              style.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"bytedance/seedream"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786413282000
                            createTime: 1786413258000
                            costTime: 21
                            creditsConsumed: 0
                            updateTime: 1786413282000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Seedream
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506352-run
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
