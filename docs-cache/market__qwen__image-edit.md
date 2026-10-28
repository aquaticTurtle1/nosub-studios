# Qwen - Image Edit

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
      summary: Qwen - Image Edit
      deprecated: false
      description: >-
        Image generation by qwen/image-edit


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
      operationId: qwen-image-edit
      tags:
        - docs/en/Market/Image    Models/Qwen
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: qwen/image-edit
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `qwen/image-edit` for this endpoint
                  enum:
                    - qwen/image-edit
                  examples:
                    - qwen/image-edit
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
                        The prompt to generate the image with (Max length: 2000
                        characters)
                      examples:
                        - Make the sky a warm sunset.
                      maxLength: 2000
                      type: string
                    image_url:
                      description: >-
                        The URL of the image to edit. (File URL after upload,
                        not file content; Accepted types: image/jpeg, image/png,
                        image/webp; Max size: 10.0MB)
                      examples:
                        - >-
                          https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg
                      type: string
                    acceleration:
                      default: none
                      description: >-
                        Acceleration level for image generation. Options:
                        'none', 'regular', 'high'. Higher acceleration increases
                        speed. 'regular' balances speed and quality. Default
                        value: "none"
                      enum:
                        - none
                        - regular
                        - high
                      examples:
                        - none
                      type: string
                    image_size:
                      default: landscape_4_3
                      description: >-
                        The size of the generated image. Default value:
                        landscape_4_3
                      enum:
                        - square
                        - square_hd
                        - portrait_4_3
                        - portrait_16_9
                        - landscape_4_3
                        - landscape_16_9
                      examples:
                        - landscape_4_3
                      type: string
                    num_inference_steps:
                      default: 25
                      description: >-
                        The number of inference steps to perform. Default value:
                        30 (Min: 2, Max: 49, Step: 1) (step: 1)
                      examples:
                        - 25
                      maximum: 49
                      minimum: 2
                      type: number
                    seed:
                      description: >-
                        The same seed and the same prompt given to the same
                        version of the model will output the same image every
                        time.
                      type: integer
                    guidance_scale:
                      default: 4
                      description: >-
                        The CFG (Classifier Free Guidance) scale is a measure of
                        how close you want the model to stick to your prompt
                        when looking for a related image to show you. Default
                        value: 4 (Min: 0, Max: 20, Step: 0.1) (step: 0.1)
                      examples:
                        - 4
                      maximum: 20
                      minimum: 0
                      type: number
                    num_images:
                      description: num_images
                      enum:
                        - '1'
                        - '2'
                        - '3'
                        - '4'
                      type: string
                    enable_safety_checker:
                      description: >-
                        If set to true, the safety checker will be enabled.
                        Default value: true (Boolean value (true/false))
                      examples:
                        - true
                      type: boolean
                    output_format:
                      default: png
                      description: 'The format of the generated image. Default value: "png"'
                      enum:
                        - jpeg
                        - png
                      examples:
                        - png
                      type: string
                    negative_prompt:
                      description: >-
                        The negative prompt for the generation Default value: "
                        " (Max length: 500 characters)
                      examples:
                        - blurry, ugly
                      maxLength: 500
                      type: string
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - image_url
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - acceleration
                    - image_size
                    - num_inference_steps
                    - seed
                    - guidance_scale
                    - num_images
                    - enable_safety_checker
                    - output_format
                    - negative_prompt
                    - 01KWKM0AMCDJ070EPKBJBNEPGH
                  x-apidog-refs:
                    01KWKM0AMCDJ070EPKBJBNEPGH:
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
              model: qwen/image-edit
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: Make the sky a warm sunset.
                image_url: >-
                  https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg
                acceleration: none
                image_size: landscape_4_3
                num_inference_steps: 25
                guidance_scale: 4
                enable_safety_checker: true
                output_format: png
                negative_prompt: blurry, ugly
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
                  taskId: task_qwen_1765179676651
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
                              example: 1786434807000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 9
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786434798000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 5
                            model:
                              type: string
                              description: Image editing model used for the task
                              example: qwen/image-edit
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"sync_mode\":false,\"enable_safety_checker\":true,\"acceleration\":\"none\",\"output_format\":\"png\",\"image_size\":\"landscape_4_3\",\"negative_prompt\":\"Blurry,
                                ugly\",\"image_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg\",\"guidance_scale\":4,\"prompt\":\"Make
                                it
                                larger\",\"num_inference_steps\":25}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/image-edit"}
                            resultJson:
                              type: string
                              description: >-
                                Image editing result in JSON string format.
                                resultUrls contains the list of processed image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/qwen-image/1786434805525-cv1nlgcu557.png"]}
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
                              example: 882b7caa2bb2d9b7c4ca8517a9de4bb4
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786434807000
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
                            taskId: 882b7caa2bb2d9b7c4ca8517a9de4bb4
                            model: qwen/image-edit
                            state: success
                            param: >-
                              {"input":"{\"sync_mode\":false,\"enable_safety_checker\":true,\"acceleration\":\"none\",\"output_format\":\"png\",\"image_size\":\"landscape_4_3\",\"negative_prompt\":\"Blurry,
                              ugly\",\"image_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg\",\"guidance_scale\":4,\"prompt\":\"Make
                              it
                              larger\",\"num_inference_steps\":25}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/image-edit"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/qwen-image/1786434805525-cv1nlgcu557.png"]}
                            completeTime: 1786434807000
                            createTime: 1786434798000
                            costTime: 9
                            creditsConsumed: 5
                            updateTime: 1786434807000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 882b7caa2bb2d9b7c4ca8517a9de4bb4
                            model: qwen/image-edit
                            state: fail
                            param: >-
                              {"input":"{\"sync_mode\":false,\"enable_safety_checker\":true,\"acceleration\":\"none\",\"output_format\":\"png\",\"image_size\":\"landscape_4_3\",\"negative_prompt\":\"Blurry,
                              ugly\",\"image_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1755603225969i6j87xnw.jpg\",\"guidance_scale\":4,\"prompt\":\"Make
                              it
                              larger\",\"num_inference_steps\":25}","callBackUrl":"https://your-domain.com/api/callback","model":"qwen/image-edit"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786434807000
                            createTime: 1786434798000
                            costTime: 9
                            creditsConsumed: 0
                            updateTime: 1786434807000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Qwen
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506382-run
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
