const http = require('../../utils/http');
Page({
  data: {
    userInfo: {},
    inviteCode: '',
    invite: {},
    invalid: false,
    userDetail: {},
    codeDisabled: false,
    isInvite: false,
    code: '',
    codeTime: '',
    type: '',
    isjoin: false,
    wx: '',
    message: false,
    regUserInfo:''
  },
  onShow() {

  },
  onHide() {

  },
  onLoad(option) {
    if (option.type != 'invite') {
      this.login();
    } else {
      this.setData({
        type: option.type,
        wx: option.wx,
      })
    }
  },
  message(e) {
    console.log(e)
    this.setData({
      message: e.detail.value[0] || '',
    })
  },
  tip(){
    wx.showToast({
      title: '请勾选协议后重试',
      icon:"none"
    })
  },
  modalTip(e) {
    var type = e.currentTarget.dataset.type || e;
    var tip = '';
    switch (type) {
      case 'service':
        tip = '您的专属客服微信号：' + this.data.wx + ',\r\n欢迎添加客服为微信好友，索取邀请码、咨询推手计划相关问题更方便';
        break;

    }
    wx.showModal({
      title: '提示',
      content: tip,
      confirmText: '复制微信',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: this.data.wx,
            success: function (result) {
              wx.showToast({
                title: '复制成功',
                icon: 'none'
              })
            }

          })
        }
      }
    })
  },
  join() {
    http.request({
      url: '/person/join',
      isLogin: true,
      data: {
        invite_code: this.data.inviteCode,
      },
      success: (res) => {
        var userInfo = wx.getStorageSync("userInfo");
        userInfo.is_zhuanke = true;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          isjoin: true,
        })

      }
    })
  },
  clearInvite() {
    this.setData({
      invite: {},
      inviteCode: '',
      invalid: false,
      codeDisabled: false,
      isInvite: false,
    })
  },
  invite(e) {
    e.detail.value = e.detail.value.replace(/[^\w]/g, '');
    console.log(e.detail.value)
    var data = {
      inviteCode: e.detail.value
    }
    if (e.detail.value.length < 6) {
      data.invalid = false
    }
    this.setData(data)
    if (e.detail.value.length >= 6) {
      this.setData({
        codeDisabled: true,
      })
      http.request({
        url: '/record/check_invite_code',
        isCode: true,
        isLogin: true,
        data: {
          invite_code: e.detail.value
        },
        isCode: true,
        success: (res) => {

          var result = res.data.result;
          if (res.data.code == 200) {
            // 验证邀请码
            this.setData({
              invite: result,
            }, () => {
              setTimeout(() => {
                this.setData({
                  isInvite: true,
                })
              }, 800)
            })

          } else {
            this.setData({
              invalid: true,
              codeDisabled: false,
              isInvite: false,
            })
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        },
        fail: (res) => {
          this.setData({
            invalid: true,
            codeDisabled: false,
            isInvite: false
          })
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })

    }
  },
  login(e) {
    return new Promise((resolve, reject) => {
      if (new Date().getTime() - this.data.codeTime > 300000 && this.data.code) {
        wx.checkSession({
          success: () => {
            console.log('session_key 有效')
            resolve(this.data.code)
          },
          fail: () => {
            console.log('session_key 无效')
            this.wxLogin().then((code) => {
              resolve(this.data.code)
            })
          }
        })
      } else {
        this.wxLogin().then((code) => {
          resolve(this.data.code)
        })
      }


    })

  },
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          this.data.code = res.code;
          this.data.codeTime = new Date().getTime();
          console.log('res.code', res.code)
          resolve(res.code)
        },
        fail: res => {
          reject(res)
        }
      })
    })
  },
  getUserInfo(e) {
   
    var type = e.currentTarget.dataset.type;
    if (e.detail.errMsg != 'getUserInfo:ok') return;
    this.data.userDetail = e.detail;
    this.setData({
      regUserInfo:e.detail.userInfo
    })
    console.log('用户信息', e.detail)
    this.login().then((code) => {
      http.request({
        url: '/passport/get_weixin_openid',
        isLogin: true,
        isCode: true,
        data: {
          app: "zhuanke",
          appid: 'wx6a73741a2ac1122e',
          code: this.data.code,
          unionid_encryptedData: e.detail.encryptedData,
          unionid_iv: e.detail.iv,
          zk_ref: getApp().globalData.zk_ref || '',
          invite_code: this.data.inviteCode,
        },
        success: (res) => {
          console.log('用户信息',res)
          wx.setStorageSync("token", res.data.token);
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


  },
  back() {
    var pages = getCurrentPages();
    if (pages.length == 1) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    } else {
      wx.navigateBack();
    }

  },
  getPhoneNumber(e) {
    if (e.detail.errMsg != 'getPhoneNumber:ok') return;
    console.log('用户手机号', e.detail)
    http.request({
      url: "/passport/entry_phone_new",
      isLogin: true,
      data: {
        app: 'zhuanke',
        appid: 'wx6a73741a2ac1122e',
        zk_ref: getApp().globalData.zk_ref || '',
        openid: this.data.userInfo.openid,
        unionid_encryptedData: this.data.userDetail.encryptedData,
        unionid_iv: this.data.userDetail.iv,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        invite_code: this.data.inviteCode,
        regUserInfo:this.data.regUserInfo
      },
      success: (result) => {
        console.log('绑定手机',result)
        var userInfo = Object.assign({}, this.data.userInfo, result);
        wx.setStorageSync("userInfo", userInfo);
        this.back()
      }
    })
  }
})