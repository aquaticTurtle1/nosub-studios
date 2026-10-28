# Extend Veo3.1 Video

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
      summary: Extend Veo3.1 Video
      deprecated: false
      description: >
        :::warning

        This is the new version of the API documentation; for the old version of
        the API, please see
        [https://docs.kie.ai/old-model/veo3-api/extend-video](https://docs.kie.ai/old-model/veo3-api/extend-video).

        :::

        ::: info[]
          Extend an existing Veo 3.1 video by generating new content based on the original video and a text prompt. This feature allows you to extend video duration or add new content based on your existing video clips.
        :::


        The result (resultUrls) is the newly generated continuation clip (720p)
        that starts from the last frame of the source video. The callback
        additionally includes info.fullResultUrls with the source and the
        continuation stitched together.


        Our **Veo 3.1 Video Extension API** is more than simple video splicing.
        It layers intelligent extension algorithms on top of the official
        models, giving you greater flexibility and markedly higher success rates
        (see [pricing details](https://kie.ai/pricing) for full details).


        | Capability              | Details |

        | :---------------------- | :------ |

        | **Smart Extension**     | Generate new video segments based on
        existing videos and text prompts |

        | **Seamless Connection** | Extended videos naturally connect with the
        original video |

        | **Flexible Control**    | Precisely control the style and actions of
        extended content through prompts |

        | **High-Quality Output** | Maintain the same quality and style as the
        original video |

        | **Audio Track**         | Extended videos default to background audio,
        consistent with the original video |


        ### Why our Veo 3.1 Video Extension is different


        1. **Smart Content Understanding** – Deeply understands the content and
        style of the original video to ensure coherence of extended content.

        2. **Natural Transition** – Extended video segments seamlessly connect
        with the original video without visible splicing marks.

        3. **Flexible Control** – Precisely control the actions, scenes, and
        styles of extended content through detailed prompts.

        4. **Significant Cost Savings** – see
        [kie.ai/pricing](https://kie.ai/pricing) for current prices.


        :::tip

        Choosing 1080p or 4k at generation costs the 720p price plus the 1080P /
        4K upgrade price. For current prices, see
        [kie.ai/pricing](https://kie.ai/pricing).

        :::


        ***


        ### Video Extension Workflow


        The video extension feature is based on your existing Veo3.1 generated
        videos and works through the following steps:


        1. **Provide Original Video**: Use the `taskId` from the original video
        generation task

        2. **Describe Extension Content**: Use `prompt` to detail how you want
        the video to be extended

        3. **Smart Analysis**: The system analyzes the content, style, and
        actions of the original video

        4. **Generate Extension**: Generate new video segments based on analysis
        results and your prompts

        5. **Seamless Connection**: Naturally connect the extended video with
        the original video


        ### Extension Features


        ::: info[Through the video extension feature, you can:]

        - Extend video duration and add more content

        - Change video direction and add new actions or scenes

        - Add new elements while maintaining the original style

        - Create richer video stories

        :::


        **Extension Features:**


        - **Smart Analysis**: Deeply understand the content and style of the
        original video

        - **Natural Connection**: Extended content seamlessly connects with the
        original video

        - **Flexible Control**: Precisely control extended content through
        prompts

        - **Quality Assurance**: Maintain the same quality and style as the
        original video


        ::: warning[**Important Notes**]

        - Can only extend videos generated through the Veo3.1 API

        - Extended content must also comply with platform content policies

        - Recommend using English prompts for best results

        - Video extension consumes credits, see [pricing
        Details](https://kie.ai/pricing) for specific pricing

        :::


        ### Best Practices


        ::: tip[Prompt Writing Suggestions]

        1. **Detailed Action Description**: Clearly describe how you want the
        video to be extended, e.g., "the dog continues running through the park,
        jumping over obstacles"

        2. **Maintain Style Consistency**: Ensure the style of extended content
        matches the original video

        3. **Natural Transition**: Described actions should naturally connect
        with the end of the original video

        4. **Use English**: Recommend using English prompts for best results

        5. **Avoid Conflicts**: Ensure extended content doesn't create logical
        conflicts with the original video

        :::


        ::: tip[Technical Recommendations]

        1. **Use Callbacks**: Strongly recommend using callback mechanisms to
        get results in production environments

        2. **Download Promptly**: Download video files promptly after
        generation, URLs have time limits

        3. **Error Handling**: Implement appropriate error handling and retry
        mechanisms

        4. **Credit Management**: Monitor credit usage to ensure sufficient
        balance

        5. **Seed Control**: Use the seeds parameter to control the randomness
        of generated content

        :::


        ## Important Notes


        ::: warning[Important Limitations]

        - **Original Video Requirements**: Can only extend videos generated
        through the Veo3.1 API

        - **Content Policy**: Extended content must also comply with platform
        content policies

        - **Credit Consumption**: Video extension consumes credits, see [pricing
        Details](https://kie.ai/pricing) for specific pricing

        - **Processing Time**: Video extension may take several minutes to over
        ten minutes to process

        - **URL Validity**: Generated video URLs have time limits, please
        download and save promptly

        :::


        ::: note[Extended Video Features]

        - **Seamless Connection**: Extended videos will naturally connect with
        the original video

        - **Quality Maintenance**: Extended videos maintain the same quality as
        the original video

        - **Style Consistency**: Extended content will maintain the visual style
        of the original video

        - **Flexible Control**: Prompts can precisely control the content and
        direction of extension

        :::


        ## Troubleshooting


        <AccordionGroup>

        <Accordion title="Common Error Handling">

        - **404 Error**: Check that task_id is a successful Veo 3.1 task.

        - **400 Error**: Check if the prompt complies with content policies

        - **402 Error**: Confirm the account has sufficient credits

        - **500 Error**: Temporary server issue, please try again later

        </Accordion>


        <Accordion title="Extension Quality Issues">

        - **Unnatural Connection**: Try more detailed prompt descriptions

        - **Style Inconsistency**: Ensure the prompt includes style descriptions

        - **Disconnected Actions**: Check if action descriptions in the prompt
        are reasonable

        - **Content Deviation**: Adjust prompts to more accurately describe
        desired extension content

        </Accordion>


        <Accordion title="Technical Issues">

        - **Callback Receipt Failure**: Check if the callback URL is accessible

        - **Video Download Failure**: Confirm URL validity and network
        connection

        - **Abnormal Task Status**: Use the details query interface to check
        task status

        - **Insufficient Credits**: Recharge credits promptly to continue using
        the service

        </Accordion>

        </AccordionGroup>
      operationId: extend-veo3-1-video
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
                  description: The outer model name, fixed to veo/extend
                  default: veo/extend
                  examples:
                    - veo/extend
                callBackUrl:
                  type: string
                  description: >-
                    Callback URL when the task is completed (optional). Highly
                    recommended for use in production environments.


                    - When the video extension is completed, the system will
                    send a POST request containing the task status and results
                    to this URL

                    - The callback includes the generated video URL, task
                    information, etc.

                    - Your callback endpoint should accept a POST request with a
                    JSON payload containing the video results

                    - For detailed callback format and implementation
                    guidelines, see [Video Generation
                    Callbacks](https://docs.kie.ai/veo3-api/generate-veo-3-video-callbacks)

                    - Alternatively, poll Get Task Details
                    (/market/common/get-task-detail).

                    - To ensure callback security, please refer to the [Webhook
                    Verification Guide](/common-api/webhook-verification) for
                    signature verification implementation
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  properties:
                    task_id:
                      type: string
                      description: >-
                        The task ID of the original video generation. Must be a
                        valid task ID returned by the video generation API.
                      examples:
                        - veo_task_abcdef123456
                    prompt:
                      type: string
                      description: >-
                        A text prompt describing the content of the extended
                        video. It should detail how you want the video to be
                        extended, including actions, scene changes, styles, etc.
                      examples:
                        - >-
                          The dog continues running through the park, jumping
                          over obstacles and playing with other dogs
                    seeds:
                      type: integer
                      description: >-
                        A random seed parameter that controls the randomness of
                        the generated content. Range: 10000-99999. The same seed
                        will generate similar video content, while different
                        seeds will generate different video content. If not
                        specified, the system will automatically assign a random
                        seed.
                      minimum: 10000
                      maximum: 99999
                      examples:
                        - 12345
                    model:
                      type: string
                      description: >-
                        Extension tier: "fast" (default), "quality" or "lite".
                        Billed per extension at the chosen tier.
                      enum:
                        - fast
                        - quality
                        - lite
                      default: fast
                      examples:
                        - fast
                    watermark:
                      type: string
                      description: >-
                        Watermark text (optional). If provided, a watermark will
                        be added to the generated video.
                      examples:
                        - MyBrand
                  required:
                    - task_id
                    - prompt
                  x-apidog-orders:
                    - task_id
                    - prompt
                    - seeds
                    - model
                    - watermark
                  x-apidog-ignore-properties: []
              required:
                - model
                - input
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              examples:
                - model: veo/extend
                  callBackUrl: https://your-domain.com/api/callback
                  input:
                    task_id: veo_task_abcdef123456
                    prompt: >-
                      The dog continues running through the park, jumping over
                      obstacles and playing with other dogs
                    seeds: 12345
                    watermark: MyBrand
              x-apidog-ignore-properties: []
            example:
              model: veo/extend
              callBackUrl: https://your-domain.com/api/callback
              input:
                task_id: veo_task_abcdef123456
                prompt: >-
                  The dog continues running through the park, jumping over
                  obstacles and playing with other dogs
                seeds: 12345
                watermark: MyBrand
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
                    description: Response message
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
                          - veo_extend_task_xyz789
                    x-apidog-orders:
                      - taskId
                    x-apidog-ignore-properties: []
                x-apidog-orders:
                  - code
                  - msg
                  - data
                examples:
                  - code: 200
                    msg: success
                    data:
                      taskId: veo_extend_task_xyz789
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
        onVideoExtended:
          '{$request.body#/callBackUrl}':
            post:
              summary: Video Extension Callback
              description: >-
                When the video extension task is completed, the system will send
                the result to your provided callback URL via POST request
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


                            - **200**: Success - Video extension task successful

                            - **400**: Your prompt was flagged by the website as
                            violating content policies.

                            Unable to retrieve image. Please verify any access
                            restrictions set by you or your service provider.

                            Public error: Unsafe image upload.

                            - **500**: Internal error, please try again later.

                            Internal error - Timeout

                            - **501**: Failed - Video extension task failed
                          enum:
                            - 200
                            - 400
                            - 500
                            - 501
                        msg:
                          type: string
                          description: Status message
                          example: Video generated successfully..
                        data:
                          type: object
                          properties:
                            taskId:
                              type: string
                              description: Task ID
                              example: veo_extend_task_xyz789
                            info:
                              type: object
                              properties:
                                resultUrls:
                                  type: string
                                  description: Extended video URLs
                                  example: '[http://example.com/extended_video1.mp4]'
                                originUrls:
                                  type: string
                                  description: >-
                                    Original video URLs. Only available when
                                    aspect_ratio is not 16:9
                                  example: '[http://example.com/original_video1.mp4]'
                                resolution:
                                  type: string
                                  description: Video resolution information
                                  example: 1080p
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Video Models/Veo3.1 API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43155884-run
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
