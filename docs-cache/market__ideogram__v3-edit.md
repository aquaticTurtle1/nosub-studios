# Ideogram V3 Edit

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
      summary: Ideogram V3 Edit
      deprecated: false
      description: >
        Image generation by ideogram/v3-edit


        Output format: WebP.


        ## Create Task


        Use this endpoint to create a new image editing generation task.


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
      operationId: ideogram-v3-edit
      tags:
        - docs/en/Market/Image    Models/Ideogram
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
                - input
              properties:
                model:
                  type: string
                  enum:
                    - ideogram/v3-edit
                  default: ideogram/v3-edit
                  description: |-
                    The model name used for generation. This field is required.

                    - This endpoint must use the `ideogram/v3-edit` model
                  examples:
                    - ideogram/v3-edit
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent.
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  description: Input parameters for the image editing task.
                  required:
                    - prompt
                    - image_url
                    - mask_url
                  properties:
                    prompt:
                      type: string
                      maxLength: 5000
                      description: >-
                        The prompt to fill the masked part of the image. Maximum
                        length: 5000 characters.
                      examples:
                        - A dog wearing a cowboy hat
                    image_url:
                      type: string
                      format: uri
                      description: >-
                        The image URL to generate an image from. Needs to match
                        the dimensions of the mask.


                        - Please provide the URL of the uploaded file, not raw
                        file content

                        - Accepted types: `image/jpeg`, `image/png`,
                        `image/webp`

                        - Max size: 10.0MB
                      examples:
                        - >-
                          https://file.aiquickdraw.com/custom-page/akr/section-images/1755076859801ryyol1du.webp
                    mask_url:
                      type: string
                      format: uri
                      description: >-
                        The mask URL to inpaint the image. Needs to match the
                        dimensions of the input image.


                        - Please provide the URL of the uploaded file, not raw
                        file content

                        - Accepted types: `image/jpeg`, `image/png`,
                        `image/webp`

                        - Max size: 10.0MB
                      examples:
                        - >-
                          https://file.aiquickdraw.com/custom-page/akr/section-images/1755076871089hx9uonhc.webp
                    rendering_speed:
                      type: string
                      enum:
                        - TURBO
                        - BALANCED
                        - QUALITY
                      default: BALANCED
                      description: |-
                        The rendering speed to use. Default value: `BALANCED`.

                        - `TURBO`: Turbo
                        - `BALANCED`: Balanced
                        - `QUALITY`: Quality
                      examples:
                        - BALANCED
                    expand_prompt:
                      type: boolean
                      default: true
                      description: >-
                        Determine if MagicPrompt should be used in generating
                        the request or not. Default value: `true`.


                        - Boolean value: `true` / `false`
                      examples:
                        - true
                    seed:
                      type: integer
                      description: Seed for the random number generator.
                  x-apidog-orders:
                    - prompt
                    - image_url
                    - mask_url
                    - rendering_speed
                    - expand_prompt
                    - seed
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: ideogram/v3-edit
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: A dog wearing a cowboy hat
                image_url: >-
                  https://file.aiquickdraw.com/custom-page/akr/section-images/1755076859801ryyol1du.webp
                mask_url: >-
                  https://file.aiquickdraw.com/custom-page/akr/section-images/1755076871089hx9uonhc.webp
                rendering_speed: BALANCED
                expand_prompt: true
                seed: 123456
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
                  - properties:
                      data:
                        properties:
                          taskId:
                            description: >-
                              Task ID, which can be used to query task status
                              through the task detail endpoint.
                            examples:
                              - task_ideogram_1765180586443
                            type: string
                        type: object
                        x-apidog-orders:
                          - taskId
                        x-apidog-ignore-properties: []
                    type: object
                    x-apidog-orders:
                      - data
                    x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: task_ideogram_1765180586443
          headers: {}
          x-apidog-name: ''
        '500':
          description: Server error.
          content:
            application/json:
              schema:
                type: object
                properties: {}
                x-apidog-orders: []
                x-apidog-ignore-properties: []
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
                              example: 7
                            model:
                              type: string
                              description: Model used for image editing
                              example: ideogram/v3-edit
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task,
                                formatted as a JSON string
                              example: >-
                                {"model":"ideogram/v3-edit","callBackUrl":"https://your-domain.com/api/callback","input":{"prompt":"A
                                dog wearing a cowboy
                                hat","image_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755076859801ryyol1du.webp","mask_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755076871089hx9uonhc.webp","rendering_speed":"BALANCED","expand_prompt":true,"seed":123456}}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result formatted as a JSON
                                string. `resultUrls` contains the URLs of the
                                generated images. Present only when state is
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
                            model: ideogram/v3-edit
                            state: success
                            param: >-
                              {"model":"ideogram/v3-edit","callBackUrl":"https://your-domain.com/api/callback","input":{"prompt":"A
                              dog wearing a cowboy
                              hat","image_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755076859801ryyol1du.webp","mask_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755076871089hx9uonhc.webp","rendering_speed":"BALANCED","expand_prompt":true,"seed":123456}}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/workers/images/image_90b6bf4499a80b74a2b5ee640b7aaf70.webp"]}
                            completeTime: 1786427040000
                            createTime: 1786426989000
                            costTime: 48
                            creditsConsumed: 7
                            updateTime: 1786427040000
                      failure:
                        summary: Failure
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 4e029a320e97cff234e6e06827c3965e
                            model: ideogram/v3-edit
                            state: fail
                            param: >-
                              {"model":"ideogram/v3-edit","callBackUrl":"https://your-domain.com/api/callback","input":{"prompt":"A
                              dog wearing a cowboy
                              hat","image_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755076859801ryyol1du.webp","mask_url":"https://file.aiquickdraw.com/custom-page/akr/section-images/1755076871089hx9uonhc.webp","rendering_speed":"BALANCED","expand_prompt":true,"seed":123456}}
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-31157352-run
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
