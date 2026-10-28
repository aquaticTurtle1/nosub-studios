# Qwen3 Pro Text to Image

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
      summary: Qwen3 Pro Text to Image
      deprecated: false
      description: >-
        ## Create Task


        Use this endpoint to create a new text-to-image generation task from a
        positive prompt.


        - Supported resolutions: `1K` and `2K`.

        - Supported image sizes: `1:1`, `3:2`, `2:3`, `4:3`, `3:4`, `16:9`,
        `9:16`, and `21:9`. 

        - Supported output formats: `png` and `jpeg`.

        - Intelligent prompt rewriting is enabled by default to improve results
        from simple prompts.


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          After submission, use the unified query endpoint to check task progress and retrieve results
        </Card>


        ::: tip[]

        For production use, we recommend providing the `callBackUrl` parameter
        so your service can receive completion notifications instead of polling
        for task status.

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Model Marketplace" icon="lucide-store" href="/market/quickstart">
            Explore all available models and capabilities
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check account credits and usage
          </Card>
        </CardGroup>
      operationId: qwen3-pro-text-to-image
      tags:
        - docs/en/Market/Image    Models/Qwen
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: qwen3/pro-text-to-image
                  description: >-
                    The model name used for generation. This field is required.
                    This endpoint must use the `qwen3/pro-text-to-image` model.
                  enum:
                    - qwen3/pro-text-to-image
                  examples:
                    - qwen3/pro-text-to-image
                  type: string
                  x-apidog-enum:
                    - description: ''
                      name: ''
                      value: qwen3/pro-text-to-image
                callBackUrl:
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent.
                  examples:
                    - https://your-domain.com/api/callback
                  format: uri
                  type: string
                input:
                  description: Input parameters for the text-to-image generation task.
                  properties:
                    prompt:
                      description: >-
                        The positive prompt that describes the image content,
                        style, and composition you want to generate or edit.
                        Both Chinese and English are supported.
                      examples:
                        - >-
                          A futuristic city at sunset, cinematic lighting, ultra
                          detailed.
                      maxLength: 5000
                      minLength: 1
                      type: string
                    resolution:
                      description: The output image resolution.
                      enum:
                        - 1K
                        - 2K
                      examples:
                        - 1K
                      type: string
                    image_size:
                      default: '16:9'
                      description: 'The output image size. '
                      enum:
                        - '1:1'
                        - '3:2'
                        - '2:3'
                        - '4:3'
                        - '3:4'
                        - '16:9'
                        - '9:16'
                        - '21:9'
                      examples:
                        - '1:1'
                      type: string
                    output_format:
                      description: 'Output format: png or jpeg. Set this field explicitly.'
                      enum:
                        - png
                        - jpeg
                      examples:
                        - png
                      type: string
                    prompt_extend:
                      default: true
                      description: >-
                        Whether to enable intelligent prompt rewriting. Default:
                        true (recommended). When enabled, the model optimizes
                        the positive prompt, which significantly improves
                        results for simple descriptions.
                      examples:
                        - true
                      type: boolean
                    negative_prompt:
                      description: >-
                        The negative prompt that describes content you do not
                        want to appear in the image.
                      examples:
                        - blurry, low quality, distorted
                      maxLength: 5000
                      minLength: 0
                      type: string
                    seed:
                      description: >-
                        Random seed, 0–2147483647. If omitted, a random seed is
                        used.
                      examples:
                        - 1
                      maximum: 2147483647
                      minimum: 0
                      type: integer
                    nsfw_checker:
                      default: false
                      description: >-
                        Whether to enable content filtering. Optional. Defaults
                        to false. When set to false, content filtering is
                        disabled and all results are returned directly by the
                        model. Note: Content filtering cannot guarantee that all
                        inappropriate content will be detected. If the filtering
                        results do not meet your requirements, you must
                        implement additional content moderation measures.
                      examples:
                        - false
                      type: boolean
                  required:
                    - prompt
                  type: object
                  x-apidog-orders:
                    - prompt
                    - resolution
                    - image_size
                    - output_format
                    - prompt_extend
                    - negative_prompt
                    - seed
                    - nsfw_checker
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
              model: qwen3/pro-text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A futuristic city at sunset, cinematic lighting, ultra
                  detailed.
                resolution: 1K
                image_size: '1:1'
                output_format: png
                prompt_extend: true
                nsfw_checker: false
                negative_prompt: blurry, low quality, distorted
                seed: 1
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
                  taskId: task_qwen3_1765180586443
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
                              example: 1786435601000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 69
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786435532000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 6.4
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: qwen3/pro-text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"output_format\":\"png\",\"seed\":1,\"image_size\":\"1:1\",\"prompt_extend\":true,\"negative_prompt\":\"blurry,
                                low quality, distorted\",\"prompt\":\"A
                                futuristic city at sunset, with cinematic
                                lighting and
                                richdetails.\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen3/pro-text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/qwen3/1786435599582-qjumky2p3s.png"]}
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
                              example: 5da7fb31a9784f0319df97783d8d32f7
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786435601000
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
                            taskId: 5da7fb31a9784f0319df97783d8d32f7
                            model: qwen3/pro-text-to-image
                            state: success
                            param: >-
                              {"input":"{\"output_format\":\"png\",\"seed\":1,\"image_size\":\"1:1\",\"prompt_extend\":true,\"negative_prompt\":\"blurry,
                              low quality, distorted\",\"prompt\":\"A futuristic
                              city at sunset, with cinematic lighting and
                              richdetails.\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen3/pro-text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/qwen3/1786435599582-qjumky2p3s.png"]}
                            completeTime: 1786435601000
                            createTime: 1786435532000
                            costTime: 69
                            creditsConsumed: 6.4
                            updateTime: 1786435601000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 5da7fb31a9784f0319df97783d8d32f7
                            model: qwen3/pro-text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"output_format\":\"png\",\"seed\":1,\"image_size\":\"1:1\",\"prompt_extend\":true,\"negative_prompt\":\"blurry,
                              low quality, distorted\",\"prompt\":\"A futuristic
                              city at sunset, with cinematic lighting and
                              richdetails.\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen3/pro-text-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786435601000
                            createTime: 1786435532000
                            costTime: 69
                            creditsConsumed: 0
                            updateTime: 1786435601000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Qwen
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-40459290-run
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
