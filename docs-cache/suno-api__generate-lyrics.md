# Generate Lyrics

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
      summary: Generate Lyrics
      deprecated: false
      description: >
        :::warning Document updated

        If you have already completed the integration process previously, you
        can still access the old version document at: Old version address
        (https://docs.kie.ai/old-model/suno-api/generate-lyrics)

        :::

        Generate creative lyrics content based on a text prompt.


        ### Usage Guide

        - Use this endpoint to create lyrics for music composition

        - Multiple variations of lyrics will be generated for each request

        - Each generated lyric set includes title and structured verse/chorus
        sections


        ### Parameter Details

        - `prompt` should describe the theme, style, or subject of the desired
        lyrics

        - A detailed prompt yields more targeted and relevant lyrics


        ### Developer Notes

        - Generated lyrics are retained for 14 days

        - Callback occurs once with all generated variations when complete

        - Typically returns 2-3 different lyric variations per request

        - Each lyric set is formatted with standard section markers ([Verse],
        [Chorus], etc.)

        - When polling recordInfo, lyrics are in
        resultJson.resultObject.lyricsData[] (text, title, status,
        error_message, tags).
      operationId: generate-lyrics
      tags:
        - docs/en/Market/Music Models/Suno/Lyrics Generation
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
                    - ai-music-api/generate-lyrics
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
                  description: Input parameters for the generation task
                  properties:
                    prompt:
                      type: string
                      description: >-
                        Description of the desired lyrics content. Be specific
                        about theme, mood, style, or story elements you want in
                        the lyrics. More detailed prompts yield better results.
                        The maximum word limit is 200 characters.
                      examples:
                        - >-
                          A nostalgic song about childhood memories and growing
                          up in a small town
                  required:
                    - prompt
                  x-apidog-orders:
                    - prompt
                  x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: ai-music-api/generate-lyrics
              callBackUrl: https://api.example.com/callback
              input:
                prompt: >-
                  A nostalgic song about childhood memories and growing up in a
                  small town
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
                          - 404
                          - 405
                          - 413
                          - 429
                          - 430
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
        audioLyricsGenerated:
          '{$request.body#/callBackUrl}':
            post:
              description: >-
                System will call this callback when lyrics generation is
                complete.


                ### Callback Example

                ```json

                {
                  "code": 200,
                  "msg": "All generated successfully.",
                  "data": {
                    "callbackType": "complete",
                    "task_id": "3b66882fde0a5d398bd269cab6d9542b",
                    "data": [
                      {
                        "error_message": "",
                        "status": "complete",
                        "text": "[Verse]\nMoonlight spreads across the windowsill\nStars dance, never standing still\nNight breeze weaves dreams with gentle skill\nLeaving all worries on the hill\n\n[Verse 2]\nLights reflect in your bright eyes\nLike meteors across the skies\nThe world stops in that moment's prize\nChasing future, no goodbyes\n\n[Chorus]\nIn starry dreams we find tomorrow\nBreak free from ordinary sorrow\nAll our dreams will bloom and follow\nDon't fear the path, don't fear tomorrow",
                        "title": "Starry Night Dreams"
                      },
                      {
                        "error_message": "",
                        "status": "complete",
                        "text": "[Verse]\nMoonlight spreads across the windowsill\nStars dance, never standing still\nNight breeze weaves dreams with gentle skill\nLeaving all worries on the hill\n\n[Verse 2]\nLights reflect in your bright eyes\nLike meteors across the skies\nThe world stops in that moment's prize\nChasing future, no goodbyes\n\n[Chorus]\nIn starry dreams we find tomorrow\nBreak free from ordinary sorrow\nAll our dreams will bloom and follow\nDon't fear the path, don't fear tomorrow",
                        "title": "Main Street Summer"
                      }
                    ]
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
                                - 400
                                - 500
                              description: >-
                                Response status code


                                - **200**: Success - Request has been processed
                                successfully

                                - **400**: Please try rephrasing   with more
                                specific details or using a different approach.

                                Song Description contained artist name

                                Song Description flagged for moderation

                                Unable to generate lyrics from song  
                                description

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
                                taskId:
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
                          example: All generated successfully
                        data:
                          type: object
                          properties:
                            callbackType:
                              type: string
                              description: Callback type, fixed as complete
                              enum:
                                - complete
                              example: complete
                            task_id:
                              type: string
                              description: Task ID
                            data:
                              type: array
                              description: Generated lyrics list
                              items:
                                type: object
                                properties:
                                  text:
                                    type: string
                                    description: Lyrics content
                                  title:
                                    type: string
                                    description: Lyrics title
                                  status:
                                    type: string
                                    description: Generation status
                                    enum:
                                      - complete
                                      - failed
                                  error_message:
                                    type: string
                                    description: Error message, valid when status is failed
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Music Models/Suno/Lyrics Generation
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-43206404-run
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
