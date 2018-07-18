const swaggerTools = require('swagger-tools');
const _ = require('lodash');
const Promise = require('bluebird');

/**
 * @private _loadSwaggerMiddleware
 * @description 该方法用于加载基于 "Swagger-Tools" 模块的 expressjs 中间件定义. 目前,
 * 是按默认方式加载中间件.
 * @param {object} options
 * @param {object} options.validator
 * @param {object} options.router
 * @param {object} options.swaggerUI
 */
async function loadSwaggerMiddleware(options = {}) {
  const { document } = this;
  const {
    validator,
    router,
    swaggerUI,
    swaggerSecurity,
  } = options;
  return new Promise((resolve, reject) => {
    if (_.isUndefined(document)) {
      return reject(new Error('Swagger documentation should be supported.'));
    }
    try {
      /**
       * 依据 Swagger Document 加载基于 ExpressJs 的 swagger API 路由模块.
       * 以下代码模块可以替换, 依据使用的模块不同加载方式不同, 使用的方式不同.
       */
      return swaggerTools.initializeMiddleware(document, (middleware) => {
        const collections = [];
        /**
         * Interpret Swagger resources and attach metadata to request - must be
         * first in swagger-tools middleware chain
         */
        collections.push(middleware.swaggerMetadata());
        /**
         * Serve the swagger Security
         */
        if (swaggerSecurity) {
          collections.push(middleware.swaggerSecurity(swaggerSecurity));
        }
        /**
         * Route validated requests to appropriate controller
         */
        if (router) {
          collections.push(middleware.swaggerRouter(router));
        }
        /**
         * Serve the Swagger documents and Swagger UI
         */
        if (swaggerUI) {
          collections.push(middleware.swaggerUi(swaggerUI));
        }
        /**
         * Validate Swagger requests
         */
        if (validator) {
          collections.push(middleware.swaggerValidator());
        }
        resolve(collections);
      });
    } catch (err) {
      return reject(err);
    }
  });
}

/**
 * 该模块是接入第三方 swagger module 预留, 由于不同的 swagger node module 都有不同的
 * 解决方案. 根据需求可实现第三方包替换的功能. 统一了 Swagger module 加载的入口. 目前暂且
 * 支持了 "Swagger Tools".
 */

class SwaggerAPI {
  /**
   * @param {object} options
   * @param {string} options.document - swagger document API
   * @param {string} options.document.document -  - swagger document
   * @param {string} options.document.controllers -  - swagger document API controllers
   */
  constructor(options = {}) {
    const { document, controllers } = options;
    this.document = document;
    this.controllers = controllers;
  }

  /**
   * @method load
   * @description 该方法是用于加载 expressjs 中间件的统一接口方法. 目前, 内部提供了基于
   * swagger-tools 第三方模块的 middleware 加载方式.
   * NOTICE: 以下参数需要在 Swagger Tool 官方文档中查看其使用方法.
   * @param {object} options
   * @param {object} options.config
   * @param {object} options.config.validator - swagger-tools validator 配置选项
   * @param {object} options.config.router - swagger-tools router 配置选项
   * @param {object} options.config.swaggerUI - swagger-tools swaggerUI 配置选项
   * @param {object} options.config.swaggerUI.swaggerUi - swagger ui path 配置信息
   * @param {object} options.config.swaggerUI.apiDocs - swagger api docs path 配置信息
   * @return {*}
   */
  async load(options = {}) {
    const { config } = options;
    const {
      validator, router, swaggerUI, swaggerSecurity,
    } = config;
    router.controllers = this.controllers;

    const collections = await loadSwaggerMiddleware.call(this, {
      validator,
      router,
      swaggerUI,
      swaggerSecurity,
    });

    return collections;
  }

  static isValidationException(exception) {
    return _.has(exception, 'failedValidation');
  }
}


module.exports = SwaggerAPI;
