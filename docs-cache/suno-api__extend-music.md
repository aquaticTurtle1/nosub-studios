# Extend Music

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
      summary: Extend Music
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/extend-music)

        :::

        Extend or modify existing music by creating a continuation based on a
        source audio track.


        ### Usage Guide

        - This endpoint allows you to extend existing music tracks

        - With source audio (`audio_id`), generation can proceed; `lyrics`
        (formerly used via `prompt`), `title`, and `style` are optional

        - Extended music will maintain style consistency with the source track


        ### Parameter Details

        - Always required: `audio_id`, `model`

        - `lyrics` is optional and takes priority over `prompt` as lyrics. If
        `lyrics` is omitted, `prompt` is used as lyrics when provided

        - `style` and `title` are optional

        - `continue_at` specifies the position in the original track where the
        extension should begin

        - Character limits by model:
          - ~~**V4**: `prompt`  3000 characters, `style` 200 characters, `title` 80 characters~~
          - ~~**V4_5 & V4_5PLUS**: `prompt`  5000 characters, `style` 1000 characters, `title` 100 characters~~
          - ~~**V4_5ALL**: `prompt`  5000 characters, `style` 1000 characters, `title` 80 characters~~
          - ~~**V5_5 & V5**: `prompt`  5000 characters, `style` 1000 characters, `title` 100 characters~~
          - **V6, V6_WILD, and V6_MINI**: `lyrics` / `prompt` 5000 characters, `style` 1000 characters, `title` 100 characters

        ### Developer Notes

        - Generated files are retained for 14 days

        - Model version must match the source audio's model version

        - Callback process follows the same pattern as the music generation
        endpoint
      operationId: extend-music
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
                    - ai-music-api/extend
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
                    - https://api.example.com/callback
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    audio_id:
                      type: string
                      description: >-
                        Unique identifier of the audio track to extend. Required
                        for all extension requests.
                      examples:
                        - e231****-****-****-****-****8cadc7dc
                    prompt:
                      type: string
                      description: >-
                        Lyrics for the extended audio. Optional.

                        - Used as lyrics only when `lyrics` is not provided. If
                        `lyrics` is present, `prompt` is not used as lyrics.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.

                        - Not required. Source audio (`audio_id`) is enough to
                        generate.

                        - Do not pass this parameter when `instrumental` is
                        `true`.
                      examples:
                        - >-
                          Extend the music with more relaxing notes and a gentle
                          bridge section
                      maxLength: 5000
                    style:
                      type: string
                      description: >-
                        Music style specification for the extended audio.
                        Optional.

                        - Not required. Source audio (`audio_id`) is enough to
                        generate.

                        - Character limits by model:
                          - **V4** (Discontinued): Maximum 200 characters
                          - **V4_5 & V4_5PLUS** (Discontinued): Maximum 1000 characters
                          - **V4_5ALL** (Discontinued): Maximum 1000 characters
                          - **V5_5 & V5** (Discontinued): Maximum 1000 characters
                          - **V6, V6_MINI, and V6_WILD**: Maximum 1000 characters
                        - Should typically align with the original audio's style
                        for best results.
                      examples:
                        - Classical
                      maxLength: 1000
                    title:
                      type: string
                      description: |-
                        Title for the extended music track. Optional.
                        - Maximum 100 characters.
                        - Displayed in player interfaces and filenames.
                      examples:
                        - Peaceful Piano Extended
                      maxLength: 100
                    continue_at:
                      type: number
                      description: >-
                        The time point (in seconds) from which to start
                        extending the music.

                        - Value range: greater than 0 and less than the total
                        duration of the generated audio.

                        - Specifies the position in the original track where the
                        extension should begin.
                      examples:
                        - 60
                    model:
                      type: string
                      description: >-
                        Required. Use V6, V6_MINI or V6_WILD.

                        - **`V6_WILD`**: Pushes creative boundaries for bolder,
                        more distinctive musical expression.

                        - **`V6_MINI`**: Lightweight and fast, balancing quality
                        and speed for effortless creation.

                        - **`V6`**: Greater musical expression with more natural
                        vocals and richer details.
                      enum:
                        - V4
                        - V4_5
                        - V4_5PLUS
                        - V4_5ALL
                        - V5
                        - V5_5
                        - V6
                        - V6_WILD
                        - V6_MINI
                      x-apidog-enum:
                        - value: V4
                          name: ''
                          description: ''
                        - value: V4_5
                          name: ''
                          description: ''
                        - value: V4_5PLUS
                          name: ''
                          description: ''
                        - value: V4_5ALL
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
                        - value: V6_WILD
                          name: ''
                          description: ''
                        - value: V6_MINI
                          name: ''
                          description: ''
                      examples:
                        - V6
                    negative_tags:
                      type: string
                      description: >-
                        Music styles or traits to exclude from the extended
                        audio. Optional. Use to avoid specific undesired
                        characteristics.
                      examples:
                        - Heavy Metal, Upbeat Drums
                    vocal_gender:
                      type: string
                      description: >-
                        Vocal gender preference. Optional. 'm' denotes a male
                        voice, and 'f' denotes a female voice. In practice, this
                        parameter only influences the probability and does not
                        guarantee strict adherence to the gender instruction.
                        This parameter is not required if `instrumental` is set
                        to `true`.
                      enum:
                        - m
                        - f
                      examples:
                        - m
                    style_weight:
                      type: number
                      description: >-
                        Strength of adherence to the specified style. Optional.
                        Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
                    weirdness_constraint:
                      type: number
                      description: >-
                        Controls experimental/creative deviation. Optional.
                        Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
                    audio_weight:
                      type: number
                      description: >-
                        Balance weight for audio features vs. other factors.
                        Optional. Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
                    persona_id:
                      type: string
                      description: >-
                        Persona ID or Voice ID to apply to the generated music.
                        Optional. Use this to apply a specific persona style to
                        your music generation.


                        To generate a Persona ID, use the [Generate
                        Persona](https://docs.kie.ai/suno-api/generate-persona)
                        endpoint to create a personalized music Persona based on
                        generated music.


                        To generate a Voice ID, use the [Generate
                        Voice](https://docs.kie.ai/suno-api/suno-voice-generate)
                        endpoint.
                      examples:
                        - persona_123
                    persona_model:
                      type: string
                      enum:
                        - style_persona
                        - voice_persona
                      x-apidog-enum:
                        - value: style_persona
                          name: ''
                          description: ''
                        - value: voice_persona
                          name: ''
                          description: ''
                      description: >-
                        The persona model is only applicable to the V5
                        (deactivated), V5.5 (deactivated), V6, V6_MINI, and
                        V6_WILD models.
                    instrumental:
                      type: boolean
                      default: false
                      description: >-
                        Indicates whether it is an instrumental track. If true,
                        passing the `lyrics`, `prompt`, and `vocal_gender`
                        parameters is prohibited.
                    lyrics:
                      type: string
                      maxLength: 5000
                      description: >-
                        Lyrics for the extended audio. Optional.

                        - Takes priority over `prompt` as lyrics. If omitted,
                        `prompt` is used as lyrics when provided.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.

                        - Not required. Source audio (`audio_id`) is enough to
                        generate.

                        - Do not pass this parameter when `instrumental` is
                        `true`.
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
                    - audio_id
                    - model
                  x-apidog-orders:
                    - audio_id
                    - prompt
                    - lyrics
                    - style
                    - title
                    - continue_at
                    - model
                    - negative_tags
                    - vocal_gender
                    - style_weight
                    - weirdness_constraint
                    - audio_weight
                    - variety
                    - persona_id
                    - persona_model
                    - instrumental
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/extend
              callBackUrl: https://api.example.com/callback
              input:
                audio_id: e231****-****-****-****-****8cadc7dc
                prompt: >-
                  Extend the music with more relaxing notes and a gentle bridge
                  section
                model: V4
                style: Classical
                title: Peaceful Piano Extended
                continue_at: 60
                negative_tags: Heavy Metal, Upbeat Drums
                vocal_gender: m
                style_weight: 0.65
                weirdness_constraint: 0.65
                audio_weight: 0.65
                persona_id: persona_123
                persona_model: style_persona
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
        audioExtend:
          '{$request.body#/callBackUrl}':
            post:
              description: >-
                System will call this callback when audio generation is
                complete.


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
                        "model_name": "chirp-v3-5",
                        "title": "Iron Man",
                        "tags": "electrifying, rock",
                        "createTime": "2025-01-01 00:00:00",
                        "duration": 198.44
                      },
                      {
                        "id": "bd15****1873",
                        "audio_url": "https://example.cn/****.mp3",
                        "stream_audio_url": "https://example.cn/****",
                        "image_url": "https://example.cn/****.jpeg",
                        "prompt": "[Verse] Night city lights shining bright",
                        "model_name": "chirp-v3-5",
                        "title": "Iron Man",
                        "tags": "electrifying, rock",
                        "createTime": "2025-01-01 00:00:00",
                        "duration": 228.28
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
                          description: Response message
                          example: All generated successfully
                        data:
                          type: object
                          properties:
                            callbackType:
                              type: string
                              description: >-
                                Callback type: text (text generation complete),
                                first (first track complete), complete (all
                                tracks complete)
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206415-run
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
