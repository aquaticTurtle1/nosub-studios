# Get Timestamped Lyrics

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
      summary: Get Timestamped Lyrics
      deprecated: false
      description: >-
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/get-timestamped-lyrics)

        :::

        Retrieve synchronized lyrics with precise timestamps for music tracks.


        ### Usage Guide

        - Use this endpoint to get lyrics that synchronize with audio playback

        - Implement karaoke-style lyric displays in your music players

        - Create visualizations that match audio timing


        ### Parameter Details

        - Both `task_id` and `audio_id` are required to identify the specific
        track

        - The `task_id` comes from "Generate Music", "Extend Music"
        ,"Upload-and-Cover" or "Upload-and-Extend" endpoints

        - The `audio_id` identifies the specific track version when multiple
        were generated


        ### Developer Notes

        - This endpoint returns the result synchronously. A request succeeds
        when both code and data.code are 200. If callBackUrl is set, a callback
        is also sent; its resultJson uses snake_case (aligned_words, start_s,
        end_s, p_align).

        - Timestamps are provided in seconds for precise synchronization

        - Waveform data is included for audio visualization implementations

        - For instrumental tracks (created with `instrumental=true`), no lyrics
        data will be returned
      operationId: get-timestamped-lyrics
      tags:
        - docs/en/Market/Music Models/Suno/Music Generation
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
                    - ai-music-api/timeStamped-lyrics
                callBackUrl:
                  type: string
                  description: >-
                    The URL to receive generation task completion updates.
                    Optional but recommended for production use.


                    - System will POST task status and results to this URL when
                    generation completes

                    - Callback includes generated content URLs and task
                    information

                    - Your callback endpoint should accept POST requests with
                    JSON payload containing results

                    - Alternatively, poll GET /api/v1/jobs/recordInfo?taskId=...
                    (see [Get Task Details](/market/common/get-task-detail)).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  format: uri
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
                        - 5c79****be8e
                    audio_id:
                      type: string
                      description: >-
                        Unique identifier of the specific audio track for which
                        to retrieve lyrics. This ID is returned in the
                        callBackUrl data after music generation completes.
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
              model: ai-music-api/timeStamped-lyrics
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
                          - 401
                          - 404
                          - 422
                          - 429
                          - 451
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
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          code:
                            type: integer
                            description: Status code of the result. 200 means success.
                            examples:
                              - 200
                          msg:
                            type: string
                            description: Result message.
                            examples:
                              - success
                          data:
                            type: object
                            properties:
                              alignedWords:
                                type: array
                                description: List of aligned lyrics words
                                items:
                                  type: object
                                  properties:
                                    word:
                                      type: string
                                      description: Lyrics word
                                      examples:
                                        - |-
                                          [Verse]
                                          Waggin'
                                    success:
                                      type: boolean
                                      description: >-
                                        Whether lyrics word is successfully
                                        aligned
                                      examples:
                                        - true
                                    startS:
                                      type: number
                                      description: Word start time (seconds)
                                      examples:
                                        - 1.36
                                    endS:
                                      type: number
                                      description: Word end time (seconds)
                                      examples:
                                        - 1.79
                                    palign:
                                      type: integer
                                      description: Alignment parameter
                                      examples:
                                        - 0
                                  x-apidog-orders:
                                    - word
                                    - success
                                    - startS
                                    - endS
                                    - palign
                                  x-apidog-ignore-properties: []
                              waveformData:
                                type: array
                                description: Waveform data, used for audio visualization
                                items:
                                  type: number
                                examples:
                                  - - 0
                                    - 1
                                    - 0.5
                                    - 0.75
                              hootCer:
                                type: number
                                description: Lyrics alignment accuracy score
                                examples:
                                  - 0.3803191489361702
                              isStreamed:
                                type: boolean
                                description: Whether it's streaming audio
                                examples:
                                  - false
                            x-apidog-orders:
                              - alignedWords
                              - waveformData
                              - hootCer
                              - isStreamed
                            x-apidog-ignore-properties: []
                        x-apidog-orders:
                          - code
                          - msg
                          - data
                        x-apidog-ignore-properties: []
                    x-apidog-orders:
                      - data
                    x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  code: 200
                  msg: success
                  data:
                    alignedWords:
                      - word: |-
                          [Verse]
                          Waggin'
                        success: true
                        startS: 1.36
                        endS: 1.79
                        palign: 0
                    waveformData:
                      - 0
                      - 1
                      - 0.5
                      - 0.75
                    hootCer: 0.3803191489361702
                    isStreamed: false
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
      x-apidog-folder: docs/en/Market/Music Models/Suno/Music Generation
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206425-run
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
