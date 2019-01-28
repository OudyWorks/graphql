const graphql = require('graphql'),
  key = require('./key'),
  Scalar = require('./Scalar'),
  getInputObjectType = require('./getInputObjectType'),
  getErrorObjectType = require('./getErrorObjectType'),
  getQueryConfig = require('./getQueryConfig'),
  getListQueryConfig = require('./getListQueryConfig'),
  getMutationObjectType = require('./getMutationObjectType'),
  getMutationConfig = require('./getMutationConfig'),
  getSubscriptionConfig = require('./getSubscriptionConfig')

module.exports = graphql

Object.assign(
  module.exports,
  {
    key,
    Scalar,
    getInputObjectType,
    getErrorObjectType,
    getQueryConfig,
    getListQueryConfig,
    getMutationObjectType,
    getMutationConfig,
    getSubscriptionConfig
  }
)