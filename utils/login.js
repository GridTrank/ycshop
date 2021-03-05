const http = require('./http.js')
const config = require('./config.js')


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

function getOpenid(){
  return new Promise((resolve,reject)=>{
    wxLogin().then((code) => {
      http.request({
        url: '/mpuser/getOpenid',
        data: {
          appid : "wx8aaa7733adaf6b38",
          secret : "c1c9ba1c953c95001b355efa7cd52210",
          code:code,
        },
        success: (res) => {
            wx.setStorageSync('sessionKey', res.data.sessionKey)
            resolve(res.data)
        },
        fail:()=>{
          reject('')
        }

      })
    })
  })
  
}
 
function shopLogin(e){
  return new Promise((resolve,reject)=>{
    getOpenid().then((res)=>{
      wx.setStorageSync('openId',res.openid)
      http.request({
        url: '/mpuser/shopLogin',
        data: {
          openId : res.openid,
          userInfo:e.detail.userInfo,
        },
        success: (res) => {

          resolve(res.data)
        },
        complete: (res) => {
          
        }
      })
  
    })
  })
 
}

function shopRegister(e){
  if(!wx.getStorageSync('openId')){
    wx.showToast({
      title: '请先登录',
    })
    return
  }
  return new Promise((resolve,reject)=>{
    let data={
      open_id:wx.getStorageSync('openId'),
      sessionKey:wx.getStorageSync('sessionKey'),
    }

    let userInfo=wx.getStorageSync('userInfo')
    let options=wx.getStorageSync('options')

    // 通过商家分享的链接进来注册
    if(options.post_share_key && !userInfo.get_share_key){
      data.get_share_key=options.post_share_key
      data.store_id=options.store_id
    }
    http.request({
      url:'/mpuser/shopRegister',
      data:data,
      success:function(res){
        console.log(res)
      }
    })
  })
}


module.exports = {
  shopLogin: shopLogin,
  shopRegister: shopRegister
}