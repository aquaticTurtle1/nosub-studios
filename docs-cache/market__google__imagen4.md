# Google - imagen4

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
      summary: Google - imagen4
      deprecated: false
      description: >
        Image generation by Google imagen4


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
      operationId: google-imagen4
      tags:
        - docs/en/Market/Image    Models/Google
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
                    - google/imagen4
                  default: google/imagen4
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `google/imagen4` for this endpoint
                  examples:
                    - google/imagen4
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
                        The text prompt describing what you want to see (Max
                        length: 5000 characters)
                      type: string
                      maxLength: 5000
                      examples:
                        - >-
                          A lively comic scene where two colleagues are in an
                          office. The first person says, 'Have you heard about
                          Google Imagen 4 Ultra?' The second person responds
                          with excitement, 'It’s the best text-to-image tool out
                          there!' The first person asks again, 'Do you know
                          where to get the API?' The second person smiles and
                          says, 'Kie.ai has it!' In the final panel, the two
                          look at a screen showing Kie.ai’s interface with an
                          API option, with bright and colorful comic-style
                          illustrations.
                    negative_prompt:
                      description: >-
                        A description of what to discourage in the generated
                        images (Max length: 5000 characters)
                      type: string
                      maxLength: 5000
                      examples:
                        - ''
                    aspect_ratio:
                      type: string
                      description: >-
                        Required. Aspect ratio of the output image: 1:1, 16:9,
                        9:16, 3:4, 4:3 or auto.
                      enum:
                        - '1:1'
                        - '16:9'
                        - '9:16'
                        - '3:4'
                        - '4:3'
                        - auto
                      examples:
                        - '1:1'
                      x-apidog-enum:
                        - value: '1:1'
                          name: ''
                          description: ''
                        - value: '16:9'
                          name: ''
                          description: ''
                        - value: '9:16'
                          name: ''
                          description: ''
                        - value: '3:4'
                          name: ''
                          description: ''
                        - value: '4:3'
                          name: ''
                          description: ''
                        - value: auto
                          name: ''
                          description: ''
                    seed:
                      description: >-
                        Random seed for reproducible generation (Max length: 500
                        characters)
                      type: string
                      maxLength: 500
                      examples:
                        - ''
                  required:
                    - prompt
                    - aspect_ratio
                  x-apidog-orders:
                    - prompt
                    - negative_prompt
                    - aspect_ratio
                    - seed
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: google/imagen4
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  A lively comic scene where two colleagues are in an office.
                  The first person says, 'Have you heard about Google Imagen 4
                  Ultra?' The second person responds with excitement, 'It’s the
                  best text-to-image tool out there!' The first person asks
                  again, 'Do you know where to get the API?' The second person
                  smiles and says, 'Kie.ai has it!' In the final panel, the two
                  look at a screen showing Kie.ai’s interface with an API
                  option, with bright and colorful comic-style illustrations.
                negative_prompt: ''
                aspect_ratio: '1:1'
                seed: ''
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
                  taskId: task_google_1765172350621
          headers: {}
          x-apidog-name: ''
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
                    x-apidog-ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                required:
                  - code
                  - msg
                  - data
                x-apidog-ignore-properties: []
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
            required: true
            schemeGroups:
              - id: qZy0RU1kSLYsjAoIDl2HZ
                schemeIds:
                  - BearerAuth
            use:
              id: qZy0RU1kSLYsjAoIDl2HZ
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
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786426989000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 8
                            model:
                              type: string
                              description: Image generation model used for the task
                              example: google/imagen4
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"A
                                lively comic scene set in an office, where two
                                colleagues are having a conversation. The first
                                person asks, ‘Have you heard of Google Imagen 4
                                Ultra?’ The second person enthusiastically
                                replies, ‘It is the best text-to-image tool
                                available right now!’ The first person then
                                asks, ‘Do you know where to get this API?’ The
                                second person smiles and says, ‘It is available
                                on Kie.ai!’ In the final panel, both people are
                                looking at a screen displaying the Kie.ai
                                interface with an API option. Use a bright,
                                colorful, and cheerful comic-book style
                                throughout.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"google/imagen4"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
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
                              example: a7445ed938f293ca663b5a5278977388
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
                            taskId: a7445ed938f293ca663b5a5278977388
                            model: google/imagen4
                            state: success
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"A
                              lively comic scene set in an office, where two
                              colleagues are having a conversation. The first
                              person asks, ‘Have you heard of Google Imagen 4
                              Ultra?’ The second person enthusiastically
                              replies, ‘It is the best text-to-image tool
                              available right now!’ The first person then asks,
                              ‘Do you know where to get this API?’ The second
                              person smiles and says, ‘It is available on
                              Kie.ai!’ In the final panel, both people are
                              looking at a screen displaying the Kie.ai
                              interface with an API option. Use a bright,
                              colorful, and cheerful comic-book style
                              throughout.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"google/imagen4"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/image_90b6bf4499a80b74a2b5ee640b7aaf70.webp"]}
                            completeTime: 1786427040000
                            createTime: 1786426989000
                            costTime: 48
                            creditsConsumed: 8
                            updateTime: 1786427040000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: a7445ed938f293ca663b5a5278977388
                            model: google/imagen4
                            state: fail
                            param: >-
                              {"input":"{\"aspect_ratio\":\"1:1\",\"prompt\":\"A
                              lively comic scene set in an office, where two
                              colleagues are having a conversation. The first
                              person asks, ‘Have you heard of Google Imagen 4
                              Ultra?’ The second person enthusiastically
                              replies, ‘It is the best text-to-image tool
                              available right now!’ The first person then asks,
                              ‘Do you know where to get this API?’ The second
                              person smiles and says, ‘It is available on
                              Kie.ai!’ In the final panel, both people are
                              looking at a screen displaying the Kie.ai
                              interface with an API option. Use a bright,
                              colorful, and cheerful comic-book style
                              throughout.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"google/imagen4"}
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
      x-apidog-folder: docs/en/Market/Image    Models/Google
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506360-run
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
