# Seedream5.0 Pro - Text to Image

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
      summary: Seedream5.0 Pro - Text to Image
      deprecated: false
      description: >
        High-quality photorealistic image generation powered by Seedream's
        advanced AI model


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
      operationId: seedream-5-pro-text-to-image
      tags:
        - docs/en/Market/Image    Models/Seedream
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: seedream/5-pro-text-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `seedream/5-pro-text-to-image` for this endpoint
                  enum:
                    - seedream/5-pro-text-to-image
                  examples:
                    - seedream/5-pro-text-to-image
                  type: string
                  x-apidog-enum:
                    - description: ''
                      name: ''
                      value: seedream/5-pro-text-to-image
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
                      description: Text prompt, 4–5000 characters.
                      examples:
                        - >-
                          A full-process cafe design tool for entrepreneurs and
                          designers. It covers core needs including store
                          layout, functional zoning, decoration style, equipment
                          selection, and customer group adaptation, supporting
                          integrated planning of "commercial attributes +
                          aesthetic design." Suitable as a promotional image for
                          a cafe design SaaS product, with a 16:9 aspect ratio.
                      maxLength: 5000
                      minLength: 4
                      type: string
                    aspect_ratio:
                      description: >-
                        Required. Width-height ratio of the image, determining
                        its visual form.
                      enum:
                        - '1:1'
                        - '4:3'
                        - '3:4'
                        - '16:9'
                        - '9:16'
                        - '2:3'
                        - '3:2'
                        - '21:9'
                      examples:
                        - '1:1'
                      type: string
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: '1:1'
                        - description: ''
                          name: ''
                          value: '4:3'
                        - description: ''
                          name: ''
                          value: '3:4'
                        - description: ''
                          name: ''
                          value: '16:9'
                        - description: ''
                          name: ''
                          value: '9:16'
                        - description: ''
                          name: ''
                          value: '2:3'
                        - description: ''
                          name: ''
                          value: '3:2'
                        - description: ''
                          name: ''
                          value: '21:9'
                    quality:
                      description: >-
                        Required. Basic outputs 1K images, while High outputs 2K
                        images.
                      enum:
                        - basic
                        - high
                      examples:
                        - basic
                      type: string
                    output_format:
                      default: png
                      description: Format of the output image
                      enum:
                        - png
                        - jpeg
                      examples:
                        - png
                      type: string
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: png
                        - description: ''
                          name: ''
                          value: jpeg
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - aspect_ratio
                    - quality
                  type: object
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - quality
                    - output_format
                    - 01KX31P7PWM8T39RWCBB910HAY
                  x-apidog-refs:
                    01KX31P7PWM8T39RWCBB910HAY:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
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
              model: seedream/5-pro-text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A full-process cafe design tool for entrepreneurs and
                  designers. It covers core needs including store layout,
                  functional zoning, decoration style, equipment selection, and
                  customer group adaptation, supporting integrated planning of
                  "commercial attributes + aesthetic design." Suitable as a
                  promotional image for a cafe design SaaS product, with a 16:9
                  aspect ratio.
                aspect_ratio: '1:1'
                quality: basic
                output_format: png
                nsfw_checker: false
      responses:
        '200':
          description: Request successful.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponseWithRecordId'
              example:
                code: 200
                msg: success
                data:
                  taskId: task_seedream_1765166238716
          headers: {}
          x-apidog-name: Success
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
                              example: 1786417135000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 165
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786416968000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 7
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: seedream/5-pro-text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"1:1\",\"output_format\":\"png\",\"prompt\":\"A
                                full-process cafe design toolfor entrepreneurs
                                and designers. It covers core needs including
                                store layout, functional zoning, decoration
                                style, equipment selection, andcustomer group
                                adaptation, supporting integrated planning of
                                \\\"commercial attributes + aesthetic
                                design.\\\" Suitable as apromotional image for a
                                cafe design SaaS product, with a 16:9 aspect
                                ratio.\",\"nsfw_checker\":false,\"quality\":\"basic\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/5-pro-text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/b0e3febbf194d27a345de523d3321555_1_1786417134_1086.png"]}
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
                              example: b0e3febbf194d27a345de523d3321555
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786417135000
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
                            taskId: b0e3febbf194d27a345de523d3321555
                            model: seedream/5-pro-text-to-image
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"output_format\":\"png\",\"prompt\":\"A
                              full-process cafe design toolfor entrepreneurs and
                              designers. It covers core needs including store
                              layout, functional zoning, decoration style,
                              equipment selection, andcustomer group adaptation,
                              supporting integrated planning of \\\"commercial
                              attributes + aesthetic design.\\\" Suitable as
                              apromotional image for a cafe design SaaS product,
                              with a 16:9 aspect
                              ratio.\",\"nsfw_checker\":false,\"quality\":\"basic\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/5-pro-text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/p/b0e3febbf194d27a345de523d3321555_1_1786417134_1086.png"]}
                            completeTime: 1786417135000
                            createTime: 1786416968000
                            costTime: 165
                            creditsConsumed: 7
                            updateTime: 1786417135000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: b0e3febbf194d27a345de523d3321555
                            model: seedream/5-pro-text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"output_format\":\"png\",\"prompt\":\"A
                              full-process cafe design toolfor entrepreneurs and
                              designers. It covers core needs including store
                              layout, functional zoning, decoration style,
                              equipment selection, andcustomer group adaptation,
                              supporting integrated planning of \\\"commercial
                              attributes + aesthetic design.\\\" Suitable as
                              apromotional image for a cafe design SaaS product,
                              with a 16:9 aspect
                              ratio.\",\"nsfw_checker\":false,\"quality\":\"basic\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/5-pro-text-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786417135000
                            createTime: 1786416968000
                            costTime: 165
                            creditsConsumed: 0
                            updateTime: 1786417135000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Seedream
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-39552965-run
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
    ApiResponseWithRecordId:
      type: object
      properties:
        code:
          type: integer
          enum:
            - 200
            - 401
            - 402
            - 404
            - 422
            - 429
            - 455
            - 500
            - 501
            - 505
          description: >-
            Status code of the request. The HTTP status is 200 even when the
            request fails, so always check this field: 200 means success; any
            other value means the request failed and msg describes the reason.
            Common values: 401 invalid or missing API key; 402 insufficient
            credits; 429 rate limit exceeded; 422 or 500 the request could not
            be processed (read msg and check your parameters before retrying).
        msg:
          type: string
          description: Response message, error description when failed
          examples:
            - success
        data:
          type: object
          properties:
            taskId:
              type: string
              description: >-
                Task ID, can be used with Get Task Details endpoint to query
                task status
            recordId:
              type: string
              description: Record ID, can be used to get the record details
          x-apidog-orders:
            - taskId
            - recordId
          x-apidog-ignore-properties: []
      x-apidog-orders:
        - code
        - msg
        - data
      title: response with recordId
      required:
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
