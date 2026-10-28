# Add Instrumental to Music

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
      summary: Add Instrumental to Music
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/add-instrumental)

        :::

        Generate instrumental accompaniment based on uploaded audio files. This
        interface allows you to upload audio files and add instrumental tracks
        to them.


        ### Usage Guide

        - Use this interface to add instrumental tracks to existing audio

        - Supports generation of various music style accompaniments

        - Allows customization of style, exclusion of specific elements, etc.

        - With source audio (`upload_url`), generation can proceed; `title`,
        `negative_tags`, and `tags` are required, and all other fields are
        optional


        ### Parameter Details

        - Always required: `upload_url`, `title`, `negative_tags`, `tags`

        - `upload_url` specifies the source audio file URL to be processed

        - `title` specifies the title for the generated music

        - `tags` and `negative_tags` are used to control music style

        - `lyrics` is optional. V6 maximum 5000 characters

        - Optional fine-tuning: `model`, `vocal_gender`, `style_weight`,
        `weirdness_constraint`, `audio_weight`, `variety`


        ### Developer Notes

        - Generated files will be retained for 14 days

        - Callbacks may be sent at the text, first and complete stages; only
        complete is guaranteed. Treat complete as the final result.
      operationId: add-instrumental
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
                    - ai-music-api/add-instrumental
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

                    - Alternatively, poll GET /api/v1/jobs/recordInfo?taskId=...
                    (see [Get Task Details](/market/common/get-task-detail)).
                    For Suno audio tasks the tracks are in data.response.data[]
                    (audio_url, stream_audio_url, image_url, id, duration).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  examples:
                    - https://example.com/callback
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    upload_url:
                      type: string
                      format: uri
                      description: >-
                        URL of the uploaded audio file. Required. Source audio
                        (`upload_url`) is enough to generate once `title`,
                        `negative_tags`, and `tags` are provided.
                      examples:
                        - https://example.com/music.mp3
                    model:
                      type: string
                      description: |-
                        The AI model version to use for generation. 
                        - Available options: 
                          - **`V6_WILD`**: Pushes creative boundaries for bolder, more distinctive musical expression.
                          - **`V6_MINI`**: Lightweight and fast, balancing quality and speed for effortless creation.
                          - **`V6`**: Greater musical expression with more natural vocals and richer details.
                          - **`V5_5`** (Discontinued): Custom Models Tailored to Your Unique Taste.
                          - **`V5`** (Discontinued): Superior musical expression, faster generation.
                          - **`V4_5PLUS`** (Discontinued): V4.5+ is richer sound, new ways to create.
                      enum:
                        - V4_5PLUS
                        - V5
                        - V5_5
                        - V6
                        - V6_MINI
                        - V6_WILD
                      default: V6
                      examples:
                        - V6
                      x-apidog-enum:
                        - value: V4_5PLUS
                          name: ''
                          description: ''
                        - value: V5
                          name: ''
                          description: ''
                        - value: V5_5
                          name: ''
                          description: ''
                        - value: V6
                          name: ''
                          description: ''
                        - value: V6_MINI
                          name: ''
                          description: ''
                        - value: V6_WILD
                          name: ''
                          description: ''
                    title:
                      type: string
                      description: >-
                        Title of the generated music. Required. Will be
                        displayed in the player interface and file name.
                      examples:
                        - Relaxing Piano
                    negative_tags:
                      type: string
                      description: >-
                        Music styles or characteristics to exclude from the
                        generated audio. Required. Used to avoid specific
                        unwanted music elements.
                      examples:
                        - heavy metal, fast drums
                      maxLength: 200
                    tags:
                      type: string
                      description: >-
                        Music styles or tags to include in the generated music.
                        Required. Defines the desired music style and
                        characteristics.
                      examples:
                        - relaxing, piano, soothing
                      maxLength: 1000
                    vocal_gender:
                      type: string
                      description: >-
                        Vocal gender preference. Optional. 'm' for male, 'f' for
                        female. Based on practice, this parameter can only
                        increase the probability but cannot guarantee adherence
                        to male/female voice instructions.
                      enum:
                        - m
                        - f
                      examples:
                        - m
                    style_weight:
                      type: number
                      description: >-
                        Adherence strength to specified style. Optional. Range
                        0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.61
                    weirdness_constraint:
                      type: number
                      description: >-
                        Controls experimental/creative deviation level.
                        Optional. Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.72
                    audio_weight:
                      type: number
                      description: >-
                        Relative weight of audio elements. Optional. Range 0–1,
                        up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
                    lyrics:
                      type: string
                      maxLength: 5000
                      description: >-
                        Lyrics for the generated audio. Optional.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.

                        - Not required. Source audio (`upload_url`) is enough to
                        generate once `title`, `negative_tags`, and `tags` are
                        provided.
                      examples:
                        - >-
                          [Verse]\nKeep the melody flowing\nInto a gentle
                          bridge\n[Chorus]\nLet the piano rise and fall
                    variety:
                      type: integer
                      default: 1
                      examples:
                        - 1
                      minimum: 0
                      maximum: 4
                      description: >-
                        Controls the diversity and stylistic variation of
                        generated results. Optional. Integer range 0–4, default
                        1.


                        - **`0`**: off (exact style) — fully off, strictly the
                        same style

                        - **`1`**: normal (balanced variety) — default, balances
                        stability and diversity

                        - **`2`**: high (distinct styles) — produces results
                        with clearly different styles

                        - **`3`**: extra (bold exploration) — higher variation,
                        encourages bold exploration of different styles

                        - **`4`**: max (unreasonably varied) — maximum
                        diversity; results may differ in style very
                        significantly
                  required:
                    - upload_url
                    - title
                    - negative_tags
                    - tags
                  x-apidog-orders:
                    - upload_url
                    - model
                    - title
                    - negative_tags
                    - tags
                    - lyrics
                    - vocal_gender
                    - style_weight
                    - weirdness_constraint
                    - audio_weight
                    - variety
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/add-instrumental
              callBackUrl: https://example.com/callback
              input:
                upload_url: https://example.com/music.mp3
                title: Relaxing Piano
                negative_tags: heavy metal, fast drums
                tags: relaxing, piano, soothing
                model: V6
                vocal_gender: m
                style_weight: 0.61
                weirdness_constraint: 0.72
                audio_weight: 0.65
                lyrics: |-
                  [Verse]
                  Keep the melody flowing
                  Into a gentle bridge
                  [Chorus]
                  Let the piano rise and fall
                variety: 1
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
                          - 402
                          - 404
                          - 409
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
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          taskId:
                            type: string
                            description: >-
                              Task ID for tracking task status. Poll GET
                              /api/v1/jobs/recordInfo?taskId=... (see [Get Task
                              Details](/market/common/get-task-detail)). For
                              Suno audio tasks the tracks are in
                              data.response.data[] (audio_url, stream_audio_url,
                              image_url, id, duration).
                            examples:
                              - 5c79****be8e
                        x-apidog-orders:
                          - taskId
                    x-apidog-orders:
                      - data
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
        audioGenerated:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                When instrumental generation is completed, the system will call
                this callback to notify the results.


                ### Callback Example

                ```json

                {
                  "code": 200,
                  "msg": "All generated successfully.",
                  "data": {
                    "callbackType": "complete",
                    "task_id": "2fac****9f72",
                    "data": [
                      {
                        "id": "e231****-****-****-****-****8cadc7dc",
                        "audio_url": "https://example.cn/****.mp3",
                        "stream_audio_url": "https://example.cn/****",
                        "image_url": "https://example.cn/****.jpeg",
                        "prompt": "[Verse] Night city lights shining bright",
                        "model_name": "chirp-v4-5",
                        "title": "Iron Man",
                        "tags": "electrifying, rock",
                        "createTime": "2025-01-01 00:00:00",
                        "duration": 198.44
                      }
                    ]
                  }
                }

                ```
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        code:
                          type: integer
                          description: Status code
                          example: 200
                        msg:
                          type: string
                          description: Return message
                          example: All generated successfully
                        data:
                          type: object
                          properties:
                            callbackType:
                              type: string
                              description: >-
                                Callback type: text (text generation completed),
                                first (first track completed), complete (all
                                completed)
                              enum:
                                - text
                                - first
                                - complete
                            task_id:
                              type: string
                              description: Task ID
                            data:
                              type: array
                              items:
                                type: object
                                properties:
                                  id:
                                    type: string
                                    description: Audio unique identifier (audioId)
                                  audio_url:
                                    type: string
                                    description: Audio file URL
                                  stream_audio_url:
                                    type: string
                                    description: Streaming audio URL
                                  image_url:
                                    type: string
                                    description: Cover image URL
                                  prompt:
                                    type: string
                                    description: Generation prompt/lyrics
                                  model_name:
                                    type: string
                                    description: Model name used
                                  title:
                                    type: string
                                    description: Music title
                                  tags:
                                    type: string
                                    description: Music tags
                                  createTime:
                                    type: string
                                    description: Creation time
                                    format: date-time
                                  duration:
                                    type: number
                                    description: Audio duration (seconds)
              responses:
                '200':
                  description: Callback received successfully
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
                                  - 408
                                  - 413
                                  - 500
                                  - 501
                                  - 531
                                description: >-
                                  Status code. 200 means success; any other
                                  value means failure (for example, 501).
                              msg:
                                type: string
                                description: Error message when code != 200
                                example: success
                      example:
                        code: 200
                        msg: success
      x-apidog-folder: docs/en/Market/Music Models/Suno/Music Generation
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206421-run
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
