# Seedream5.0 Pro -  Layer Decomposition

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
      summary: Seedream5.0 Pro -  Layer Decomposition
      deprecated: false
      description: >
        Layer decomposition with Seedream 5.0 Pro: split an image into a base
        image and separate layers.


        :::tip

        The base image and every separated layer each count as one billed image;
        in auto mode the model decides the number of layers, so the cost varies
        per request. For current prices, see
        [kie.ai/pricing](https://kie.ai/pricing).

        :::


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
      operationId: seedream-5-pro-layer-decomposition
      tags:
        - docs/en/Market/Image    Models/Seedream
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              properties:
                model:
                  default: seedream/5-pro-layer-decomposition
                  description: >-
                    The model name used to execute the layer separation task.
                    Required field.


                    - Must be `seedream/5-pro-layer-decomposition` for this
                    endpoint
                  enum:
                    - seedream/5-pro-layer-decomposition
                  examples:
                    - seedream/5-pro-layer-decomposition
                  type: string
                  x-apidog-enum:
                    - description: ''
                      name: ''
                      value: seedream/5-pro-layer-decomposition
                callBackUrl:
                  description: >-
                    The URL to receive task completion notifications. Optional,
                    but recommended for production environments.


                    - Upon task completion, the system will send a POST request
                    to this URL

                    - The callback content includes task status, generated
                    result URLs, and task information

                    - You can also actively query the task status through the
                    get task details interface

                    - For callback signature verification methods, please refer
                    to the [Webhook Verification
                    Guide](/common-api/webhook-verification)
                  examples:
                    - https://your-domain.com/api/callback
                  format: uri
                  type: string
                input:
                  description: Input parameters for the layer separation task
                  properties:
                    prompt:
                      description: >-
                        Optional prompt for layer separation.


                        - When a prompt is provided, the model separates the
                        specified elements based on the prompt

                        - When no prompt is provided, the model automatically
                        identifies the main elements in the image

                        - Supports using `<bbox>x1 y1 x2 y2</bbox>` to precisely
                        specify element positions, recommending the use of
                        normalized coordinates in the 0-1000 range
                      examples:
                        - >-
                          Separate the title text <bbox>179 58 809 197</bbox>
                          and the parrot <bbox>330 274 641 991</bbox> into
                          independent layers
                      maxLength: 5000
                      minLength: 0
                      type: string
                    image_url:
                      description: |-
                        The source image URL for layer separation.

                        - Must upload exactly 1 image
                        - Supported formats: PNG, JPEG.
                        - Image size must not exceed 30 MB
                        - Total pixel range is 262,144-36,000,000
                        - Aspect ratio range is 1:16-16:1
                      examples:
                        - >-
                          https://static.aiquickdraw.com/tools/example/1786019968051_cKRYLHHu.png
                      format: uri
                      type: string
                    size:
                      description: >-
                        Required. Output resolution tier: auto, 1K, 1.5K or 2K.
                        auto follows the input image size.
                      enum:
                        - auto
                        - 1K
                        - 1.5K
                        - 2K
                      examples:
                        - 2K
                      type: string
                      x-apidog-enum:
                        - description: >-
                            Automatically select output size based on input
                            image
                          name: ''
                          value: auto
                        - description: 1K resolution level
                          name: ''
                          value: 1K
                        - description: 1.5K resolution level
                          name: ''
                          value: 1.5K
                        - description: 2K resolution level
                          name: ''
                          value: 2K
                    output_format:
                      default: jpeg
                      description: >-
                        Output format of the base image. This parameter only
                        controls the base image format; all separated layers are
                        fixed to output as PNG.
                      enum:
                        - png
                        - jpeg
                      examples:
                        - jpeg
                      type: string
                      x-apidog-enum:
                        - description: ''
                          name: ''
                          value: png
                        - description: ''
                          name: ''
                          value: jpeg
                  required:
                    - image_url
                    - size
                  type: object
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - size
                    - output_format
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
              model: seedream/5-pro-layer-decomposition
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Separate the title text <bbox>179 58 809 197</bbox> and the
                  parrot <bbox>330 274 641 991</bbox> into independent layers
                image_url: >-
                  https://static.aiquickdraw.com/tools/example/1786019968051_cKRYLHHu.png
                size: 2K
      responses:
        '200':
          description: Request successful.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
              example:
                code: 200
                msg: success
                data:
                  taskId: task_seedream_1765172101886
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
                              example: 1786417803000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 43
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786417758000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 21
                            model:
                              type: string
                              description: >-
                                Model used for the image layer decomposition
                                task
                              example: seedream/5-pro-layer-decomposition
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"size\":\"auto\",\"output_format\":\"jpeg\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1786019968051_cKRYLHHu.png\",\"prompt\":\"Split
                                the title text <bbox>179 58 809 197</bbox> and
                                the parrot <bbox>330 274641 991</bbox> into
                                separate
                                layers\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/5-pro-layer-decomposition"}
                            resultJson:
                              type: string
                              description: >-
                                Layer decomposition result in JSON string
                                format. resultObject.layers_data contains
                                information about each layer, and resultUrls
                                contains the list of all output file URLs.
                                Present only when state is success.
                              example: >-
                                {"resultObject":{"layers_data":[{"z_index":0,"size":"1080x1080","output_format":"jpeg","url":"https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417797749-4ts7v7lh2v9.jpeg"},{"z_index":1,"size":"1179x245","output_format":"png","bounding_box":{"absolute":[202,63,872,202],"normalized":[187,58,806,186]},"name":"Seedream
                                Title Text","description":"Extract the yellow
                                Seedream title text. Retain only the text
                                itself, excluding annotation borders and
                                background
                                content.","url":"https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417799558-xckcwufhvg.png"},{"z_index":2,"size":"425x995","output_format":"png","bounding_box":{"absolute":[385,331,686,1035],"normalized":[356,306,634,957]},"name":"Colorful
                                Macaw","description":"Extract the colorful red,
                                yellow, green, and blue macaw perched on the
                                branch. Retain only the parrot itself, excluding
                                annotation borders, the branch, and background
                                content.","url":"https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417801592-m1rf8z5zs0l.png"}]},"resultUrls":["https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417797749-4ts7v7lh2v9.jpeg","https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417799558-xckcwufhvg.png","https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417801592-m1rf8z5zs0l.png"]}
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
                              example: d481b8cd378397dce459252764a33621
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786417803000
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
                            taskId: d481b8cd378397dce459252764a33621
                            model: seedream/5-pro-layer-decomposition
                            state: success
                            param: >-
                              {"input":"{\"size\":\"auto\",\"output_format\":\"jpeg\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1786019968051_cKRYLHHu.png\",\"prompt\":\"Split
                              the title text <bbox>179 58 809 197</bbox> and the
                              parrot <bbox>330 274641 991</bbox> into separate
                              layers\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/5-pro-layer-decomposition"}
                            resultJson: >-
                              {"resultObject":{"layers_data":[{"z_index":0,"size":"1080x1080","output_format":"jpeg","url":"https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417797749-4ts7v7lh2v9.jpeg"},{"z_index":1,"size":"1179x245","output_format":"png","bounding_box":{"absolute":[202,63,872,202],"normalized":[187,58,806,186]},"name":"Seedream
                              Title Text","description":"Extract the yellow
                              Seedream title text. Retain only the text itself,
                              excluding annotation borders and background
                              content.","url":"https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417799558-xckcwufhvg.png"},{"z_index":2,"size":"425x995","output_format":"png","bounding_box":{"absolute":[385,331,686,1035],"normalized":[356,306,634,957]},"name":"Colorful
                              Macaw","description":"Extract the colorful red,
                              yellow, green, and blue macaw perched on the
                              branch. Retain only the parrot itself, excluding
                              annotation borders, the branch, and background
                              content.","url":"https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417801592-m1rf8z5zs0l.png"}]},"resultUrls":["https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417797749-4ts7v7lh2v9.jpeg","https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417799558-xckcwufhvg.png","https://tempfile.aiquickdraw.com/seedream5pro-layer/1786417801592-m1rf8z5zs0l.png"]}
                            completeTime: 1786417803000
                            createTime: 1786417758000
                            costTime: 43
                            creditsConsumed: 21
                            updateTime: 1786417803000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: d481b8cd378397dce459252764a33621
                            model: seedream/5-pro-layer-decomposition
                            state: fail
                            param: >-
                              {"input":"{\"size\":\"auto\",\"output_format\":\"jpeg\",\"image_url\":\"https://static.aiquickdraw.com/tools/example/1786019968051_cKRYLHHu.png\",\"prompt\":\"Split
                              the title text <bbox>179 58 809 197</bbox> and the
                              parrot <bbox>330 274641 991</bbox> into separate
                              layers\"}","callBackUrl":"https://your-domain.com/api/callback","model":"seedream/5-pro-layer-decomposition"}
                            failCode: '500'
                            failMsg: <error detail>
                            completeTime: 1786417803000
                            createTime: 1786417758000
                            costTime: 43
                            creditsConsumed: 0
                            updateTime: 1786417803000
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Seedream
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-41328118-run
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
