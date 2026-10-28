# Generate sounds

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
      summary: Generate sounds
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/generate-sounds)

        :::

        Used for creating a sound generation task (Sounds Task). It supports
        settings for looping, tempo (BPM), pitch (Key), as well as lyrics
        subtitle capture, etc. 


        ## 🚀 User Guide 

        - By using this interface, you can generate corresponding audio content
        based on the input `prompt`.

        - It supports setting up loop playback effect, which is suitable for
        background music, ambient sounds, and other scenarios.

        - It allows specifying BPM (beats per minute) and pitch (Key) to
        facilitate control over the style of the generated result.

        - Optional feature to enable lyric subtitle capture for easier display
        or processing of lyric content later.

        - Supports asynchronous reception of task completion notifications
        through callBackUrl address. 


        ## 📌 Usage Scenarios

        - 🎧 Background music creation

        - 🎮 Game sound effects or looped ambient sounds generation

        - 🌐 Integration of audio content platforms and creative tools


        When polling GET /api/v1/jobs/recordInfo, the clips are in
        data.response.data[] (audio_url, stream_audio_url, image_url, id,
        duration).
      operationId: generate-sounds
      tags:
        - docs/en/Market/Music Models/Suno/Sounds Generation
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  description: The model name to use for generation. Required field.
                  examples:
                    - ai-music-api/sounds
                callBackUrl:
                  type: string
                  title: Callback address
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
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      description: Description of the sound (max 500 characters).
                      type: string
                      title: prompt
                    model:
                      type: string
                      title: ''
                      description: >-
                        Required. Use V6, V6_MINI or V6_WILD.

                        - **`V6_WILD`**: Pushes creative boundaries for bolder,
                        more distinctive musical expression.

                        - **`V6_MINI`**: Lightweight and fast, balancing quality
                        and speed for effortless creation.

                        - **`V6`**: Greater musical expression with more natural
                        vocals and richer details.
                      enum:
                        - V5
                        - V5_5
                        - V6
                        - V6_WILD
                        - V6_MINI
                      x-apidog-enum:
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
                    sound_loop:
                      type: boolean
                      title: ''
                      description: Whether the generated sound loops seamlessly.
                      default: false
                    sound_tempo:
                      type: integer
                      title: BPM:Beats per minute
                      description: Tempo in BPM (1–300). Omit for automatic tempo.
                      default: null
                      minimum: 1
                      maximum: 300
                    sound_key:
                      type: string
                      title: ''
                      default: Any
                      enum:
                        - Any
                        - Cm
                        - C#m
                        - Dm
                        - D#m
                        - Em
                        - Fm
                        - F#m
                        - Gm
                        - G#m
                        - Am
                        - A#m
                        - Bm
                        - C
                        - C#
                        - D
                        - D#
                        - E
                        - F
                        - F#
                        - G
                        - G#
                        - A
                        - A#
                        - B
                      x-apidog-enum:
                        - value: Any
                          name: ''
                          description: ''
                        - value: Cm
                          name: ''
                          description: ''
                        - value: C#m
                          name: ''
                          description: ''
                        - value: Dm
                          name: ''
                          description: ''
                        - value: D#m
                          name: ''
                          description: ''
                        - value: Em
                          name: ''
                          description: ''
                        - value: Fm
                          name: ''
                          description: ''
                        - value: F#m
                          name: ''
                          description: ''
                        - value: Gm
                          name: ''
                          description: ''
                        - value: G#m
                          name: ''
                          description: ''
                        - value: Am
                          name: ''
                          description: ''
                        - value: A#m
                          name: ''
                          description: ''
                        - value: Bm
                          name: ''
                          description: ''
                        - value: C
                          name: ''
                          description: ''
                        - value: C#
                          name: ''
                          description: ''
                        - value: D
                          name: ''
                          description: ''
                        - value: D#
                          name: ''
                          description: ''
                        - value: E
                          name: ''
                          description: ''
                        - value: F
                          name: ''
                          description: ''
                        - value: F#
                          name: ''
                          description: ''
                        - value: G
                          name: ''
                          description: ''
                        - value: G#
                          name: ''
                          description: ''
                        - value: A
                          name: ''
                          description: ''
                        - value: A#
                          name: ''
                          description: ''
                        - value: B
                          name: ''
                          description: ''
                      examples:
                        - Any
                      description: Musical key. Default "Any" (automatic).
                    grab_lyrics:
                      type: boolean
                      title: Grab the lyrics subtitles
                      description: >-
                        Whether to capture the lyrics subtitles 


                        Will the interface be called after completion to obtain
                        the lyrics subtitles?
                      default: false
                  required:
                    - prompt
                    - model
                  x-apidog-orders:
                    - prompt
                    - model
                    - sound_loop
                    - sound_tempo
                    - sound_key
                    - grab_lyrics
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
            example:
              model: ai-music-api/sounds
              callBackUrl: https://api.example.com/callback
              input:
                prompt: sint
                model: V6
                sound_loop: true
                sound_tempo: 166
                sound_key: D#m
                grab_lyrics: true
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                type: object
                required:
                  - data
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
                    enum:
                      - 200
                      - 401
                      - 402
                      - 404
                      - 422
                      - 429
                      - 433
                      - 455
                      - 500
                      - 501
                      - 505
                  msg:
                    type: string
                    description: Response message, error description upon failure
                    examples:
                      - success
                  data:
                    type: object
                    required:
                      - taskId
                    properties:
                      taskId:
                        type: string
                        description: >-
                          The task ID can be used with the "Get Task Details"
                          endpoint to query the task status.
                        examples:
                          - dc1928bfcbc77cb6c85f3359a9c718b3
                    x-apidog-orders:
                      - taskId
                x-apidog-orders:
                  - code
                  - msg
                  - data
              example:
                code: 200
                msg: success
                data:
                  taskId: task38695****935u9043u
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
      x-apidog-folder: docs/en/Market/Music Models/Suno/Sounds Generation
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206422-run
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
