# Flux-2 - Pro Text to Image

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
      summary: Flux-2 - Pro Text to Image
      deprecated: false
      description: >
        High-quality photorealistic image generation powered by Flux-2's
        advanced AI model


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
      operationId: flux-2-pro-text-to-image
      tags:
        - docs/en/Market/Image    Models/Flux-2
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: flux-2/pro-text-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `flux-2/pro-text-to-image` for this endpoint
                  enum:
                    - flux-2/pro-text-to-image
                  examples:
                    - flux-2/pro-text-to-image
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
                      description: ' Must be between 3 and 5000 characters. (Max length: 5000 characters)'
                      examples:
                        - >-
                          Hyperrealistic supermarket blister pack on clean olive
                          green surface. No shadows. Inside: bright pink 3D
                          letters spelling "FLUX.2" pressing against stretched
                          plastic film, creating realistic deformation and
                          reflective highlights. Bottom left corner: barcode
                          sticker with text "GENERATE NOW" and "PLAYGROUND".
                          Plastic shows tension wrinkles and realistic shine
                          where stretched by the volumetric letters.
                      maxLength: 5000
                      type: string
                    aspect_ratio:
                      description: Required. Aspect ratio for the generated image.
                      enum:
                        - '1:1'
                        - '4:3'
                        - '3:4'
                        - '16:9'
                        - '9:16'
                        - '3:2'
                        - '2:3'
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
                          value: '3:2'
                        - description: ''
                          name: ''
                          value: '2:3'
                    resolution:
                      description: Required. Output image resolution.
                      enum:
                        - 1K
                        - 2K
                      examples:
                        - 1K
                      type: string
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - aspect_ratio
                    - resolution
                  type: object
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - resolution
                    - 01KWKKKH6B3CDM7AGTZXZCPH5P
                  x-apidog-refs:
                    01KWKKKH6B3CDM7AGTZXZCPH5P:
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
              model: flux-2/pro-text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Hyperrealistic supermarket blister pack on clean olive green
                  surface. No shadows. Inside: bright pink 3D letters spelling
                  "FLUX.2" pressing against stretched plastic film, creating
                  realistic deformation and reflective highlights. Bottom left
                  corner: barcode sticker with text "GENERATE NOW" and
                  "PLAYGROUND". Plastic shows tension wrinkles and realistic
                  shine where stretched by the volumetric letters.
                aspect_ratio: '1:1'
                resolution: 1K
                nsfw_checker: false
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
                  taskId: task_flux-2_1765175072483
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
                              example: 1786430358000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 26
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786430330000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 5
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: flux-2/pro-text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"Hyperrealistic
                                supermarket blister pack on a clean olive-green
                                surface. No shadows. Inside, bright pink 3D
                                letters spelling \\\"FLUX.2\\\" press against
                                stretched plastic film, creating realistic
                                deformation and reflective highlights. In the
                                bottom-left corner, include a barcode sticker
                                with the text \\\"GENERATE NOW\\\" and
                                \\\"PLAYGROUND\\\". The plastic shows tension
                                wrinkles and realistic shine where stretched by
                                the volumetric
                                letters.\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"flux-2/pro-text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/h/e0af60383dfdb1d6bfb6bd40d9e6f891_1786430355.png"]}
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
                              example: e0af60383dfdb1d6bfb6bd40d9e6f891
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786430358000
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
                            taskId: e0af60383dfdb1d6bfb6bd40d9e6f891
                            model: flux-2/pro-text-to-image
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"Hyperrealistic
                              supermarket blister pack on a clean olive-green
                              surface. No shadows. Inside, bright pink 3D
                              letters spelling \\\"FLUX.2\\\" press against
                              stretched plastic film, creating realistic
                              deformation and reflective highlights. In the
                              bottom-left corner, include a barcode sticker with
                              the text \\\"GENERATE NOW\\\" and
                              \\\"PLAYGROUND\\\". The plastic shows tension
                              wrinkles and realistic shine where stretched by
                              the volumetric
                              letters.\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"flux-2/pro-text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/h/e0af60383dfdb1d6bfb6bd40d9e6f891_1786430355.png"]}
                            completeTime: 1786430358000
                            createTime: 1786430330000
                            costTime: 26
                            creditsConsumed: 5
                            updateTime: 1786430358000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: e0af60383dfdb1d6bfb6bd40d9e6f891
                            model: flux-2/pro-text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"Hyperrealistic
                              supermarket blister pack on a clean olive-green
                              surface. No shadows. Inside, bright pink 3D
                              letters spelling \\\"FLUX.2\\\" press against
                              stretched plastic film, creating realistic
                              deformation and reflective highlights. In the
                              bottom-left corner, include a barcode sticker with
                              the text \\\"GENERATE NOW\\\" and
                              \\\"PLAYGROUND\\\". The plastic shows tension
                              wrinkles and realistic shine where stretched by
                              the volumetric
                              letters.\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"flux-2/pro-text-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786430358000
                            createTime: 1786430330000
                            costTime: 26
                            creditsConsumed: 0
                            updateTime: 1786430358000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Flux-2
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506365-run
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
