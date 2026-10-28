# Gemini 3.8 Flash Text to speech

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
      summary: Gemini 3.8 Flash Text to speech
      deprecated: false
      description: >-
        Text-to-speech with Gemini 3.8 Flash.


        Output: WAV (16-bit PCM, 24 kHz, mono).


        ## Query Task Status


        After submitting a task, use the unified query endpoint to check
        progress and retrieve results:


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          Learn how to query task status and retrieve generation results
        </Card>


        ::: tip[]

        For production use, we recommend using the `callBackUrl` parameter to
        receive automatic notifications when generation completes, rather than
        polling the status endpoint.

        :::


        ## Related Resources


        <CardGroup cols={3}>
          <Card title="Market Overview" icon="lucide-store" href="/market/quickstart">
            Explore all available models
          </Card>
          <Card title="File Upload API" icon="lucide-cog" href="/file-upload-api/quickstart">
            Learn how to upload and manage files
          </Card>
          <Card title="Common API" icon="lucide-webhook" href="/common-api/get-account-credits">
            Check credits and account usage
          </Card>
        </CardGroup>
      operationId: gemini-3-8-flash-tts
      tags:
        - docs/en/Market/Music Models/Gemini
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  description: Model to be used
                  enum:
                    - google/gemini-3-8-flash-tts
                  default: google/gemini-3-8-flash-tts
                  x-apidog-enum:
                    - value: google/gemini-3-8-flash-tts
                      name: ''
                      description: ''
                callBackUrl:
                  type: string
                  description: Callback URL for the result
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    temperature:
                      type: number
                      minimum: 0
                      maximum: 2
                      default: 1
                      description: Sampling temperature, e.g., 1
                    speakers:
                      type: array
                      description: >-
                        List of speaker configurations. Each speaker uses either
                        `voice_name` (preset voice) or `replica` (voice clone);
                        the two are mutually exclusive. If neither is sent, the
                        speaker defaults to `Fola`.
                      items:
                        type: object
                        properties:
                          speaker_id:
                            type: string
                            description: >-
                              Speaker identifier, e.g., "Speaker 1" or "Speaker
                              2". Must be in "Speaker N" format.
                          voice_name:
                            type: string
                            description: >-
                              Voice name. Mutually exclusive with `replica`:
                              send only one of `voice_name` or `replica` for the
                              same speaker. Omit this field when using voice
                              cloning. If neither this field nor `replica` is
                              sent, default is `Fola`.


                              70 voices grouped by use case:


                              - Tutor: Bodi, Lumi, Sadaltager, Sola, Sulafat,
                              Varo, Zephyr

                              - Commercial Voiceover: Koda, Kore, Nika, Tavi,
                              Zeno

                              - Instructional: Algenib, Despina, Erinome, Kira,
                              Ludo, Mako, Rasalgethi, Rina

                              - Podcast: Alnilam, Brio, Jori, Laomedeia, Rami,
                              Veda

                              - Storyteller: Achird, Enzo, Riko, Sami, Zali,
                              Zubenelgenubi

                              - Digital Assistant: Algieba, Aoede, Autonoe,
                              Callirrhoe, Enceladus, Gero, Iapetus, Neno, Olin,
                              Tari, Umbriel

                              - Call Center: Achernar, Charon, Daro, Fola, Hali,
                              Milo, Puck

                              - Concierge: Arlo, Cleo, Fenrir, Finn, Leda, Lora,
                              Orus

                              - Tech Support: Enya, Jett, Knox, Nyla, Sadachbia,
                              Vindemiatrix

                              - Professional: Cruz, Elio, Gacrux, Pulcherrima,
                              Schedar, Tova, Zuri
                            enum:
                              - Bodi
                              - Lumi
                              - Sadaltager
                              - Sola
                              - Sulafat
                              - Varo
                              - Zephyr
                              - Koda
                              - Kore
                              - Nika
                              - Tavi
                              - Zeno
                              - Algenib
                              - Despina
                              - Erinome
                              - Kira
                              - Ludo
                              - Mako
                              - Rasalgethi
                              - Rina
                              - Alnilam
                              - Brio
                              - Jori
                              - Laomedeia
                              - Rami
                              - Veda
                              - Achird
                              - Enzo
                              - Riko
                              - Sami
                              - Zali
                              - Zubenelgenubi
                              - Algieba
                              - Aoede
                              - Autonoe
                              - Callirrhoe
                              - Enceladus
                              - Gero
                              - Iapetus
                              - Neno
                              - Olin
                              - Tari
                              - Umbriel
                              - Achernar
                              - Charon
                              - Daro
                              - Fola
                              - Hali
                              - Milo
                              - Puck
                              - Arlo
                              - Cleo
                              - Fenrir
                              - Finn
                              - Leda
                              - Lora
                              - Orus
                              - Enya
                              - Jett
                              - Knox
                              - Nyla
                              - Sadachbia
                              - Vindemiatrix
                              - Cruz
                              - Elio
                              - Gacrux
                              - Pulcherrima
                              - Schedar
                              - Tova
                              - Zuri
                            default: Fola
                            x-apidog-enum:
                              - value: Bodi
                                name: Tutor
                                description: Tutor
                              - value: Lumi
                                name: Tutor
                                description: Tutor
                              - value: Sadaltager
                                name: Tutor
                                description: Tutor
                              - value: Sola
                                name: Tutor
                                description: Tutor
                              - value: Sulafat
                                name: Tutor
                                description: Tutor
                              - value: Varo
                                name: Tutor
                                description: Tutor
                              - value: Zephyr
                                name: Tutor
                                description: Tutor
                              - value: Koda
                                name: Commercial Voiceover
                                description: Commercial Voiceover
                              - value: Kore
                                name: Commercial Voiceover
                                description: Commercial Voiceover
                              - value: Nika
                                name: Commercial Voiceover
                                description: Commercial Voiceover
                              - value: Tavi
                                name: Commercial Voiceover
                                description: Commercial Voiceover
                              - value: Zeno
                                name: Commercial Voiceover
                                description: Commercial Voiceover
                              - value: Algenib
                                name: Instructional
                                description: Instructional
                              - value: Despina
                                name: Instructional
                                description: Instructional
                              - value: Erinome
                                name: Instructional
                                description: Instructional
                              - value: Kira
                                name: Instructional
                                description: Instructional
                              - value: Ludo
                                name: Instructional
                                description: Instructional
                              - value: Mako
                                name: Instructional
                                description: Instructional
                              - value: Rasalgethi
                                name: Instructional
                                description: Instructional
                              - value: Rina
                                name: Instructional
                                description: Instructional
                              - value: Alnilam
                                name: Podcast
                                description: Podcast
                              - value: Brio
                                name: Podcast
                                description: Podcast
                              - value: Jori
                                name: Podcast
                                description: Podcast
                              - value: Laomedeia
                                name: Podcast
                                description: Podcast
                              - value: Rami
                                name: Podcast
                                description: Podcast
                              - value: Veda
                                name: Podcast
                                description: Podcast
                              - value: Achird
                                name: Storyteller
                                description: Storyteller
                              - value: Enzo
                                name: Storyteller
                                description: Storyteller
                              - value: Riko
                                name: Storyteller
                                description: Storyteller
                              - value: Sami
                                name: Storyteller
                                description: Storyteller
                              - value: Zali
                                name: Storyteller
                                description: Storyteller
                              - value: Zubenelgenubi
                                name: Storyteller
                                description: Storyteller
                              - value: Algieba
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Aoede
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Autonoe
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Callirrhoe
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Enceladus
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Gero
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Iapetus
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Neno
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Olin
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Tari
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Umbriel
                                name: Digital Assistant
                                description: Digital Assistant
                              - value: Achernar
                                name: Call Center
                                description: Call Center
                              - value: Charon
                                name: Call Center
                                description: Call Center
                              - value: Daro
                                name: Call Center
                                description: Call Center
                              - value: Fola
                                name: Call Center
                                description: Call Center
                              - value: Hali
                                name: Call Center
                                description: Call Center
                              - value: Milo
                                name: Call Center
                                description: Call Center
                              - value: Puck
                                name: Call Center
                                description: Call Center
                              - value: Arlo
                                name: Concierge
                                description: Concierge
                              - value: Cleo
                                name: Concierge
                                description: Concierge
                              - value: Fenrir
                                name: Concierge
                                description: Concierge
                              - value: Finn
                                name: Concierge
                                description: Concierge
                              - value: Leda
                                name: Concierge
                                description: Concierge
                              - value: Lora
                                name: Concierge
                                description: Concierge
                              - value: Orus
                                name: Concierge
                                description: Concierge
                              - value: Enya
                                name: Tech Support
                                description: Tech Support
                              - value: Jett
                                name: Tech Support
                                description: Tech Support
                              - value: Knox
                                name: Tech Support
                                description: Tech Support
                              - value: Nyla
                                name: Tech Support
                                description: Tech Support
                              - value: Sadachbia
                                name: Tech Support
                                description: Tech Support
                              - value: Vindemiatrix
                                name: Tech Support
                                description: Tech Support
                              - value: Cruz
                                name: Professional
                                description: Professional
                              - value: Elio
                                name: Professional
                                description: Professional
                              - value: Gacrux
                                name: Professional
                                description: Professional
                              - value: Pulcherrima
                                name: Professional
                                description: Professional
                              - value: Schedar
                                name: Professional
                                description: Professional
                              - value: Tova
                                name: Professional
                                description: Professional
                              - value: Zuri
                                name: Professional
                                description: Professional
                          replica:
                            type: object
                            title: TTSVoiceReplica
                            description: >-
                              Voice clone settings. Gemini 3.8 only. Optional.
                              Mutually exclusive with `voice_name` — do not send
                              both on the same speaker.


                              When set, this task temporarily clones the speaker
                              from two recordings. The clone is not saved as a
                              reusable voice. You can pass `replica` for a
                              speaker in both single-speaker and two-speaker
                              requests.


                              Both recordings must be of the same adult,
                              captured with the same microphone in the same
                              room. AI-generated audio is rejected.


                              WAV only. Recommended: 24kHz, mono, 16-bit PCM.
                              Max 10MB per file. Format is detected from file
                              content, not the extension or Content-Type.
                            properties:
                              source_audio_url:
                                type: string
                                format: uri
                                description: >-
                                  URL of the reference recording. The file must
                                  be directly downloadable. Record 10–30 seconds
                                  of natural speech in a quiet space: no echo,
                                  no background music, and only one voice.
                                  Record in the language you will generate.
                              consent_audio_url:
                                type: string
                                format: uri
                                description: >-
                                  URL of the consent recording. The file must be
                                  directly downloadable. The same person as in
                                  the reference recording must read this
                                  sentence verbatim:


                                  I am the owner of this voice and I consent to
                                  Google using this voice to create a synthetic
                                  voice model.


                                  Other supported language versions of this
                                  sentence are also accepted. Trim silence and
                                  noise at the start and end.
                            required:
                              - source_audio_url
                              - consent_audio_url
                            x-apidog-orders:
                              - source_audio_url
                              - consent_audio_url
                            x-apidog-ignore-properties: []
                        x-apidog-orders:
                          - speaker_id
                          - voice_name
                          - replica
                        required:
                          - speaker_id
                        not:
                          required:
                            - voice_name
                            - replica
                        x-apidog-ignore-properties: []
                    filler_words:
                      type: boolean
                      default: false
                      description: >-
                        Whether to insert filler words in two-speaker dialogue.
                        Off by default (omit this field); when enabled, the
                        request includes `"filler_words": true`. Only takes
                        effect when `speakers` has two speakers (e.g. Speaker 1
                        and Speaker 2). When two people are speaking, you can
                        turn on this switch.
                    dialogue_turns:
                      type: array
                      description: List of dialogue turns, output in sequential order
                      items:
                        type: object
                        properties:
                          speaker_id:
                            type: string
                            description: >-
                              Corresponding speaker identifier, e.g., "Speaker
                              1"
                          text:
                            type: string
                            description: >-
                              The speaker's line. May include tone tags wrapped
                              in English angle brackets. Example: Hello there.
                              `<laugh>` That works.


                              Official insertable tags: `<argh>`, `<breath>`,
                              `<cackle>`, `<cheer>`, `<chuckle>`, `<chuckles>`,
                              `<cough>`, `<cry>`, `<exhales>`, `<gasp>`,
                              `<giggle>`, `<groan>`, `<growl>`, `<grr>`,
                              `<grunt>`, `<heavy breath>`, `<hiss>`, `<laugh>`,
                              `<laughter>`, `<long pause>`, `<moan>`, `<pant>`,
                              `<pff>`, `<phew>`, `<scream>`, `<short pause>`,
                              `<shout>`, `<shriek>`, `<sigh>`, `<sighs>`,
                              `<sneeze>`, `<snicker>`, `<snort>`, `<sob>`,
                              `<throat-clearing>`, `<tsk>`, `<whimper>`,
                              `<whispering>`, `<whispers>`, `<yawn>`.
                            maxLength: 10000
                            examples:
                              - Hello there. <laugh> That works.
                          style:
                            type: string
                            description: >-
                              Per-turn speaking style, 3.8 only. Freely describe
                              tone, emotion, and pace; different lines from the
                              same speaker can differ. Example: Speak like a
                              tired night-shift radio host, slow and dry.
                        x-apidog-orders:
                          - speaker_id
                          - text
                          - style
                        required:
                          - speaker_id
                          - text
                        x-apidog-ignore-properties: []
                  x-apidog-orders:
                    - temperature
                    - speakers
                    - filler_words
                    - dialogue_turns
                  required:
                    - speakers
                    - dialogue_turns
                  x-apidog-ignore-properties: []
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: google/gemini-3-8-flash-tts
              callBackUrl: https://your-domain.com/api/callback
              input:
                temperature: 1
                speakers:
                  - speaker_id: Speaker 1
                    voice_name: Fola
                  - speaker_id: Speaker 2
                    voice_name: Zephyr
                dialogue_turns:
                  - speaker_id: Speaker 1
                    style: Speak like a tired night-shift radio host, slow and dry.
                    text: Hello there. <laugh> That works.
                  - speaker_id: Speaker 2
                    style: Bright and curious, slightly faster.
                    text: >-
                      Wait, did you hear that? <gasp> I think it actually
                      worked.
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - type: object
                    x-apidog-refs:
                      01KXQS745D9PR85D93VDCQPDFJ:
                        $ref: '#/components/schemas/ApiResponseWithRecordId'
                        x-apidog-overrides:
                          data: &ref_0
                            type: object
                            properties:
                              taskId:
                                type: string
                                description: >-
                                  Task ID, can be used with Get Task Details
                                  endpoint to query task status
                            x-apidog-orders:
                              - taskId
                            x-apidog-ignore-properties: []
                        required:
                          - data
                    x-apidog-orders:
                      - 01KXQS745D9PR85D93VDCQPDFJ
                    properties:
                      code:
                        type: integer
                        enum:
                          - 200
                          - 401
                          - 402
                          - 404
                          - 422
                          - 429
                          - 455
                          - 500
                          - 501
                          - 505
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
                        description: Response message, error description when failed
                        examples:
                          - success
                      data: *ref_0
                    required:
                      - data
                    x-apidog-ignore-properties:
                      - code
                      - msg
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
        musicTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the audio task succeeds or
                fails.
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      type: object
                      required:
                        - code
                        - msg
                        - data
                      properties:
                        code:
                          type: integer
                          description: >-
                            Unified callback code: 200 for success, 501 for
                            failure.
                          enum:
                            - 200
                            - 501
                        msg:
                          type: string
                          description: Unified callback message.
                          enum:
                            - Playground task completed successfully.
                            - Playground task failed.
                        data:
                          type: object
                          required:
                            - taskId
                            - model
                            - state
                            - param
                          properties:
                            taskId:
                              type: string
                              description: The unique task identifier.
                            model:
                              type: string
                              description: The model used for the task.
                              enum:
                                - google/gemini-3-8-flash-tts
                            state:
                              type: string
                              description: Terminal task state.
                              enum:
                                - success
                                - fail
                            param:
                              type: string
                              description: >-
                                JSON string containing the submitted task
                                parameters.
                            resultJson:
                              type: string
                              nullable: true
                              description: >-
                                JSON string containing resultUrls and
                                resultObject when successful. Present only when
                                state is success.
                            failCode:
                              type: string
                              nullable: true
                              description: >-
                                Failure code, a numeric string such as "400" or
                                "500". Present only when state is fail.
                            failMsg:
                              type: string
                              nullable: true
                              description: Failure reason. Present only when state is fail.
                            costTime:
                              type: integer
                              format: int64
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                            completeTime:
                              type: integer
                              format: int64
                              description: Task completion timestamp.
                            createTime:
                              type: integer
                              format: int64
                              description: Task creation timestamp.
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                            creditsConsumed:
                              type: number
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          msg: Playground task completed successfully.
                          data:
                            taskId: task_example_music_webhook_001
                            model: google/gemini-3-8-flash-tts
                            state: success
                            param: >-
                              {"input":"{\"temperature\":1,\"speakers\":[{\"speaker_id\":\"Speaker
                              1\",\"voice_name\":\"Fola\"},{\"speaker_id\":\"Speaker
                              2\",\"voice_name\":\"Zephyr\"}],\"dialogue_turns\":[{\"speaker_id\":\"Speaker
                              1\",\"style\":\"Speak like a tired night-shift
                              radio host, slow and dry.\",\"text\":\"Hello
                              there. <laugh> That
                              works.\"},{\"speaker_id\":\"Speaker
                              2\",\"style\":\"Bright and curious, slightly
                              faster.\",\"text\":\"Wait, did you hear that?
                              <gasp> I think it actually
                              worked.\"}]}","callBackUrl":"https://your-domain.com/api/callback","model":"google/gemini-3-8-flash-tts"}
                            resultJson: >-
                              {"resultUrls":["https://example.com/generated-audio.wav"],"resultObject":null}
                            costTime: 12
                            completeTime: 1234567890
                            createTime: 1234560000
                            updateTime: 1234567890
                            creditsConsumed: 1.23
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: task_example_music_webhook_001
                            model: google/gemini-3-8-flash-tts
                            state: fail
                            param: >-
                              {"input":"{\"temperature\":1,\"speakers\":[{\"speaker_id\":\"Speaker
                              1\",\"voice_name\":\"Fola\"},{\"speaker_id\":\"Speaker
                              2\",\"voice_name\":\"Zephyr\"}],\"dialogue_turns\":[{\"speaker_id\":\"Speaker
                              1\",\"style\":\"Speak like a tired night-shift
                              radio host, slow and dry.\",\"text\":\"Hello
                              there. <laugh> That
                              works.\"},{\"speaker_id\":\"Speaker
                              2\",\"style\":\"Bright and curious, slightly
                              faster.\",\"text\":\"Wait, did you hear that?
                              <gasp> I think it actually
                              worked.\"}]}","callBackUrl":"https://your-domain.com/api/callback","model":"google/gemini-3-8-flash-tts"}
                            failCode: '400'
                            failMsg: <error detail>
                            costTime: 12
                            creditsConsumed: 0
              responses:
                '200':
                  description: Callback received successfully.
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          code:
                            type: integer
                            example: 200
                          msg:
                            type: string
                            example: success
                      example:
                        code: 200
                        msg: success
      x-apidog-folder: docs/en/Market/Music Models/Gemini
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-44315167-run
components:
  schemas:
    ApiResponseWithRecordId:
      type: object
      properties:
        code:
          type: integer
          enum:
            - 200
            - 401
            - 402
            - 404
            - 422
            - 429
            - 455
            - 500
            - 501
            - 505
          description: >-
            Status code of the request. The HTTP status is 200 even when the
            request fails, so always check this field: 200 means success; any
            other value means the request failed and msg describes the reason.
            Common values: 401 invalid or missing API key; 402 insufficient
            credits; 429 rate limit exceeded; 422 or 500 the request could not
            be processed (read msg and check your parameters before retrying).
        msg:
          type: string
          description: Response message, error description when failed
          examples:
            - success
        data:
          type: object
          properties:
            taskId:
              type: string
              description: >-
                Task ID, can be used with Get Task Details endpoint to query
                task status
            recordId:
              type: string
              description: Record ID, can be used to get the record details
          x-apidog-orders:
            - taskId
            - recordId
          x-apidog-ignore-properties: []
      x-apidog-orders:
        - code
        - msg
        - data
      title: response with recordId
      required:
        - data
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
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
