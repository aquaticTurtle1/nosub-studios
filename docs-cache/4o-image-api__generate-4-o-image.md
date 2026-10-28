# Generate 4o Image

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
      summary: Generate 4o Image
      deprecated: false
      description: >-
        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/4o-image-api/generate-4-o-image](https://docs.kie.ai/old-model/4o-image-api/generate-4-o-image).

        :::

        Create a new 4o Image generation task. Generated images are stored for
        14 days, after which they expire.
      operationId: generate-4o-image
      tags:
        - docs/en/Market/Image    Models/4o Image API
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              examples:
                - callBackUrl: https://your-domain.com/api/callback
                  input:
                    prompt: A beautiful sunset over the mountains
                    size: '1:1'
                  model: 4o-image-api
              properties:
                model:
                  default: 4o-image-api
                  description: Required. Must be 4o-image-api.
                  examples:
                    - 4o-image-api
                  type: string
                  enum:
                    - 4o-image-api
                callBackUrl:
                  description: >-
                    The URL to receive 4o image generation task completion
                    updates. Optional but recommended for production use.


                    - System will POST task status and results to this URL when
                    4o image generation completes

                    - Callback includes generated image URLs and task
                    information for all variations

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing image generation results

                    - For detailed callback format and implementation guide, see
                    [4o Image Generation
                    Callbacks](https://docs.kie.ai/4o-image-api/generate-4-o-image-callbacks)

                    - Alternatively, query the task with [Get Task
                    Details](/market/common/get-task-detail) (GET
                    /api/v1/jobs/recordInfo).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  examples:
                    - https://your-callback-url.com/callback
                  format: uri
                  type: string
                input:
                  properties:
                    prompt:
                      description: >-
                        (Optional) Text prompt that conveys the creative idea
                        you want the 4o model to render. Required if neither
                        `files_url` nor `file_url` is supplied. At least one of
                        `prompt` or `files_url` must be provided.
                      examples:
                        - A beautiful sunset over the mountains
                      type: string
                    files_url:
                      description: >-
                        (Optional) Up to 5 publicly reachable image URLs to
                        serve as reference or source material. Use this when you
                        want to edit or build upon an existing picture. If you
                        don’t have reliable hosting, upload your images first
                        via our File Upload API quick‑start:
                        https://docs.kie.ai/file-upload-api/quickstart.
                        Supported formats: .jfif, .pjpeg, .jpeg, .pjp, .jpg,
                        .png, .webp. At least one of `prompt` or `files_url`
                        must be provided.
                      examples:
                        - - https://example.com/image.png
                      items:
                        format: uri
                        type: string
                      type: array
                    size:
                      description: >-
                        (Required) Aspect ratio of the generated image. Must be
                        one of the listed values.
                      enum:
                        - '1:1'
                        - '3:2'
                        - '2:3'
                      examples:
                        - '1:1'
                      type: string
                    file_url:
                      deprecated: true
                      description: >-
                        (Optional, Deprecated) File URL, such as an image URL.
                        If file_url is provided, 4o image may create based on
                        this image. This parameter will be deprecated in the
                        future, please use files_url instead.
                      examples:
                        - https://example.com/image.png
                      format: uri
                      type: string
                  required:
                    - size
                  type: object
                  x-apidog-orders:
                    - prompt
                    - files_url
                    - size
                    - file_url
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
              model: 4o-image-api
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: A beautiful sunset over the mountains
                size: '1:1'
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - properties:
                      code:
                        description: >-
                          Status code of the request. The HTTP status is 200
                          even when the request fails, so always check this
                          field: 200 means success; any other value means the
                          request failed and msg describes the reason. Common
                          values: 401 invalid or missing API key; 402
                          insufficient credits; 429 rate limit exceeded; 422 or
                          500 the request could not be processed (read msg and
                          check your parameters before retrying).
                        enum:
                          - 200
                          - 400
                          - 401
                          - 402
                          - 404
                          - 422
                          - 429
                          - 455
                          - 500
                        type: integer
                      msg:
                        description: Error message when code != 200
                        examples:
                          - success
                        type: string
                    type: object
                    x-apidog-orders:
                      - code
                      - msg
                    x-apidog-ignore-properties: []
                  - properties:
                      data:
                        properties:
                          taskId:
                            description: >-
                              Task ID, can be used with [Get Task
                              Details](/market/common/get-task-detail) to query
                              task status
                            examples:
                              - task12345
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
                  taskId: task12345
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
        on4oImageGenerated:
          '{$request.body#/callBackUrl}':
            post:
              summary: 4o Image Generation Task Callback
              description: >-
                When the 4o Image task is completed, the system will send the
                result to your provided callback URL via POST request
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
                            Response Status Codes


                            - **200**: Success - Image generation completed
                            successfully  

                            - **400**: Bad Request  
                              - The image content in files_url violates content policy  
                              - Image size exceeds maximum of 26214400 bytes  
                              - We couldn't process the provided image file (code=invalid_image_format)  
                              - Your content was flagged by OpenAI as violating content policies  
                              - The image in files_url could not be downloaded.  
                            - **451**: Download Failed - Unable to download
                            image from the provided files_url  

                            - **500**: Server Error  
                              - Please try again later  
                              - Failed to get user token  
                              - Failed to generate image  
                              - GPT 4O failed to edit the picture  
                              - null
                          enum:
                            - 200
                            - 400
                            - 451
                            - 500
                        msg:
                          type: string
                          description: Status message
                          example: success
                        data:
                          type: object
                          properties:
                            taskId:
                              type: string
                              description: Task ID
                              example: task12345
                            info:
                              type: object
                              properties:
                                result_urls:
                                  type: array
                                  items:
                                    type: string
                                  description: List of generated image URLs
                                  example:
                                    - https://example.com/result/image1.png
                    example:
                      code: 200
                      msg: success
                      data:
                        taskId: task12345
                        info:
                          result_urls:
                            - https://example.com/result/image1.png
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/4o Image API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43187255-run
components:
  schemas: {}
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
