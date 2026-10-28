# Grok Imagine - image to image

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
      summary: Grok Imagine - image to image
      deprecated: false
      description: >
        Content generation using grok-imagine/image-to-image


        ## File Upload Requirements


        Before using the Image-to-Image API, you need to upload your reference
        image:


        <Steps>

        <Step title="Upload Reference Image">
          Use the File Upload API to upload your reference image.

          <Card title="File Upload API" icon="lucide-upload" href="/file-upload-api/quickstart">
            Learn how to upload images and get file URLs
          </Card>

          **Requirements:**
          - **File Type**: JPEG, PNG, or WebP format
          - **Max File Size**: 10MB per file
          - **Content**: Image you want to use as reference for generation
        </Step>


        <Step title="Get File URL">
          After upload, you'll receive a file URL that you can use in the `image_urls` parameter.
        </Step>

        </Steps>


        :::warning

        - Supported formats: JPEG, PNG, WebP (Max: 10MB)

        :::


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


        <CardGroup cols={2}>
          <Card title="Market Overview" icon="lucide-store" href="/market/quickstart">
            Explore all available models
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            Check credits and account usage
          </Card>
        </CardGroup>
      operationId: grok-imagine-image-to-image
      tags:
        - docs/en/Market/Image    Models/Grok Imagine
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required:
                - model
              properties:
                model:
                  type: string
                  enum:
                    - grok-imagine/image-to-image
                  default: grok-imagine/image-to-image
                  description: |-
                    The model name to use for generation. Required field.

                    - Must be `grok-imagine/image-to-image` for this endpoint
                  examples:
                    - grok-imagine/image-to-image
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
                    - https://your-domain.com/api/callback
                input:
                  type: object
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      description: >-
                        A text description specifying the desired content or
                        style of the generated image. (Max length: 390000
                        characters)
                      type: string
                      maxLength: 390000
                      examples:
                        - >-
                          Recreate the Titanic movie poster with two adorable
                          anthropomorphic cats in the same romantic pose at the
                          bow of the ship. The male cat is an orange tabby
                          wearing a vest, standing behind a white long-haired
                          female cat in a lace dress, holding her paws as they
                          stretch forward in the wind. Both cats are
                          photorealistic with detailed fur, wind-swept hair, and
                          dramatic sunset lighting (warm golden highlights, cool
                          blue shadows). Background: the Titanic ship at dusk
                          with four smokestacks, glowing deck lights, calm
                          ocean, and orange-pink sunset sky. Center title:
                          “CATANIC” in the same gold metallic serif style as
                          Titanic, same size and position.
                    image_urls:
                      type: array
                      items:
                        type: string
                        format: uri
                      description: >-
                        1–5 image URLs. (Use file URLs after upload, not raw
                        file content. Accepted types: image/jpeg, image/png,
                        image/webp. Max size: 10.0MB per image.) In your prompt,
                        reference the uploaded image by typing @image(n)
                        followed by a space (for example: @image1 a sunset over
                        the ocean).
                      maxItems: 5
                      examples:
                        - - >-
                            https://static.aiquickdraw.com/tools/example/1767602105243_0MmMCrwq.png
                    nsfw_checker:
                      type: boolean
                      description: >-
                        Defaults to false. When false, no additional content
                        filtering is applied and results are returned directly
                        by the model.
                  required:
                    - image_urls
                  x-apidog-orders:
                    - prompt
                    - image_urls
                    - 01KWKKPRV1ZZV5A5MNR4YZ5FVD
                  x-apidog-refs:
                    01KWKKPRV1ZZV5A5MNR4YZ5FVD:
                      $ref: '#/components/schemas/nsfw_checker'
                  x-apidog-ignore-properties:
                    - nsfw_checker
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: grok-imagine/image-to-image
              callBackUrl: https://your-domain.com/api/callback
              input:
                prompt: >-
                  Recreate the Titanic movie poster with two adorable
                  anthropomorphic cats in the same romantic pose at the bow of
                  the ship. The male cat is an orange tabby wearing a vest,
                  standing behind a white long-haired female cat in a lace
                  dress, holding her paws as they stretch forward in the wind.
                  Both cats are photorealistic with detailed fur, wind-swept
                  hair, and dramatic sunset lighting (warm golden highlights,
                  cool blue shadows). Background: the Titanic ship at dusk with
                  four smokestacks, glowing deck lights, calm ocean, and
                  orange-pink sunset sky. Center title: “CATANIC” in the same
                  gold metallic serif style as Titanic, same size and position.
                image_urls:
                  - >-
                    https://static.aiquickdraw.com/tools/example/1767602105243_0MmMCrwq.png
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
                  taskId: task_grok-imagine_1767694553297
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
        onImageGenerated:
          '{$request.body#/callBackUrl}':
            post:
              summary: Image Generation Callback
              description: Sent when the task succeeds or fails.
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
                            200: success. 501: failure; see data.failCode and
                            data.failMsg.
                          enum:
                            - 200
                            - 501
                        msg:
                          type: string
                          description: Status message
                          example: Playground task completed successfully.
                        data:
                          type: object
                          properties:
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786431871000
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 11
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds
                              example: 1786431859000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 4
                            model:
                              type: string
                              description: Image-to-image model used for the task
                              example: grok-imagine/image-to-image
                            param:
                              type: string
                              description: >-
                                Parameters submitted when creating the task, in
                                JSON string format
                              example: >-
                                {"input":"{\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1767602105243_0MmMCrwq.png\"],\"prompt\":\"Recreate
                                the Titanic movie poster with two adorable
                                anthropomorphic cats in the same romantic pose
                                at the bow of the ship. The male cat is an
                                orange tabby wearing a vest, standing behind a
                                white long-haired female cat in a lace dress,
                                holding her paws as they stretch forward in the
                                wind. Both cats are photorealistic with detailed
                                fur, wind-swept hair, and dramatic sunset
                                lighting (warm golden highlights, cool blue
                                shadows). Background: the Titanic ship at dusk
                                with four smokestacks, glowing deck lights, calm
                                ocean, and orange-pink sunset sky. Center title:
                                \\\"CATANIC\\\" in the same gold metallic serif
                                style as Titanic, same size and
                                position.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine/image-to-image"}
                            resultJson:
                              type: string
                              description: >-
                                Image generation result in JSON string format.
                                resultUrls contains the list of generated image
                                URLs. Present only when state is success.
                              example: >-
                                {"resultUrls":["https://tempfile.aiquickdraw.com/g/users/9a2eef47-0997-4343-8b25-8ff800ae0529/generated/e51cd53b-736a-4742-858b-f2b8fbe5998a/image.jpg"]}
                            state:
                              type: string
                              description: Task status
                              enum:
                                - success
                                - fail
                              example: success
                            taskId:
                              type: string
                              description: Task ID
                              example: 9c6b5b687460e9fc898baff13649c2cf
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786431871000
                            failCode:
                              type: string
                              description: >-
                                Failure code, a numeric string such as "400" or
                                "500". Present only when state is fail.
                              example: '500'
                            failMsg:
                              type: string
                              description: Failure reason. Present only when state is fail.
                              example: <error detail>
                    examples:
                      success:
                        summary: Task completed successfully
                        value:
                          code: 200
                          msg: Playground task completed successfully.
                          data:
                            taskId: 9c6b5b687460e9fc898baff13649c2cf
                            model: grok-imagine/image-to-image
                            state: success
                            param: >-
                              {"input":"{\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1767602105243_0MmMCrwq.png\"],\"prompt\":\"Recreate
                              the Titanic movie poster with two adorable
                              anthropomorphic cats in the same romantic pose at
                              the bow of the ship. The male cat is an orange
                              tabby wearing a vest, standing behind a white
                              long-haired female cat in a lace dress, holding
                              her paws as they stretch forward in the wind. Both
                              cats are photorealistic with detailed fur,
                              wind-swept hair, and dramatic sunset lighting
                              (warm golden highlights, cool blue shadows).
                              Background: the Titanic ship at dusk with four
                              smokestacks, glowing deck lights, calm ocean, and
                              orange-pink sunset sky. Center title:
                              \\\"CATANIC\\\" in the same gold metallic serif
                              style as Titanic, same size and
                              position.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine/image-to-image"}
                            resultJson: >-
                              {"resultUrls":["https://tempfile.aiquickdraw.com/g/users/9a2eef47-0997-4343-8b25-8ff800ae0529/generated/e51cd53b-736a-4742-858b-f2b8fbe5998a/image.jpg"]}
                            costTime: 11
                            createTime: 1786431859000
                            completeTime: 1786431871000
                            updateTime: 1786431871000
                            creditsConsumed: 4
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: 9c6b5b687460e9fc898baff13649c2cf
                            model: grok-imagine/image-to-image
                            state: fail
                            param: >-
                              {"input":"{\"image_urls\":[\"https://static.aiquickdraw.com/tools/example/1767602105243_0MmMCrwq.png\"],\"prompt\":\"Recreate
                              the Titanic movie poster with two adorable
                              anthropomorphic cats in the same romantic pose at
                              the bow of the ship. The male cat is an orange
                              tabby wearing a vest, standing behind a white
                              long-haired female cat in a lace dress, holding
                              her paws as they stretch forward in the wind. Both
                              cats are photorealistic with detailed fur,
                              wind-swept hair, and dramatic sunset lighting
                              (warm golden highlights, cool blue shadows).
                              Background: the Titanic ship at dusk with four
                              smokestacks, glowing deck lights, calm ocean, and
                              orange-pink sunset sky. Center title:
                              \\\"CATANIC\\\" in the same gold metallic serif
                              style as Titanic, same size and
                              position.\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine/image-to-image"}
                            costTime: 11
                            createTime: 1786431859000
                            completeTime: 1786431871000
                            updateTime: 1786431871000
                            creditsConsumed: 0
                            failCode: '500'
                            failMsg: <error detail>
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Grok Imagine
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506369-run
components:
  schemas:
    nsfw_checker:
      type: object
      properties:
        nsfw_checker:
          type: boolean
          description: >-
            Defaults to false. When false, no additional content filtering is
            applied and results are returned directly by the model.
      x-apidog-orders:
        - nsfw_checker
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
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
