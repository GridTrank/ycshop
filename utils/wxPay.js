const http = require('./http.js');
const getAppConfig = require('./config.js').wxConfig;
// 微信下单地址
const appID = getAppConfig['appid'];			// appID
const signType = "MD5";				    				// 签名类型
const payMethod = 'wxprogrampay';         // 支付方式

module.exports = {
  // 获取支付参数 - 函数
  getPayParam(id,cb, bool) {
    let self = this;
    console.log(wx.getStorageSync('userInfo'))
    http.request({
      url: '/paycenter/dopayment',
       
      data: {
        payment: {
          "order_id": id,
          "openid": wx.getStorageSync('userInfo').openid,
          "def_pay": {
            "pay_app_id": payMethod
          }
        }
      },
      isCode:true,
      success: res => {
        wx.hideNavigationBarLoading();
        if (res.data.code == 400031 && bool) return cb && cb(res.data.msg); //wx.navigateTo({ url: '/pages/order/index' });
        if(res.data.code == 200){
          let wxpay = res.data.result.wxpay;
          wx.requestPayment({
            appId: wxpay.appId,
            timeStamp: wxpay.timeStamp.toString(),
            nonceStr: wxpay.nonceStr,
            package: wxpay.package,
            signType: wxpay.signType,
            paySign: wxpay.paySign,
            success: res => {
              // 支付成功
              if (typeof cb === 'function' && !bool) return cb({ msg: 'pay:ok', delay: true });
              setTimeout(() => {
                wx.redirectTo({ url: '/pages/payBox/index?id=' + id + '&type=1&delay=true' })
              }, 300);
            },
            fail: res => {
              // 取消支付

              let isCancel = res.errMsg == 'requestPayment:fail cancel' ? true : false;

              if (typeof cb === 'function' && !bool) return cb({ msg: isCancel ? 'pay:cancel' : 'pay:err', delay: false });
              setTimeout(() => {
                wx.redirectTo({ url: '/pages/payBox/index?id=' + id + '&type=1&delay=true' })
              }, 300);
            }
          })
        }else{
          if (res.data.code == 400034) {
            cb({ msg: 'pay:paid', delay: true})
          }
         
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }
      }
    })
  },


  
}	
