# Generate Veo3.1 Video

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
      summary: Generate Veo3.1 Video
      deprecated: false
      description: >
        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/veo3-api/generate-veo-3-video](https://docs.kie.ai/old-model/veo3-api/generate-veo-3-video).

        :::

        ### Veo 3.1 Generation API


        Our **Veo 3.1 Generation API** is more than a direct wrapper around
        Google's baseline. It layers extensive optimisation and reliability
        tooling on top of the official models, giving you greater flexibility
        and markedly higher success rates (see
        [kie.ai/pricing](https://kie.ai/pricing) for full details).


        | Capability | Details |

        | :------------------- | :------ |

        | **Models** | • **Veo 3.1 Quality** — flagship model, highest fidelity•
        **Veo 3.1 Fast** — cost-efficient variant that still delivers strong
        visual results• **Veo 3.1 Lite** — most cost-effective model for
        high-volume generation |

        | **Tasks** | • **Text → Video**• **Image → Video** (single reference
        frame or first and last frames)• **Material → Video** (based on material
        images) |

        | **Generation Modes** | • **TEXT\_2\_VIDEO** — Text-to-video: using
        text prompts only• **FIRST\_AND\_LAST\_FRAMES\_2\_VIDEO** — First and
        last frames to video: generate transition videos using one or two
        images• **REFERENCE\_2\_VIDEO** — Material-to-video: based on material
        images (**Fast model** and **Lite model**, supports **16:9 & 9:16**) |

        | **Aspect Ratios** | Supports both native **16:9** and **9:16**
        outputs. **Auto** mode lets the system decide aspect ratio based on
        input materials and internal strategy (for production control, we
        recommend explicitly setting `aspect_ratio`). |

        | **Output Quality** | Both **16:9** and **9:16** support **1080P** and
        **4K** outputs.|

        | **Audio Track** | All videos ship with background audio by default. In
        rare cases, audio may be suppressed when the scene is deemed sensitive
        (e.g. minors). |


        ### Why our Veo 3.1 API is different


        1. **True vertical video** – Native Veo 3.1 supports **9:16** output,
        delivering authentic vertical videos without the need for re-framing or
        manual editing.

        2. **Global language reach** – Our flow supports multilingual prompts by
        default (no extra configuration required).

        3. **Significant cost savings** – see
        [kie.ai/pricing](https://kie.ai/pricing) for current prices.


        :::tip

        Choosing 1080p or 4k at generation costs the 720p price plus the 1080P /
        4K upgrade price. For current prices, see
        [kie.ai/pricing](https://kie.ai/pricing).

        :::
      operationId: generate-veo3-1-video
      tags:
        - docs/en/Market/Video Models/Veo3.1 API
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  description: >-
                    Must be "veo-3-1". Use input.model to choose the Fast / Lite
                    / Quality tier.
                  default: veo-3-1
                  examples:
                    - veo-3-1
                  enum:
                    - veo-3-1
                callBackUrl:
                  type: string
                  description: >-
                    Completion callback URL for receiving video generation
                    status updates.


                    - Optional but recommended for production use

                    - System will POST task completion status to this URL when
                    the video generation is completed

                    - Callback will include task results, video URLs, and status
                    information

                    - Your callback endpoint should accept POST requests with
                    JSON payload

                    - For detailed callback format and implementation guide, see
                    [Callback
                    Documentation](https://docs.kie.ai/veo3-api/generate-veo-3-video-callbacks)

                    - Alternatively, poll Get Task Details
                    (/market/common/get-task-detail).

                    - To ensure callback security, see [Webhook Verification
                    Guide](/common-api/webhook-verification) for signature
                    verification implementation
                  examples:
                    - http://your-callback-url.com/complete
                input:
                  type: object
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Text prompt describing the desired video content.
                        Required for all generation modes.


                        - Should be detailed and specific in describing video
                        content

                        - Can include actions, scenes, style and other
                        information

                        - For image-to-video, describe how you want the image to
                        come alive
                      examples:
                        - A dog playing in a park
                    model:
                      type: string
                      enum:
                        - veo3_fast
                        - veo3_lite
                        - veo3
                      default: veo3_fast
                      description: >-
                        Veo 3.1 tier: "veo3_fast" (default), "veo3_lite" or
                        "veo3" (Quality). The top-level model stays "veo-3-1".
                        REFERENCE_2_VIDEO supports veo3_fast and veo3_lite.
                      examples:
                        - veo3_fast
                    image_urls:
                      type: array
                      items:
                        type: string
                      description: >-
                        Image URLs. FIRST_AND_LAST_FRAMES_2_VIDEO: 1 image
                        (first frame) or 2 images (first + last frame).
                        REFERENCE_2_VIDEO: 1–3 reference images, 8-second
                        duration only.
                      examples:
                        - - http://example.com/image1.jpg
                          - http://example.com/image2.jpg
                    generation_type:
                      type: string
                      description: >-
                        Video generation mode (optional). Specifies different
                        video generation approaches:


                        - **TEXT_2_VIDEO**: Text-to-video - Generate videos
                        using only text prompts

                        - **FIRST_AND_LAST_FRAMES_2_VIDEO**: First and last
                        frames to video - Flexible image-to-video generation
                        mode
                          - 1 image: Generate video based on the provided image
                          - 2 images: First image as first frame, second image as last frame, generating transition video
                        - **REFERENCE_2_VIDEO**: Reference-to-video - Generate
                        videos based on reference images, requires 1-3 images in
                        imageUrls (minimum 1, maximum 3)


                        **Important Notes**:

                        - REFERENCE_2_VIDEO mode currently supports the
                        veo3_fast and veo3_lite models.

                        - If not specified, the system will automatically
                        determine the generation mode based on whether imageUrls
                        are provided
                      enum:
                        - TEXT_2_VIDEO
                        - FIRST_AND_LAST_FRAMES_2_VIDEO
                        - REFERENCE_2_VIDEO
                      examples:
                        - TEXT_2_VIDEO
                    aspect_ratio:
                      type: string
                      description: >-
                        Video aspect ratio. Specifies the dimension ratio of the
                        generated video. Available options:


                        - 16:9: Landscape video format. 

                        - 9:16: Portrait video format, suitable for mobile short
                        videos

                        - Auto: In auto mode, the video will be automatically
                        center-cropped based on whether your uploaded image is
                        closer to 16:9 or 9:16.


                        Default value is 16:9.
                      enum:
                        - '16:9'
                        - '9:16'
                        - Auto
                      default: '16:9'
                      examples:
                        - '16:9'
                    enable_fallback:
                      type: boolean
                      description: Deprecated. Remove it from requests.
                      default: false
                      deprecated: true
                      examples:
                        - false
                    enable_translation:
                      type: boolean
                      description: >-
                        Optional. When true, the prompt is translated to English
                        before generation.
                      examples:
                        - true
                    watermark:
                      type: string
                      description: >-
                        Watermark text.


                        - Optional parameter

                        - If provided, a watermark will be added to the
                        generated video
                      examples:
                        - MyBrand
                    resolution:
                      type: string
                      enum:
                        - 720p
                        - 1080p
                        - 4k
                      x-apidog-enum:
                        - value: 720p
                          name: ''
                          description: ''
                        - value: 1080p
                          name: ''
                          description: ''
                        - value: 4k
                          name: ''
                          description: ''
                      default: 720p
                      description: >-
                        Output resolution: 720p (default), 1080p or 4k. For
                        1080p and 4k, the video URL is in
                        resultJson.data.result_urls (the 720p version is in
                        data.origin_urls). Controls the pixel dimensions of the
                        generated video. Higher resolution results in greater
                        clarity and detail, while lower resolution allows for
                        faster generation.
                    duration:
                      type: integer
                      description: >-
                        The duration of the generated video, in seconds.
                        Optional values are 4, 6, 8.

                        **Important Note**:

                        - The REFERENCE_2_VIDEO mode currently only supports a
                        duration of 8 seconds.
                      enum:
                        - 4
                        - 6
                        - 8
                      examples:
                        - 8
                      default: 8
                  required:
                    - prompt
                  x-apidog-orders:
                    - prompt
                    - model
                    - image_urls
                    - generation_type
                    - aspect_ratio
                    - enable_fallback
                    - enable_translation
                    - watermark
                    - resolution
                    - duration
                  x-apidog-ignore-properties: []
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              examples:
                - model: veo-3-1
                  callBackUrl: http://your-callback-url.com/complete
                  input:
                    prompt: A dog playing in a park
                    image_urls:
                      - http://example.com/image1.jpg
                      - http://example.com/image2.jpg
                    watermark: MyBrand
                    aspect_ratio: '16:9'
                    enable_translation: true
                    generation_type: REFERENCE_2_VIDEO
              x-apidog-ignore-properties: []
            example:
              model: veo-3-1
              callBackUrl: http://your-callback-url.com/complete
              input:
                prompt: A dog playing in a park
                image_urls:
                  - http://example.com/image1.jpg
                  - http://example.com/image2.jpg
                watermark: MyBrand
                aspect_ratio: '16:9'
                enable_translation: true
                generation_type: REFERENCE_2_VIDEO
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    enum:
                      - 200
                      - 400
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
                      Status code of the request. The HTTP status is 200 even
                      when the request fails, so always check this field: 200
                      means success; any other value means the request failed
                      and msg describes the reason. Common values: 401 invalid
                      or missing API key; 402 insufficient credits; 429 rate
                      limit exceeded; 422 or 500 the request could not be
                      processed (read msg and check your parameters before
                      retrying).
                  msg:
                    type: string
                    description: Error message when code != 200
                    examples:
                      - success
                  data:
                    type: object
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Task ID, can be used with [Get Task
                          Details](/market/common/get-task-detail) endpoint to
                          query task status
                        examples:
                          - veo_task_abcdef123456
                    x-apidog-orders:
                      - taskId
                    x-apidog-ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: veo_task_abcdef123456
          headers: {}
          x-apidog-name: success
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
        onVideoGenerated:
          '{$request.body#/callBackUrl}':
            post:
              summary: Video Generation Callback
              description: >-
                When the video generation task is completed, the system will
                send the result to your provided callback URL via POST request
              requestBody:
                required: true
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        code:
                          type: integer
                          description: >-
                            Status code


                            - **200**: Success - Video generation task
                            successfully

                            - **400**: Your prompt was flagged by Website as
                            violating content policies.

                            Failed to fetch the image. Kindly verify any access
                            limits set by you or your service provider.

                            public error unsafe image upload.

                            - **500**: Internal Error, Please try again later.

                            Internal Error - Timeout

                            - **501**: Failed - Video generation task failed
                          enum:
                            - 200
                            - 400
                            - 500
                            - 501
                        msg:
                          type: string
                          description: Status message
                          example: Veo3.1 video generated successfully.
                        data:
                          type: object
                          properties:
                            taskId:
                              type: string
                              description: Task ID
                              example: veo_task_abcdef123456
                            info:
                              type: object
                              properties:
                                resultUrls:
                                  type: array
                                  items:
                                    type: string
                                  description: Generated video URLs
                                  example:
                                    - http://example.com/video1.mp4
                                originUrls:
                                  type: array
                                  items:
                                    type: string
                                  description: >-
                                    Original video URLs. Only has value when
                                    aspect_ratio is not 16:9
                                  example:
                                    - http://example.com/original_video1.mp4
                                resolution:
                                  type: string
                                  description: Video resolution information
                                  example: 1080p
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Video Models/Veo3.1 API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43155880-run
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
