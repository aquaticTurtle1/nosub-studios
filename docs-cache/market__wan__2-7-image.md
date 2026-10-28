# Wan 2.7 Image

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
      summary: Wan 2.7 Image
      deprecated: false
      description: >-
        Based on wan/2-7-image, image generation and editing are achieved. 


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
      tags:
        - docs/en/Market/Image    Models/Wan
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
                  description: >-
                    Model name for generation tasks. This endpoint currently
                    uses `wan/2-7-image`.
                  enum:
                    - wan/2-7-image
                  default: wan/2-7-image
                  x-apidog-enum:
                    - value: wan/2-7-image
                      name: ''
                      description: ''
                  examples:
                    - wan/2-7-image
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
                  $ref: '#/components/schemas/CallbackUrl'
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Prompt for image generation or editing. This field
                        supports both Chinese and English, with a maximum length
                        of 5000 characters.
                      maxLength: 5000
                      examples:
                        - >-
                          Transform the food photo by replacing the marked
                          ingredients with sliced red chili pieces while
                          preserving the bowl, lighting, steam, camera angle,
                          and overall realism.
                    input_urls:
                      type: array
                      description: (Optional) Array of input image URLs.
                      items:
                        type: string
                        format: uri
                      maxItems: 9
                      examples:
                        - - >-
                            https://static.aiquickdraw.com/tools/example/1775122744247_eSHwJX1k.jpg
                    aspect_ratio:
                      type: string
                      description: >-
                        (Optional) Output aspect ratio when no image input is
                        provided. 
                      examples:
                        - '1:1'
                      enum:
                        - '1:1'
                        - '16:9'
                        - '4:3'
                        - '21:9'
                        - '3:4'
                        - '9:16'
                        - '8:1'
                        - '1:8'
                      x-apidog-enum:
                        - value: '1:1'
                          name: ''
                          description: ''
                        - value: '16:9'
                          name: ''
                          description: ''
                        - value: '4:3'
                          name: ''
                          description: ''
                        - value: '21:9'
                          name: ''
                          description: ''
                        - value: '3:4'
                          name: ''
                          description: ''
                        - value: '9:16'
                          name: ''
                          description: ''
                        - value: '8:1'
                          name: ''
                          description: ''
                        - value: '1:8'
                          name: ''
                          description: ''
                    enable_sequential:
                      type: boolean
                      description: >-
                        Whether to enable sequential/group image mode. Default
                        is false.
                      default: false
                      examples:
                        - false
                    'n':
                      type: integer
                      description: >-
                        Number of images to generate. Range is 1-4 when
                        `enable_sequential=false` (default: 4); range is 1-12
                        when `enable_sequential=true` (default: 12).
                      examples:
                        - 4
                    resolution:
                      type: string
                      description: >-
                        Output resolution: 1K or 2K (default 2K). For 4K, use
                        wan/2-7-image-pro.
                      enum:
                        - 1K
                        - 2K
                      default: 2K
                      examples:
                        - 2K
                    thinking_mode:
                      type: boolean
                      description: >-
                        Whether to enable thinking mode. Only available when
                        `enable_sequential=false` and `input_urls` is empty; it
                        is disabled in other cases.
                      default: false
                      examples:
                        - false
                    color_palette:
                      type: array
                      description: >-
                        (Optional) Custom color theme. Only available when
                        `enable_sequential=false`. Requires 3-10 colors, 8
                        recommended.
                      minItems: 3
                      maxItems: 10
                      items:
                        type: object
                        properties:
                          hex:
                            type: string
                            description: HEX color value.
                            pattern: ^#[0-9A-Fa-f]{6}$
                            examples:
                              - '#C2D1E6'
                          ratio:
                            type: string
                            description: Color proportion, format must be xx.xx%.
                            pattern: ^\d{1,3}\.\d{2}%$
                            examples:
                              - 23.51%
                        required:
                          - hex
                          - ratio
                        x-apidog-orders:
                          - hex
                          - ratio
                        x--orders:
                          - hex
                          - ratio
                        x--ignore-properties: []
                    bbox_list:
                      type: array
                      description: >-
                        (Optional) Interactive editing bounding box areas. The
                        outer list length should match `input_urls`; maximum 2
                        boxes per image; single box format is `[x1, y1, x2,
                        y2]`.
                      items:
                        type: array
                        maxItems: 2
                        items:
                          type: array
                          minItems: 4
                          maxItems: 4
                          items:
                            type: integer
                      examples:
                        - - []
                    watermark:
                      type: boolean
                      description: Whether to add watermark.
                      default: false
                      examples:
                        - false
                    seed:
                      type: integer
                      description: Optional. Omit for a random seed.
                      minimum: 0
                      maximum: 2147483647
                      examples:
                        - 0
                  required:
                    - prompt
                  x-apidog-orders:
                    - prompt
                    - input_urls
                    - aspect_ratio
                    - enable_sequential
                    - 'n'
                    - resolution
                    - thinking_mode
                    - color_palette
                    - bbox_list
                    - watermark
                    - seed
                    - 01KWKM3Z0W5ZTEMZEDV632Q54X
                  examples:
                    - prompt: >-
                        Transform the food photo by replacing the marked
                        ingredients with sliced red chili pieces in the
                        corresponding positions, while keeping the same bowl,
                        composition, steam, lighting, camera angle, background,
                        texture, and overall realism.
                      input_urls:
                        - >-
                          https://static.aiquickdraw.com/tools/example/1775122744247_eSHwJX1k.jpg
                      'n': 4
                      enable_sequential: false
                      resolution: 2K
                      thinking_mode: false
                      watermark: false
                      seed: 0
                      bbox_list:
                        - []
                  x-apidog-refs:
                    01KWKM3Z0W5ZTEMZEDV632Q54X:
                      $ref: '#/components/schemas/nsfw_checker'
                  x--orders:
                    - prompt
                    - input_urls
                    - aspect_ratio
                    - enable_sequential
                    - 'n'
                    - resolution
                    - thinking_mode
                    - color_palette
                    - bbox_list
                    - watermark
                    - seed
                  x--ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x--orders:
                - model
                - callBackUrl
                - input
              x--ignore-properties: []
            examples: {}
      responses:
        '200':
          description: Request successful.
          content:
            application/json:
              schema:
                type: object
                properties: {}
                x-apidog-orders:
                  - 01KN70Z3PJ58VSVYS7VAV8D4BV
                x-apidog-refs:
                  01KN70Z3PJ58VSVYS7VAV8D4BV:
                    $ref: '#/components/schemas/response%20not%20with%20recordId'
                x--orders: []
                x--ignore-properties: []
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
                    x--orders: []
                    x--ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                required:
                  - code
                  - msg
                  - data
                x--orders:
                  - code
                  - msg
                  - data
                x--ignore-properties: []
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
              summary: Image Editing Callback
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
                              example: 1786436986000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 19
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786436966000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 19.2
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: wan/2-7-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"watermark\":false,\"seed\":0,\"thinking_mode\":false,\"bbox_list\":[[]],\"enable_sequential\":false,\"prompt\":\"Transform
                                the food photo by replacing the marked
                                ingredients with sliced red chili pieces in the
                                corresponding positions, while keeping the same
                                bowl, composition, steam, lighting, camera
                                angle, background, texture, and overall
                                realism.\",\"resolution\":\"2K\",\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1775122744247_eSHwJX1k.jpg\"],\"n\":4}","callBackUrl":"https://your-domain.com/api/callback","model":"wan/2-7-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image editing result in JSON string format.
                                resultUrls contains the list of processed image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://example.com/your-image.png","https://example.com/your-image.png","https://example.com/your-image.png","https://example.com/your-image.png"]}
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
                              example: ae9fbfbb1bc08526dde77aaa380d94c1
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786436986000
                            failCode:
                              type: string
                              description: >-
                                Failure code, a numeric string such as "400" or
                                "500". Present only when state is fail.
                            failMsg:
                              type: string
                              description: Failure reason. Present only when state is fail.
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          msg: Playground task completed successfully.
                          data:
                            taskId: ae9fbfbb1bc08526dde77aaa380d94c1
                            model: wan/2-7-image
                            state: success
                            param: >-
                              {"input":"{\"watermark\":false,\"seed\":0,\"thinking_mode\":false,\"bbox_list\":[[]],\"enable_sequential\":false,\"prompt\":\"Transform
                              the food photo by replacing the marked ingredients
                              with sliced red chili pieces in the corresponding
                              positions, while keeping the same bowl,
                              composition, steam, lighting, camera angle,
                              background, texture, and overall
                              realism.\",\"resolution\":\"2K\",\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1775122744247_eSHwJX1k.jpg\"],\"n\":4}","callBackUrl":"https://your-domain.com/api/callback","model":"wan/2-7-image"}
                            resultJson: >-
                              {"resultUrls":["https://example.com/your-image.png","https://example.com/your-image.png","https://example.com/your-image.png","https://example.com/your-image.png"]}
                            costTime: 19
                            completeTime: 1786436986000
                            createTime: 1786436966000
                            updateTime: 1786436986000
                            creditsConsumed: 19.2
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: ae9fbfbb1bc08526dde77aaa380d94c1
                            model: wan/2-7-image
                            state: fail
                            param: >-
                              {"input":"{\"watermark\":false,\"seed\":0,\"thinking_mode\":false,\"bbox_list\":[[]],\"enable_sequential\":false,\"prompt\":\"Transform
                              the food photo by replacing the marked ingredients
                              with sliced red chili pieces in the corresponding
                              positions, while keeping the same bowl,
                              composition, steam, lighting, camera angle,
                              background, texture, and overall
                              realism.\",\"resolution\":\"2K\",\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1775122744247_eSHwJX1k.jpg\"],\"n\":4}","callBackUrl":"https://your-domain.com/api/callback","model":"wan/2-7-image"}
                            costTime: 19
                            completeTime: 1786436986000
                            createTime: 1786436966000
                            updateTime: 1786436986000
                            creditsConsumed: 0
                            failCode: '500'
                            failMsg: <error detail>
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Wan
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-32370659-run
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
      x--orders:
        - nsfw_checker
      x--ignore-properties: []
      x-apidog-folder: ''
    CallbackUrl:
      type: string
      format: uri
      description: >-
        The URL to receive generation task completion updates. Optional but
        recommended for production use.


        - System will POST task status and results to this URL when generation
        completes

        - Callback includes generated content URLs and task information

        - Your callback endpoint should accept POST requests with JSON payload
        containing results

        - Alternatively, use the Get Task Details endpoint to poll task status

        - To ensure callback security, see [Webhook Verification
        Guide](/common-api/webhook-verification) for signature verification
        implementation
      examples:
        - https://your-domain.com/api/callback
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
          x--orders:
            - taskId
          x--ignore-properties: []
      x-apidog-orders:
        - code
        - msg
        - data
      x--orders:
        - code
        - msg
        - data
      x--ignore-properties: []
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
