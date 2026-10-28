# Seedream4.5 - Edit

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
      summary: Seedream4.5 - Edit
      deprecated: false
      description: >
        Image editing by Seedream4.5


        The output format is not fixed: results may be PNG or JPEG.


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
      operationId: seedream-4-5-edit
      tags:
        - docs/en/Market/Image    Models/Seedream
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
              properties:
                model:
                  type: string
                  enum:
                    - seedream/4.5-edit
                  default: seedream/4.5-edit
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `seedream/4.5-edit` for this endpoint
                  examples:
                    - seedream/4.5-edit
                callBackUrl:
                  type: string
                  format: uri
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
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      description: >-
                        A text description of the image you want to generate
                        (Max length: 3000 characters)
                      type: string
                      maxLength: 3000
                      examples:
                        - >-
                          Keep the model's pose and the flowing shape of the
                          liquid dress unchanged. Change the clothing material
                          from silver metal to completely transparent clear
                          water (or glass). Through the liquid water, the
                          model's skin details are visible. Lighting changes
                          from reflection to refraction.
                    image_urls:
                      description: >-
                        Upload an image file to use as input for the API (File
                        URL after upload, not file content; Accepted types:
                        image/jpeg, image/png, image/webp; Max size: 30.0MB)
                      type: array
                      items:
                        type: string
                        format: uri
                      maxItems: 14
                      examples:
                        - - >-
                            https://static.aiquickdraw.com/tools/example/1764851484363_ScV1s2aq.webp
                    aspect_ratio:
                      description: >-
                        Required. Width-height ratio of the image, determining
                        its visual form.
                      type: string
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
                    quality:
                      description: >-
                        Required. Basic outputs 2K images, while High outputs 4K
                        images.
                      type: string
                      enum:
                        - basic
                        - high
                      examples:
                        - basic
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - image_urls
                    - aspect_ratio
                    - quality
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - aspect_ratio
                    - quality
                    - 01KWKKDK5ZN1V5DDC3SBHGKYGP
                  x-apidog-refs:
                    01KWKKDK5ZN1V5DDC3SBHGKYGP:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: seedream/4.5-edit
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Keep the model's pose and the flowing shape of the liquid
                  dress unchanged. Change the clothing material from silver
                  metal to completely transparent clear water (or glass).
                  Through the liquid water, the model's skin details are
                  visible. Lighting changes from reflection to refraction.
                image_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/1764851484363_ScV1s2aq.webp
                aspect_ratio: '1:1'
                quality: basic
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
                  taskId: task_seedream_1765172101886
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
                              example: 1786415673000
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
                              example: 1786415638000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 6.5
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: seedream/4.5-edit
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"1:1\",\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1764851484363_ScV1s2aq.webp\"],\"prompt\":\"Keep
                                the model's pose and the flowing shape of the
                                liquid dress unchanged. Changethe clothing
                                material from silver metal to completely
                                transparent clear water (or glass). Through the
                                liquid water, the model's skin detailsare
                                visible. Lighting changes from reflection to
                                refraction.\",\"nsfw_checker\":true,\"quality\":\"basic\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/4.5-edit"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/8f4544cc6a73916aebae00b285a2e55a_1_1786415672_9284.jpg"]}
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
                              example: 8f4544cc6a73916aebae00b285a2e55a
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786415673000
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
                            taskId: 8f4544cc6a73916aebae00b285a2e55a
                            model: seedream/4.5-edit
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1764851484363_ScV1s2aq.webp\"],\"prompt\":\"Keep
                              the model's pose and the flowing shape of the
                              liquid dress unchanged. Changethe clothing
                              material from silver metal to completely
                              transparent clear water (or glass). Through the
                              liquid water, the model's skin detailsare visible.
                              Lighting changes from reflection to
                              refraction.\",\"nsfw_checker\":true,\"quality\":\"basic\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/4.5-edit"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/p/8f4544cc6a73916aebae00b285a2e55a_1_1786415672_9284.jpg"]}
                            completeTime: 1786415673000
                            createTime: 1786415638000
                            costTime: 29
                            creditsConsumed: 6.5
                            updateTime: 1786415673000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 8f4544cc6a73916aebae00b285a2e55a
                            model: seedream/4.5-edit
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1764851484363_ScV1s2aq.webp\"],\"prompt\":\"Keep
                              the model's pose and the flowing shape of the
                              liquid dress unchanged. Changethe clothing
                              material from silver metal to completely
                              transparent clear water (or glass). Through the
                              liquid water, the model's skin detailsare visible.
                              Lighting changes from reflection to
                              refraction.\",\"nsfw_checker\":true,\"quality\":\"basic\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/4.5-edit"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786415673000
                            createTime: 1786415638000
                            costTime: 29
                            creditsConsumed: 0
                            updateTime: 1786415673000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Seedream
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506356-run
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
