# File Stream Upload

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/file-stream-upload:
    post:
      summary: File Stream Upload
      deprecated: false
      description: >-
        :::info[]
          Uploaded files are deleted 24 hours after upload.
        :::


        ### Features


        * Supports binary stream upload for multiple file types

        * Suitable for large file uploads with high transmission efficiency

        * Automatically identifies MIME types

        * Supports custom filenames or auto-generation (identical filenames will
        overwrite old files, potential caching delays may occur)

        * Returns complete file information and download links

        * Protected by API Key authentication


        ### Usage Recommendations


        * Recommended for large files (>10MB)

        * Supports multiple formats: images, videos, documents, etc.

        * Avoids the ~33% size overhead of Base64 encoding.


        ### Example Command


        ```bash  theme={null}

        curl -X POST https://kieai.redpandaai.co/api/file-stream-upload \
          -H "Authorization: Bearer YOUR_API_KEY" \
          -F "file=@/path/to/your-file.jpg" \
          -F "uploadPath=images/user-uploads" \
          -F "fileName=custom-name.jpg"
        ```
      operationId: upload-file-stream
      tags:
        - docs/en/File Upload API
      parameters: []
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: File to upload (binary data)
                  example: ''
                uploadPath:
                  type: string
                  description: File upload path, without leading or trailing slashes
                  examples:
                    - images/user-uploads
                  example: images/user-uploads
                fileName:
                  type: string
                  description: >-
                    File name (optional), including file extension. If not
                    provided, a random file name will be generated. If the same
                    file name is uploaded again, the old file will be
                    overwritten, but changes may not take effect immediately due
                    to caching
                  examples:
                    - my-image.jpg
                  example: my-image.jpg
              required:
                - file
                - uploadPath
            examples: {}
      responses:
        '200':
          description: File uploaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    description: Whether the request was successful
                  code:
                    type: integer
                    enum:
                      - 200
                      - 400
                      - 401
                      - 405
                      - 500
                    description: >-
                      Response Status Code


                      | Code | Description |

                      |------|-------------|

                      | 200 | Success - Request has been processed successfully
                      |

                      | 400 | Bad Request - Request parameters are incorrect or
                      missing required parameters |

                      | 401 | Unauthorized - Authentication credentials are
                      missing or invalid |

                      | 405 | Method Not Allowed - Request method is not
                      supported |

                      | 500 | Server Error - An unexpected error occurred while
                      processing the request |
                  msg:
                    type: string
                    description: Response message
                    examples:
                      - File uploaded successfully
                  data:
                    $ref: '#/components/schemas/FileUploadResult'
                required:
                  - success
                  - code
                  - msg
                  - data
                x-apidog-orders:
                  - success
                  - code
                  - msg
                  - data
                x-apidog-ignore-properties: []
              example:
                success: true
                code: 200
                msg: File uploaded successfully
                data:
                  fileName: uploaded-image.png
                  filePath: images/user-uploads/uploaded-image.png
                  downloadUrl: >-
                    https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png
                  fileSize: 154832
                  mimeType: image/png
                  uploadedAt: '2025-01-01T12:00:00.000Z'
          headers: {}
          x-apidog-name: SuccessResponse
        '400':
          description: Request parameter error
          content:
            application/json:
              schema: &ref_0
                $ref: '#/components/schemas/ApiResponse'
              example:
                success: false
                code: 400
                msg: 'Missing required parameter: uploadPath'
          headers: {}
          x-apidog-name: BadRequestError
        '401':
          description: Unauthorized access
          content:
            application/json:
              schema:
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
                    description: Response message, error description when failed
                    examples:
                      - success
                  success:
                    type: boolean
                    description: Whether the request was successful
                x-apidog-orders:
                  - code
                  - msg
                  - success
                required:
                  - success
                x-apidog-ignore-properties: []
              example:
                success: false
                code: 401
                msg: 'Authentication failed: Invalid API Key'
          headers: {}
          x-apidog-name: UnauthorizedError
        '500':
          description: Internal server error
          content:
            application/json:
              schema: *ref_0
              example:
                success: false
                code: 500
                msg: Internal server error
          headers: {}
          x-apidog-name: ServerError
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
      x-apidog-folder: docs/en/File Upload API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1184766/apis/api-28506192-run
components:
  schemas:
    FileUploadResult:
      type: object
      properties:
        fileName:
          type: string
          description: File name
          examples:
            - uploaded-image.png
        filePath:
          type: string
          description: Complete file path in storage
          examples:
            - images/user-uploads/uploaded-image.png
        downloadUrl:
          type: string
          format: uri
          description: File download URL
          examples:
            - >-
              https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png
        fileSize:
          type: integer
          description: File size in bytes
          examples:
            - 154832
        mimeType:
          type: string
          description: File MIME type
          examples:
            - image/png
        uploadedAt:
          type: string
          format: date-time
          description: Upload timestamp
          examples:
            - '2025-01-01T12:00:00.000Z'
      required:
        - fileName
        - filePath
        - downloadUrl
        - fileSize
        - mimeType
        - uploadedAt
      x-apidog-orders:
        - fileName
        - filePath
        - downloadUrl
        - fileSize
        - mimeType
        - uploadedAt
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    ApiResponse:
      type: object
      properties:
        success:
          type: boolean
          description: Whether the request was successful
        code:
          type: integer
          enum:
            - 200
            - 400
            - 401
            - 405
            - 500
          description: >-
            Response status code


            | Code | Description |

            |------|-------------|

            | 200 | Success - Request has been processed successfully |

            | 400 | Bad Request - Request parameters are incorrect or missing
            required parameters |

            | 401 | Unauthorized - Authentication credentials are missing or
            invalid |

            | 405 | Method Not Allowed - Request method is not supported |

            | 500 | Server Error - An unexpected error occurred while processing
            the request |
        msg:
          type: string
          description: Response message
          examples:
            - File uploaded successfully
      required:
        - success
        - code
        - msg
      x-apidog-orders:
        - success
        - code
        - msg
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
