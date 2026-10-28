# Qwen - Image to Image

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
      summary: Qwen - Image to Image
      deprecated: false
      description: >-
        Image generation by Qwen's advanced AI model


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
      operationId: qwen-image-to-image
      tags:
        - docs/en/Market/Image    Models/Qwen
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
              properties:
                model:
                  type: string
                  enum:
                    - qwen/image-to-image
                  default: qwen/image-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `qwen/image-to-image` for this endpoint
                  examples:
                    - qwen/image-to-image
                callBackUrl:
                  type: string
                  format: uri
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
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      description: >-
                        The prompt to generate the image with (Max length: 5000
                        characters)
                      type: string
                      maxLength: 5000
                      examples:
                        - >-
                          Change the season from winter to spring. Keep the same
                          composition, with the cabin, lake, and mountains
                          unchanged. Fill the scene with warmth and vitality
                          using blooming flowers and lush greenery.
                    image_url:
                      description: >-
                        The reference image to guide the generation (File URL
                        after upload, not file content; Accepted types:
                        image/jpeg, image/png, image/webp; Max size: 10.0MB)
                      type: string
                      examples:
                        - >-
                          https://static.aiquickdraw.com/tools/example/1786021267002_2vLU3iDm.png
                    strength:
                      description: >-
                        Denoising strength. 1.0 = fully remake; 0.0 = preserve
                        original (Min: 0, Max: 1, Step: 0.01) (step: 0.01)
                      type: number
                      minimum: 0
                      maximum: 1
                      default: 0.8
                      examples:
                        - 0.8
                    output_format:
                      description: The format of the generated image
                      type: string
                      enum:
                        - png
                        - jpeg
                      default: png
                      examples:
                        - png
                    acceleration:
                      description: >-
                        Acceleration level for image generation. Options:
                        'none', 'regular', 'high'. Higher acceleration increases
                        speed. 'regular' balances speed and quality. 'high' is
                        recommended for images without text
                      type: string
                      enum:
                        - none
                        - regular
                        - high
                      default: none
                      examples:
                        - none
                    negative_prompt:
                      description: >-
                        The negative prompt for the generation (Max length: 500
                        characters)
                      type: string
                      maxLength: 500
                      examples:
                        - blurry, ugly
                    seed:
                      description: >-
                        The same seed and the same prompt given to the same
                        version of the model will output the same image every
                        time
                      type: integer
                    num_inference_steps:
                      description: >-
                        The number of inference steps to perform (Min: 2, Max:
                        250, Step: 1) (step: 1)
                      type: number
                      minimum: 2
                      maximum: 250
                      default: 30
                      examples:
                        - 30
                    guidance_scale:
                      description: >-
                        The CFG (Classifier Free Guidance) scale is a measure of
                        how close you want the model to stick to your prompt
                        when looking for a related image to show you (Min: 0,
                        Max: 20, Step: 0.1) (step: 0.1)
                      type: number
                      minimum: 0
                      maximum: 20
                      default: 2.5
                      examples:
                        - 2.5
                    enable_safety_checker:
                      description: >-
                        The safety checker is always enabled in Playground. It
                        can only be disabled by setting false through the API.
                        (Boolean value (true/false))
                      type: boolean
                      examples:
                        - true
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - image_url
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - strength
                    - output_format
                    - acceleration
                    - negative_prompt
                    - seed
                    - num_inference_steps
                    - guidance_scale
                    - enable_safety_checker
                    - 01KWKKZ74FZWPMQ7JNYP7FNF2B
                  x-apidog-refs:
                    01KWKKZ74FZWPMQ7JNYP7FNF2B:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: qwen/image-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Change the season from winter to spring. Keep the same
                  composition, with the cabin, lake, and mountains unchanged.
                  Fill the scene with warmth and vitality using blooming flowers
                  and lush greenery.
                image_url: >-
                  https://static.aiquickdraw.com/tools/example/1786021267002_2vLU3iDm.png
                strength: 0.8
                output_format: png
                acceleration: none
                negative_prompt: blurry, ugly
                num_inference_steps: 30
                guidance_scale: 2.5
                enable_safety_checker: true
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
                  taskId: task_qwen_1765178156594
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
                              example: 1786434631000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 10
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786434621000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 4
                            model:
                              type: string
                              description: Image-to-image model used for the task
                              example: qwen/image-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"enable_safety_checker\":true,\"acceleration\":\"none\",\"strength\":0.8,\"output_format\":\"png\",\"negative_prompt\":\"blurry,
                                ugly\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1786021267002_2vLU3iDm.png\",\"guidance_scale\":2.5,\"prompt\":\"Change
                                the season from winter to spring. Keep the same
                                composition, with the cabin, lake, and mountains
                                unchanged. Fill the scene with warmth and
                                vitality using blooming flowers and lush
                                greenery.\",\"num_inference_steps\":30}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/image-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/qwen-image/1786434629356-p5gtmeygqbk.png"]}
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
                              example: 1eafcc55dc4f627a9381fceedf8fa464
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786434631000
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
                            taskId: 1eafcc55dc4f627a9381fceedf8fa464
                            model: qwen/image-to-image
                            state: success
                            param: >-
                              {"input":"{\"enable_safety_checker\":true,\"acceleration\":\"none\",\"strength\":0.8,\"output_format\":\"png\",\"negative_prompt\":\"blurry,
                              ugly\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1786021267002_2vLU3iDm.png\",\"guidance_scale\":2.5,\"prompt\":\"Change
                              the season from winter to spring. Keep the same
                              composition, with the cabin, lake, and mountains
                              unchanged. Fill the scene with warmth and vitality
                              using blooming flowers and lush
                              greenery.\",\"num_inference_steps\":30}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/image-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/qwen-image/1786434629356-p5gtmeygqbk.png"]}
                            completeTime: 1786434631000
                            createTime: 1786434621000
                            costTime: 10
                            creditsConsumed: 4
                            updateTime: 1786434631000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 1eafcc55dc4f627a9381fceedf8fa464
                            model: qwen/image-to-image
                            state: fail
                            param: >-
                              {"input":"{\"enable_safety_checker\":true,\"acceleration\":\"none\",\"strength\":0.8,\"output_format\":\"png\",\"negative_prompt\":\"blurry,
                              ugly\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1786021267002_2vLU3iDm.png\",\"guidance_scale\":2.5,\"prompt\":\"Change
                              the season from winter to spring. Keep the same
                              composition, with the cabin, lake, and mountains
                              unchanged. Fill the scene with warmth and vitality
                              using blooming flowers and lush
                              greenery.\",\"num_inference_steps\":30}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/image-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786434631000
                            createTime: 1786434621000
                            costTime: 10
                            creditsConsumed: 0
                            updateTime: 1786434631000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Qwen
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506381-run
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
