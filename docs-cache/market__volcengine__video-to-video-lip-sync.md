# Volcengine video to video lip sync

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
      summary: Volcengine video to video lip sync
      deprecated: false
      description: >-
        ## Create Task


        Use this endpoint to create a new video-to-video lip sync task. Upload a
        video and an audio file, and the model will drive the video lip
        movements to match the target audio.


        <Card title="Get Task Details" icon="lucide-search"
        href="/market/common/get-task-detail">
          After submission, use the unified query endpoint to check task progress and retrieve results
        </Card>


        ::: tip[]

        For production use, we recommend providing the `callBackUrl` parameter
        so your service can receive completion notifications instead of polling
        for task status.

        :::


        ## File Upload


        ::: tip[]

        Need to upload files before calling this endpoint? See [File Upload API
        Quickstart](/file-upload-api/quickstart).

        :::


        ## Output Specifications


        The generated video is returned in MP4 format at 25 fps. The final
        output duration follows the audio duration: if the source video is
        longer than the audio, it will be trimmed; if the source video is
        shorter than the audio, it will be looped.


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Model Marketplace" icon="lucide-store" href="/market/quickstart">
            Explore all available models and capabilities
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check account credits and usage
          </Card>
        </CardGroup>
      operationId: volcengine-video-to-video-lip-sync
      tags:
        - docs/en/Market/Video Models/Volcengine
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
                  enum:
                    - volcengine/video-to-video-lip-sync
                  default: volcengine/video-to-video-lip-sync
                  description: >-
                    The model name used for video lip sync. This field is
                    required.


                    - This endpoint must use the
                    `volcengine/video-to-video-lip-sync` model
                  examples:
                    - volcengine/video-to-video-lip-sync
                input:
                  type: object
                  description: Input parameters for the video-to-video lip sync task.
                  required:
                    - mode
                    - video_url
                    - audio_url
                  properties:
                    mode:
                      type: string
                      enum:
                        - lite
                        - basic
                      description: >-
                        Service mode for lip-sync generation.

                        - `lite`: For single-person frontal videos. Faster
                        processing.

                        - `basic`: For single-person complex scenes. Supports
                        scene segmentation and speaker identification.
                    video_url:
                      type: string
                      format: uri
                      description: >-
                        Video URL. Supported resolution: 360p–1080p. Videos
                        above 1080p will be compressed to 1080p, while videos
                        below 360p are not supported. Supported formats: MOV,
                        MP4, HDR, MKV. Recommended codec: H.264. Other
                        formats/codecs may be transcoded. Max file size: 500 MB.
                        Bitrate: 1–30 Mbps. Frame rate: 24–60 fps.
                    audio_url:
                      type: string
                      format: uri
                      description: >-
                        Target pure vocal audio URL; used to drive video lip
                        movements. Audio duration: over 1 s and up to 240 s in
                        lite mode; over 1 s and up to 210 s in basic mode.
                        Accepted file types: audio/mpeg, audio/wav, audio/x-wav,
                        audio/aac, audio/mp4, audio/ogg. Max file size: 10MB.
                    separate_vocal:
                      type: boolean
                      default: false
                      description: >-
                        Enable vocal separation to suppress background noise.
                        Default value: `false`.
                    open_scenedet:
                      type: boolean
                      default: false
                      description: >-
                        Whether to enable scene segmentation and speaker
                        identification. Supported only in Basic mode. Default
                        value: `false`.
                    align_audio:
                      type: boolean
                      default: true
                      description: >-
                        Supported in Lite mode. Whether to loop the video when
                        the audio is longer than the video. Default value:
                        `true`.
                    align_audio_reverse:
                      type: boolean
                      default: false
                      description: >-
                        Supported in Lite mode. Whether to loop the video in
                        reverse (backward). Requires `align_audio` to be set to
                        `true`. Default value: `false`.
                    templ_start_seconds:
                      type: number
                      default: 0
                      description: >-
                        Supported in Lite mode. Start time of the template
                        video, in seconds. Default value: `0`.
                  x-apidog-orders:
                    - mode
                    - video_url
                    - audio_url
                    - separate_vocal
                    - open_scenedet
                    - align_audio
                    - align_audio_reverse
                    - templ_start_seconds
                  x-apidog-ignore-properties: []
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    Callback URL. Once the task is fully completed, kie will
                    send the result to the business webhook URL. To verify
                    callbacks, see [Webhook Verification
                    Guide](/common-api/webhook-verification).
              x-apidog-orders:
                - model
                - input
                - callBackUrl
              x-apidog-ignore-properties: []
            example:
              model: volcengine/video-to-video-lip-sync
              input:
                mode: lite
                video_url: https://your-domain.com/video/example.mp4
                audio_url: https://your-domain.com/audio/speech.mp3
                separate_vocal: false
                open_scenedet: false
                align_audio: true
                align_audio_reverse: false
                templ_start_seconds: 0
              callBackUrl: https://your-domain.com/api/callback
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
              example:
                code: 200
                msg: success
                data:
                  taskId: task_volcengine-video-to-video-lip-sync_1234567890
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
              nYkvj53xeZmoR6Q1kdV80:
                undefined: []
      callbacks:
        videoTaskCompleted:
          '{request.body#/callBackUrl}':
            post:
              description: >-
                The system sends this callback when the
                `volcengine/video-to-video-lip-sync` task succeeds or fails.
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
                                - volcengine/video-to-video-lip-sync
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
                                JSON string containing resultUrls,
                                firstFrameUrl, lastFrameUrl, or resultObject
                                when successful. Present only when state is
                                success.
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
                            taskId: task_example_video_webhook_001
                            model: volcengine/video-to-video-lip-sync
                            state: success
                            param: >-
                              {"input":"{\"mode\":\"lite\",\"video_url\":\"https://example.com/input-video.mp4\",\"audio_url\":\"https://example.com/input-audio.mp3\",\"separate_vocal\":false,\"open_scenedet\":false,\"align_audio\":true,\"align_audio_reverse\":false,\"templ_start_seconds\":0}","callBackUrl":"https://example.com/callback","model":"volcengine/video-to-video-lip-sync"}
                            resultJson: >-
                              {"resultUrls":["https://example.com/generated-video.mp4"]}
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
                            taskId: task_example_video_webhook_001
                            model: volcengine/video-to-video-lip-sync
                            state: fail
                            param: >-
                              {"input":"{\"mode\":\"lite\",\"video_url\":\"https://example.com/input-video.mp4\",\"audio_url\":\"https://example.com/input-audio.mp3\",\"separate_vocal\":false,\"open_scenedet\":false,\"align_audio\":true,\"align_audio_reverse\":false,\"templ_start_seconds\":0}","callBackUrl":"https://example.com/callback","model":"volcengine/video-to-video-lip-sync"}
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
      x-apidog-folder: docs/en/Market/Video Models/Volcengine
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-37880495-run
components:
  schemas:
    response not with recordId:
      type: object
      required:
        - data
      properties:
        code:
          type: integer
          description: >-
            Status code of the request. The HTTP status is 200 even when the
            request fails, so always check this field: 200 means success; any
            other value means the request failed and msg describes the reason.
            Common values: 401 invalid or missing API key; 402 insufficient
            credits; 429 rate limit exceeded; 422 or 500 the request could not
            be processed (read msg and check your parameters before retrying).
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
                The task ID can be used with the "Get Task Details" endpoint to
                query the task status.
              examples:
                - dc1928bfcbc77cb6c85f3359a9c718b3
          x-apidog-orders:
            - taskId
          x-apidog-ignore-properties: []
      x-apidog-orders:
        - code
        - msg
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
