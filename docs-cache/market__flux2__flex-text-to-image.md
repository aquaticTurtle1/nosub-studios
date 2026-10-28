# Flux-2 - Text to Image

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
      summary: Flux-2 - Text to Image
      deprecated: false
      description: >
        High-quality photorealistic image generation powered by Flux-2's
        advanced AI model


        The output format is not fixed: results may be PNG or JPEG.


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
      operationId: flux-2-flex-text-to-image
      tags:
        - docs/en/Market/Image    Models/Flux-2
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: flux-2/flex-text-to-image
                  description: >-
                    Model name for the generation task. Required field.


                    - This endpoint must use the `flux-2/flex-text-to-image`
                    model
                  enum:
                    - flux-2/flex-text-to-image
                  examples:
                    - flux-2/flex-text-to-image
                  type: string
                callBackUrl:
                  description: >-
                    Callback URL to receive notifications when the generation
                    task is completed. Optional configuration, recommended for
                    production environments.


                    - After the task is generated, the system will POST task
                    status and results to this URL

                    - The callback content includes the generated resource URL
                    and task-related information

                    - Your callback endpoint needs to support receiving POST
                    requests with JSON payloads

                    - Alternatively, you can call the task details endpoint to
                    actively poll task status

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
                        Generation prompt, length must be between 3-5000
                        characters. (Maximum length: 5000 characters)
                      examples:
                        - >-
                          A humanoid figure with a vintage television set for a
                          head, featuring a green-tinted screen displaying a
                          `Hello FLUX.2` writing in ASCII font. The figure is
                          wearing a yellow raincoat, and there are various wires
                          and components attached to the television. The
                          background is cloudy and indistinct, suggesting an
                          outdoor setting
                      maxLength: 5000
                      type: string
                    aspect_ratio:
                      description: Required. Aspect ratio of the generated image.
                      enum:
                        - '1:1'
                        - '4:3'
                        - '3:4'
                        - '16:9'
                        - '9:16'
                        - '3:2'
                        - '2:3'
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
                          value: '16:9'
                        - description: ''
                          name: ''
                          value: '9:16'
                        - description: ''
                          name: ''
                          value: '3:2'
                        - description: ''
                          name: ''
                          value: '2:3'
                    resolution:
                      description: Required. Output image resolution.
                      enum:
                        - 1K
                        - 2K
                      examples:
                        - 1K
                      type: string
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - prompt
                    - aspect_ratio
                    - resolution
                  type: object
                  x-apidog-orders:
                    - prompt
                    - aspect_ratio
                    - resolution
                    - 01KWKKN00S0QBA76FQ5GKQ61C6
                  x-apidog-refs:
                    01KWKKN00S0QBA76FQ5GKQ61C6:
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
              model: flux-2/flex-text-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A humanoid figure with a vintage television set for a head,
                  featuring a green-tinted screen displaying a `Hello FLUX.2`
                  writing in ASCII font. The figure is wearing a yellow
                  raincoat, and there are various wires and components attached
                  to the television. The background is cloudy and indistinct,
                  suggesting an outdoor setting
                aspect_ratio: '1:1'
                resolution: 1K
                nsfw_checker: false
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
                  taskId: task_flux-2_1765175490366
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
                              example: 1786430877000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 38
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786430837000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 14
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: flux-2/flex-text-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"A
                                humanoid figure with a vintage television set
                                for a head,featuring a green-tinted screen
                                displaying a `Hello FLUX.2` writing in ASCII
                                font. The figure is wearing a yellow raincoat,
                                and there are various wires and components
                                attached to the television. The background is
                                cloudy and indistinct, suggesting an outdoor
                                setting\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"flux-2/flex-text-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/h/97d494e87bb500bbfd9ae018b9df5e50_1786430874.png"]}
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
                              example: 97d494e87bb500bbfd9ae018b9df5e50
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786430877000
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
                            taskId: 97d494e87bb500bbfd9ae018b9df5e50
                            model: flux-2/flex-text-to-image
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"A
                              humanoid figure with a vintage television set for
                              a head,featuring a green-tinted screen displaying
                              a `Hello FLUX.2` writing in ASCII font. The figure
                              is wearing a yellow raincoat, and there are
                              various wires and components attached to the
                              television. The background is cloudy and
                              indistinct, suggesting an outdoor
                              setting\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"flux-2/flex-text-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/h/97d494e87bb500bbfd9ae018b9df5e50_1786430874.png"]}
                            completeTime: 1786430877000
                            createTime: 1786430837000
                            costTime: 38
                            creditsConsumed: 14
                            updateTime: 1786430877000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 97d494e87bb500bbfd9ae018b9df5e50
                            model: flux-2/flex-text-to-image
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"A
                              humanoid figure with a vintage television set for
                              a head,featuring a green-tinted screen displaying
                              a `Hello FLUX.2` writing in ASCII font. The figure
                              is wearing a yellow raincoat, and there are
                              various wires and components attached to the
                              television. The background is cloudy and
                              indistinct, suggesting an outdoor
                              setting\",\"resolution\":\"1K\",\"nsfw_checker\":false}","callBackUrl":"https://your-domain.com/api/callback","model":"flux-2/flex-text-to-image"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786430877000
                            createTime: 1786430837000
                            costTime: 38
                            creditsConsumed: 0
                            updateTime: 1786430877000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Flux-2
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506367-run
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
