const { TRANSLATE_LANGUAGES } = require("../constants");

function getCode(desiredLang) {
  if (!desiredLang) {
      return false;
  }
  desiredLang = desiredLang.toLowerCase();

  if (TRANSLATE_LANGUAGES[desiredLang]) {
      return desiredLang;
  }

  var keys = Object.keys(TRANSLATE_LANGUAGES).filter(function (key) {
      if (typeof TRANSLATE_LANGUAGES[key] !== 'string') {
          return false;
      }

      return TRANSLATE_LANGUAGES[key].toLowerCase() === desiredLang;
  });

  return keys[0] || false;
}

module.exports.isSupported = function (desiredLang) {
  return Boolean(getCode(desiredLang));
}