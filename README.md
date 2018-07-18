# rms-swagger package
`rms-swagger` 是对 third-party package `swagger-tool` 的再次封装, 为了在 expressjs 应用中实现 multiple-SwaggerDocuments 的加载机制, 做了一些优化的工作.

## 关于 middleware
### 1. swaggerValidationFailedHandler 定义
```
const DEFAULT_ERROR_CODE = '1080001';
/**
 * @description 处理 Swagger validation error 的信息.
 * @param {Object} options
 * @param {string} options.ValidationFailedCode
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
      exception.message = `[${exception.code}] -> ${exception.message}`;
    }
    next(exception);
  };
}
```

### 调用 swaggerValidationFailedHandler

```
this.app.use(swaggerValidationFailedHandler({
	ValidationFailedCode: ... // 可选项定义. 用于指定自定义 `swagger validator` 的错误代码, 默认值是: 1080000
}));
```

## 关于 load swagger 文档
### 1. 如何将自己的 swagger.yaml 文档和 controllers 目录加载到 SwaggerAPI 中.

> NOTE: 该代码并没有做完全封装, 而是开放自定义给开发者, 用于加载文档时可以按需进行自由配置.

```
const { SwaggerAPI } = require('rms-swagger');
const utils = require('rms-utils');
const path = require('path');

const defaultDocFilePath = './api/swagger.yaml';
const defaultControllers = './controllers';

module.exports = (options = {}) => {
  const {
    docFilePath = defaultDocFilePath,
    controllers = defaultControllers,
  } = options;
  const swaggerAPI = new SwaggerAPI({
    document: utils.yaml.load({
      filePath: path.join(__dirname, docFilePath),
    }),
    controllers: path.join(__dirname, controllers),
  });
  return {
    load: async (loadOptions = {}) => {
      const { validator = {}, router = {}, swaggerUI } = loadOptions;
      const middleware = await swaggerAPI.load({
        config: {
          validator,
          router,
          swaggerUI,
        },
      });
      return middleware;
    },
  };
};

```

### 2. Express.js app.use 加载 swagger API 文档
```
app.use(await swaggerAPIFileManagementSystem.load({
  swaggerUI: {
    swaggerUi: '/fileManagementSystem/docs',
    apiDocs: '/fileManagementSystem/api-docs',
  },
}));

```


