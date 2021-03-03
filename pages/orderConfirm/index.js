const http = require('../../utils/http');
const wxPay = require('../../utils/wxPay');


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
  // 滚动监听
  onPageScroll(e) {
    if (e.scrollTop > 60) {
      this.setData({
        isTip: true
      });
    } else {
      this.setData({
        isTip: false
      });
    }
  },
  onLoad(e) {
    wx.setNavigationBarTitle({
      title: '订单确认'
    });
    this.setData({
      is_fastbuy: e.is_fastbuy || 0
    });
    this.getData();
  },

  onShow() {

    let self = this;

    wx.getStorage({
      key: 'cpns',
      success: res => {
        console.log(res)
        if (res.data.total != undefined) {
          self.setData({
            select_cpns: JSON.stringify(res.data.cpn) == '{}' ? {} : res.data.cpn,
            favourable_total: res.data.total.favourable_total,
            order_total: res.data.total.order_total,
            freight_fee: res.data.total.freight_fee,
            md5_cart_info: res.data.total.md5_cart_info,
            cpn_number: res.data.cpn_number,
            gift_list: res.data.hasOwnProperty('gift_list') ? res.data.gift_list : []
          });
        }
        setTimeout(() => wx.setStorageSync('cpns', ''), 500);
      },
      fail: res => {
        // console.log(res,'----------')
      }
    })

    wx.getStorage({
      key: 'orderAddress',
      success: res => {
        if (res.data == '') return;
        self.setData({
          address: Object.assign({}, res.data.address, {
            is_fastbuy: self.data.is_fastbuy
          }),
          favourable_total: res.data.total.favourable_total,
          order_total: res.data.total.order_total,
          freight_fee: res.data.total.freight_fee,
          fee_title: res.data.total.fee_title, //邮费提醒标题
          fee_content: res.data.total.fee_content, //邮费提醒内容
        })
        setTimeout(() => wx.setStorageSync('orderAddress', ''), 500);
      }
    })

  },

  // 创建订单
  createOrder() {
    let self = this;
    if (this.data.isAlearyPay && !this.data.isPay) return this.showModal(); // 是否已经支付
    if (!this.data.checked || this.data.isPay) return;
    this.data.isPay = true;
    wx.showNavigationBarLoading();
    var createData = {
      isfastbuy: self.data.is_fastbuy,
      md5_cart_info: self.data.md5_cart_info,
      address: {
        addr_id: self.data.address.addr_id
      },
      shipping: {
        id: self.data.shipping.dt_id
      },
      payment: {
        is_tax: false,
        pay_app_id: {
          pay_app_id: self.data.payMethod
        }
      },
    }
    if (this.data.prepare_list) {
      createData.promotion_type = 'prepare'
    }
    http.request({
      url: '/order/create',
      
      data: createData,
      isCode: true,
      success: res => {
        if (res.data.code == 200) {
          if (res.data.result.is_payed) {
            // 0元支付
            wx.redirectTo({
              url: '/pages/payBox/index?id=' + res.data.result.order_id + '&type=1&delay=true'
            });
            return;
          }
          this.data.isAlearyPay = true;
          this.data.isPay = true;
          // 已下单，未支付
          wxPay.getPayParam(res.data.result.order_id, (wxPayRes) => { // 获取支付参数  
            wx.showToast({
              title: wxPayRes,
              icon: 'none',
              success: function () {
                wx.navigateTo({
                  url: '/pages/order/index'
                });
              }
            })
          }, true);
        } else {
          wx.hideNavigationBarLoading();
          self.data.isAlearyPay = false;
          self.data.isPay = false;
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
          })
        }

      }
    })
  },
  // 添加收货地址
  addAddress() {
    this.selectComponent("#editAddress").toggleEdit()
  },


  // 数据请求
  getData(title, callback) {
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '加载中...'
    })
    let _ = this;
    http.request({
      url: '/cart/order_check',
      
      data: {
        is_fastbuy: _.data.is_fastbuy,
        wx_program: 1,
      },
      isCode: true,
      success: res => {
        wx.hideLoading();
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          wx.hideNavigationBarLoading();
          let data = res.data.result;
          let address = data.address;
          _.setData({
            address: Object.assign({}, address, {
              is_fastbuy: _.data.is_fastbuy
            }),
            cpn_number: data.cpn_number,
            goods_total: data.goods_total,
            freight_fee: data.freight_fee,
            favourable_total: data.favourable_total,
            order_total: data.order_total,
            max_cpns: data.max_cpns,
            goods_list: data.goods_list,
            gift_list: data.gift_list,
            abgoods_list: data.abgoods_list,
            select_cpns: data.select_cpns,
            md5_cart_info: data.md5_cart_info,
            shipping: data.shipping,
            isOk: true,
            fee_title: data.fee_title,
            prepare_list: data.prepare_list || null,
            fee_content: data.fee_content,
            support_coupon: data.support_coupon
          })
          typeof callback === 'function' ? callback() : "";

          if (data.max_cpns.memc_code != '' && !data.support_coupon && data.select_cpns.memc_code == '') {
            let cpns = data.max_cpns;
            http.request({
              url: '/cart/add',
              
              data: {
                addr_id: _.data.address.addr_id,
                obj_type: 'coupon',
                coupon: cpns.memc_code,
                is_fastbuy: _.data.is_fastbuy,
                zk_ref: wx.getStorageSync('userInfo').is_zhuanke ? wx.getStorageSync('userInfo').member_id : getApp().globalData.zk_ref || '',
                chan_id: getApp().globalData.chanId || '',
                chan_refer_app_id: getApp().globalData.chan_refer_app_id || '', 
              },
              success: result => {

                _.setData({
                  select_cpns: result.coupon_info[0],
                  md5_cart_info: result.md5_cart_info,
                  freight_fee: result.freight_fee,
                  favourable_total: result.favourable_total,
                  order_total: result.order_total,
                })


              }
            })
          }
        } else if (res.data.code == 140001) {
          // 超过购买数
          _.selectComponent('#requestPage').updata(true);
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 2000)
        } else {
          if (res.data.code != 400014) {
            _.selectComponent('#requestPage').updata(false);
          }
          wx.showToast({
            title: res.data.msg,
            icon: 'none',

          })
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/cart/index'
            })
          }, 2000)

        }


      },
      fail: function () {
        wx.hideLoading()
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },

  // 邮费说明
  freightInfo() {
    wx.showModal({
      title: this.data.fee_title,
      content: this.data.fee_content,
      showCancel: false,
      confirmText: "知道了",
      confirmColor: '#D71F28',
    })
  },

  changeCheckBox() {
    this.setData({
      checked: !this.data.checked
    })
  },


  /** 
   * 提醒弹窗
   */
  showModal(e) {
    let type = e != undefined ? e.currentTarget.dataset.type : 1;
    if (type == 1) {
      this.setData({
        'isModal': true
      });
      setTimeout(() => {
        this.setData({
          'isShow': true
        })
      }, 200);
    }
    if (type == 2) {
      this.setData({
        'isShow': false
      });
      setTimeout(() => {
        this.setData({
          'isModal': false
        });
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 200);
    }

  }, // 取消地址窗口
  toggleEdit: function (e) {
    this.setData({
      edit: !this.data.edit,
    })
  },

  data: {
    orderSource: 'order',
    type: "0", //默认值是1,0 是确认订单选择地址
    address: {}, //修改地址详情
    editAddressData: {}, //地址信息数据

    isTip: false, //去付款按钮地址提示
    selected: 0,
    selectSet: {
      series: 3, //联动级数（台湾、香港、澳门）是2级联动
      edit: false,
      open: false,
      disabled: true,
    },
    enterAddress: [ //确认的地区信息数据
    ],
    tabData: [{
      name: "省份",
      id: "0"
    }],
    default: 0,
    edit: false,
    userInfo: wx.getStorageSync('userInfo'),
    isModal: false,
    isShow: false,
    isAlearyPay: false,
    isPay: false, // 是否在支付请求中
    payMethod: 'wxprogrampay', // 支付方式
    is_fastbuy: '', // 是否立即购买。1 是 0 否
    cpns: {}, // 选择的优惠卷
    checked: true, // 协议
    md5_cart_info: '', // md5
    address: {}, // 默认地址
    cpn_number: '', // 优惠卷数量
    goods_total: '', // 商品总价
    freight_fee: '', // 运费
    favourable_total: '', // 活动优惠
    order_total: '', // 订单应付金额
    max_cpns: {}, // 最优惠的优惠券
    goods_list: [], // 结算商品列表
    gift_list: [], // 结算赠品列表
    abgoods_list: [],
    select_cpns: [], // 用户选中的优惠卷
    fee_title: "", //邮费提醒标题
    fee_content: "", //邮费提醒内容
    prepare_list: null, //预售信息
    support_coupon: false, //是否支持是呀优惠券
  }
})