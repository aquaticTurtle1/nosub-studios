# Vocal & Instrument Stem Separation

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
      summary: Vocal & Instrument Stem Separation
      deprecated: false
      description: >-
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/separate-vocals)

        :::

        Use advanced audio processing technology to separate music into vocals,
        accompaniment, and individual instrumental stems.


        ### Usage Guide


        - Separate platform-generated mixes into vocals, accompaniment, and
        individual instrumental components.

        - Supports three processing modes:
          - separate_vocal — 2-stem separation (vocals + accompaniment)
          - split_stem — Up to 12-stem separation
          - split_stem_advanced — Advanced multi-stem separation, supporting precise extraction of a single target stem through `stem_name`
        - Suitable for karaoke production, mixing, sample extraction, and
        detailed post-production.

        - Works best with professional AI-generated mixes that have clearly
        separated vocals and instruments.

        - **Billing:** Each API call consumes credits; **repeated calls for the
        same audio stem will be charged again** (no server-side caching).

        - **Pricing:** Billed per request; the price depends on the separation
        mode (`type`). Failed tasks are not charged. For current prices, see
        [kie.ai/pricing](https://kie.ai/pricing).


        ### Separation Mode Description


        | **Mode (`type`)** | **Returned Stems** | **Typical Use Cases** |

        | :---------------------------- |
        :---------------------------------------------------------------------------------------------------------------------------------
        | :------------------------------------------ |

        | `separate_vocal` *(default)*   | **2 stems** — Vocals +
        accompaniment                                                                                                             
        | Quick vocal removal, karaoke, and basic mixing               |

        | `split_stem`                  | **Up to 12 stems** — Vocals, backing
        vocals, drums, bass, guitar, keyboard, strings, brass, woodwinds,
        percussion, synthesizer, FX/other;    | Advanced mixing, remixing, sound
        design, and individual instrument extraction         |

        | `split_stem_advanced`    | Returns 2 groups, each with "extract" (only
        the target stem) and "remove" (everything except the target stem). |
        Individual instrument extraction and detailed post-production      |


        ### Parameters


        | Name       | Type   |
        Description                                                                
        |

        | :--------- | :----- |
        :------------------------------------------------------------------- |

        | `task_id`   | string | The ID of the original music generation
        task                                                |

        | `audio_url`   | string | The URL of the user-uploaded audio file.
        Required when processing user-uploaded audio. Cannot be used together
        with `audio_id`.                                               |

        | `audio_id`  | string | Specifies the audio variant to process when
        multiple versions exist. Cannot be used together with
        `audio_url`.                                 |

        | `type`     | string | Separation mode: `separate_vocal`, `split_stem`,
        or `split_stem_advanced`; defaults to `separate_vocal`     |

        | `stem_name` | string | Used only with type split_stem_advanced, where
        it is required. |


        ### Query Results


        When polling GET /api/v1/jobs/recordInfo, results are in
        resultJson.resultUrls (file names end with the stem name, e.g.
        _Vocals.mp3). Stem ids (needed by Generate MIDI and Convert to WAV
        Format) are returned in the callback
        (vocal_removal_info.origin_data[].id) and in
        resultJson.resultObject.origin_data[].id when polling recordInfo.


        ### Developer Notes


        - All returned audio file URLs are valid for **14 days**.

        - Separation quality depends on the complexity and mixing
        characteristics of the original track.

        - `separate_vocal` returns **2 stems** — vocals + accompaniment.

        - `split_stem` returns **up to 12 independent stems** — vocals, backing
        vocals, drums, bass, guitar, keyboard, strings, brass, woodwinds,
        percussion, synthesizer, and FX/other.

        - `split_stem_advanced` supports specifying a single target stem through
        `stem_name` for precise extraction.

        - Each separated stem can be converted to WAV: call Convert to WAV
        Format with this task's task_id and the stem's id as audio_id.

        - **Billing:** Each request consumes credits. Repeatedly submitting the
        same stem will **deduct credits again** (no server-side caching).
      operationId: separate-vocals
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
                    - ai-music-api/separate-vocals
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
                  description: >-
                    Input parameters for the generation task. Provide either
                    task_id + audio_id, or audio_url alone.
                  oneOf:
                    - title: Separate using existing audio
                      required:
                        - task_id
                        - audio_id
                      properties:
                        task_id:
                          type: string
                          description: >-
                            Unique identifier of the music generation task. This
                            should be a task_id returned from the Generate Music
                            or Extend Music endpoint.
                          examples:
                            - 5c79****be8e
                        audio_id:
                          type: string
                          description: >-
                            Unique identifier of the specific audio track to
                            process for vocal separation. This ID is returned in
                            the callBackUrl data after music generation
                            completes.
                          examples:
                            - e231****-****-****-****-****8cadc7dc
                      not:
                        anyOf:
                          - required:
                              - audio_url
                      x-apidog-orders:
                        - task_id
                        - audio_id
                      x-apidog-ignore-properties: []
                      type: object
                    - title: Separate using user-uploaded audio
                      required:
                        - audio_url
                      properties:
                        audio_url:
                          type: string
                          format: uri
                          description: >-
                            Custom audio URL uploaded by the user. The maximum
                            file size is 20MB.
                          examples:
                            - https://example.com/audio.mp3
                        audio_id:
                          type: string
                          description: >-
                            Unique identifier of the specific audio track to
                            process for vocal separation. This ID is returned in
                            the callBackUrl data after music generation
                            completes. `audio_url` and `audio_id` are mutually
                            exclusive; exactly one of them must be provided.
                          examples:
                            - e231****-****-****-****-****8cadc7dc
                      not:
                        anyOf:
                          - required:
                              - task_id
                          - required:
                              - audio_id
                      x-apidog-orders:
                        - audio_url
                        - audio_id
                      x-apidog-ignore-properties: []
                      type: object
                  properties:
                    type:
                      type: string
                      enum:
                        - separate_vocal
                        - split_stem
                        - split_stem_advanced
                      default: separate_vocal
                      description: >-
                        Separation type, options:


                        - **separate_vocal**: Separate vocals and accompaniment,
                        generating a vocal track and an instrumental track.

                        - **split_stem**: Separate various instrument sounds,
                        generating multiple instrument tracks.

                        - **split_stem_advanced**: Advanced multi-track
                        separation, supporting the specification of a particular
                        instrument track to generate finer instrument tracks.
                      examples:
                        - separate_vocal
                    stem_name:
                      type: string
                      enum:
                        - Lead Vocal
                        - Drum Kit
                        - Kick
                        - Snare
                        - Risers
                        - Bass
                        - Backing Vocals
                        - Piano
                        - Electric Guitar
                        - Percussion
                        - String Section
                        - Synth
                        - Acoustic Guitar
                        - Sound Effects
                        - Synth Pad
                        - Synth Bass
                        - Guitar
                        - Brass Section
                        - Organ
                        - Electronic Drum Kit
                        - Lead Electric Guitar
                        - Synth Keys
                        - Rhythm Electric Guitar
                        - Electric Piano
                        - Upright Bass
                        - Keyboards
                        - Distorted Electric Guitar
                        - Synth Strings
                        - Synth Lead
                        - Woodwinds
                        - Rhythm Acoustic Guitar
                        - Flute
                        - Harp
                        - Tambourine
                        - Trumpet
                        - Arpeggiator
                        - Accordion
                        - Fiddle
                        - Pedal Steel Guitar
                        - Synth Voice
                        - Violin
                        - Digital Piano
                        - Synth Brass
                        - Mandolin
                        - Choir
                        - Banjo
                        - Bells
                        - Clarinet
                        - Tenor Saxophone
                        - Trombone
                        - Shaker
                        - French Horn
                        - Glockenspiel
                        - Electric Bass
                        - Cello
                        - Timpani
                        - Harmonica
                        - Marimba
                        - Vibraphone
                        - Lap Steel Guitar
                        - Saxophone
                        - Orchestra
                        - Horns
                        - Cymbals
                        - Hand Clap
                        - Oboe
                        - Celesta
                        - Congas
                        - Drone
                        - Alto Saxophone
                        - Double Bass
                        - Ukulele
                        - Harpsichord
                        - Baritone Saxophone
                        - Xylophone
                        - Tuba
                        - Bass Guitar
                        - Whistle
                        - Lead Guitar
                        - Rhodes
                        - '808'
                        - Bongos
                        - Bassoon
                        - Cowbell
                        - Viola
                        - Sitar
                        - Steel Drums
                        - Piccolo
                        - Theremin
                        - Bagpipes
                        - Hi-Hat
                        - Music Box
                        - Melodica
                        - Tabla
                        - Koto
                        - Djembe
                        - Taiko
                        - Didgeridoo
                      description: >-
                        Only used when `type` is `split_stem_advanced` to
                        request a specific stem track/instrument name.
                      examples:
                        - Piano
                  x-apidog-orders:
                    - type
                    - stem_name
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: ai-music-api/separate-vocals
              callBackUrl: https://api.example.com/callback
              input:
                task_id: 5c79****be8e
                audio_id: e231****-****-****-****-****8cadc7dc
                type: separate_vocal
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
        vocalRemovalGenerated:
          '{$request.body#/callBackUrl}':
            post:
              description: >-
                System will call this callback when vocal separation is
                complete. Callback data structure varies based on the type
                parameter specified in the request.


                ### separate_vocal Type Callback Example

                ```json

                {
                  "code": 200,
                  "msg": "vocal separation generated successfully.",
                  "data": {
                    "task_id": "3e63b4cc88d52611159371f6af5571e7",
                    "vocal_removal_info": {
                      "instrumental_url": "https://file.aiquickdraw.com/s/d92a13bf-c6f4-4ade-bb47-f69738435528_Instrumental.mp3",
                      "origin_url": "",
                      "vocal_url": "https://file.aiquickdraw.com/s/3d7021c9-fa8b-4eda-91d1-3b9297ddb172_Vocals.mp3"
                    }
                  }
                }

                ```


                ### split_stem Type Callback Example

                ```json

                {
                  "code": 200,
                  "msg": "vocal separation generated successfully.",
                  "data": {
                    "task_id": "e649edb7abfd759285bd41a47a634b10",
                    "vocal_removal_info": {
                      "origin_url": "",
                      "backing_vocals_url": "https://file.aiquickdraw.com/s/aadc51a3-4c88-4c8e-a4c8-e867c539673d_Backing_Vocals.mp3",
                      "bass_url": "https://file.aiquickdraw.com/s/a3c2da5a-b364-4422-adb5-2692b9c26d33_Bass.mp3",
                      "brass_url": "https://file.aiquickdraw.com/s/334b2d23-0c65-4a04-92c7-22f828afdd44_Brass.mp3",
                      "drums_url": "https://file.aiquickdraw.com/s/ac75c5ea-ac77-4ad2-b7d9-66e140b78e44_Drums.mp3",
                      "fx_url": "https://file.aiquickdraw.com/s/a8822c73-6629-4089-8f2a-d19f41f0007d_FX.mp3",
                      "guitar_url": "https://file.aiquickdraw.com/s/064dd08e-d5d2-4201-9058-c5c40fb695b4_Guitar.mp3",
                      "keyboard_url": "https://file.aiquickdraw.com/s/adc934e0-df7d-45da-8220-1dba160d74e0_Keyboard.mp3",
                      "percussion_url": "https://file.aiquickdraw.com/s/0f70884d-047c-41f1-a6d0-7044618b7dc6_Percussion.mp3",
                      "strings_url": "https://file.aiquickdraw.com/s/49829425-a5b0-424e-857a-75d4c63a426b_Strings.mp3",
                      "synth_url": "https://file.aiquickdraw.com/s/56b2d94a-eb92-4d21-bc43-3460de0c8348_Synth.mp3",
                      "vocal_url": "https://file.aiquickdraw.com/s/07420749-29a2-4054-9b62-e6a6f8b90ccb_Vocals.mp3",
                      "woodwinds_url": "https://file.aiquickdraw.com/s/d81545b1-6f94-4388-9785-1aaa6ecabb02_Woodwinds.mp3"
                    }
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
                                task_id:
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
                          example: vocal separation generated successfully.
                        data:
                          type: object
                          properties:
                            task_id:
                              type: string
                              description: Task ID
                            vocal_removal_info:
                              type: object
                              description: >-
                                Vocal separation result information, fields vary
                                based on the type parameter in the request
                              properties:
                                origin_url:
                                  type: string
                                  description: Original audio URL
                                vocal_url:
                                  type: string
                                  description: Vocal part audio URL
                                instrumental_url:
                                  type: string
                                  description: >-
                                    Instrumental part audio URL (separate_vocal
                                    type only)
                                backing_vocals_url:
                                  type: string
                                  description: >-
                                    Backing vocals audio URL (split_stem type
                                    only)
                                drums_url:
                                  type: string
                                  description: Drums part audio URL (split_stem type only)
                                bass_url:
                                  type: string
                                  description: Bass part audio URL (split_stem type only)
                                guitar_url:
                                  type: string
                                  description: Guitar part audio URL (split_stem type only)
                                keyboard_url:
                                  type: string
                                  description: >-
                                    Keyboard part audio URL (split_stem type
                                    only)
                                percussion_url:
                                  type: string
                                  description: >-
                                    Percussion part audio URL (split_stem type
                                    only)
                                strings_url:
                                  type: string
                                  description: >-
                                    Strings part audio URL (split_stem type
                                    only)
                                synth_url:
                                  type: string
                                  description: >-
                                    Synthesizer part audio URL (split_stem type
                                    only)
                                fx_url:
                                  type: string
                                  description: >-
                                    Effects part audio URL (split_stem type
                                    only)
                                brass_url:
                                  type: string
                                  description: Brass part audio URL (split_stem type only)
                                woodwinds_url:
                                  type: string
                                  description: >-
                                    Woodwinds part audio URL (split_stem type
                                    only)
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Music Models/Suno/Vocal Removal
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206408-run
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
