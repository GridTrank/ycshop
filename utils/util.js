const http = require('./http.js');
const formatTime = date => {
  // const year = date.getFullYear()
  // const month = date.getMonth() + 1
  // const day = date.getDate()
  // const hour = date.getHours()
  // const minute = date.getMinutes()
  // const second = date.getSeconds()
  // [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')

  return date.getTime()
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 选择收货地址
//isSave 是否保存
const chooseAddress = (isSave, callback) => {
  wx.chooseAddress({
    success(res) {

      http.request({
        url: '/member/check_weixin_addr',
        data: {
          area: res.provinceName + res.cityName + res.countyName
        },
        success: function (result) {

          var arr = result;
          // if (isSave) {
          //   if (res.provinceName == '台湾省' || res.provinceName == '香港特别行政区' || res.provinceName == '澳门特别行政区') {
          //     wx.showToast({
          //       title: '暂不支持港澳台地区',
          //       icon: 'none'
          //     })
          //     return;
          //   }
          //   // 保存地址成功后跳转
          //   http.request({
          //     url: '/member/save_rec',
          //     
          //     data: {
          //       name: res.userName,
          //       mobile: res.telNumber,
          //       // mobile:"13662423038",
          //       addr: res.detailInfo,
          //       def_addr: 0,
          //       area: "mainland:" + arr[0].local_name + "/" + arr[1].local_name + "/" + arr[2].local_name + ":" + arr[2].region_id
          //     },
          //     success(result) {
          //       console.log('作霖接口返回的result',res)
          //       if (result.data.code == 200) {
          //         if (typeof (callback) === 'function') callback(res);
          //       } else {
          //         wx.showToast({
          //           title: result.data.msg,
          //           icon: 'none'
          //         })
          //       }
          //     }
          //   })
          // } else {
          res.arr = arr;
          if (typeof (callback) === 'function') callback(res);
          // }


        }
      })


    },
    fail(res) {
      console.warn('拒绝地址授权');
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.address']) {
            wx.showModal({ // 提示需要授权才可以继续访问
              title: '提示',
              content: '小程序需要您的授权地址才可以正常购买',
              success: res => {
                if (res.cancel) {
                  return;
                }
                wx.openSetting({
                  success: res => {
                    if (res.authSetting["scope.address"]) {
                      // chooseAddress(isSave, callback)
                      console.log('成功打开授权')
                    } // 成功打开授权
                    else {
                      console.log('用户再次拒绝授权')
                    } // 用户再次拒绝授权
                  },
                  fail: res => { // 调用失败，授权地址不成功
                    console.log('授权地址不成功')
                  }
                })
              }
            });
          }
        }
      })

    }
  })
};

// 日期格式化
const getFormat = function (msec) {
  let countDown = parseInt(msec / 1000);
  let mm = parseInt(countDown / 60 % 60);
  let hh = parseInt(countDown / (60 * 60) % 24);
  let dd = parseInt(countDown / (60 * 60) / 24, 10);
  let ss = parseInt(countDown % 60);
  // let h = parseInt(option.time / 3600 % 24),
  //   m = parseInt(option.time % (60 * 60) / 60),
  //   s = parseInt(option.time % (60));
  ss = ss > 9 ? ss : `0${ss}`;
  mm = mm > 9 ? mm : `0${mm}`;
  hh = hh > 9 ? hh : `0${hh}`;

  return {
    ss,
    mm,
    hh,
    dd
  };
};
const validateTel = function (tel) {
  var myreg = "^(1)[0-9]{10}$";
  myreg = new RegExp(myreg);
  return myreg.test(tel);
}
const validateIdcard = function (Idcard) {
  var myreg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  // myreg = new RegExp(myreg);
  return myreg.test(Idcard);
}
const validateEmail = function (email) {
  var myreg = '/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(/.[a-zA-Z0-9_-])+/';
  // myreg = new RegExp(myreg);
  return myreg.test(email);
}
module.exports = {
  formatTime: formatTime,
  getFormat: getFormat,
  validateTel: validateTel,
  validateIdcard: validateIdcard,
  validateEmail: validateEmail,
  chooseAddress: chooseAddress
}