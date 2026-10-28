# Convert to WAV Format

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
      summary: Convert to WAV Format
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/convert-to-wav)

        :::

        Convert an existing music track to high-quality WAV format.


        ### Usage Guide

        - Use this endpoint to obtain WAV format files from your generated music

        - WAV files provide uncompressed audio for professional editing and
        processing

        - Converted files maintain the full quality of the original audio

        - Separated stems are supported: to convert a stem produced by Vocal &
        Instrument Stem Separation, pass that separation task's task_id and the
        stem's id as audio_id


        ### Parameter Details

        - `task_id` identifies the original music generation task, or the stem
        separation task when converting a separated stem

        - `audio_id` specifies which audio track to convert when multiple
        variations exist; for a separated stem, use the stem's id
        (vocal_removal_info.origin_data[].id in the separation callback, or
        resultJson.resultObject.origin_data[].id when polling recordInfo)


        ### Developer Notes

        - Generated WAV files are retained for 14 days

        - WAV files are typically 5-10 times larger than MP3 equivalents

        - Processing time may vary depending on the length of the original audio

        - When polling GET /api/v1/jobs/recordInfo, the file URL is
        resultJson.resultUrls[0] (the callback uses audio_wav_url / video_url).
      operationId: convert-to-wav
      tags:
        - docs/en/Market/Music Models/Suno/WAV Conversion
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
                    - ai-music-api/convert-to-wav-format
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
                        Music" or "Extend Music" endpoints. To convert a
                        separated stem, use the task_id of the Vocal &
                        Instrument Stem Separation task instead.
                      examples:
                        - 5c79****be8e
                    audio_id:
                      type: string
                      description: >-
                        Unique identifier of the specific audio track to
                        convert. This ID is returned in the callBackUrl data
                        after music generation completes. For a separated stem,
                        use the stem's id from the separation result
                        (origin_data[].id).
                      examples:
                        - e231****-****-****-****-****8cadc7dc
                  required:
                    - task_id
                    - audio_id
                  x-apidog-orders:
                    - task_id
                    - audio_id
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: ai-music-api/convert-to-wav-format
              callBackUrl: https://api.example.com/callback
              input:
                task_id: 5c79****be8e
                audio_id: e231****-****-****-****-****8cadc7dc
      responses:
        '200':
          description: Request successful
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
                          check your parameters before retrying). If this track
                          has already been converted, the request returns code
                          422 and data contains the existing taskId and
                          audioWavUrl; no credits are charged.
                      msg:
                        type: string
                        description: Error message when code != 200
                        examples:
                          - success
                    x-apidog-orders:
                      - code
                      - msg
                    x-apidog-ignore-properties: []
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          taskId:
                            type: string
                            description: Task ID for tracking task status
                            examples:
                              - 5c79****be8e
                        x-apidog-orders:
                          - taskId
                        x-apidog-ignore-properties: []
                    x-apidog-orders:
                      - data
                    x-apidog-ignore-properties: []
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
        wavGenerated:
          '{$request.body#/callBackUrl}':
            post:
              description: >-
                System will call this callback when WAV format audio generation
                is complete.


                ### Callback Example

                ```json

                {
                  "code": 200,
                  "msg": "success",
                  "data": {
                    "audio_wav_url": "https://example.com/s/04e6****e727.wav",
                    "task_id": "988e****c8d3"
                  }
                }

                ```
              requestBody:
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
                        - type: object
                          properties:
                            data:
                              type: object
                              properties:
                                taskId:
                                  type: string
                                  description: Task ID for tracking task status
                                  example: 5c79****be8e
                      type: object
                      properties:
                        code:
                          type: integer
                          description: Status code
                          example: 200
                        msg:
                          type: string
                          description: Response message
                          example: success
                        data:
                          type: object
                          properties:
                            task_id:
                              type: string
                              description: Task ID
                            audio_wav_url:
                              type: string
                              description: WAV format audio file URL
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Music Models/Suno/WAV Conversion
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206401-run
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
