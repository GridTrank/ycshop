const http = require('../../utils/http.js')
import { formatTime } from '../../utils/util.js';
Page({


  /** 
   * 转发分享
   */
  onShareAppMessage() {

    return {
      title: '名创优选-让人惊喜的好物平台',
      path: '/pages/index/index',
      imageUrl: 'https://s1.miniso.cn/bsimg/ec/public/images/4f/a5/4fa50b410a8462864c429fcc98d68e74.png'
    }
  },

  // 初始化数据
  onLoad(options) {
    this.setData({
      rule_id: options.rule_id
    });
    this.getData();

    wx.setNavigationBarTitle({ title: "赠品列表" })
  },

  getData() {
    let _ = this;
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '加载中...'
    })
    http.request({
      url: '/cart/gift',
      data: {
        "rule_id": _.data.rule_id
      },
      isCode:true,
      success: function (res) {
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          _.setData({
            rule_info: res.data.result.rule_info,
            gift_list: res.data.result.gift_list
          });
          wx.hideNavigationBarLoading();
        } else {
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        wx.hideLoading()
      },
      fail: function () {
        wx.hideLoading()
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },

  data: {
    userInfo: wx.getStorageSync('userInfo'),
    rule_id: "",         //  活动规则id
    gift_list: [],	 	    //	赠品列表
  },


})