const base = {
  env: {
    node: true,
    mocha: true,
  },
  extends: 'airbnb-base',
}

// 如果要修改原airbnb中规则，请在下面的rules中添加对应规则进行覆盖
const modifyAirbnb = {
  rules: {
    'no-unused-vars': ['error', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
    'no-underscore-dangle': ['error', {
      allow: [],
      allowAfterThis: true,
      allowAfterSuper: false,
      enforceInMethodNames: false,
    }],
  },
}


const rules = Object.assign({}, modifyAirbnb.rules);


module.exports = Object.assign({}, base, { rules: rules });