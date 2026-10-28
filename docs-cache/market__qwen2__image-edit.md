# Qwen2 - Image Edit

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
      summary: Qwen2 - Image Edit
      deprecated: false
      description: >-
        Image generation by qwen2/image-edit


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
      operationId: qwen2-image-edit
      tags:
        - docs/en/Market/Image    Models/Qwen
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: qwen2/image-edit
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `qwen2/image-edit` for this endpoint
                  enum:
                    - qwen2/image-edit
                  examples:
                    - qwen2/image-edit
                  type: string
                  x-apidog-enum:
                    - description: ''
                      name: ''
                      value: qwen2/image-edit
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
                        The prompt to generate the image with (Max length: 800
                        characters)
                      examples:
                        - Make the sky a warm sunset.
                      maxLength: 800
                      type: string
                    image_url:
                      description: >-
                        URLs of the images to edit. Supports up to 3 images.
                        (File URL after upload, not file content; Accepted
                        types: image/jpeg, image/png, image/webp; Max size:
                        10.0MB)
                      examples:
                        - - >-
                            https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg
                      type: array
                      items:
                        type: string
                      maxItems: 3
                    image_size:
                      default: '16:9'
                      description: 'The size of the generated image. Default value: 16:9'
                      enum:
                        - '1:1'
                        - '2:3'
                        - '3:2'
                        - '3:4'
                        - '4:3'
                        - '9:16'
                        - '16:9'
                        - '21:9'
                      examples:
                        - '16:9'
                      type: string
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: '1:1'
                        - description: ''
                          name: ''
                          value: '2:3'
                        - description: ''
                          name: ''
                          value: '3:2'
                        - description: ''
                          name: ''
                          value: '3:4'
                        - description: ''
                          name: ''
                          value: '4:3'
                        - description: ''
                          name: ''
                          value: '9:16'
                        - description: ''
                          name: ''
                          value: '16:9'
                        - description: ''
                          name: ''
                          value: '21:9'
                    seed:
                      description: >-
                        The same seed and the same prompt given to the same
                        version of the model will output the same image every
                        time.
                      type: integer
                    output_format:
                      description: 'Output format: png or jpeg. Set this field explicitly.'
                      enum:
                        - jpeg
                        - png
                      examples:
                        - png
                      type: string
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - image_url
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - image_size
                    - seed
                    - output_format
                    - 01KWKM0Y0VH804SXN1Y4W9KBWJ
                  x-apidog-refs:
                    01KWKM0Y0VH804SXN1Y4W9KBWJ:
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
              model: qwen2/image-edit
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: Make the sky a warm sunset.
                image_url:
                  - >-
                    https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg
                image_size: '16:9'
                output_format: png
                seed: 0
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
                  taskId: task_qwen_1765179676651
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
                              example: 1786435002000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 7
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786434994000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 5.6
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: qwen2/image-edit
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"output_format\":\"png\",\"seed\":0,\"image_size\":\"16:9\",\"image_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg\",\"prompt\":\"Increase
                                the image
                                size\"}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2/image-edit"}
                            resultJson:
                              type: string
                              description: >-
                                Image editing result in JSON string format.
                                resultUrls contains the list of processed image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/qwen2/1786435000213-m76chh0hfq.png"]}
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
                              example: 544336bf13104a44ccbf4c8fbc953ed7
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786435002000
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
                            taskId: 544336bf13104a44ccbf4c8fbc953ed7
                            model: qwen2/image-edit
                            state: success
                            param: >-
                              {"input":"{\"output_format\":\"png\",\"seed\":0,\"image_size\":\"16:9\",\"image_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg\",\"prompt\":\"Increase
                              the image
                              size\"}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2/image-edit"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/qwen2/1786435000213-m76chh0hfq.png"]}
                            completeTime: 1786435002000
                            createTime: 1786434994000
                            costTime: 7
                            creditsConsumed: 5.6
                            updateTime: 1786435002000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 544336bf13104a44ccbf4c8fbc953ed7
                            model: qwen2/image-edit
                            state: fail
                            param: >-
                              {"input":"{\"output_format\":\"png\",\"seed\":0,\"image_size\":\"16:9\",\"image_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg\",\"prompt\":\"Increase
                              the image
                              size\"}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2/image-edit"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786435002000
                            createTime: 1786434994000
                            costTime: 7
                            creditsConsumed: 0
                            updateTime: 1786435002000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Qwen
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-30609477-run
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
