# Qwen 2.1 - Text to Image

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
      summary: Qwen 2.1 - Text to Image
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
      operationId: playground_349
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
                  default: qwen2-1/text-to-image
                  description: >-
                    The model name used for generation. This endpoint must use
                    `qwen2-1/text-to-image`.
                  enum:
                    - qwen2-1/text-to-image
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
                  description: Input parameters for the text-to-image generation task.
                  properties:
                    prompt:
                      description: >-
                        The prompt that describes the image content, style and
                        composition you want to generate. Required. Any language
                        is supported, up to 5000 characters; if it is longer,
                        the request is rejected.
                      examples:
                        - >-
                          A corgi wearing a yellow rain hat sitting on stone
                          steps after the rain, shallow depth of field
                      maxLength: 5000
                      minLength: 1
                      type: string
                    aspect_ratio:
                      default: '1:1'
                      description: >-
                        The output aspect ratio. Default `1:1`. The actual pixel
                        size also depends on `resolution`.
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
                        The output resolution tier. `1K` is the faster option;
                        `2K` produces four times the pixels and takes longer.
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
                        The output image format. `png` (default) and `webp` both
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
                    - prompt
                  type: object
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - resolution
                    - background
                    - output_format
                    - enhance_prompt
                    - seed
                    - 01M33FVH063Z39SG30K69YS2JP
                  x-apidog-refs:
                    01M33FVH063Z39SG30K69YS2JP:
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
              model: qwen2-1/text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A corgi wearing a yellow rain hat sitting on stone steps after
                  the rain, shallow depth of field
                aspect_ratio: '16:9'
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
                    type: integer
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
                          The task ID can be used with the "Get Task Details"
                          endpoint to query the task status.
                        examples:
                          - dc1928bfcbc77cb6c85f3359a9c718b3
                    x-apidog-orders:
                      - taskId
                    x-apidog-ignore-properties: []
                required:
                  - data
                title: response not with recordId
                type: object
                x-apidog-orders:
                  - 01M31DTMBK2FVZ5RQHM8WRQX68
                x-apidog-refs:
                  01M31DTMBK2FVZ5RQHM8WRQX68:
                    $ref: '#/components/schemas/response%20not%20with%20recordId'
                x-apidog-ignore-properties:
                  - code
                  - msg
                  - data
              example:
                code: 200
                msg: success
                data:
                  taskId: task_qwen21_1769000000000
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
                              example: qwen2-1/text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"prompt\":\"A corgi wearing a yellow
                                rain hat sitting on stone steps after the rain,
                                shallow depth of
                                field\",\"aspect_ratio\":\"16:9\",\"resolution\":\"1K\",\"background\":\"opaque\",\"output_format\":\"png\",\"enhance_prompt\":true,\"seed\":20260921}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2-1/text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/40a762429ca2e4b0bd55ed2c30458bec.png"]}
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
                              example: aceeb8dc2576eeb47a1cef80b9490885
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
                            taskId: aceeb8dc2576eeb47a1cef80b9490885
                            model: qwen2-1/text-to-image
                            state: success
                            param: >-
                              {"input":"{\"prompt\":\"A corgi wearing a yellow
                              rain hat sitting on stone steps after the rain,
                              shallow depth of
                              field\",\"aspect_ratio\":\"16:9\",\"resolution\":\"1K\",\"background\":\"opaque\",\"output_format\":\"png\",\"enhance_prompt\":true,\"seed\":20260921}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2-1/text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/40a762429ca2e4b0bd55ed2c30458bec.png"]}
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
                            taskId: aceeb8dc2576eeb47a1cef80b9490885
                            model: qwen2-1/text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"prompt\":\"A corgi wearing a yellow
                              rain hat sitting on stone steps after the rain,
                              shallow depth of
                              field\",\"aspect_ratio\":\"16:9\",\"resolution\":\"1K\",\"background\":\"opaque\",\"output_format\":\"png\",\"enhance_prompt\":true,\"seed\":20260921}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen2-1/text-to-image"}
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43923408-run
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
