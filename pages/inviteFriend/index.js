// pages/inviteFriend/index.js
const config = require('../../utils/config');
const http = require('../../utils/http');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {
      code: {},
      poster_image: '',
    },
    userInfo: wx.getStorageSync("userInfo"),
    config: config,
    token: wx.getStorageSync("token"),

    info: {},

    visible: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
    this.setData({
      userInfo: wx.getStorageSync("userInfo"),
      token: wx.getStorageSync("token"),
    })
    this.getImageInfo(this.data.config.Domain + '/person/make_product_code?token=' + this.data.token + '&zk=' + this.data.userInfo.member_id)
  },
  getData() {
    http.request({
      url: '/info/get_info',
      success: (result) => {
        this.setData({
          info: result,
          'detail.poster_image': result.poster_image
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  togglePopup() {
    this.setData({
      visible: !this.data.visible,
    })
  },
  getImageInfo(url, name) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: (res) => {
          this.setData({
            'detail.code': res
          })
        },
        fail: (res) => {
          reject({
            url,
            res,
            name
          })
        },
      })
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var state = this.data.info.share_jump.indexOf('?') != -1 ? '&' : '?';
    return {
      title: this.data.info.share_title || '名创优选-让人惊喜的好物平台',
      path: this.data.info.share_jump ? (this.data.info.share_jump +state+'zk='+ this.data.userInfo.member_id) : 'pages/index/index?zk='+ this.data.userInfo.member_id,
      imageUrl: this.data.info.share_image || 'https://s1.miniso.cn/bsimg/ec/public/images/f4/c5/f4c5cc341829362cb484ff209279dfde.jpg?x-oss-process=style/high'
    }
  }
})