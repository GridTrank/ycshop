/**
 * 签名插件  
 */

const md5 = require('./md5.js');

module.exports = {

  // 参数集合
  assemble(param) {
    if (typeof (param) !== 'object' || param === null) return '';
    var key = Object.keys(param).sort();
    var str = '';
    for (var n = 0; n < key.length; n++) {
      str += key[n] + '=' + ((typeof (param[key[n]]) == 'object' ? this.assemble(param[key[n]]) : param[key[n]])) + '&';
    }

    str = str.substring(0, str.length - 1);
    console.log(str)
    return str;
  },

  // 获取签名
  getSign(param, key) {
    return (md5(this.assemble(param) + key)).toUpperCase();
  }


}