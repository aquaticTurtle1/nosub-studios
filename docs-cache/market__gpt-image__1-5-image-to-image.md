# GPT Image-1.5 - Image to Image

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
      summary: GPT Image-1.5 - Image to Image
      deprecated: false
      description: >
        ## Overview


        Generate images from input images using the GPT Image 1.5 Image To Image
        model. This model allows you to edit or modify existing images with text
        prompts. The process consists of two steps: create a generation task and
        query task status and results.


        ## File Upload Requirements


        Before using this API, you need to upload your image files:


        <Steps>

        <Step title="Upload Image">
          Use the File Upload API to upload your source image.

          <Card title="File Upload API" icon="lucide-upload" href="/file-upload-api/quickstart">
            Learn how to upload images and get file URLs
          </Card>
        </Step>


        <Step title="Get File URL">
          After upload, you'll receive a file URL that you can use in the `input_urls` parameter.
        </Step>

        </Steps>


        :::warning

        - Supported formats: JPEG, PNG, WebP

        - Maximum file size: 10MB

        - Maximum 16 input URLs per request

        - Images should be appropriate and follow usage guidelines

        :::


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
      operationId: gpt-image-1-5-image-to-image
      tags:
        - docs/en/Market/Image    Models/GPT Image
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: gpt-image/1.5-image-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `gpt-image/1.5-image-to-image` for this endpoint
                  enum:
                    - gpt-image/1.5-image-to-image
                  examples:
                    - gpt-image/1.5-image-to-image
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
                    input_urls:
                      description: >-
                        Upload an image file to use as input for the API (File
                        URL after upload, not file content; Accepted types:
                        image/jpeg, image/png, image/webp; Max size: 10.0MB)
                      examples:
                        - - >-
                            https://static.aiquickdraw.com/tools/example/1765962794374_GhtqB9oX.webp
                      items:
                        format: uri
                        type: string
                      maxItems: 16
                      type: array
                    prompt:
                      description: A text description of the image you want to generate
                      examples:
                        - >-
                          Edit the image to dress the woman using the provided
                          clothing images. Preserve her exact likeness,
                          expression, hairstyle, and proportions. Replace only
                          the clothing, fitting the garments naturally to her
                          existing pose and body geometry with realistic fabric
                          behavior. Match lighting, shadows, and color
                          temperature to the original photo so the outfit
                          integrates photorealistically, without looking pasted
                          on.
                      type: string
                    aspect_ratio:
                      description: >-
                        Required. Width-height ratio of the image, determining
                        its visual form.
                      enum:
                        - '1:1'
                        - '2:3'
                        - '3:2'
                      examples:
                        - '3:2'
                      type: string
                    quality:
                      description: 'Required. Quality: medium=balanced, high=slow/detailed.'
                      enum:
                        - medium
                        - high
                      examples:
                        - medium
                      type: string
                  required:
                    - input_urls
                    - prompt
                    - aspect_ratio
                    - quality
                  type: object
                  x-apidog-orders:
                    - input_urls
                    - prompt
                    - aspect_ratio
                    - quality
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
              model: gpt-image/1.5-image-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                input_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/1765962794374_GhtqB9oX.webp
                prompt: >-
                  Edit the image to dress the woman using the provided clothing
                  images. Preserve her exact likeness, expression, hairstyle,
                  and proportions. Replace only the clothing, fitting the
                  garments naturally to her existing pose and body geometry with
                  realistic fabric behavior. Match lighting, shadows, and color
                  temperature to the original photo so the outfit integrates
                  photorealistically, without looking pasted on.
                aspect_ratio: '3:2'
                quality: medium
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
                  taskId: task_gpt-image_1765968156336
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
                              example: 1786432473000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 76
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786432397000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 4
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: gpt-image/1.5-image-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"3:2\",\"prompt\":\"Edit
                                the image to dress the woman using the provided
                                clothing images. Preserve her exact likeness,
                                expression, hairstyle, and proportions. Replace
                                only the clothing, fitting the garments
                                naturally to her existing pose and body geometry
                                with realistic fabric behavior. Match lighting,
                                shadows, and color temperature to the original
                                photo so the outfit integrates
                                photorealistically, without looking pasted
                                on.\",\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1765962794374_GhtqB9oX.webp\"],\"quality\":\"medium\"}","callBackUrl":"https://your-domain.com/api/callback","model":"gpt-image/1.5-image-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/images/chatgpt/file_00000000a2ec81f7824e0c47380c4e2e.png"]}
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
                              example: 4365c9c9261f1623f40e86acf09da76d
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786432473000
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
                            taskId: 4365c9c9261f1623f40e86acf09da76d
                            model: gpt-image/1.5-image-to-image
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"3:2\",\"prompt\":\"Edit
                              the image to dress the woman using the provided
                              clothing images. Preserve her exact likeness,
                              expression, hairstyle, and proportions. Replace
                              only the clothing, fitting the garments naturally
                              to her existing pose and body geometry with
                              realistic fabric behavior. Match lighting,
                              shadows, and color temperature to the original
                              photo so the outfit integrates photorealistically,
                              without looking pasted
                              on.\",\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1765962794374_GhtqB9oX.webp\"],\"quality\":\"medium\"}","callBackUrl":"https://your-domain.com/api/callback","model":"gpt-image/1.5-image-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/images/chatgpt/file_00000000a2ec81f7824e0c47380c4e2e.png"]}
                            completeTime: 1786432473000
                            createTime: 1786432397000
                            costTime: 76
                            creditsConsumed: 4
                            updateTime: 1786432473000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 4365c9c9261f1623f40e86acf09da76d
                            model: gpt-image/1.5-image-to-image
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"3:2\",\"prompt\":\"Edit
                              the image to dress the woman using the provided
                              clothing images. Preserve her exact likeness,
                              expression, hairstyle, and proportions. Replace
                              only the clothing, fitting the garments naturally
                              to her existing pose and body geometry with
                              realistic fabric behavior. Match lighting,
                              shadows, and color temperature to the original
                              photo so the outfit integrates photorealistically,
                              without looking pasted
                              on.\",\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1765962794374_GhtqB9oX.webp\"],\"quality\":\"medium\"}","callBackUrl":"https://your-domain.com/api/callback","model":"gpt-image/1.5-image-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786432473000
                            createTime: 1786432397000
                            costTime: 76
                            creditsConsumed: 0
                            updateTime: 1786432473000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/GPT Image
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506372-run
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
