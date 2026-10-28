# Generate MIDI from Audio

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
      summary: Generate MIDI from Audio
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/generate-midi)

        :::


        > Convert separated audio tracks into MIDI format with detailed note
        information for each instrument.


        ## Usage Guide


        * Convert separated audio tracks into structured MIDI data containing
        pitch, timing, and velocity information

        * Requires a completed vocal separation task ID (from the Vocal Removal
        API)

        * Generates MIDI note data for multiple detected instruments including
        drums, bass, guitar, keyboards, and more

        * Ideal for music transcription, notation, remixing, or educational
        analysis

        * Best results on clean, well-separated audio tracks with clear
        instrument parts


        ## Prerequisites


        :::warning Required

        You must first use the **Vocal & Instrument Stem Separation** API to
        separate your audio before generating MIDI.

        :::


        :::tip

        This endpoint is free.

        :::


        ## Parameter Reference


        | Name | Type | Description |

        | :--- | :--- | :--- |

        | **`task_id`** | string | **Required.** Task ID from a completed vocal
        separation. |

        | **`callBackUrl`** | string | **Required.** URL to receive MIDI
        generation completion notifications. |

        | **`audio_id`** | string | **Optional.** The id of a stem from the
        separation callback (vocal_removal_info.origin_data[].id). If omitted,
        MIDI is generated from all stems. |


        ## Developer Notes


        * Set callBackUrl to receive note data. To fetch notes later, use GET
        /api/v1/midi/record-info?taskId=….

        * Each note includes: `pitch` (MIDI note number), `start` (seconds),
        `end` (seconds), `velocity` (0-1).

        * Not all instruments may be detected — depends on audio content.

        * When polling GET /api/v1/jobs/recordInfo, resultJson.resultObject only
        contains summary fields; the notes are delivered in the callback
        (data.instruments[].notes[]) or via /api/v1/midi/record-info.
      operationId: generate-midi
      tags:
        - docs/en/Market/Music Models/Suno/Vocal Removal
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
                    - ai-music-api/generate-midi-from-audio
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
                    - https://example.callback
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    task_id:
                      type: string
                      description: >-
                        Task ID from a completed vocal separation. This should
                        be the task_id returned from the Vocal & Instrument Stem
                        Separation endpoint.
                      examples:
                        - 5c79****be8e
                    audio_id:
                      type: string
                      description: >-
                        The id of a stem from the separation callback
                        (vocal_removal_info.origin_data[].id). If omitted, MIDI
                        is generated from all stems.
                      examples:
                        - 8ca376e7-******-08aaf2c6dd27
                  required:
                    - task_id
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
              model: ai-music-api/generate-midi-from-audio
              callBackUrl: https://example.callback
              input:
                task_id: 5c79****be8e
                audio_id: 8ca376e7-******-08aaf2c6dd27
      responses:
        '200':
          description: MIDI generation task created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
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
                    description: Response message
                    examples:
                      - success
                  data:
                    type: object
                    description: Response data containing task information
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Unique identifier for the MIDI generation task. Use
                          this to query task status or receive callBackUrl
                          results.
                        examples:
                          - 5c79****be8e
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
                  taskId: 5c79****be8e
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
      x-apidog-folder: docs/en/Market/Music Models/Suno/Vocal Removal
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206416-run
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
