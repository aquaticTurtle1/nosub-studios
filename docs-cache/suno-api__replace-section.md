# Replace Music Section

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
      summary: Replace Music Section
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/replace-section)

        :::

        > Replace a specific time segment within existing music.


        This interface can replace specific time segments in already generated
        music. It requires providing the original music's task ID and the time
        range to be replaced. The replaced audio will naturally blend with the
        original music. This endpoint is always custom mode.


        ### Parameter Details


        * Always required: `prompt`, `tags`, `title`, `infill_start_s`,
        `infill_end_s`, `full_lyrics`

        * `lyrics` is optional lyrics for the replaced segment. V6 maximum 5000
        characters

        * Optional: `negative_tags`, `vocal_gender`, `style_weight`,
        `weirdness_constraint`, `audio_weight`, `variety`, `persona_id`,
        `persona_model`


        ### Time Range Instructions


        *   `infill_start_s` must be less than `infill_end_s`.

        *   Time values are precise to 2 decimal places, e.g., `10.50` seconds.

        *   The replacement time must be at least **10 seconds**.

        *   Replacement duration should not exceed **50%** of the original
        music's total duration.


        ### Developer Notes


        *   Replacement segments will be regenerated based on the provided
        `prompt` and `tags`.

        *   Generated replacement segments will automatically blend with the
        original music's preceding and following parts.

        *   Generated files will be retained for **14 days**.
      operationId: replace-section
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
                  description: >-
                    The model name used to generate the task. This field is
                    required. This endpoint must use the
                    `ai-music-api/replace-section` model.
                  enum:
                    - ai-music-api/replace-section
                  examples:
                    - ai-music-api/replace-section
                  x-apidog-enum:
                    - value: ai-music-api/replace-section
                      name: ''
                      description: ''
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    The URL to receive updates when the generation task is
                    completed. Optional, but recommended for production
                    environments.


                    - When generation is complete, the system will POST the task
                    status and results to this URL

                    - The callback includes the generated URL and task
                    information

                    - Your callback endpoint should accept POST requests with a
                    JSON payload containing the results

                    - Alternatively, poll GET /api/v1/jobs/recordInfo?taskId=...
                    (see [Get Task Details](/market/common/get-task-detail)).
                    For Suno audio tasks the tracks are in data.response.data[]
                    (audio_url, stream_audio_url, image_url, id, duration).

                    - To ensure callback security, refer to the [Webhook
                    Verification Guide](/common-api/webhook-verification) for
                    signature verification implementation
                  examples:
                    - https://api.example.com/callback
                input:
                  type: object
                  description: Input parameters for the music section replacement task.
                  required:
                    - prompt
                    - tags
                    - title
                    - infill_start_s
                    - infill_end_s
                    - full_lyrics
                  oneOf:
                    - title: Replace section using existing audio
                      required:
                        - task_id
                        - audio_id
                      not:
                        anyOf:
                          - required:
                              - upload_url
                          - required:
                              - model
                      properties:
                        task_id:
                          type: string
                          description: >-
                            The original task ID (parent task), used to identify
                            the source music for section replacement.
                          examples:
                            - 2fac****9f72
                        audio_id:
                          type: string
                          description: >-
                            The unique identifier of the audio track to be
                            replaced. This ID is returned in the callback data
                            after music generation is completed.
                          examples:
                            - e231****-****-****-****-****8cadc7dc
                      x-apidog-orders:
                        - task_id
                        - audio_id
                      type: object
                    - title: Replace section using uploaded custom audio
                      required:
                        - upload_url
                        - model
                      not:
                        anyOf:
                          - required:
                              - task_id
                          - required:
                              - audio_id
                      properties:
                        upload_url:
                          type: string
                          format: uri
                          description: The URL of the custom audio uploaded by the user.
                          examples:
                            - https://example.com/audio.mp3
                        model:
                          type: string
                          default: V6
                          description: |-
                            The AI model version used for generation. 
                            - Available options:
                              - **`V6_WILD`**: Breaks through stylistic boundaries, delivering bolder and more unique musical expression.
                              - **`V6_MINI`**: Lightweight and fast, balancing audio quality and efficiency for easier inspirational creation.
                              - **`V6`**: Stronger musical expressiveness, more natural vocals, and richer details
                              - **`V5_5`** (deprecated): A dedicated model tailored to your unique taste.   
                              - **`V5`** (deprecated): Superior musical expressiveness with faster generation.  
                              - **`V4_5PLUS`** (deprecated): V4.5+ offers richer timbres, new creative methods, and supports durations of up to 8 minutes.  
                              - **`V4_5`** (deprecated): V4.5 provides smarter prompts, faster generation, and supports durations of up to 8 minutes.  
                              - **`V4_5ALL`** (deprecated): V4.5ALL provides smarter prompts, faster generation, and supports durations of up to 8 minutes.  
                              - **`V4`** (deprecated): V4 offers improved vocal quality and supports durations of up to 4 minutes.
                          enum:
                            - V4
                            - V4_5
                            - V4_5PLUS
                            - V4_5ALL
                            - V5
                            - V5_5
                            - V6
                            - V6_MINI
                            - V6_WILD
                          examples:
                            - V6
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
                            - value: V6_MINI
                              name: ''
                              description: ''
                            - value: V6_WILD
                              name: ''
                              description: ''
                      x-apidog-orders:
                        - upload_url
                        - model
                      type: object
                  properties:
                    prompt:
                      type: string
                      description: The lyrics after replacement. Required.
                      examples:
                        - A calm and relaxing piano track.
                    tags:
                      type: string
                      description: >-
                        Style tags for the music, such as jazz or electronic.
                        Required.
                      examples:
                        - Jazz
                    title:
                      type: string
                      description: The title of the music. Required.
                      examples:
                        - Relaxing Piano
                    negative_tags:
                      type: string
                      description: >-
                        Music styles to exclude, used to prevent specific
                        stylistic elements from appearing in the replacement
                        section.
                      examples:
                        - Rock
                    infill_start_s:
                      type: number
                      description: >-
                        The point in time, in seconds, at which replacement
                        starts, rounded to 2 decimal places. Required. Must be
                        less than infill_end_s, and the difference between
                        infill_end_s and infill_start_s must be at least 10
                        seconds.
                      minimum: 0
                      examples:
                        - 10.5
                    infill_end_s:
                      type: number
                      description: >-
                        The point in time, in seconds, at which replacement
                        ends, rounded to 2 decimal places. Required. Must be
                        greater than infill_start_s, and the difference between
                        infill_end_s and infill_start_s must be at least 10
                        seconds.
                      minimum: 0
                      examples:
                        - 20.75
                    full_lyrics:
                      type: string
                      description: >-
                        The complete modified lyrics, combining the modified and
                        unmodified lyrics. Required. This parameter contains the
                        complete lyrics text that will be used for the entire
                        song after section replacement.
                      examples:
                        - >-
                          [Verse 1]\nOriginal lyrics content\n[Chorus]\nModified
                          lyrics for this section\n[Verse 2]\nMore original
                          lyrics
                    lyrics:
                      type: string
                      maxLength: 5000
                      description: |-
                        Lyrics for the replaced segment. Optional.
                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.
                      examples:
                        - '[Chorus]\nModified lyrics for this section'
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
                      x-apidog-enum:
                        - value: m
                          name: ''
                          description: ''
                        - value: f
                          name: ''
                          description: ''
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
                        - 0.65
                    weirdness_constraint:
                      type: number
                      description: >-
                        Controls experimental/creative deviation level.
                        Optional. Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
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
                      default: style_persona
                      description: >-
                        Persona model. Optional. Use `style_persona` for
                        Generate Persona IDs, or `voice_persona` for Suno Voice
                        IDs. Default: `style_persona`. Available for V5
                        (Discontinued), V5_5 (Discontinued), V6, V6_MINI, and
                        V6_WILD.
                  x-apidog-orders:
                    - prompt
                    - lyrics
                    - tags
                    - title
                    - negative_tags
                    - infill_start_s
                    - infill_end_s
                    - full_lyrics
                    - vocal_gender
                    - style_weight
                    - weirdness_constraint
                    - audio_weight
                    - variety
                    - persona_id
                    - persona_model
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/replace-section
              callBackUrl: https://example.com/callback
              input:
                task_id: 2fac****9f72
                audio_id: e231****-****-****-****-****8cadc7dc
                prompt: A calm and relaxing piano track.
                tags: Jazz
                title: Relaxing Piano
                negative_tags: Rock
                infill_start_s: 10.5
                infill_end_s: 20.75
                full_lyrics: |-
                  [Verse 1]
                  Original lyrics here
                  [Chorus]
                  Modified lyrics for this section
                  [Verse 2]
                  More original lyrics
                lyrics: |-
                  [Chorus]
                  Modified lyrics for this section
                variety: 1
                vocal_gender: m
                style_weight: 0.65
                weirdness_constraint: 0.65
                audio_weight: 0.65
                persona_id: persona_123
                persona_model: style_persona
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
                When audio generation is complete, the system will call this
                callback to notify the result.


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
                        "prompt": "A calm and relaxing piano track.",
                        "model_name": "chirp-v3-5",
                        "title": "Relaxing Piano",
                        "tags": "Jazz",
                        "createTime": 1791200596437,
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
                                Callback type: text (text generation complete),
                                first (first song complete), complete (all
                                complete)
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
                                    type: integer
                                    description: >-
                                      Creation time (Unix timestamp in
                                      milliseconds)
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206430-run
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
