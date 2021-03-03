const config = require('./config.js');
const signature = require('./signature.js');
const md5 = require('./md5.js');
const Domain = config.Domain;
const Sign = config.sign;
/* 记录上级路由 并传参 */
var requestUrl = [];
const routerData = () => {
  let pages = getCurrentPages() || [{
    route: 'pages/index/index'
  }];
  let p = pages[pages.length - 1].route || 'pages/index/index';
  var o = pages[pages.length - 1].options || {};
  let w = "?";
  if (Object.keys(o).length == 0) {
    getApp().globalData.route = '/' + p;
  } else {
    for (var item in o) {
      w += item + "=" + o[item] + "&";
    }
    w = w.substring(w.length - 1, 1);
    getApp().globalData.route = '/' + p + '?' + w;
  }
}

function request(obj) {
  if (wx.getStorageSync("token")) {
    ajax(obj)
  } else {
    token().then(() => {
      ajax(obj)
    })
  }

}



function token() {
  return new Promise(function (resolve, reject) {
    ajax({
      url: '/index/token',
      isCode: true,
      success: function (res) {
        wx.setStorageSync('token', res.data.token);
      },
      complete: function () {
        resolve(true);
      }
    })
  })
}
// noRequest  不需要防重复的接口
// cdn 需要cdn缓存的接口
// storage 本地缓存的接口  默认10min
function ajax(obj) {
  var data = JSON.parse(JSON.stringify(obj));
  if (obj.data == undefined) obj.data = {};
  obj.data.version = config.version;
  obj.data.source = Sign.source + (obj.data.source ? '-' + obj.data.source : (!getApp().globalData.source ? '' : ('-' + getApp().globalData.source)));
  // 防重复
  if (requestUrl.indexOf(obj.url) != -1) return;
  // 过滤不需要防重复接口
  if (!obj.noRequest) {
    requestUrl.push(obj.url);
  }
  // cdn缓存
  if (obj.cdn) {
    if (obj.data) {
      var string = ''
      for (var key in obj.data) {
        string += ('/' + key + '/' + obj.data[key]);
      }
      obj.url += string;
    }
  }
  obj.data.zk_ref=getApp().globalData.zk_ref
  obj.data.identity = Sign.identity;
  obj.data.token = wx.getStorageSync('token');
  obj.data.sign = obj.data.sign ? obj.data.sign : signature.getSign(obj.data, Sign.secret);
  if (obj.storage) {
    var res = getCache(JSON.parse(JSON.stringify(obj)));
    if (res) {
      if (obj.isCode) {
        obj.success && obj.success(res);
        return;
      } else if (res.data.code == 200) {
        obj.success && obj.success(res.data.result);
      }
    }
  }
  wx.request({
    url: Domain + obj.url,
    data: obj.data || {},
    method: obj.method || 'POST',
    header:{
      version : config.version
    },
    success: (res) => {
      if (res.data.code == 100001) {
        wx.navigateTo({
          url: '/pages/load/index',
        })
        return;
      }
      if (obj.isCode) {
        obj.success && obj.success(res);
        return;
      }

      if (res.data.code == 200) {
        obj.success && obj.success(res.data.result);
        if (obj.storage) {
          //缓存接口缓存数据
          // obj.data.url = obj.url;
          let keyObject = md5(JSON.stringify(obj.data));
          wx.setStorageSync(keyObject, {
            time: (new Date()).getTime(),
            result: res,
          });
        }
      }else {
        wx.showToast({
          title: res.data.msg,
          icon: "none"
        })
      }
    },
    fail: (res) => {
      obj.fail && obj.fail(res);
    },
    complete: (res) => {
      setTimeout(() => {
        var index = requestUrl.indexOf(data.url);
        if (index != -1) {
          requestUrl.splice(index, 1);
        }
      }, 300)
      obj.complete && obj.complete(res);
    }
  })
}

function getCache(data) {
  data.data.url = data.url;
  let keyObject = md5(JSON.stringify(data.data));
  var storageData = wx.getStorageSync(keyObject);
  if (storageData) {
    let nowTime = (new Date()).getTime();
    if (nowTime - storageData.time >= 600000) {
      return false
    } else {
      var index = requestUrl.indexOf(data.url);
      if (index != -1) {
        requestUrl.splice(index, 1);
      }
      return storageData.result;
    }
  } else {
    return false
  }
}

module.exports = {
  request: request,
  routerData: routerData
}