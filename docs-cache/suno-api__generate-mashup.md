# Generate Mashup Music

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
      summary: Generate Mashup Music
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/generate-mashup)

        :::

        > Create remix music using AI models by combining multiple audio tracks.


        ### Usage Guide


        - This interface creates remix music from uploaded audio files.

        - It combines elements from multiple tracks into a coherent new piece.

        - `upload_url_list` must contain 2 audio URLs. Only the first 2 are
        used.


        ### Parameter Details


        - Always required: `upload_url_list`, `model`, `style`, `title`

        - `lyrics` is optional and takes priority over `prompt` as lyrics. If
        `lyrics` is omitted, `prompt` is used as lyrics when provided

        - Character limits by model:
            - ~~**V4**: `prompt`  3000 characters, `style` 200 characters, `title` 80 characters~~
            - ~~**V4_5 & V4_5PLUS**: `prompt`  5000 characters, `style` 1000 characters, `title` 100 characters~~
            - ~~**V4_5ALL**: `prompt`  5000 characters, `style` 1000 characters, `title` 80 characters~~
            - ~~**V5_5 & V5**: `prompt`  5000 characters, `style` 1000 characters, `title` 100 characters~~
            - **V6, V6_WILD, and V6_MINI**: `lyrics` / `prompt` 5000 characters, `style` 1000 characters, `title` 100 characters

        ### Developer Notes


        - Generated files will be retained for 14 days.

        - The callBackUrl process has three stages: `text` (text generation),
        `first` (first track complete), `complete` (all complete).

        - Uploaded audio files must have publicly accessible URLs.

        - `upload_url_list` must contain 2 audio file URLs. Only the first 2 are
        used.


        ### Optional Parameters


        | Parameter | Type | Description |

        |:---|:---|:---|

        | `lyrics` | string | Lyrics for the mashup. Optional. V6 maximum 5000
        characters. Takes priority over `prompt` as lyrics. |

        | `prompt` | string | Used as lyrics only when `lyrics` is not provided.
        Optional. V6 maximum 5000 characters. |

        | `vocal_gender` | string | Vocal gender preference. `m` for male, `f`
        for female. In practice, this parameter only increases the probability
        but does not guarantee adherence to the specified vocal gender. |

        | `style_weight` | number | Strength of adherence to style. Range is
        0–1, with two decimal places. Example: `0.61`. |

        | `weirdness_constraint` | number | Creativity/discreteness level. Range
        is 0–1, with two decimal places. Example: `0.72`. |

        | `audio_weight` | number | Weight of audio elements. Range is 0–1, with
        two decimal places. Example: `0.65`. |

        | `variety` | integer | Diversity of generated results. Integer from
        0–4, default 1. `0` off, `1` normal, `2` high, `3` extra, `4` max. |

        | `persona_id` | string | Persona ID or Voice ID to apply to the
        generated music. |

        | `persona_model` | string | Persona model. `style_persona` or
        `voice_persona`. Default: `style_persona`. |

        | `duration` | number | Audio duration in seconds. Range 10–360, default
        20. Valid when `model` is ~~V5_5~~, V6, V6_MINI, or V6_WILD. |
      operationId: generate-mashup
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
                    - ai-music-api/mashup
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
                    upload_url_list:
                      type: array
                      description: >-
                        Array of audio file URLs to mashup. Provide 2 audio
                        URLs. Only the first 2 are used. Each URL must be
                        publicly accessible.
                      items:
                        type: string
                        format: uri
                      minItems: 2
                      examples:
                        - - https://example.com/audio1.mp3
                          - https://example.com/audio2.mp3
                    prompt:
                      type: string
                      description: >-
                        A description of the desired audio content. Optional.

                        - Used as lyrics only when `lyrics` is not provided. If
                        `lyrics` is present, `prompt` is not used as lyrics.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.
                      examples:
                        - A calm and relaxing piano track with soft melodies
                      maxLength: 5000
                    style:
                      type: string
                      description: >-
                        Music style specification for the generated audio.
                        Required.

                        - Character limits by model:
                          - **V4** (Discontinued): Maximum 200 characters
                          - **V4_5 & V4_5PLUS** (Discontinued): Maximum 1000 characters
                          - **V4_5ALL** (Discontinued): Maximum 1000 characters
                          - **V5 & V5_5** (Discontinued): Maximum 1000 characters
                          - **V6, V6_MINI & V6_WILD**: Maximum 1000 characters
                        - Common examples: Jazz, Classical, Electronic, Pop,
                        Rock, Hip-hop, etc.
                      examples:
                        - Jazz
                      maxLength: 1000
                    title:
                      type: string
                      description: |-
                        Title for the generated music track. Required.
                        - Character limits by model:
                          - **V4** (Discontinued): Maximum 80 characters
                          - **V4_5 & V4_5PLUS** (Discontinued): Maximum 100 characters
                          - **V4_5ALL** (Discontinued): Maximum 80 characters
                          - **V5 & V5_5** (Discontinued): Maximum 100 characters
                          - **V6, V6_MINI & V6_WILD**: Maximum 100 characters
                        - Will be displayed in player interfaces and filenames.
                      examples:
                        - Relaxing Piano
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
                        - value: V6_WILD
                          name: ''
                          description: ''
                        - value: V6_MINI
                          name: ''
                          description: ''
                    vocal_gender:
                      type: string
                      description: >-
                        Vocal gender preference for the singing voice. Optional.
                        Use 'm' for male and 'f' for female. Based on practice,
                        this parameter can only increase the probability but
                        cannot guarantee adherence to male/female voice
                        instructions.
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
                        - 0.61
                    weirdness_constraint:
                      type: number
                      description: >-
                        Controls experimental/creative deviation. Optional.
                        Range 0–1, up to 2 decimal places.
                      minimum: 0
                      maximum: 1
                      multipleOf: 0.01
                      examples:
                        - 0.72
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
                    duration:
                      type: integer
                      default: 20
                      examples:
                        - 20
                      minimum: 10
                      maximum: 360
                      description: >-
                        Audio duration in seconds. Optional. Range 10–360,
                        default 20. Valid when `model` is ~~V5_5~~
                        (Discontinued), V6, V6_MINI, or V6_WILD.
                    lyrics:
                      type: string
                      maxLength: 5000
                      description: >-
                        Lyrics for the mashup. Optional.

                        - Takes priority over `prompt` as lyrics. If omitted,
                        `prompt` is used as lyrics when provided.

                        - V6, V6_MINI, and V6_WILD: Maximum 5000 characters.
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
                  required:
                    - upload_url_list
                    - model
                    - style
                    - title
                  x-apidog-orders:
                    - upload_url_list
                    - prompt
                    - lyrics
                    - style
                    - title
                    - model
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
              model: ai-music-api/mashup
              callBackUrl: https://example.com/callback
              input:
                upload_url_list:
                  - https://example.com/audio1.mp3
                  - https://example.com/audio2.mp3
                model: V6
                prompt: A calm and relaxing piano track with soft melodies
                style: Jazz
                title: Relaxing Piano
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
                duration: 20
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
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206432-run
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
