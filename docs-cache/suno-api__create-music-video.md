# Create Music Video

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
      summary: Create Music Video
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/create-music-video)

        :::

        Create a video with visualizations based on your generated music track.


        ### Usage Guide

        - Use this endpoint to turn your audio tracks into visually appealing
        videos

        - Add artist attribution and branding to your music videos

        - Videos can be shared on social media or embedded in websites


        ### Parameter Details

        - `task_id` identifies the original music generation task

        - `audio_id` specifies which audio track to visualize when multiple
        variations exist

        - Optional `author` and `domain_name` add customized branding to the
        video


        ### Developer Notes

        - Generated video files are retained for 14 days

        - Videos are optimized for social media sharing

        - Processing time varies based on audio length and server load

        - When polling GET /api/v1/jobs/recordInfo, the file URL is
        resultJson.resultUrls[0] (the callback uses audio_wav_url / video_url).
      operationId: create-music-video
      tags:
        - docs/en/Market/Music Models/Suno/Music Video Generation
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
                  description: The model name to use for generation. Required field.
                  examples:
                    - ai-music-api/create-music-video
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
                    - https://api.example.com/callback
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    task_id:
                      type: string
                      description: >-
                        Unique identifier of the music generation task. This
                        should be a task_id returned from either the "Generate
                        Music" or "Extend Music" endpoints.
                      examples:
                        - taskId_774b9aa0422f
                    audio_id:
                      type: string
                      description: >-
                        Unique identifier of the specific audio track to
                        visualize. This ID is returned in the callBackUrl data
                        after music generation completes.
                      examples:
                        - e231****-****-****-****-****8cadc7dc
                    author:
                      type: string
                      maxLength: 50
                      description: >-
                        Artist or creator name to display as a signature on the
                        video cover. Maximum 50 characters. This creates
                        attribution for the music creator.
                      examples:
                        - DJ Electronic
                    domain_name:
                      type: string
                      maxLength: 50
                      description: >-
                        Website or brand to display as a watermark at the bottom
                        of the video. Maximum 50 characters. Useful for
                        promotional branding or attribution.
                      examples:
                        - music.example.com
                  required:
                    - task_id
                    - audio_id
                  x-apidog-orders:
                    - task_id
                    - audio_id
                    - author
                    - domain_name
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: ai-music-api/create-music-video
              callBackUrl: https://api.example.com/callback
              input:
                task_id: taskId_774b9aa0422f
                audio_id: e231****-****-****-****-****8cadc7dc
                author: DJ Electronic
                domain_name: music.example.com
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                allOf:
                  - type: object
                    properties:
                      code:
                        type: integer
                        enum:
                          - 200
                          - 400
                          - 401
                          - 402
                          - 404
                          - 409
                          - 422
                          - 429
                          - 455
                          - 500
                        description: >-
                          Status code of the request. The HTTP status is 200
                          even when the request fails, so always check this
                          field: 200 means success; any other value means the
                          request failed and msg describes the reason. Common
                          values: 401 invalid or missing API key; 402
                          insufficient credits; 429 rate limit exceeded; 422 or
                          500 the request could not be processed (read msg and
                          check your parameters before retrying).
                      msg:
                        type: string
                        description: Error message when code != 200
                        examples:
                          - success
                    x-apidog-orders:
                      - code
                      - msg
                    x-apidog-ignore-properties: []
                type: object
                properties:
                  code:
                    type: integer
                    format: int32
                    description: >-
                      Status code of the request. The HTTP status is 200 even
                      when the request fails, so always check this field: 200
                      means success; any other value means the request failed
                      and msg describes the reason. Common values: 401 invalid
                      or missing API key; 402 insufficient credits; 429 rate
                      limit exceeded; 422 or 500 the request could not be
                      processed (read msg and check your parameters before
                      retrying).
                    examples:
                      - 200
                  msg:
                    type: string
                    description: Status message
                    examples:
                      - success
                  data:
                    type: object
                    properties:
                      taskId:
                        type: string
                        description: Task ID
                        examples:
                          - ''
                    x-apidog-orders:
                      - taskId
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
                  taskId: <taskId>
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
        onMp4Generated:
          '{$request.body#/callBackUrl}':
            post:
              summary: MP4 Generation Completion Callback
              description: >-
                When MP4 generation is complete, the system will send a POST
                request to the provided callback URL to notify the result
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      allOf:
                        - type: object
                          properties:
                            code:
                              type: integer
                              enum:
                                - 200
                                - 500
                              description: >-
                                Response status code


                                - **200**: Success - Request has been processed
                                successfully

                                - **500**: Internal Error - Please try again
                                later.
                            msg:
                              type: string
                              description: Error message when code != 200
                              example: success
                      type: object
                      required:
                        - code
                        - msg
                        - data
                      properties:
                        code:
                          type: integer
                          description: Status code; 200 indicates success.
                          example: 200
                        msg:
                          type: string
                          description: Status message
                          example: msg_9a23a47664f7
                        data:
                          type: object
                          required:
                            - task_id
                            - video_url
                          properties:
                            task_id:
                              type: string
                              description: Unique identifier of the generation task
                              example: task_id_5bbe7721119d
                            video_url:
                              type: string
                              description: Accessible video URL, valid for 14 days
                              example: video_url_847715e66259
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Music Models/Suno/Music Video Generation
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206403-run
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
