
const http = require('../../utils/http');
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
  onLoad(options) {
    this.setData({
      order_id: options.id
    })
    this.getData();
  },

  getData() {
    let _ = this;
    wx.showLoading({
      title: '加载中...'
    })
    http.request({
      url: "/tracker/order",
       
      data: {
        order_id: this.data.order_id,
      },
      isCode:true,
      success: (res) => {
        if (res.data.code == 200) {
          var result = res.data.result;
          if (typeof result.logi == 'string') {
            result.logi = [{
              AcceptStation: '不能提供物流状态',
              AccepTime: '系统错误,请联系客服',
              state: true,
            }]
          }
          this.setData({
            logistics: result,
            order_id: this.data.order_id,
          })
        } else {
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },
  // 复制订单
  copy() {
    var _ = this;
    wx.setClipboardData({
      data: _.data.logistics.delivery[0].logi_no,
      success: function () {
      }
    })
  },
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    order_id: "",
    logistics: [],
  }
})