# Get 4K Video

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
      summary: Get 4K Video
      deprecated: false
      description: >-
        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/veo3-api/get-veo-3-4k-video](https://docs.kie.ai/old-model/veo3-api/get-veo-3-4k-video).

        :::

        ::: info[]
          Get the ultra-high-definition 4K version of a Veo 3.1 video generation task.
        :::



        ### Usage Instructions


        * **Supported aspect ratios**
          * Both **16:9** and **9:16** tasks support upgrading to **1080P** and **4K**.
        * **Processing time**
          * 4K generation requires significant extra processing time — typically **~5–10 minutes** depending on load.
        * If the 4K video is not ready yet, the endpoint may return a non-200
        code. Wait and retry (recommended interval: **30s+**) until the result
        is available.


        ::: tip[]
          For production use, we recommend using `callBackUrl` to receive automatic notifications when 4K generation completes, rather than polling frequently.
        :::


        :::tip

        Choosing 1080p or 4k at generation costs the 720p price plus the 1080P /
        4K upgrade price. For current prices, see
        [kie.ai/pricing](https://kie.ai/pricing).

        :::


        ## Callbacks


        After submitting a 4K video generation task, use the unified callback
        mechanism to receive generation completion notifications:


        <Card title="4K Video Generation Callbacks" icon="bell"
        href="/veo3-api/get-veo-3-4k-video-callbacks">
          Learn how to configure and handle 4K video generation callback notifications
        </Card>



        ## Error Responses


        When submitting repeated requests for the same task ID, the system
        returns a `422` status code with specific error details:


        <Tabs>
          <TabItem value="processing" label="4K Video Processing">
            ```json
            {
              "code": 422,
              "msg": "4k is processing. It should be ready in 5-10 minutes. Please check back shortly.",
              "data": {
                "taskId": "veo_task_example123",
                "resultUrls": null,
                "imageUrls": null
              }
            }
            ```
          </TabItem>
          <TabItem value="generated" label="4K Video Already Generated">
            ```json
            {
              "code": 422,
              "msg": "The video has been generated successfully",
              "data": {
                "taskId": "veo_task_example123",
                "resultUrls": [
                  "https://tempfile.aiquickdraw.com/v/example_task_1234567890.mp4"
                ],
                "imageUrls": [
                  "https://tempfile.aiquickdraw.com/v/example_task_1234567890.jpg"
                ]
              }
            }
            ```
          </TabItem>
        </Tabs>
      operationId: get-veo3-1-4k-video
      tags:
        - docs/en/Market/Video Models/Veo3.1 API
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
                  default: veo/get-4k-video
                  description: 'Fixed: veo/get-4k-video.'
                  examples:
                    - veo/get-4k-video
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    The URL to receive 4K video generation task completion
                    updates. Optional but recommended for production use.


                    - System will POST task status and results to this URL when
                    4K video generation completes

                    - Callback includes generated video URLs, media IDs, and
                    related information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing results

                    - Alternatively, poll Get Task Details
                    (/market/common/get-task-detail).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  examples:
                    - http://your-callback-url.com/4k-callback
                input:
                  type: object
                  required:
                    - task_id
                  properties:
                    task_id:
                      type: string
                      description: Task ID
                      examples:
                        - veo_task_abcdef123456
                    index:
                      type: integer
                      description: video index
                      default: 0
                      examples:
                        - 0
                  x-apidog-orders:
                    - task_id
                    - index
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: veo/get-4k-video
              callBackUrl: http://your-callback-url.com/4k-callback
              input:
                task_id: veo_task_abcdef123456
                index: 0
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    enum:
                      - 200
                      - 401
                      - 404
                      - 422
                      - 429
                      - 451
                      - 455
                      - 500
                    description: >-
                      Status code of the request. The HTTP status is 200 even
                      when the request fails, so always check this field: 200
                      means success; any other value means the request failed
                      and msg describes the reason. Common values: 401 invalid
                      or missing API key; 402 insufficient credits; 429 rate
                      limit exceeded; 422 or 500 the request could not be
                      processed (read msg and check your parameters before
                      retrying). If taskId does not exist or the source task
                      failed, the request returns a non-200 code; retrying will
                      not help.
                  msg:
                    type: string
                    description: Error message when code != 200
                    examples:
                      - success
                  data:
                    type: object
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Task ID, can be used with [Get Task
                          Details](/market/common/get-task-detail) endpoint to
                          query task status
                        examples:
                          - veo_task_abcdef123456
                      resultUrls:
                        type: array
                        items:
                          type: string
                        description: Generated 4K video URLs
                        examples:
                          - - >-
                              https://file.aiquickdraw.com/v/example_task_1234567890.mp4
                      imageUrls:
                        type: array
                        items:
                          type: string
                        description: Related thumbnail or preview image URLs
                        examples:
                          - - >-
                              https://file.aiquickdraw.com/v/example_task_1234567890.jpg
                    x-apidog-orders:
                      - taskId
                      - resultUrls
                      - imageUrls
                    x-apidog-ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: veo_task_abcdef123456
                  resultUrls: null
                  imageUrls: null
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
        on4KVideoGenerated:
          '{$request.body#/callBackUrl}':
            post:
              summary: 4K Video Generation Callback
              description: >-
                When the 4K video generation task completes, the system will
                send a POST request to your configured callback URL
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
                            Status code


                            - **200**: Success - 4K video generation task
                            successful
                          enum:
                            - 200
                            - 400
                            - 500
                        msg:
                          type: string
                          description: Status message
                          example: 4K Video generated successfully.
                        data:
                          type: object
                          properties:
                            task_id:
                              type: string
                              description: Task ID
                              example: bf3e7adb-fb6c-4257-bbcd-470787386fb0
                            result_urls:
                              type: array
                              items:
                                type: string
                              description: Generated 4K video URLs
                              example:
                                - >-
                                  https://file.aiquickdraw.com/p/d1301f0aa3f647c1ab7bb1f60ef006c0_1750236843.mp4
                            media_ids:
                              type: array
                              items:
                                type: string
                              description: Media IDs
                              example:
                                - >-
                                  CAUaJDQ5NGYwY2NhLTE1NTUtNDIzNS1iNjJiLWE0OWE4NzMxNjMzOCIDQ0FFKi4xMDJlOTA5MS01NGJlLTQzN2EtODhkMC01NWNkNGUxNTllNTNfdXBzYW1wbGVk
                            image_urls:
                              type: array
                              items:
                                type: string
                              description: Related image URLs
                              example:
                                - >-
                                  https://tempfile.aiquickdraw.com/p/d1301f0aa3f647c1ab7bb1f60ef006c0_1750236843.jpg
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Video Models/Veo3.1 API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43155883-run
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
