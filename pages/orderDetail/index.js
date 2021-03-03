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
  onShow() {
    

    wx.setNavigationBarTitle({ title: "订单详情" });
    this.getData();
    this.setData({
      payState: true,
    });
  },

  onLoad(options) {
    this.setData({
      order_id: options.id,
      type:options.type,
      order_type:options.order_type
    })
  },
  // 复制订单
  copy(e) {
    var _ = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.id,
    })
  },
  formatDate(now) {
    var date = new Date(now * 1000),
      Y = date.getFullYear() + '-',
      M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
      D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ',
      h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
      m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':',
      s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    return (Y + M + D + h + m + s);
  },
  togglePopup() {
    this.setData({
      'isHide': !this.data.isHide,
    })
  },
  makePhoneCall() {
    let _ = this;
    wx.makePhoneCall({
      phoneNumber: _.data.tel //仅为示例，并非真实的电话号码
    })
  },
  getData: function () {
    wx.showNavigationBarLoading({
      title: "订单详情"
    });
    wx.showLoading({
      title: '加载中...'
    })
    let _ = this;
    var url='/order/orderdetail';
    if(_.data.type == 'income'){
      url = '/waybill/orderdetail'
    }
    http.request({
      url: url,
      
      data: {
        order_id: _.data.order_id,
        order_type:_.data.order_type,
      },
      isCode:true,
      success: (res) => {
        wx.hideNavigationBarLoading();
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          let result = res.data.result;
          result.createDate = this.formatDate(result.createtime);
          _.setData({
            orderData: result
          });

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
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },
  toafterSale() {
    wx.navigateTo({
      url: "/pages/web/index?type=1"
    })
  },
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    payState: true,
    isHide: false,
    tel: '4009965022',
    order_id: '',
    orderData: {},
    type:''
  }
})