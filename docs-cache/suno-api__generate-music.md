# Generate Music

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
      summary: Generate Music
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/generate-music)

        :::

        Generate music with or without lyrics using AI models.


        ### Usage Guide

        - This endpoint creates music based on your text prompt

        - Multiple variations will be generated for each request

        - You can control detail level with custom mode and instrumental
        settings


        ### Parameter Details


        * Always required: `custom_mode`, `instrumental`, `model`

        * In Custom Mode (`custom_mode: true`):
          * `title` is required, maximum 80 characters
          * `prompt` is optional; when provided, it is used strictly as lyrics and sung in the generated track. If `lyrics` is also provided, `lyrics` takes priority
          * At least one of `style`, `lyrics`, or `negative_tags` must be provided; generation is rejected if all are empty
          * If `instrumental: true`: generate instrumental music (no vocals)
          * If `instrumental: false`: use `lyrics` as lyrics (fall back to `prompt` if `lyrics` is not provided)
          * Optional: `duration`, `negative_tags`, `vocal_gender`, `style_weight`, `weirdness_constraint`, `audio_weight`, `variety`, `persona_id`, `persona_model`
          * Character limits by model:
            * ~~**V4**: `prompt` 3000 characters, `style` 200 characters~~
            * ~~**V4\_5, V4\_5PLUS, V4\_5ALL, V5, V5_5**: `prompt` 5000 characters, `style` 1000 characters~~
            * **V6, V6_MINI, V6_WILD**: `style` 1000 characters; `lyrics` 5000 characters
          * `title` length limit: 80 characters (all models)
        * In Non-custom Mode (`custom_mode: false`):
          * `prompt` is optional; it serves as the core idea, and lyrics are generated automatically (not a strict match), maximum 3000 characters
          * `lyrics` can be used as a lyrics attachment together with `prompt`
          * At least one of `image_urls`, `video_urls`, `audio_urls`, `style`, or `lyrics` must be provided; generation is rejected if all are empty
          * `image_urls`, `video_urls`, and `audio_urls` are only valid in this mode
          * Do not pass parameters that are only effective in custom mode: `duration`, `vocal_gender`, `style_weight`, `weirdness_constraint`, `audio_weight`, `variety`
          * Total attachments must not exceed 10: `style` + `lyrics` + `image_urls` + `video_urls` + `audio_urls`

        ### Optional Parameters


        * `prompt` (string): Description of the desired audio content. Optional.
        Used as lyrics in custom mode; used as the core idea in non-custom mode
        (maximum 3000 characters).

        * `lyrics` (string): Lyrics content. Optional. V6 maximum 5000
        characters. In custom mode, takes priority over `prompt` as lyrics; in
        non-custom mode, can be used as a lyrics attachment together with
        `prompt`.

        * `image_urls` (array): Image references. Only effective when
        `custom_mode` is `false`. Up to 5 images, each no more than 10 MB.
        Supported formats: jpeg, png, webp, bmp.

        * `video_urls` (array): Video references. Only effective when
        `custom_mode` is `false`. Up to 1 file, each no more than 100 MB,
        duration no more than 241 seconds. Supported formats: mp4, mov, webm.

        * `audio_urls` (array): Audio references. Only effective when
        `custom_mode` is `false`. Duration must be between 6 seconds and 30
        minutes; each file no more than 500 MB.

        * `style` (string): Music style specification. See character limits in
        Parameter Details above.

        * `negative_tags` (string): Music styles or traits to exclude from the
        generated audio. Optional.

        * `vocal_gender` (string): Vocal gender preference. `m` for male, `f`
        for female. Only effective when `custom_mode` is `true`. In practice,
        this only increases probability and cannot guarantee the instruction is
        followed.

        * `style_weight` (number): Strength of adherence to the specified style.
        Range 0–1, up to 2 decimal places. Only effective when `custom_mode` is
        `true`.

        * `weirdness_constraint` (number): Creative/experimental deviation.
        Range 0–1, up to 2 decimal places. Only effective when `custom_mode` is
        `true`.

        * `audio_weight` (number): Relative weight of audio features. Range 0–1,
        up to 2 decimal places. Only effective when `custom_mode` is `true`. Not
        supported when there are no vocals.

        * `variety` (number): Diversity of generated results. Integer from 0–4,
        default 1. Only effective when `custom_mode` is `true`. `0` off (exact
        style), `1` normal (default, balanced), `2` high (distinct styles), `3`
        extra (bold exploration), `4` max (maximum variation).

        * `persona_id` (string): Persona ID or Voice ID. Optional. To generate a
        Persona ID, see [Generate Persona](/suno-api/generate-persona).

        * `persona_model` (string): Persona model, `style_persona` or
        `voice_persona`. Only available for V5 (Discontinued), V5.5
        (Discontinued), V6, V6_MINI, and V6_WILD.

        * `duration` (number): Target length in seconds (10–360). Optional; if
        omitted, the model chooses the length. Only valid when `custom_mode` is
        `true` and the model is ~~V5_5~~, V6, V6_MINI, or V6_WILD. Do not pass
        it otherwise.


        ### Developer Notes

        - Recommendation for new users: Start with `custom_mode: false` for
        simpler usage

        - Generated files are retained for 14 days

        - Callback process has three stages: `text` (text generation), `first`
        (first track complete), `complete` (all tracks complete)
      operationId: generate-music
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
                    - ai-music-api/generate
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
                    prompt:
                      type: string
                      description: >-
                        A description of the desired audio content. Optional.

                        - Custom mode (`custom_mode=true`): When provided, the
                        prompt is used strictly as lyrics and sung in the
                        generated track. Character limits by model:
                          - V4: Maximum 3000 characters
                          - V4_5, V4_5PLUS, V4_5ALL, V5_5, V5: Maximum 5000 characters
                        - Non-custom mode (`custom_mode=false`): When provided,
                        the prompt serves as the core idea. Lyrics are generated
                        automatically based on it and do not strictly match the
                        input. Maximum 3000 characters.

                        `prompt` is not required. In non-custom mode, provide at
                        least one of `image_urls`, `video_urls`, `audio_urls`,
                        `style`, or `lyrics`. In custom mode, provide at least
                        one of `style`, `lyrics`, or `negative_tags`. Generation
                        is rejected if all related inputs are empty.
                      examples:
                        - A calm and relaxing piano track with soft melodies
                    style:
                      type: string
                      description: >-
                        Music style specification for the generated audio.

                        - Character limits by model:
                          - **V4** (Discontinued): Maximum 200 characters
                          - **V4_5 and V4_5PLUS** (Discontinued): Maximum 1000 characters
                          - **V4_5ALL** (Discontinued): Maximum 1000 characters
                          - **V5_5 and V5** (Discontinued): Maximum 1000 characters
                          - **V6, V6_MINI, and V6_WILD**: Maximum 1000 characters
                        - Common examples: Jazz, Classical, Electronic, Pop,
                        Rock, Hip-hop, etc.
                      examples:
                        - Classical
                    title:
                      type: string
                      description: |-
                        Title for the generated music track.
                        - Required in Custom Mode (`custom_mode: true`).
                        - Max length: 80 characters.
                        - Will be displayed in player interfaces and filenames.
                      examples:
                        - Peaceful Piano Meditation
                    custom_mode:
                      type: boolean
                      description: >-
                        Determines whether advanced parameter customization is
                        enabled.

                        - If `true`: Allows detailed control

                        - If `false`: Simplified mode
                      examples:
                        - true
                    instrumental:
                      type: boolean
                      description: >-
                        Whether to generate instrumental music (no vocals). See
                        Parameter Details for the fields required in each mode.
                      examples:
                        - true
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
                        - V6_MINI
                        - V6_WILD
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
                      examples:
                        - V6
                    negative_tags:
                      type: string
                      description: >-
                        Music styles or traits to exclude from the generated
                        audio. Optional. Use to avoid specific styles.
                      examples:
                        - Heavy Metal, Upbeat Drums
                    vocal_gender:
                      type: string
                      description: >-
                        Vocal gender preference. Optional. Use `m` for male and
                        `f` for female. This parameter is only effective when
                        `custom_mode` is true. In practice, it only increases
                        probability and cannot guarantee male/female voice
                        instructions are followed.
                      enum:
                        - m
                        - f
                      examples:
                        - m
                    style_weight:
                      type: number
                      description: >-
                        Only available when Custom Mode (`custom_mode: true`) is
                        enabled. Strength of adherence to the specified style.
                        Optional. Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
                    weirdness_constraint:
                      type: number
                      description: >-
                        Only available when Custom Mode (`custom_mode: true`) is
                        enabled. Controls experimental/creative deviation.
                        Optional. Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.65
                    audio_weight:
                      type: number
                      description: >-
                        Only available when Custom Mode (`custom_mode: true`) is
                        enabled. Relative weight of audio features. Optional.
                        Range 0–1, up to 2 decimal places.

                        - `audio_weight` is not supported when there are no
                        vocals
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
                        Persona model. Only available for V5 (Discontinued),
                        V5.5 (Discontinued), V6, V6_MINI, and V6_WILD.
                    duration:
                      type: number
                      examples:
                        - 20
                      minimum: 10
                      maximum: 360
                      description: >-
                        Target length in seconds (10–360). Optional; if omitted,
                        the model chooses the length. Only valid when
                        `custom_mode` is true and the model is V5_5
                        (Discontinued), V6, V6_MINI, or V6_WILD.
                    image_urls:
                      type: array
                      description: >-
                        Image references. Only effective when
                        `custom_mode=false`.

                        - Optional

                        - Up to 5 images; each image must not exceed 10 MB

                        - Supported formats: `jpeg`, `png`, `webp`, and `bmp`
                      items:
                        type: string
                      maxItems: 5
                    variety:
                      type: number
                      default: 1
                      examples:
                        - 1
                      minimum: 0
                      maximum: 4
                      multipleOf: 1
                      description: >-
                        Only available when Custom Mode (`custom_mode: true`) is
                        enabled. Controls the diversity and stylistic variation
                        of generated results. Optional. Range 0–4, integer,
                        default 1.


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
                    lyrics:
                      type: string
                      description: >-
                        Lyrics for the generated audio. Optional.

                        - V6: Maximum 5000 characters.

                        - When `custom_mode=true`, `lyrics` is used as lyrics
                        first; if `lyrics` is not provided, `prompt` is used as
                        lyrics.

                        - When `custom_mode=false`, `lyrics` is used as a lyrics
                        attachment and can be used together with the audio
                        description in `prompt`.
                    audio_urls:
                      type: array
                      items:
                        type: string
                      description: >-
                        Audio references. Only effective when
                        `custom_mode=false`.

                        - Optional

                        - Audio duration must be between 6 seconds and 30
                        minutes; each audio file must not exceed 500 MB
                    video_urls:
                      type: array
                      items:
                        type: string
                      description: >-
                        Video references. Only effective when
                        `custom_mode=false`.

                        - Optional

                        - Up to 1 video file; each file must not exceed 100 MB,
                        duration must not exceed 241 seconds, with no minimum
                        duration

                        - Supported formats: mp4, mov, and webm
                      maxItems: 1
                  required:
                    - custom_mode
                    - instrumental
                    - model
                  x-apidog-orders:
                    - prompt
                    - lyrics
                    - image_urls
                    - video_urls
                    - audio_urls
                    - style
                    - title
                    - custom_mode
                    - instrumental
                    - model
                    - negative_tags
                    - vocal_gender
                    - style_weight
                    - weirdness_constraint
                    - audio_weight
                    - variety
                    - persona_id
                    - persona_model
                    - duration
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/generate
              input:
                custom_mode: false
                instrumental: false
                model: V6
                prompt: An upbeat acoustic song about a summer road trip
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
                        "createTime": 1791200596437,
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
                        "createTime": 1791200596437,
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206407-run
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
