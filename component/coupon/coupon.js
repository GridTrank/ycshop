const http = require("../../utils/http.js");
import {
  formatTime
} from '../../utils/util.js';
Component({
  properties: {
    pageName: {
      type: String,
      value: 'list'
    },
    order: {
      type: Object
    },
  },

  data: {
    userInfo: wx.getStorageSync('userInfo'),
    page: 1,
    states: {
      1: {
        class: "",
        status: 1,
        name: '未使用'
      },
      2: {
        class: "gray",
        status: 2,
        name: '已使用'
      },
      3: {
        class: "gray",
        status: 3,
        name: '已失效'
      },
    },
    couponState: [{
      page: 1,
      load: true,
      coupon: []
    }, {
      page: 1,
      load: true,
      coupon: []
    }, {
      page: 1,
      load: true,
      coupon: []
    }],

    isTab: 0,
    inputValue: "",
    tabItem: ["未使用", "已使用", "已失效"],
    sNoData: {
      url: "https://s1.miniso.cn/bsimg/ec/public/images/f3/b7/f3b7dc5a8fddab547ab73ba53f5ffd55.png",
      text: "暂无优惠券"
    }
  },
  methods: {
    getData() {
      let _ = this;
      if (!_.data.couponState[_.data.isTab].load) return;
      wx.showLoading({
        title: '加载中...'
      })

      wx.showNavigationBarLoading();
      var url = '/member/coupon';
      var data = {
        status: _.data.isTab + 1,
        page: _.data.couponState[_.data.isTab].page
      }
      if (this.data.pageName == 'order') {
        url = '/cart/coupon';
        data = {
          "page": _.data.couponState[_.data.isTab].page,
          "selectCoupon": _.data.order.memc_code,
          "isfastbuy": _.data.order.is_fastbuy
        }
      }
      http.request({
        url: url,
        data: data,
        success: function (result) {
          wx.hideLoading()
          wx.hideNavigationBarLoading();

          _.data.couponState[_.data.isTab].page++;
          _.data.couponState[_.data.isTab].coupon = _.data.couponState[_.data.isTab].coupon.concat(result.coupons || []),
            _.setData({
              couponState: _.data.couponState,
            });
          if (_.data.couponState[_.data.isTab].coupon.length >= result.counts) {
            _.data.couponState[_.data.isTab].load = false;
          }
          console.info(_.data.couponState)


        },
        fail: function () {
          wx.hideNavigationBarLoading();
        }
      });
    },
    /**
     * 返回
     */
    back() {
      let _ = this;

      http.request({
        url: '/cart/remove_coupon',
        data: {
          "is_fastbuy": _.data.order.is_fastbuy,
          "addr_id": _.data.order.address_id
        },
        success: function (result) {

          wx.setStorage({
            key: 'cpns',
            data: {
              cpn: {},
              total: {
                freight_fee: result.freight_fee,
                favourable_total: result.favourable_total,
                order_total: result.order_total,
                md5_cart_info: result.md5_cart_info,
              },
              cpn_number: _.data.couponState[_.data.isTab].coupon.length,
              gift_list: result.gift_list
            },
            success() {
              wx.navigateBack();
            }
          })

          wx.hideNavigationBarLoading();

        },
      })
    },

    /**
     * tab点击
     */
    isTabfun: function (e) {
      if (this.data.isTab == e.target.dataset.number) return;
      this.setData({
        isTab: e.target.dataset.number,
      });
      this.getData();
    },

    /**
     * button兑换券码判断 提示
     */
    getExchange: function (e) {
      let v = this.data.inputValue;
      let _ = this;
      if (v == "") return;

      http.request({
        url: "/member/exchange_coupon",
        data: {
          coupon_code: v
        },
        success: function (result) {

          wx.showToast({
            title: '兑换成功',
            icon: "none"
          })
          _.data.couponState[0] = {
            page: 1,
            load: true,
            coupon: []
          }
          _.getData();

        }
      });

    },
    /**
     * 点击选择优惠券
     */
    selectCoupon(e) {
      if (this.data.pageName != 'order') return;

      // 订单确认选择优惠劵
      let index = e.detail;

      let _ = this;
      wx.showNavigationBarLoading();

      http.request({
        url: '/cart/add',
        data: {
          "obj_type": "coupon",
          "coupon": _.data.couponState[_.data.isTab].coupon[index].memc_code,
          "is_fastbuy": _.data.order.is_fastbuy,
          "addr_id": _.data.order.address_id,
          zk_ref: wx.getStorageSync('userInfo').is_zhuanke ? wx.getStorageSync('userInfo').member_id : getApp().globalData.zk_ref || ''
        },
        success: function (result) {
            wx.setStorage({
              key: 'cpns',
              data: {
                cpn: _.data.couponState[_.data.isTab].coupon[index],
                total: {
                  freight_fee: result.freight_fee,
                  favourable_total: result.favourable_total,
                  order_total: result.order_total,
                  md5_cart_info: result.md5_cart_info,
                },
                gift_list: result.gift_list,
                cpn_number: _.data.couponState[_.data.isTab].coupon.length
              },
              success() {
                wx.navigateBack();
              }
            })


          wx.hideNavigationBarLoading();
        },
        complete: function () {
          wx.hideNavigationBarLoading()
        }
      })
    },
    /**
     * 获取输入框优惠券码
     */
    bindKeyInput: function (e) {
      this.setData({
        inputValue: e.detail.value
      });
    },

    /**
     * 滚动加载
     */
    scroll(e) {
      this.getData();
    }
  },
  ready() {

    this.getData();

  }
})