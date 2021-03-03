const http = require("../../utils/http.js");
import {
  formatTime
} from '../../utils/util.js';
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

  onLoad(e) {
    this.getData({
      page: 1,
      id: 0
    });
    wx.setNavigationBarTitle({
      title: "优惠券"
    })
  },


  getData(args) {
    let _ = this;
    if (_.data.isOver) return;
    if (_.data.isLoad) return;
    wx.showLoading({
      title: '加载中...'
    })
    _.data.isLoad = true;

    wx.showNavigationBarLoading();

    http.request({
      url: "/member/coupon",
      data: {
        status: args.id + 1,
        page: args.page
      },
      isCode:true,
      success: function(res) {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        if (res.data.code == 200) {
          _.setData({
            status: res.data.result.status,
            mianItem: res.data.result.coupons == null ?
              _.data.mianItem : _.data.mianItem.concat(res.data.result.coupons),
            isTab: args.id,
            page: args.page,
            isLoad: false,
            Coupons: res.data.result.counts
          });

          if (_.data.mianItem.length >= res.data.result.counts)
            _.data.isOver = true;
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          _.selectComponent('#requestPage').updata(false);
          _.data.isLoad = false;
        }

      },
      fail: function() {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
        _.data.isLoad = false;
      }
    });
  },

  getSildeData(args) {
    let _ = this;
    if (_.data.isOver) return;
    if (_.data.isLoad) return;

    _.data.isLoad = true;

    wx.showNavigationBarLoading();

    http.request({
      url: "/member/coupon",
      data: {
        status: args.id + 1,
        page: args.page
      },
      isCode:true,
      success: function(res) {
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          _.setData({
            status: res.data.result.status,
            mianItem: res.data.result.coupons == null ?
              _.data.mianItem : res.data.result.coupons,
            isTab: args.id,
            page: args.page,
            isLoad: false,
            Coupons: res.data.result.counts
          });

          if (_.data.mianItem.length >= res.data.result.counts)
            _.data.isOver = true;
        } else {
          _.selectComponent('#requestPage').updata(false);
          _.data.isLoad = false;
        }
        wx.hideNavigationBarLoading();
      },
      fail: function() {
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
        _.data.isLoad = false;
      }
    });
  },

  data: {
    userInfo: wx.getStorageSync('userInfo'),
    isUser: true,
    page: 1,
    isLoad: false,
    isOver: false,

    mianItem: [],
    status: {},

    states: {
      1: "",
      2: "use",
      4: "none",
      3: "timeout"
    },
    isTab: 0,
    selectId: "",
    selectItem: [],
    isdescUp: null,
    inputValue: "",
    tabItem: ["未使用", "已使用", "已失效"],
    Coupons: 0, //优惠列表数组

    sNoData: {
      url: "../../images/coupon-none.png",
      text: "暂无优惠券"
    }
  },

  /**
   * tab点击
   */
  isTabfun: function(e) {
    if (this.data.isTab == e.target.dataset.number) return;
    this.setData({
      mianItem: [],
      isTab: e.target.dataset.number,
      isOver: false
    });
    this.getData({
      id: e.target.dataset.number,
      page: 1
    });
  },



  /**
   * button兑换券码判断 提示
   */
  getExchange: function(e) {
    let v = this.data.inputValue;
    let _ = this;
    if (v == "") return;

    http.request({
      url: "/member/exchange_coupon",
      data: {
        coupon_code: v
      },
      success: function(res) {

          wx.showToast({
            title: '兑换成功',
            icon: "none"
          })
          _.setData({
            isOver: false,
          });
          _.getSildeData({
            id: _.data.isTab,
            page: 1
          });
        
      }
    });

  },

  /**
   * 获取输入框优惠券码
   */
  bindKeyInput: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  /**
   * 滚动加载
   */
  scroll(e) {
    let numPage = this.data.page + 1;
    this.getData({
      id: this.data.isTab,
      page: numPage
    });
  }
});