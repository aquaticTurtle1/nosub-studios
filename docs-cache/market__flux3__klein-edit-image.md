# FLUX 3 Klein Edit Image

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
      summary: FLUX 3 Klein Edit Image
      deprecated: false
      description: >

        ## Query Task Status

        After submitting the task, you can check the progress of the task and
        obtain the generated results through the unified query endpoint: 

        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
         Learn how to check the task status and obtain the generated results 
        </Card> 


        ::: tip[]

        In the production environment, it is recommended to use the
        "callBackUrl" parameter to receive the automatic notification upon
        completion of the generation, rather than polling the status endpoint. 

        :::


        Related resources

        <CardGroup cols={2}>
          <Card title="Market Overview" icon="lucide-store" href="/market/quickstart"> View all available models </Card>
          <Card title="General API" icon="lucide-cog" href="/common-api/get-account-credits"> View account credits and usage </Card>
        </CardGroup>
      operationId: flux-3-klein-edit-image
      tags:
        - docs/en/Market/Image    Models/Flux-3
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
                - input
              properties:
                model:
                  type: string
                  enum:
                    - flux-3/klein-edit-image
                  default: flux-3/klein-edit-image
                  description: >-
                    The model name used for generation. This endpoint must use
                    `flux-3/klein-edit-image`.
                callBackUrl:
                  type: string
                  format: uri
                  examples:
                    - https://your-domain.com/api/callback
                  description: >-
                    The URL to receive generation task completion updates.
                    Optional but recommended for production use. The system
                    POSTs the task status and results to this URL when
                    generation completes.


                    To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification).
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      type: string
                      minLength: 1
                      maxLength: 5000
                      description: >-
                        An instruction describing how to edit the image (Max
                        length: 5000 characters)
                    image_urls:
                      type: array
                      minItems: 1
                      maxItems: 10
                      items:
                        type: string
                        pattern: ^https?://.+
                      description: >-
                        Input images to transform or use as reference (supports
                        up to 10 images) (File URL after upload, not file
                        content; Accepted types: image/jpeg, image/png,
                        image/webp; Max size: 30.0MB)
                    aspect_ratio:
                      type: string
                      enum:
                        - '1:1'
                        - '4:3'
                        - '3:4'
                        - '3:2'
                        - '2:3'
                        - '16:9'
                        - '9:16'
                        - '21:9'
                        - '9:21'
                        - auto
                      default: auto
                      description: >-
                        Aspect ratio of the generated image. Select auto to
                        match the first input image ratio.

                        Options: 1:1; 4:3; 3:4; 3:2; 2:3; 16:9; 9:16; 21:9;
                        9:21; auto
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
                          value: '3:2'
                        - description: ''
                          name: ''
                          value: '2:3'
                        - description: ''
                          name: ''
                          value: '16:9'
                        - description: ''
                          name: ''
                          value: '9:16'
                        - description: ''
                          name: ''
                          value: '21:9'
                        - description: ''
                          name: ''
                          value: '9:21'
                        - description: ''
                          name: ''
                          value: auto
                    resolution:
                      type: string
                      enum:
                        - 1K
                        - 2K
                        - 4K
                      default: 1K
                      description: |-
                        Resolution of the generated image
                        Options: 1K; 2K; 4K
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: 1K
                        - description: ''
                          name: ''
                          value: 2K
                        - description: ''
                          name: ''
                          value: 4K
                    width:
                      type: integer
                      minimum: 256
                      maximum: 4096
                      description: >-
                        Width of the generated image. Both width and height must
                        be passed at the same time. Must be an integer between
                        256 and 4096. The aspect ratio (width:height) must be
                        between 1:2.5 and 2.5:1. Once passed, aspect_ratio and
                        resolution are ignored.
                    height:
                      type: integer
                      minimum: 256
                      maximum: 4096
                      description: >-
                        Height of the generated image. Both width and height
                        must be passed at the same time. Must be an integer
                        between 256 and 4096. The aspect ratio (width:height)
                        must be between 1:2.5 and 2.5:1. Once passed,
                        aspect_ratio and resolution are ignored.
                    output_format:
                      type: string
                      enum:
                        - png
                        - jpeg
                        - webp
                      default: png
                      description: |-
                        Format of the output image
                        Options: png; jpeg; webp
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: png
                        - description: ''
                          name: ''
                          value: jpeg
                        - description: ''
                          name: ''
                          value: webp
                    num_images:
                      type: integer
                      minimum: 1
                      maximum: 4
                      default: 1
                      description: Number of images to generate
                    seed:
                      type: integer
                      minimum: 0
                      maximum: 2147483647
                      description: Random seed
                    enhance_prompt:
                      type: boolean
                      enum:
                        - true
                        - false
                      default: true
                      description: >-
                        Rewrites the prompt into a fuller description before
                        generating, which noticeably improves quality. Enabled
                        by default (also when the parameter is omitted); pass
                        false to turn it off. Applies to both text-to-image and
                        image editing; in editing, the rewrite preserves the
                        intent of the original instruction.
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - image_urls
                  dependencies:
                    width:
                      - height
                    height:
                      - width
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - aspect_ratio
                    - resolution
                    - width
                    - height
                    - output_format
                    - num_images
                    - seed
                    - enhance_prompt
                    - 01M5BMR3H1JCQKMRW49R7XETE3
                  x-apidog-refs:
                    01M5BMR3H1JCQKMRW49R7XETE3:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: flux-3/klein-edit-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Change the backpack to dark green and keep everything else
                  unchanged
                image_urls:
                  - https://example.com/input.jpg
                aspect_ratio: auto
                resolution: 1K
                output_format: png
                num_images: 1
                enhance_prompt: false
      responses:
        '200':
          description: Request Successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
              example:
                code: 200
                msg: success
                data:
                  taskId: task_flux-3_klein-edit-image_1765175072483
          headers: {}
          x-apidog-name: 成功
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
                              example: 8
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
                                tasks. 1K = 1.6 / image, 2K = 2.5, 4K = 6.5;
                                billed per output image.
                              example: 1.6
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: flux-3/klein-edit-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"model": "flux-3/klein-edit-image",
                                "callBackUrl":
                                "https://your-domain.com/api/callback", "input":
                                "{\"prompt\": \"Change the backpack to dark
                                green and keep everything else unchanged\",
                                \"image_urls\":
                                [\"https://example.com/input.jpg\"],
                                \"aspect_ratio\": \"auto\", \"resolution\":
                                \"1K\", \"output_format\": \"png\",
                                \"num_images\": 1, \"enhance_prompt\": false}"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":
                                ["https://tempfile.aiquickdraw.com/js/p6/3f2a9c1d0b7e.png"]}
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
                            model: flux-3/klein-edit-image
                            state: success
                            param: >-
                              {"model": "flux-3/klein-edit-image",
                              "callBackUrl":
                              "https://your-domain.com/api/callback", "input":
                              "{\"prompt\": \"Change the backpack to dark green
                              and keep everything else unchanged\",
                              \"image_urls\":
                              [\"https://example.com/input.jpg\"],
                              \"aspect_ratio\": \"auto\", \"resolution\":
                              \"1K\", \"output_format\": \"png\",
                              \"num_images\": 1, \"enhance_prompt\": false}"}
                            resultJson: >-
                              {"resultUrls":
                              ["https://tempfile.aiquickdraw.com/js/p6/3f2a9c1d0b7e.png"]}
                            completeTime: 1786430358000
                            createTime: 1786430330000
                            costTime: 8
                            creditsConsumed: 1.6
                            updateTime: 1786430358000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: e0af60383dfdb1d6bfb6bd40d9e6f891
                            model: flux-3/klein-edit-image
                            state: fail
                            param: >-
                              {"model": "flux-3/klein-edit-image",
                              "callBackUrl":
                              "https://your-domain.com/api/callback", "input":
                              "{\"prompt\": \"Change the backpack to dark green
                              and keep everything else unchanged\",
                              \"image_urls\":
                              [\"https://example.com/input.jpg\"],
                              \"aspect_ratio\": \"auto\", \"resolution\":
                              \"1K\", \"output_format\": \"png\",
                              \"num_images\": 1, \"enhance_prompt\": false}"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786430358000
                            createTime: 1786430330000
                            costTime: 8
                            creditsConsumed: 0
                            updateTime: 1786430358000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Flux-3
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-45558886-run
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
