# Topaz - Image Upscale

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
      summary: Topaz - Image Upscale
      deprecated: false
      description: >
        Enhance image resolution and quality using advanced AI upscaling powered
        by Topaz


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
      operationId: topaz-image-upscale
      tags:
        - docs/en/Market/Image    Models/Topaz
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: topaz/image-upscale
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `topaz/image-upscale` for this endpoint
                  enum:
                    - topaz/image-upscale
                  examples:
                    - topaz/image-upscale
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
                    image_url:
                      description: >-
                        Url of the image to be upscaled (File URL after upload,
                        not file content; Accepted types: image/jpeg, image/png,
                        image/webp; Max size: 10.0MB)
                      examples:
                        - >-
                          https://static.aiquickdraw.com/tools/example/1762752805607_mErUj1KR.png
                      type: string
                    upscale_factor:
                      default: '2'
                      description: >-
                        Factor to upscale the image by (e.g. 2 doubles width and
                        height).
                      enum:
                        - '1'
                        - '2'
                        - '4'
                      examples:
                        - '2'
                      type: string
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: '1'
                        - description: ''
                          name: ''
                          value: '2'
                        - description: ''
                          name: ''
                          value: '4'
                  required:
                    - image_url
                    - upscale_factor
                  type: object
                  x-apidog-orders:
                    - image_url
                    - upscale_factor
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
              model: topaz/image-upscale
              callBackUrl: https://your-domain.com/api/callback
              input:
                image_url: >-
                  https://static.aiquickdraw.com/tools/example/1762752805607_mErUj1KR.png
                upscale_factor: '2'
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
                  taskId: task_topaz_1765176093786
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
              summary: Image Upscaling Callback
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
                              example: 1786433399000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 72
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786433326000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 10
                            model:
                              type: string
                              description: Image upscaling model used for the task
                              example: topaz/image-upscale
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"upscale_factor\":\"2\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1762752805607_mErUj1KR.png\"}","callBackUrl":"https://your-domain.com/api/callback","model":"topaz/image-upscale"}
                            resultJson:
                              type: string
                              description: >-
                                Image upscaling result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/h/ea2e1877719c0f0deac55d0a9d6cf7ef_1786433397.png"]}
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
                              example: ea2e1877719c0f0deac55d0a9d6cf7ef
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786433399000
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
                            taskId: ea2e1877719c0f0deac55d0a9d6cf7ef
                            model: topaz/image-upscale
                            state: success
                            param: >-
                              {"input":"{\"upscale_factor\":\"2\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1762752805607_mErUj1KR.png\"}","callBackUrl":"https://your-domain.com/api/callback","model":"topaz/image-upscale"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/h/ea2e1877719c0f0deac55d0a9d6cf7ef_1786433397.png"]}
                            completeTime: 1786433399000
                            createTime: 1786433326000
                            costTime: 72
                            creditsConsumed: 10
                            updateTime: 1786433399000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: ea2e1877719c0f0deac55d0a9d6cf7ef
                            model: topaz/image-upscale
                            state: fail
                            param: >-
                              {"input":"{\"upscale_factor\":\"2\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1762752805607_mErUj1KR.png\"}","callBackUrl":"https://your-domain.com/api/callback","model":"topaz/image-upscale"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786433399000
                            createTime: 1786433326000
                            costTime: 72
                            creditsConsumed: 0
                            updateTime: 1786433399000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Topaz
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506373-run
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
