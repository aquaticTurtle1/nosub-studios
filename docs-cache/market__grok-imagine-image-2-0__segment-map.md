# Grok Imagine Image 2.0 Segment Map

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
      summary: Grok Imagine Image 2.0 Segment Map
      deprecated: false
      description: >-
        ## Create Task



        <Card title="Get Task Detail" icon="lucide-search"
        href="/market/common/get-task-detail">
          After submitting a task, use the unified task detail endpoint to check progress and retrieve results
        </Card>


        ::: tip[]

        In production, we recommend using the `callBackUrl` parameter to receive
        task completion notifications instead of polling task status
        continuously.

        :::


        :::tip

        This endpoint is free.

        :::


        ## Related Resources


        <CardGroup cols={2}>
          <Card title="Model Market" icon="lucide-store" href="/market/quickstart">
            Browse all available models and capabilities
          </Card>
          <Card title="Common API" icon="lucide-cog" href="/common-api/get-account-credits">
            View account credits and usage
          </Card>
        </CardGroup>
      operationId: grok-imagine-image-2-segment-map
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
                - input
              properties:
                model:
                  type: string
                  enum:
                    - grok-imagine-image-2-0/segment-map
                  default: grok-imagine-image-2-0/segment-map
                  description: >-
                    The model name used for generation. This field is required.
                    This endpoint must use the
                    `grok-imagine-image-2-0/segment-map` model.
                  examples:
                    - grok-imagine-image-2-0/segment-map
                callBackUrl:
                  type: string
                  format: uri
                  description: >-
                    Callback URL for task completion notifications. Optional
                    parameter. If provided, the system will send a POST request
                    to this URL when the task completes, whether it succeeds or
                    fails. If omitted, no callback notification will be sent.
                  examples:
                    - https://your-domain.com/api/callback
                input:
                  description: Input parameters for the segment map task.
                  oneOf:
                    - title: task_id
                      type: object
                      required:
                        - task_id
                      properties:
                        task_id:
                          type: string
                          minLength: 1
                          description: 'The ID of an existing task. Required. '
                          examples:
                            - task_grok_imagine_1765180586443
                      x-apidog-orders:
                        - task_id
                      x-apidog-ignore-properties: []
                    - title: image_url
                      type: object
                      required:
                        - image_url
                      properties:
                        image_url:
                          type: string
                          format: uri
                          description: The URL of the reference image.
                      x-apidog-orders:
                        - image_url
                      x-apidog-ignore-properties: []
              x-apidog-orders:
                - model
                - callBackUrl
                - input
              x-apidog-ignore-properties: []
            example:
              model: grok-imagine-image-2-0/segment-map
              callBackUrl: https://your-domain.com/api/callback
              input:
                task_id: task_grok_imagine_1765180586443
      responses:
        '200':
          description: Request successful
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/response%20not%20with%20recordId'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          taskId:
                            type: string
                            description: Task ID used to query task status and results.
                            examples:
                              - task_grok_segment_map_1765180586443
                        x-apidog-orders:
                          - taskId
                        x-apidog-ignore-properties: []
                    x-apidog-orders:
                      - data
                    x-apidog-ignore-properties: []
              example:
                code: 200
                msg: success
                data:
                  taskId: task_grok_segment_map_1765180586443
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
        onTaskCompleted:
          '{$request.body#/callBackUrl}':
            post:
              summary: Segment Map Task Completion Callback
              description: Sent when the task succeeds or fails.
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
                            200: success. 501: failure; see data.failCode and
                            data.failMsg.
                          enum:
                            - 200
                            - 501
                          example: 200
                        msg:
                          type: string
                          description: Callback status message.
                          example: Playground task completed successfully.
                        data:
                          type: object
                          description: >-
                            Task completion data returned by the segment map
                            task.
                          properties:
                            completeTime:
                              type: integer
                              format: int64
                              description: >-
                                Task completion time, represented as a Unix
                                timestamp in milliseconds.
                              example: 1786701857096
                            costTime:
                              type: integer
                              description: >-
                                Processing time in seconds. Present on both
                                success and failure callbacks.
                              example: 39
                            createTime:
                              type: integer
                              format: int64
                              description: >-
                                Task creation time, represented as a Unix
                                timestamp in milliseconds.
                              example: 1786701799000
                            creditsConsumed:
                              type: number
                              format: double
                              description: >-
                                Credits consumed by the task; 0 for failed
                                tasks.
                              example: 0
                            model:
                              type: string
                              description: The model used for the task.
                              enum:
                                - grok-imagine-image-2-0/segment-map
                              example: grok-imagine-image-2-0/segment-map
                            param:
                              type: string
                              description: >-
                                JSON string containing the parameters submitted
                                when creating the task.
                              example: >-
                                {"input":"{\"task_id\":\"8507949ab5358de2262c3f351f12c7df\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine-image-2-0/segment-map"}
                            resultJson:
                              type: string
                              description: >-
                                JSON string containing the segment map result.
                                The parsed result contains
                                `resultObject.segments_count` and the
                                `resultObject.segments` array. Present only when
                                state is success.
                              example: >-
                                {"resultObject":{"segments_count":11,"segments":[{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_0.png","name":"golden
                                retriever","index":0},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_1.png","name":"dog
                                tongue","index":1},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_2.png","name":"dog
                                nose","index":2},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_3.png","name":"dog
                                eyes","index":3},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_4.png","name":"dog
                                eyes","index":4},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_5.png","name":"dog
                                ears","index":5},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_6.png","name":"dog
                                ears","index":6},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_7.png","name":"dog
                                fur","index":7},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_8.png","name":"green
                                grass","index":8},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_9.png","name":"green
                                grass","index":9},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_10.png","name":"blurred
                                trees","index":10}]}}
                            state:
                              type: string
                              description: Terminal task state.
                              enum:
                                - success
                                - fail
                              example: success
                            taskId:
                              type: string
                              description: The unique task identifier.
                              example: a8584a5b29a6188957b923b47571a278
                            updateTime:
                              type: integer
                              format: int64
                              description: >-
                                Use completeTime as the completion time;
                                updateTime may equal createTime.
                              example: 1786701811000
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
                            taskId: a8584a5b29a6188957b923b47571a278
                            model: grok-imagine-image-2-0/segment-map
                            state: success
                            param: >-
                              {"input":"{\"task_id\":\"8507949ab5358de2262c3f351f12c7df\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine-image-2-0/segment-map"}
                            resultJson: >-
                              {"resultObject":{"segments_count":11,"segments":[{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_0.png","name":"golden
                              retriever","index":0},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_1.png","name":"dog
                              tongue","index":1},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_2.png","name":"dog
                              nose","index":2},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_3.png","name":"dog
                              eyes","index":3},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_4.png","name":"dog
                              eyes","index":4},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_5.png","name":"dog
                              ears","index":5},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_6.png","name":"dog
                              ears","index":6},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_7.png","name":"dog
                              fur","index":7},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_8.png","name":"green
                              grass","index":8},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_9.png","name":"green
                              grass","index":9},{"maskUrl":"https://tempfile.aiquickdraw.com/ggg/dd9fa155-2f7e-46fc-82f7-089144b43cd5_seg_10.png","name":"blurred
                              trees","index":10}]}}
                            costTime: 39
                            createTime: 1786701799000
                            completeTime: 1786701857096
                            updateTime: 1786701811000
                            creditsConsumed: 0
                      failure:
                        summary: Task failed
                        value:
                          code: 501
                          msg: Playground task failed.
                          data:
                            taskId: a8584a5b29a6188957b923b47571a278
                            model: grok-imagine-image-2-0/segment-map
                            state: fail
                            param: >-
                              {"input":"{\"task_id\":\"8507949ab5358de2262c3f351f12c7df\"}","callBackUrl":"https://your-domain.com/api/callback","model":"grok-imagine-image-2-0/segment-map"}
                            costTime: 39
                            createTime: 1786701799000
                            completeTime: 1786701857096
                            updateTime: 1786701811000
                            creditsConsumed: 0
                            failCode: '500'
                            failMsg: <error detail>
              responses:
                '200':
                  description: Callback received successfully
      x-apidog-folder: docs/en/Market/Image    Models/Grok Imagine
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-41732585-run
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
