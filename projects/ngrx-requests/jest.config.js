module.exports = {
  "globals": {
    "ts-jest": {
      "tsConfig": '<rootDir>/projects/ngrx-requests/tsconfig.spec.json',
      "stringifyContentPathRegex": '\\.html$',
      "astTransformers": [require.resolve('jest-preset-angular/InlineHtmlStripStylesTransformer')],
      "diagnostics": { "ignoreCodes": [151001] }
    }
  },
  "preset": "jest-preset-angular",
  "transform": {
    '^.+\\.(ts|html)$': 'ts-jest',
    "^.+\\.js$": "babel-jest"
  }
}
