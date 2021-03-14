// pages/cart/index.js
const http = require("../../utils/http.js");

const {
  getFormat,
  formatTime
} = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    isCouponTip: false,
    getCode: false,
    codeState: '免费获取',
    requestState: true,
    right: 0,
    startRight: 0,
    isOpen: 0,
    clientX: 0,
    openId: "",
    isSelectAll: false,
    isLogin: false,
    cart_number: 0, //	购物车选中数量
    cart_total: "0.00", // 	购物车选中小计
    subtotal: "",
    discount_amount: "",
    promotion_detail: [],
    promo_info: {
      rule_id: 0,
      rule_name: ""
    }, //	免邮促销信息
    favourable_warn: [], // 	优惠提醒
    cart_list: [], //	购物车列表（请用该字段，判断有无购物车商品的页面展示）
    prepare_list: [], //预售列表
    dataTime: {}, //预售倒计时时间
    timer: {},
    isPartOrder: false, //分单弹窗
    partOrderVal: "",
    orderData: {
      cart_list: {
        num: 0,
        items: []
      },
      prepare: {}
    }, //分单信息数据
    gift_list: [], //	赠品列表
    abgoods_list: [], //换购列表
    unavailable: [], //	失效商品列表
    is_all: 0, //  是否全选
    sNoData: {
      url: "https://s1.miniso.cn/bsimg/ec/public/images/74/00/7400fcf52ff9850b9929fda2cffe63c1.png",
      text: "去添加点什么吧"
    },
    explain: {
      visiblePopup: false,
    },
    userRefresh: {},
  },

  // 倒计时
  timeDown: function (option) {
    // this.data.timeArr[id] = getFormat(this.data.timestamp[id]);
    let d = parseInt(option.time / 3600 / 24),
      h = parseInt(option.time / 3600 % 24),
      m = parseInt(option.time % (60 * 60) / 60),
      s = parseInt(option.time % (60));
    var day = '';
    d > 0 ? day = d + '天' : '';
    this.data.dataTime[option.id] = day + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
    if (option.time <= 0) {
      // 结束回调
      this.getData();
      clearTimeout(this.data.timer[option.id]);
      return;
    }
    this.setData({
      dataTime: this.data.dataTime
    });
    option.time--;
    this.data.timer[option.id] = setTimeout(() => {
      this.timeDown(option)
    }, 1000);

  },


  getData() {
    let _ = this;
    wx.showLoading({
      title: '加载中...'
    })
    wx.showNavigationBarLoading();
    http.request({
      url: '/cart/list',
      data: {
        mid:wx.getStorageSync('userInfo').mid
      },
      success:  (res)=> {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        if(res.code==200){
          this.setData({
            cart_list:res.data
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      }
    })

  },

  
  subOrder() {
    var _ = this;
    http.request({
      url: '/cart/cart_checkout',
      data: {
        is_fastbuy: 0
      },
      isCode: true,
      success: function (res) {
        if (res.data.code == 200) {

          wx.getStorage({
            key: 'userInfo',
            success: res => {
              _.setData({
                isPartOrder: false,
              })
              wx.navigateTo({
                url: '/pages/orderConfirm/index?is_fastbuy=0'
              })

            }

          })
        } else {
          wx.hideNavigationBarLoading();

          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })

          _.getData()

        }
        wx.hideNavigationBarLoading();
      },
      fail: function () {
        wx.hideNavigationBarLoading();
      }
    })
  },
  drawStart(e) {
    let t = e.touches[0];

    this.setData({
      clientX: t.clientX,
      openId: e.currentTarget.dataset.id

    })

  },
  drawEnd(e) {
    let t = e.changedTouches[0];
    var isOpen = 0;
    if (t.clientX - this.data.clientX == 0) {
      return;
    } else if (t.clientX - this.data.clientX <= -40) {
      isOpen = 1
    }
    this.setData({
      isOpen: isOpen
    })

  },
  /**
   * 选择商品
   */
  seletActive(e, cb) {
    let _ = this;
    let cid=[]
    cid.push(e.currentTarget.dataset.id)
    let is_choice=e.currentTarget.dataset.is_choice
    
    if (!(e instanceof Array)) {
      // 非分单选择
      var objIdentities = [],
        objIdentity = e.currentTarget.dataset.id,
        seta = e.currentTarget.dataset.seta,
        allsta = e.currentTarget.dataset.allsta,
        isall = e.currentTarget.dataset.isall;
      seta == 1 ? seta = 0 : seta = 1;
      allsta == 1 ? allsta = 0 : allsta = 1;

    }
    wx.showNavigationBarLoading()
    return
    http.request({
      url: '/cart/choice',
       
      data: {
        cid:cid,
        is_choice: 2
      },
      success: function (result) {

        _.setData({
          cart_list: result.cart_list,
          prepare_list: result.prepare_list || null,
          unavailable: result.unavailable,
          favourable_warn: result.favourable_warn,
          cart_number: result.cart_number,
          cart_total: result.cart_total,
          promo_info: result.promo_info,
          is_all: result.is_all,
          gift_list: result.gift_list,
          abgoods_list: result.abgoods_list,
          promotion_detail: result.promotion_detail,
          subtotal: result.subtotal,
          promo_info: result.promo_info,
          discount_amount: result.discount_amount,
          promotion_detail: result.promotion_detail,
          subtotal: result.subtotal,
        });
        cb && cb();

        wx.hideNavigationBarLoading()
      },

    })
  },


  /**
   * 更改商品数量
   */
  update(e) {
    let _ = this,
      add = e.currentTarget.dataset.add,
      store = e.currentTarget.dataset.store,
      num = e.currentTarget.dataset.num,
      objIdentity = e.currentTarget.dataset.id,
      seta = e.currentTarget.dataset.seta,
      name = e.currentTarget.dataset.name,
      gid = e.currentTarget.dataset.gid,
      price = e.currentTarget.dataset.price;


    if ((num == store || num >= 99) && add == "add") {

      if (num == store) {
        wx.showToast({
          title: "商品库存不足",
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: "最多可购买99件",
          icon: 'none'
        })
      }

      return;
    };

    if (num == 1 && add != "add") return

    add == "add" ? num++ : num--;

    if (store <= num) {
      num = store;
    }

    wx.showNavigationBarLoading()
    http.request({
      url: '/cart/update',
       
      data: {
        "modify_quantity": [{
          "obj_ident": objIdentity,
          "quantity": num,
          "is_selected": seta
        }]
      },
      success: function (result) {

        _.setData({
          cart_list: result.cart_list,
          unavailable: result.unavailable,
          favourable_warn: result.favourable_warn,
          cart_number: result.cart_number,
          cart_total: result.cart_total,
          promo_info: result.promo_info,
          is_all: result.is_all,
          gift_list: result.gift_list,
          abgoods_list: result.abgoods_list,
          prepare_list: result.prepare_list || null,
          promotion_detail: result.promotion_detail,
          subtotal: result.subtotal,
          discount_amount: result.discount_amount,
          promo_info: result.promo_info,
        });




      },
      complete() {
        wx.hideNavigationBarLoading()
      }
    })
  },

  /**
   * 删除商品
   */
  deleting(e) {
    let _ = this,
      num = e.currentTarget.dataset.num,
      objIdentity = e.currentTarget.dataset.id;
    wx.showNavigationBarLoading();
    http.request({
      url: '/cart/remove',
       
      data: {
        "modify_quantity": [{
          "obj_ident": objIdentity,
          "quantity": num,
        }]
      },
      success: function (result) {

        _.setData({
          cart_list: result.cart_list,
          unavailable: result.unavailable,
          favourable_warn: result.favourable_warn,
          cart_number: result.cart_number,
          cart_total: result.cart_total,
          promo_info: result.promo_info,
          is_all: result.is_all,
          gift_list: result.gift_list,
          prepare_list: result.prepare_list || null,
          promotion_detail: result.promotion_detail,
          subtotal: result.subtotal,
          promo_info: result.promo_info,
        });

        wx.hideNavigationBarLoading();
      },
      complete: function () {
        wx.hideNavigationBarLoading()
      }
    })
  },
  /***
   * 下单
   */
  order() {

    let _ = this;


    if (_.data.cart_total == 0) return;

    if (_.data.prepare_list) {
      // 预售判断是否要分单
      _.partOrder();
      return;
    } else {
      _.subOrder();
    }
  },
  // 下单优惠弹窗
  couponTip() {
    if (!this.data.promotion_detail.length) return;
    this.setData({
      isCouponTip: !this.data.isCouponTip,
    })
  },
  cout(e) {
    let _ = this,
      store = e.currentTarget.dataset.store,
      num = e.detail.value,
      objIdentity = e.currentTarget.dataset.id,
      seta = e.currentTarget.dataset.seta;


    if (num == '' || num == 0) {
      num = 1;
    }

    if (num > store && num <= 99) {
      wx.showToast({
        title: "商品库存不足",
        icon: 'none'
      })

      num = store;
    }

    if (num > 99) {
      if (num > store) {
        wx.showToast({
          title: "商品库存不足",
          icon: 'none'
        })

        if (store > 99) {
          num = 99;
        } else {
          num = store;

        }
      } else {
        wx.showToast({
          title: "最多可购买99件",
          icon: 'none'
        })

        num = 99;
      }
    }

    wx.showNavigationBarLoading()

    http.request({
      url: '/cart/update',
       
      data: {
        "modify_quantity": [{
          "obj_ident": objIdentity,
          "quantity": num,
          "is_selected": seta
        }]
      },
      success: function (result) {

        _.setData({
          cart_list: result.cart_list,
          unavailable: result.unavailable,
          favourable_warn: result.favourable_warn,
          cart_number: result.cart_number,
          cart_total: result.cart_total,
          promo_info: result.promo_info,
          is_all: result.is_all,
          gift_list: result.gift_list,
          abgoods_list: result.abgoods_list,
          prepare_list: result.prepare_list || null,
          promotion_detail: result.promotion_detail,
          subtotal: result.subtotal,
          promo_info: result.promo_info,
        });

        wx.hideNavigationBarLoading()

      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getData()
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

  }
})