export interface SuccessResponse<T> {
  status: 'success'
  code: number
  message: string
  data: T
}

export interface ErrorResponse {
  status: 'error'
  code: number
  message: string
}
