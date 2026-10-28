# Upload And Cover Audio

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
      summary: Upload And Cover Audio
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/upload-and-cover-audio)

        :::

        > This API creates a cover version of an audio track by transforming it
        into a new style while retaining its core melody. It incorporates Suno's
        upload capability, enabling users to upload an audio file for
        processing. The expected result is a refreshed audio track with a new
        style, keeping the original melody intact.


        ### Parameter Usage Guide


        :::note Character Limits

        Character limits vary depending on the model version:


        *   **V6, V6_WILD, and V6_MINI**: `style` (max 1000 chars), `title` (max
        80 chars), `lyrics` / `prompt` (max 5000 chars)

        *   ~~**Model V5_5 and V5**: `style` (max 1000 chars), `title` (max 100
        chars), `prompt` (max 5000 chars)~~

        *   ~~**Models V4.5PLUS and V4.5**: `style` (max 1000 chars), `title`
        (max 100 chars), `prompt` (max 5000 chars)~~

        *   ~~**Model V4.5ALL**: `style` (max 1000 chars), `title` (max 80
        chars), `prompt` (max 5000 chars)~~

        *   ~~**Model V4**: `style` (max 200 chars), `title` (max 80 chars),
        `prompt` (max 3000 chars)~~

        :::


        *   Do not pass `image_urls`. Cover does not support simple-mode
        reference images.

        *   Always required: `instrumental`, `model`, plus a source: either
        `upload_url`, or `task_id` + `audio_id` of a track you generated on KIE

        *   With a source (`upload_url`, or `task_id` + `audio_id`), generation
        can proceed; `lyrics` (formerly used via `prompt`), `title`, and `style`
        are optional

        *   `lyrics` takes priority over `prompt` as lyrics. If `lyrics` is
        omitted, `prompt` is used as lyrics when provided

        *   If `instrumental` is `true`: generate instrumental music (no
        vocals). Do not pass `lyrics`, `prompt`, or `vocal_gender`

        *   `upload_url` specifies the source audio file; ensure the uploaded
        audio does not exceed 8 minutes in length

        *   `task_id` + `audio_id` cover a track you already generated:
        `task_id` is the generation task, `audio_id` is the id of the specific
        track in its result (each track in the callback data or recordInfo
        carries an `id`). Mutually exclusive with `upload_url`


        ### Developer Notes


        1.  Generated files will be deleted after **14 days**.

        2.  Pay attention to character limits for `lyrics` / `prompt`, `style`,
        and `title` to ensure successful processing.

        3.  **Callback Process Stages:** The callBackUrl process has three
        stages: `text` (text generation complete), `first` (first track
        complete), and `complete` (all tracks complete).

        4.  **Active Status Check:** Instead of waiting for callbacks, you can
        poll GET /api/v1/jobs/recordInfo?taskId=... (see [Get Task
        Details](/market/common/get-task-detail)).

        5.  The `upload_url` parameter is used to specify the source audio file;
        please provide a valid URL. To cover a track generated on KIE, pass
        `task_id` and `audio_id` instead.


        ### Optional Parameters


        | Parameter | Type | Description |

        |:---|:---|:---|

        | `lyrics` | string | Lyrics for the covered audio. Optional. V6 maximum
        5000 characters. Takes priority over `prompt` as lyrics. |

        | `prompt` | string | Used as lyrics only when `lyrics` is not provided.
        Optional. V6 maximum 5000 characters. |

        | `style` | string | Music style specification. Optional. V6 maximum
        1000 characters. |

        | `title` | string | Track title. Optional. Maximum 80 characters. |

        | `negative_tags` | string | Music styles or traits to exclude from the
        generated audio. |

        | `vocal_gender` | string | Vocal gender preference. Use `m` for male,
        `f` for female. |

        | `style_weight` | number | Strength of adherence to style. Range 0–1,
        up to 2 decimal places. Example: `0.65`. |

        | `weirdness_constraint` | number | Controls creative deviation. Range
        0–1, up to 2 decimal places. Example: `0.65`. |

        | `audio_weight` | number | Balance weight for audio features. Range
        0–1, up to 2 decimal places. Example: `0.65`. |

        | `variety` | integer | Diversity of generated results. Integer from
        0–4, default 1. `0` off, `1` normal, `2` high, `3` extra, `4` max. |

        | `persona_id` | string | Persona ID or Voice ID to apply to the
        generated music. To create one, use **Generate Persona**. |

        | `duration` | integer | Target length in seconds (10–360). Optional; if
        omitted, the model chooses the length. Valid when `model` is ~~V5_5~~,
        V6, V6_MINI, or V6_WILD. |
      operationId: upload-and-cover-audio
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
                    - ai-music-api/upload-and-cover-audio
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
                    upload_url:
                      type: string
                      format: uri
                      description: >-
                        The URL of the source audio file to cover. Required
                        unless `task_id` and `audio_id` are provided. Source
                        audio (`upload_url`) is enough to generate. Ensure the
                        uploaded audio does not exceed 8 minutes in length.
                      examples:
                        - https://storage.example.com/upload
                    prompt:
                      type: string
                      description: >-
                        Lyrics for the covered audio. Optional.

                        - Used as lyrics only when `lyrics` is not provided. If
                        `lyrics` is present, `prompt` is not used as lyrics.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.

                        - Not required. Source audio (`upload_url`) is enough to
                        generate.

                        - Do not pass this parameter when `instrumental` is
                        `true`.
                      examples:
                        - A calm and relaxing piano track with soft melodies
                      maxLength: 5000
                    style:
                      type: string
                      description: >-
                        The music style or genre for the audio. Optional.

                        - Not required. Source audio (`upload_url`) is enough to
                        generate.

                        - Character limits by model:
                          - **V4** (Discontinued): Maximum 200 characters
                          - **V4_5 & V4_5PLUS** (Discontinued): Maximum 1000 characters
                          - **V4_5ALL** (Discontinued): Maximum 1000 characters
                          - **V5_5 & V5** (Discontinued): Maximum 1000 characters
                          - **V6, V6_MINI, and V6_WILD**: Maximum 1000 characters
                      examples:
                        - Classical
                      maxLength: 1000
                    title:
                      type: string
                      description: |-
                        The title of the generated music track. Optional.
                        - Maximum 80 characters.
                        - Displayed in player interfaces and filenames.
                      examples:
                        - Peaceful Piano Meditation
                      maxLength: 80
                    instrumental:
                      type: boolean
                      description: >-
                        Determines if the audio should be instrumental (no
                        lyrics).

                        - If `true`: generate instrumental music (no vocals). Do
                        not pass `lyrics`, `prompt`, or `vocal_gender`.

                        - If `false`: use `lyrics` as lyrics (fall back to
                        `prompt` if `lyrics` is not provided).
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
                        Music styles or traits to exclude from the generated
                        audio.  

                        - Optional. Use to avoid specific styles.  
                          Example: "Heavy Metal, Upbeat Drums"
                      examples:
                        - Heavy Metal, Upbeat Drums
                    vocal_gender:
                      type: string
                      description: >-
                        Vocal gender preference for the singing voice. Optional.
                        Use 'm' for male and 'f' for female. Based on practice,
                        this parameter can only increase the probability but
                        cannot guarantee adherence to male/female voice
                        instructions. Do not pass this parameter when
                        `instrumental` is `true`.
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
                        - voice_persona
                        - style_persona
                      x-apidog-enum:
                        - value: voice_persona
                          name: ''
                          description: ''
                        - value: style_persona
                          name: ''
                          description: ''
                      description: >-
                        Persona model: style_persona or voice_persona. Available
                        for V6, V6_MINI and V6_WILD.
                    duration:
                      type: integer
                      examples:
                        - 20
                      minimum: 10
                      maximum: 360
                      description: >-
                        Target length in seconds (10–360). Optional; if omitted,
                        the model chooses the length. Valid when `model` is
                        ~~V5_5~~ (Discontinued), V6, V6_MINI, or V6_WILD.
                    lyrics:
                      type: string
                      maxLength: 5000
                      description: >-
                        Lyrics for the covered audio. Optional.

                        - Takes priority over `prompt` as lyrics. If omitted,
                        `prompt` is used as lyrics when provided.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.

                        - Not required. Source audio (`upload_url`) is enough to
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
                    task_id:
                      type: string
                      description: >-
                        Task ID of a music generation task on KIE whose track
                        you want to cover. Use together with `audio_id`;
                        mutually exclusive with `upload_url`.
                    audio_id:
                      type: string
                      description: >-
                        ID of the specific track to cover, from the generation
                        result (the `id` of each track in the callback data or
                        recordInfo). Use together with `task_id`; mutually
                        exclusive with `upload_url`.
                  required:
                    - instrumental
                    - model
                  x-apidog-orders:
                    - upload_url
                    - task_id
                    - audio_id
                    - prompt
                    - lyrics
                    - style
                    - title
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
              model: ai-music-api/upload-and-cover-audio
              callBackUrl: https://api.example.com/callback
              input:
                upload_url: https://storage.example.com/upload
                prompt: A calm and relaxing piano track with soft melodies
                instrumental: true
                model: V4
                style: Classical
                title: Peaceful Piano Meditation
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
                            description: Task ID for tracking task status
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
                        "source_audio_url": "https://example.cn/****.mp3",
                        "stream_audio_url": "https://example.cn/****",
                        "source_stream_audio_url": "https://example.cn/****",
                        "image_url": "https://example.cn/****.jpeg",
                        "source_image_url": "https://example.cn/****.jpeg",
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
                        "source_audio_url": "https://example.cn/****.mp3",
                        "stream_audio_url": "https://example.cn/****",
                        "source_stream_audio_url": "https://example.cn/****",
                        "image_url": "https://example.cn/****.jpeg",
                        "source_image_url": "https://example.cn/****.jpeg",
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
                                  source_audio_url:
                                    type: string
                                    description: Original audio file URL
                                  stream_audio_url:
                                    type: string
                                    description: Streaming audio URL
                                  source_stream_audio_url:
                                    type: string
                                    description: Original streaming audio URL
                                  image_url:
                                    type: string
                                    description: Cover image URL
                                  source_image_url:
                                    type: string
                                    description: Original cover image URL
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206419-run
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
