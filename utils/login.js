const http = require('../../utils/http.js')
const config = require('../../utils/config.js')


function wxLogin(){
    return new Promise((resolve, reject) => {
        wx.login({
          success: res => {
            resolve(res.code)
          },
          fail: res => {
            reject(res)
          }
        })
    })
}
function login(e) {
    return new Promise((resolve, reject) => {
      if (new Date().getTime() - this.data.codeTime > 300000 && this.data.code) {
        wx.checkSession({
          success: () => {
            console.log('session_key 有效')
            resolve(code)
          },
          fail: () => {
            console.log('session_key 无效')
            wxLogin().then((code) => {
              resolve(code)
            })
          }
        })
      } else {
        wxLogin().then((code) => {
          resolve(this.data.code)
        })
      }

    })
}
function getOpenid(){
    wxLogin().then((code) => {
        http.request({
          url: '/mpuser/get_openid',
          data: {
            appid: 'wx8aaa7733adaf6b38',
            code: code,
          },
          success: (res) => {
            console.log('用户信息123131',res)
            this.data.userInfo = Object.assign({}, res.data.result, e.detail.userInfo);
            if (this.data.userInfo.is_bind_mobile) {
              // 已注册
              wx.setStorageSync("userInfo", this.data.userInfo)
              this.back();
            }
            this.setData({
              userInfo: this.data.userInfo
            })
          },
          complete: (res) => {
            this.data.code = '';
          }
        })
    })
}
