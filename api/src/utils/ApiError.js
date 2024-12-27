class ApiError extends Error {
  constructor(
    statusCode,
    message,
    errors=[],
    stack = ""
    ){
    super(message);
    this.erros = errors;
    this.data = null;
    this.statusCode = statusCode;
    this.message = message;
    this.success=false;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
    }
    }
    export {ApiError};