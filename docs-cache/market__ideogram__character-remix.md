# Ideogram - Character Remix

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
      summary: Ideogram - Character Remix
      deprecated: false
      description: >-
        Image generation by ideogram/character-remix


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
      operationId: ideogram-character-remix
      tags:
        - docs/en/Market/Image    Models/Ideogram
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
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
                    expand_prompt:
                      description: >-
                        Determine if MagicPrompt should be used in generating
                        the request or not. Default value: true (Boolean value
                        (true/false))
                      examples:
                        - true
                      type: boolean
                    image_size:
                      default: square_hd
                      description: Output image size.
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
                    image_url:
                      description: >-
                        The image URL to remix (File URL after upload, not file
                        content; Accepted types: image/jpeg, image/png,
                        image/webp; Max size: 10.0MB)
                      examples:
                        - >-
                          https://file.aiquickdraw.com/custom-page/akr/section-images/1755768466167d0tiuc6e.webp
                      type: string
                    image_urls:
                      description: >-
                        A set of images to use as style references (maximum
                        total size 10MB across all style references). The images
                        should be in JPEG, PNG or WebP format (File URL after
                        upload, not file content; Accepted types: image/jpeg,
                        image/png, image/webp; Max size: 10.0MB)
                      examples:
                        - []
                      items:
                        format: uri
                        type: string
                      type: array
                      maxItems: 5
                    negative_prompt:
                      description: >-
                        Description of what to exclude from an image.
                        Descriptions in the prompt take precedence to
                        descriptions in the negative prompt. Default value: ""
                        (Max length: 500 characters)
                      examples:
                        - ''
                      maxLength: 500
                      type: string
                    num_images:
                      default: '1'
                      description: Number of images to generate.
                      enum:
                        - '1'
                        - '2'
                        - '3'
                        - '4'
                      examples:
                        - '1'
                      type: string
                    prompt:
                      description: >-
                        The prompt to remix the image with (Max length: 5000
                        characters)
                      examples:
                        - >-
                          A fisheye lens selfie photograph taken at night on an
                          urban street. The image is circular with a black
                          border and shows a person wearing dark sunglasses and
                          a black jacket, holding a silver digital camera up to
                          capture the reflection. The background shows a row of
                          shuttered storefronts with red neon lighting visible
                          in the upper portion. The street is empty and dark,
                          with street lights creating a warm glow along the
                          sidewalk. The fisheye effect creates a curved,
                          distorted perspective that bends the straight lines of
                          the street and buildings. The lighting is
                          predominantly red and dark, creating a moody urban
                          atmosphere. The person's reflection shows long dark
                          hair and is positioned in the center of the circular
                          frame. Multiple storefront shutters are visible in the
                          background, creating a repeating pattern of horizontal
                          lines. The overall composition has a cinematic quality
                          with strong contrast between the dark street and the
                          illuminated storefronts above.
                      maxLength: 5000
                      type: string
                    reference_image_urls:
                      description: >-
                        A set of images to use as character references.
                        Currently only 1 image is supported, rest will be
                        ignored. (maximum total size 10MB across all character
                        references). The images should be in JPEG, PNG or WebP
                        format (File URL after upload, not file content;
                        Accepted types: image/jpeg, image/png, image/webp; Max
                        size: 10.0MB)
                      examples:
                        - - >-
                            https://file.aiquickdraw.com/custom-page/akr/section-images/1755768479029sugx0g6f.webp
                      items:
                        format: uri
                        type: string
                      type: array
                      maxItems: 1
                    reference_mask_urls:
                      description: >-
                        A set of masks to apply to the character references.
                        Currently only 1 mask is supported, rest will be
                        ignored. (maximum total size 10MB across all character
                        references). The masks should be in JPEG, PNG or WebP
                        format (File URL after upload, not file content;
                        Accepted types: image/jpeg, image/png, image/webp; Max
                        size: 10.0MB)
                      examples:
                        - ''
                      type: string
                    rendering_speed:
                      default: BALANCED
                      description: 'The rendering speed to use. Default value: "BALANCED"'
                      enum:
                        - TURBO
                        - BALANCED
                        - QUALITY
                      examples:
                        - BALANCED
                      type: string
                    seed:
                      description: Seed for the random number generator
                      type: integer
                    strength:
                      default: 0.8
                      description: >-
                        Strength of the input image in the remix Default value:
                        0.8 (Min: 0.1, Max: 1, Step: 0.1) (step: 0.1)
                      examples:
                        - 0.8
                      maximum: 1
                      minimum: 0.1
                      type: number
                    style:
                      default: AUTO
                      description: 'The style type to generate with. Default value: "AUTO"'
                      enum:
                        - AUTO
                        - REALISTIC
                        - FICTION
                      examples:
                        - AUTO
                      type: string
                  required:
                    - image_url
                    - prompt
                    - reference_image_urls
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - reference_image_urls
                    - rendering_speed
                    - style
                    - expand_prompt
                    - image_size
                    - num_images
                    - seed
                    - strength
                    - negative_prompt
                    - image_urls
                    - reference_mask_urls
                  x--orders:
                    - expand_prompt
                    - image_size
                    - image_url
                    - image_urls
                    - negative_prompt
                    - num_images
                    - prompt
                    - reference_image_urls
                    - reference_mask_urls
                    - rendering_speed
                    - seed
                    - strength
                    - style
                  x--ignore-properties: []
                model:
                  default: ideogram/character-remix
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `ideogram/character-remix` for this endpoint
                  enum:
                    - ideogram/character-remix
                  examples:
                    - ideogram/character-remix
                  type: string
              required:
                - model
              type: object
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x--orders:
                - callBackUrl
                - input
                - model
              x--ignore-properties: []
            example:
              model: ideogram/character-remix
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A fisheye lens selfie photograph taken at night on an urban
                  street. The image is circular with a black border and shows a
                  person wearing dark sunglasses and a black jacket, holding a
                  silver digital camera up to capture the reflection. The
                  background shows a row of shuttered storefronts with red neon
                  lighting visible in the upper portion. The street is empty and
                  dark, with street lights creating a warm glow along the
                  sidewalk. The fisheye effect creates a curved, distorted
                  perspective that bends the straight lines of the street and
                  buildings. The lighting is predominantly red and dark,
                  creating a moody urban atmosphere. The person's reflection
                  shows long dark hair and is positioned in the center of the
                  circular frame. Multiple storefront shutters are visible in
                  the background, creating a repeating pattern of horizontal
                  lines. The overall composition has a cinematic quality with
                  strong contrast between the dark street and the illuminated
                  storefronts above.
                image_url: >-
                  https://file.aiquickdraw.com/custom-page/akr/section-images/1755768466167d0tiuc6e.webp
                reference_image_urls:
                  - >-
                    https://file.aiquickdraw.com/custom-page/akr/section-images/1755768479029sugx0g6f.webp
                rendering_speed: BALANCED
                style: AUTO
                expand_prompt: true
                image_size: square_hd
                num_images: '1'
                strength: 0.8
                negative_prompt: ''
                image_urls: []
                reference_mask_urls: ''
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
                  taskId: task_ideogram_1765179916266
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
                                Task completion time as a Unix timestamp in
                                milliseconds
                              example: 1786427040000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 48
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time as a Unix timestamp in
                                milliseconds
                              example: 1786426989000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 18
                            model:
                              type: string
                              description: Model used for image editing
                              example: ideogram/character-remix
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task,
                                formatted as a JSON string
                              example: >-
                                {"model":"ideogram/character-remix","callBackUrl":"https://your-domain.com/api/callback","input":{"prompt":"A
                                fisheye-lens selfie taken on a city street at
                                night. The image is circular with a black
                                border. The subject wears dark sunglasses and a
                                black jacket,holding a silver digital camera up
                                to capture their reflection. In the background,
                                a row of closed storefront shutters is visible
                                beneath red neon lights. The street is empty and
                                dimly lit, with streetlights casting a warm glow
                                onto the sidewalk. The fisheye effect creates a
                                curved,distorted perspective, causing the
                                straight lines of the street and buildings to
                                appear arched. The image is dominated by red and
                                dark tones,creating a highly atmospheric urban
                                mood. The subject's reflection, with dark long
                                hair visible, is positioned in the center of the
                                circular frame. Multiple storefront shutters
                                form repeating horizontal patterns in the
                                background. The overall composition has a
                                cinematic quality, with a strong contrast
                                between the dim street and the brightly
                                illuminated storefront
                                above.","image_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755768466167d0tiuc6e.webp","reference_image_urls":["https://file.aiquickdraw.com/custom-page/akr/section-images/1755768479029sugx0g6f.webp"],"rendering_speed":"BALANCED","style":"AUTO","expand_prompt":true,"image_size":"square_hd","num_images":"1","strength":0.8,"negative_prompt":"","image_urls":[],"reference_mask_urls":""}}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result formatted as a JSON
                                string. resultUrls contains the list of
                                generated image URLs. Present only when state is
                                success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/image_90b6bf4499a80b74a2b5ee640b7aaf70.webp"]}
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
                              example: 4e029a320e97cff234e6e06827c3965e
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786427040000
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
                            taskId: 4e029a320e97cff234e6e06827c3965e
                            model: ideogram/character-remix
                            state: success
                            param: >-
                              {"model":"ideogram/character-remix","callBackUrl":"https://your-domain.com/api/callback","input":{"prompt":"A
                              fisheye-lens selfie taken on a city street at
                              night. The image is circular with a black border.
                              The subject wears dark sunglasses and a black
                              jacket,holding a silver digital camera up to
                              capture their reflection. In the background, a row
                              of closed storefront shutters is visible beneath
                              red neon lights. The street is empty and dimly
                              lit, with streetlights casting a warm glow onto
                              the sidewalk. The fisheye effect creates a
                              curved,distorted perspective, causing the straight
                              lines of the street and buildings to appear
                              arched. The image is dominated by red and dark
                              tones,creating a highly atmospheric urban mood.
                              The subject's reflection, with dark long hair
                              visible, is positioned in the center of the
                              circular frame. Multiple storefront shutters form
                              repeating horizontal patterns in the background.
                              The overall composition has a cinematic quality,
                              with a strong contrast between the dim street and
                              the brightly illuminated storefront
                              above.","image_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755768466167d0tiuc6e.webp","reference_image_urls":["https://file.aiquickdraw.com/custom-page/akr/section-images/1755768479029sugx0g6f.webp"],"rendering_speed":"BALANCED","style":"AUTO","expand_prompt":true,"image_size":"square_hd","num_images":"1","strength":0.8,"negative_prompt":"","image_urls":[],"reference_mask_urls":""}}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/image_90b6bf4499a80b74a2b5ee640b7aaf70.webp"]}
                            completeTime: 1786427040000
                            createTime: 1786426989000
                            costTime: 48
                            creditsConsumed: 18
                            updateTime: 1786427040000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 4e029a320e97cff234e6e06827c3965e
                            model: ideogram/character-remix
                            state: fail
                            param: >-
                              {"model":"ideogram/character-remix","callBackUrl":"https://your-domain.com/api/callback","input":{"prompt":"A
                              fisheye-lens selfie taken on a city street at
                              night. The image is circular with a black border.
                              The subject wears dark sunglasses and a black
                              jacket,holding a silver digital camera up to
                              capture their reflection. In the background, a row
                              of closed storefront shutters is visible beneath
                              red neon lights. The street is empty and dimly
                              lit, with streetlights casting a warm glow onto
                              the sidewalk. The fisheye effect creates a
                              curved,distorted perspective, causing the straight
                              lines of the street and buildings to appear
                              arched. The image is dominated by red and dark
                              tones,creating a highly atmospheric urban mood.
                              The subject's reflection, with dark long hair
                              visible, is positioned in the center of the
                              circular frame. Multiple storefront shutters form
                              repeating horizontal patterns in the background.
                              The overall composition has a cinematic quality,
                              with a strong contrast between the dim street and
                              the brightly illuminated storefront
                              above.","image_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755768466167d0tiuc6e.webp","reference_image_urls":["https://file.aiquickdraw.com/custom-page/akr/section-images/1755768479029sugx0g6f.webp"],"rendering_speed":"BALANCED","style":"AUTO","expand_prompt":true,"image_size":"square_hd","num_images":"1","strength":0.8,"negative_prompt":"","image_urls":[],"reference_mask_urls":""}}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786427040000
                            createTime: 1786426989000
                            costTime: 48
                            creditsConsumed: 0
                            updateTime: 1786427040000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Ideogram
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506378-run
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
