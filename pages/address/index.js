const http = require('../../utils/http');
import {
  formatTime
} from '../../utils/util.js';
Page({
  onShow() {
    wx.setNavigationBarTitle({
      title: "地址管理"
    });
   
  },

  onLoad(options) {
    this.getData('加载数据...');
    this.setData(options)
    wx.showNavigationBarLoading({
      title: "地址管理"
    });
  },
 
  addAddress: function () {
    if (this.data.addressData.receiver.length >= 10) {
      wx.showToast({
        title: '地址最多添加10条',
        icon: "none"
      })
      return;
    }
    this.setData({
      address:{}
    })
    this.toggleEdit()
  },
  toggleEdit(data){
    if(data){
      this.setData({
        address:data.detail
      })
    }
    this.selectComponent("#editAddress").toggleEdit()
  },
  // 获取数据
  getData(title, callback) {
    let _ = this;
    wx.showLoading({
      title: '加载中...'
    })
    http.request({
      url: '/member/receiver',
      
      data: {},
      isCode:true,
      success(res) {
        wx.hideNavigationBarLoading();
        wx.hideLoading();
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          let result = res.data.result;
          _.setData({
            pageLoad: true,
            addressData: result
          })
          typeof callback === 'function' ? callback() : "";
        } else {
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }

      },
      fail: function () {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },
  data: {
    page:"",
    userInfo: wx.getStorageSync('userInfo'),
    isLock: false,
    pageLoad: false, //页面加在状态
    is_fastbuy: "0",
    addressData: {
      receiver: [],
    },
    notFound: {
      url: 'https://s1.miniso.cn/bsimg/ec/public/images/61/6d/616deb73f28f5a09a8fa2c74df3b5f18.png',
      text: '还没有收货地址哦～~',
      address: true,
    },


  },



  /** 
   * 转发分享
   */
  onShareAppMessage() {

    return {
      title: '名创优选-让人惊喜的好物平台',
      path: '/pages/index/index',
      imageUrl: 'https://s1.miniso.cn/bsimg/ec/public/images/4f/a5/4fa50b410a8462864c429fcc98d68e74.png'
    }
  }
})