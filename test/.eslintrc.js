module.exports = {
  plugins: [ 'metafizzy' ],
  extends: 'plugin:metafizzy/node',
  globals: {
    Promise: 'readonly',
  },
  rules: {
    radix: [ 'error', 'as-needed' ],
  },
};
