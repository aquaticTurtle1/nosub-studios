# Qwen - Text to Image

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
      summary: Qwen - Text to Image
      deprecated: false
      description: >-
        High-quality photorealistic image generation powered by Qwen's advanced
        AI model


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
      operationId: qwen-text-to-image
      tags:
        - docs/en/Market/Image    Models/Qwen
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: qwen/text-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `qwen/text-to-image` for this endpoint
                  enum:
                    - qwen/text-to-image
                  examples:
                    - qwen/text-to-image
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
                        The prompt to generate the image with (Max length: 5000
                        characters)
                      examples:
                        - >-
                          A rainy nighttime city poster illuminated by neon
                          lights.
                      maxLength: 5000
                      type: string
                    image_size:
                      description: >-
                        The size of the generated image. Set this field
                        explicitly.
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
                    num_inference_steps:
                      default: 30
                      description: >-
                        The number of inference steps to perform (Min: 2, Max:
                        250, Step: 1) (step: 1)
                      examples:
                        - 30
                      maximum: 250
                      minimum: 2
                      type: number
                    seed:
                      description: >-
                        The same seed and the same prompt given to the same
                        version of the model will output the same image every
                        time
                      type: integer
                    guidance_scale:
                      default: 2.5
                      description: >-
                        The CFG (Classifier Free Guidance) scale is a measure of
                        how close you want the model to stick to your prompt
                        when looking for a related image to show you (Min: 0,
                        Max: 20, Step: 0.1) (step: 0.1)
                      examples:
                        - 2.5
                      maximum: 20
                      minimum: 0
                      type: number
                    enable_safety_checker:
                      description: >-
                        The safety checker is always enabled in Playground. It
                        can only be disabled by setting false through the API.
                        (Boolean value (true/false))
                      examples:
                        - true
                      type: boolean
                    output_format:
                      default: png
                      description: The format of the generated image
                      enum:
                        - png
                        - jpeg
                      examples:
                        - png
                      type: string
                    negative_prompt:
                      description: >-
                        The negative prompt for the generation (Max length: 500
                        characters)
                      examples:
                        - ' '
                      maxLength: 500
                      type: string
                    acceleration:
                      default: none
                      description: >-
                        Acceleration level for image generation. Options:
                        'none', 'regular', 'high'. Higher acceleration increases
                        speed. 'regular' balances speed and quality. 'high' is
                        recommended for images without text
                      enum:
                        - none
                        - regular
                        - high
                      examples:
                        - none
                      type: string
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
                    - image_size
                    - num_inference_steps
                    - seed
                    - guidance_scale
                    - enable_safety_checker
                    - output_format
                    - negative_prompt
                    - acceleration
                    - 01KWKKY7BT19W5R0JHASAQTSFY
                  x-apidog-refs:
                    01KWKKY7BT19W5R0JHASAQTSFY:
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
              model: qwen/text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: A rainy nighttime city poster illuminated by neon lights.
                image_size: square_hd
                num_inference_steps: 30
                guidance_scale: 2.5
                enable_safety_checker: true
                output_format: png
                negative_prompt: ' '
                acceleration: none
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
                  taskId: task_qwen_1765178144357
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
                              example: 1786434391000
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
                              example: 1786434382000
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
                              example: qwen/text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"enable_safety_checker\":true,\"acceleration\":\"none\",\"output_format\":\"png\",\"image_size\":\"square_hd\",\"negative_prompt\":\"
                                \",\"guidance_scale\":2.5,\"prompt\":\"A rainy
                                nighttime city poster illuminated by neon
                                lights.\",\"num_inference_steps\":30}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/qwen-image/1786434388947-u9d3279xvf.png"]}
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
                              example: baaf97925be1f493a290d76479d1b27a
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786434391000
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
                            taskId: baaf97925be1f493a290d76479d1b27a
                            model: qwen/text-to-image
                            state: success
                            param: >-
                              {"input":"{\"enable_safety_checker\":true,\"acceleration\":\"none\",\"output_format\":\"png\",\"image_size\":\"square_hd\",\"negative_prompt\":\"
                              \",\"guidance_scale\":2.5,\"prompt\":\"A rainy
                              nighttime city poster illuminated by neon
                              lights.\",\"num_inference_steps\":30}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/qwen-image/1786434388947-u9d3279xvf.png"]}
                            completeTime: 1786434391000
                            createTime: 1786434382000
                            costTime: 8
                            creditsConsumed: 5
                            updateTime: 1786434391000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: baaf97925be1f493a290d76479d1b27a
                            model: qwen/text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"enable_safety_checker\":true,\"acceleration\":\"none\",\"output_format\":\"png\",\"image_size\":\"square_hd\",\"negative_prompt\":\"
                              \",\"guidance_scale\":2.5,\"prompt\":\"A rainy
                              nighttime city poster illuminated by neon
                              lights.\",\"num_inference_steps\":30}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/text-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786434391000
                            createTime: 1786434382000
                            costTime: 8
                            creditsConsumed: 0
                            updateTime: 1786434391000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Qwen
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506380-run
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
