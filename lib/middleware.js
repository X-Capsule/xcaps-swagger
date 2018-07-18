const SwaggerAPI = require('./swaggerAPI');

const DEFAULT_ERROR_CODE = 'SWAGGER_VALIDATION_ERROR';
/**
 * @description 处理 Swagger validation error 的信息.
 * @param {Object} options
 * @param {string} [options.ValidationFailedCode]
 * @return {function(*, *, *, *)}
 */
function swaggerValidationFailedHandler(options = {}) {
  const { ValidationFailedCode = DEFAULT_ERROR_CODE } = options;
  /**
   * @description 处理 Swagger validation error 的信息.
   * @param err
   * @param req
   * @param res
   * @param next
   */
  return (err, req, res, next) => {
    const exception = err;
    // 检测 swagger Exception
    if (SwaggerAPI.isValidationException(exception)) {
      exception.code = ValidationFailedCode;
      exception.message = `${exception.message} <错误代码: ${exception.code}>`;
    }
    next(exception);
  };
}

module.exports = {
  swaggerValidationFailedHandler,
};
