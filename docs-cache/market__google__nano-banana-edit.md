# Google - Nano Banana Edit

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
      summary: Google - Nano Banana Edit
      deprecated: false
      description: >
        Image editing using Google's Nano Banana Edit model


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
      operationId: google-nano-banana-edit
      tags:
        - docs/en/Market/Image    Models/Google
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: google/nano-banana-edit
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `google/nano-banana-edit` for this endpoint
                  enum:
                    - google/nano-banana-edit
                  examples:
                    - google/nano-banana-edit
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
                        The prompt for image editing (Max length: 20000
                        characters)
                      examples:
                        - >-
                          turn this photo into a character figure. Behind it,
                          place a box with the character’s image printed on it,
                          and a computer showing the Blender modeling process on
                          its screen. In front of the box, add a round plastic
                          base with the character figure standing on it. set the
                          scene indoors if possible
                      maxLength: 20000
                      type: string
                    image_urls:
                      description: >-
                        List of URLs of input images for editing,up to 10
                        images. (File URL after upload, not file content;
                        Accepted types: image/jpeg, image/png, image/webp; Max
                        size: 10.0MB)
                      examples:
                        - - >-
                            https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png
                      items:
                        format: uri
                        type: string
                      maxItems: 10
                      type: array
                    output_format:
                      default: png
                      description: Output format for the images
                      enum:
                        - png
                        - jpeg
                      examples:
                        - png
                      type: string
                    aspect_ratio:
                      description: >-
                        Aspect ratio of the output image. Set this field
                        explicitly.
                      enum:
                        - '1:1'
                        - '9:16'
                        - '16:9'
                        - '3:4'
                        - '4:3'
                        - '3:2'
                        - '2:3'
                        - '5:4'
                        - '4:5'
                        - '21:9'
                        - auto
                      examples:
                        - '1:1'
                      type: string
                    image_size:
                      default: '1:1'
                      deprecated: true
                      description: >-
                        The aspect ratio of the generated image (this parameter
                        has been replaced by aspect_ratio; please use the latest
                        aspect_ratio parameter).
                      enum:
                        - '1:1'
                        - '9:16'
                        - '16:9'
                        - '3:4'
                        - '4:3'
                        - '3:2'
                        - '2:3'
                        - '5:4'
                        - '4:5'
                        - '21:9'
                        - auto
                      examples:
                        - '1:1'
                      type: string
                  required:
                    - prompt
                    - image_urls
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - output_format
                    - aspect_ratio
                    - image_size
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
              model: google/nano-banana-edit
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  turn this photo into a character figure. Behind it, place a
                  box with the character’s image printed on it, and a computer
                  showing the Blender modeling process on its screen. In front
                  of the box, add a round plastic base with the character figure
                  standing on it. set the scene indoors if possible
                image_urls:
                  - >-
                    https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png
                output_format: png
                aspect_ratio: '1:1'
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
                  taskId: task_google_1765178615729
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
              - id: PKYBIr614UoX-v-krq5Sv
                schemeIds:
                  - BearerAuth
            use:
              id: PKYBIr614UoX-v-krq5Sv
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
                              example: 1786428283000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 61
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786428202000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 3
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: google/nano-banana-edit
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"output_format\":\"png\",\"aspect_ratio\":\"1:1\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png\"],\"prompt\":\"Convert
                                this photo into a character figurine. Place a
                                packaging box featuring the character's image
                                behind the figurine, with a computer beside it
                                displaying the Blender modeling process on its
                                screen. Add a round plastic base in front of the
                                packaging box and position the character
                                figurine standing on the base. Set the scene in
                                an indoor environment whenever
                                possible.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"google/nano-banana-edit"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/p/bf5a824ce79d693a2a876fb2a8ff9851_1_1786428282_8210.png"]}
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
                              example: bf5a824ce79d693a2a876fb2a8ff9851
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786428283000
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
                            taskId: bf5a824ce79d693a2a876fb2a8ff9851
                            model: google/nano-banana-edit
                            state: success
                            param: >-
                              {"input":"{\"output_format\":\"png\",\"aspect_ratio\":\"1:1\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png\"],\"prompt\":\"Convert
                              this photo into a character figurine. Place a
                              packaging box featuring the character's image
                              behind the figurine, with a computer beside it
                              displaying the Blender modeling process on its
                              screen. Add a round plastic base in front of the
                              packaging box and position the character figurine
                              standing on the base. Set the scene in an indoor
                              environment whenever
                              possible.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"google/nano-banana-edit"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/p/bf5a824ce79d693a2a876fb2a8ff9851_1_1786428282_8210.png"]}
                            completeTime: 1786428283000
                            createTime: 1786428202000
                            costTime: 61
                            creditsConsumed: 3
                            updateTime: 1786428283000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: bf5a824ce79d693a2a876fb2a8ff9851
                            model: google/nano-banana-edit
                            state: fail
                            param: >-
                              {"input":"{\"output_format\":\"png\",\"aspect_ratio\":\"1:1\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/1756223420389w8xa2jfe.png\"],\"prompt\":\"Convert
                              this photo into a character figurine. Place a
                              packaging box featuring the character's image
                              behind the figurine, with a computer beside it
                              displaying the Blender modeling process on its
                              screen. Add a round plastic base in front of the
                              packaging box and position the character figurine
                              standing on the base. Set the scene in an indoor
                              environment whenever
                              possible.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"google/nano-banana-edit"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786428283000
                            createTime: 1786428202000
                            costTime: 61
                            creditsConsumed: 0
                            updateTime: 1786428283000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Google
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506361-run
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
