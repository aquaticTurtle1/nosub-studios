# Qwen 2.1 - Image to Image

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
      summary: Qwen 2.1 - Image to Image
      deprecated: false
      description: >-
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
      operationId: playground_350
      tags:
        - docs/en/Market/Image    Models/Qwen
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              additionalProperties: false
              properties:
                model:
                  default: qwen2-1/image-to-image
                  description: >-
                    The model name used for generation. This endpoint must use
                    `qwen2-1/image-to-image`.
                  enum:
                    - qwen2-1/image-to-image
                  type: string
                callBackUrl:
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent. To
                    verify callbacks, see [Webhook Verification
                    Guide](/common-api/webhook-verification).
                  examples:
                    - https://your-domain.com/api/callback
                  format: uri
                  type: string
                input:
                  additionalProperties: false
                  description: Input parameters for the image-to-image generation task.
                  properties:
                    image_urls:
                      description: >-
                        Reference images, given as an array of 1 to 10 http(s)
                        URLs. Required. The order of the array is the order the
                        prompt refers to ("the first image", "the second
                        image"). JPEG, PNG and WebP are supported, up to 30MB
                        and 25MP each, and every URL must be directly
                        retrievable with a GET. If an image URL cannot be
                        fetched, the task fails with failCode 400. With more
                        than 10 entries the request is rejected. The more
                        references you supply the less detail each individual
                        one keeps, so stay within 4 when fidelity matters. When
                        combining several people or objects into a single
                        picture, a landscape ratio such as `3:2` or `16:9`
                        usually gives better results.
                      examples:
                        - - https://example.com/a.jpg
                          - https://example.com/b.jpg
                      items:
                        format: uri
                        type: string
                      maxItems: 10
                      minItems: 1
                      type: array
                    prompt:
                      description: >-
                        The prompt describing the result you want. Required. Any
                        language is supported, up to 5000 characters; if it is
                        longer, the request is rejected. When `mask_url` is
                        supplied, use it to describe what should be generated
                        inside the white area of the mask.
                      examples:
                        - >-
                          Replace the backpack in the first image with the
                          colour scheme from the second image, and leave
                          everything else unchanged
                      maxLength: 5000
                      minLength: 1
                      type: string
                    mask_url:
                      description: >-
                        Inpainting mask that switches the request into
                        local-edit mode. A black and white image where **white
                        marks the area to change and black is kept unchanged**,
                        with a few pixels of feathering along the boundary. It
                        must be used with exactly one entry in `image_urls`,
                        otherwise the request is rejected. The mask should have
                        the same aspect ratio as that reference image; a mask of
                        a different size is scaled to it. In local-edit mode the
                        output ratio follows the reference image, so
                        `aspect_ratio` and `enhance_prompt` are ignored. It
                        cannot be combined with `background: transparent`; such
                        a request is rejected.
                      examples:
                        - https://example.com/room-mask.png
                      format: uri
                      type: string
                    aspect_ratio:
                      default: auto
                      description: >-
                        Output aspect ratio. Defaults to `auto`, which takes the
                        aspect ratio of the first reference image and snaps it
                        to the nearest supported ratio. The actual pixel size
                        also depends on `resolution`. Ignored in local-edit
                        mode.
                      enum:
                        - auto
                        - '1:1'
                        - '4:3'
                        - '3:4'
                        - '3:2'
                        - '2:3'
                        - '16:9'
                        - '9:16'
                        - '21:9'
                        - '9:21'
                      examples:
                        - auto
                      type: string
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: auto
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
                    resolution:
                      default: 1K
                      description: >-
                        Output resolution tier. `1K` is the faster option; `2K`
                        produces four times the pixels and takes considerably
                        longer, up to about 3 minutes with reference images.
                        Only `1K` and `2K` are accepted — with any other value,
                        including `4K`, the request is rejected.
                      enum:
                        - 1K
                        - 2K
                      examples:
                        - 1K
                      type: string
                    background:
                      default: opaque
                      description: >-
                        Background type. transparent outputs a PNG or WebP with
                        a real alpha channel and cannot be used with JPEG. When
                        using transparent, describe only the subject — prompts
                        that mention a background, scene, surface, etc. may
                        produce a non-transparent result.
                      enum:
                        - opaque
                        - transparent
                      examples:
                        - opaque
                      type: string
                    output_format:
                      default: png
                      description: >-
                        Output image format. `png` (default) and `webp` both
                        carry an alpha channel and can be used with `background:
                        transparent`. `jpeg` has no alpha channel and cannot be
                        combined with a transparent background.
                      enum:
                        - png
                        - webp
                        - jpeg
                      examples:
                        - png
                      type: string
                    enhance_prompt:
                      default: true
                      description: >-
                        Rewrites the prompt into a fuller scene description
                        before generating, which noticeably improves quality.
                        Enabled by default (also when the parameter is omitted);
                        pass false to turn it off.
                      examples:
                        - false
                      type: boolean
                    seed:
                      description: >-
                        The random seed. Omit it to generate with a random seed.
                        Passing the same seed together with the same prompt and
                        parameters reproduces the same image within the same
                        service version.
                      examples:
                        - 20260921
                      type: integer
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - image_urls
                    - prompt
                  type: object
                  x-apidog-orders:
                    - image_urls
                    - prompt
                    - mask_url
                    - aspect_ratio
                    - resolution
                    - background
                    - output_format
                    - enhance_prompt
                    - seed
                    - 01M33FW4QEJYW62Y23R0V8SJH3
                  x-apidog-refs:
                    01M33FW4QEJYW62Y23R0V8SJH3:
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
              model: qwen2-1/image-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                image_urls:
                  - https://example.com/a.jpg
                  - https://example.com/b.jpg
                prompt: >-
                  Replace the backpack in the first image with the colour scheme
                  from the second image, and leave everything else unchanged
                aspect_ratio: auto
                resolution: 1K
                background: opaque
                output_format: png
                enhance_prompt: true
                seed: 20260921
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                properties:
                  code:
                    description: >-
                      Status code of the request. The HTTP status is 200 even
                      when the request fails, so always check this field: 200
                      means success; any other value means the request failed
                      and msg describes the reason. Common values: 401 invalid
                      or missing API key; 402 insufficient credits; 429 rate
                      limit exceeded; 422 or 500 the request could not be
                      processed (read msg and check your parameters before
                      retrying).
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
                    type: integer
                  data:
                    properties:
                      taskId:
                        description: >-
                          Task ID, can be used with Get Task Details endpoint to
                          query task status
                        type: string
                    required:
                      - taskId
                    type: object
                    x-apidog-orders:
                      - taskId
                    x-apidog-ignore-properties: []
                  msg:
                    description: Response message, error description when failed
                    example: success
                    type: string
                required:
                  - data
                title: response not with recordId
                type: object
                x-apidog-orders:
                  - code
                  - data
                  - msg
                x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: task_qwen21i2i_1769000000000
          headers: {}
          x-apidog-name: Success
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
                              example: 1786435794000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 50
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786435744000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 4.8
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: qwen2-1/image-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"image_urls\":[\"https://example.com/a.jpg\",\"https://example.com/b.jpg\"],\"prompt\":\"Replace
                                the backpack in the first image with the colour
                                scheme from the second image, and leave
                                everything else
                                unchanged\",\"aspect_ratio\":\"auto\",\"resolution\":\"1K\",\"background\":\"opaque\",\"output_format\":\"png\",\"enhance_prompt\":true,\"seed\":20260921}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2-1/image-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/6a290e5bf56277db2f3c56686e0b51ba.png"]}
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
                              example: 709bf695b197209c410c980ee55a6ea6
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786435794000
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
                            taskId: 709bf695b197209c410c980ee55a6ea6
                            model: qwen2-1/image-to-image
                            state: success
                            param: >-
                              {"input":"{\"image_urls\":[\"https://example.com/a.jpg\",\"https://example.com/b.jpg\"],\"prompt\":\"Replace
                              the backpack in the first image with the colour
                              scheme from the second image, and leave everything
                              else
                              unchanged\",\"aspect_ratio\":\"auto\",\"resolution\":\"1K\",\"background\":\"opaque\",\"output_format\":\"png\",\"enhance_prompt\":true,\"seed\":20260921}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2-1/image-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/6a290e5bf56277db2f3c56686e0b51ba.png"]}
                            completeTime: 1786435794000
                            createTime: 1786435744000
                            costTime: 50
                            creditsConsumed: 4.8
                            updateTime: 1786435794000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 709bf695b197209c410c980ee55a6ea6
                            model: qwen2-1/image-to-image
                            state: fail
                            param: >-
                              {"input":"{\"image_urls\":[\"https://example.com/a.jpg\",\"https://example.com/b.jpg\"],\"prompt\":\"Replace
                              the backpack in the first image with the colour
                              scheme from the second image, and leave everything
                              else
                              unchanged\",\"aspect_ratio\":\"auto\",\"resolution\":\"1K\",\"background\":\"opaque\",\"output_format\":\"png\",\"enhance_prompt\":true,\"seed\":20260921}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2-1/image-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786435794000
                            createTime: 1786435744000
                            costTime: 50
                            creditsConsumed: 0
                            updateTime: 1786435794000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Qwen
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43925316-run
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
