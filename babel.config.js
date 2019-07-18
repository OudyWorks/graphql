module.exports = {
  ignore: [
    './node_modules',
    './Entity'
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
}