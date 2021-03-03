const http = require('../../utils/http');
const {
  getFormat
} = require('../../utils/util.js');


Page({
  onShow(options) {
    this.setData({
      userInfo: wx.getStorageSync('userInfo') || {},
    })
    if(this.data.userInfo.is_bind_mobile && !this.data.isSelectCoupon){
        this.getData(this.data.product_id);
    }
  },
  onUnload() {
    clearTimeout(this.data.timer)

  },

  onLoad(options) {
    if (options.scene) {
      var scene = decodeURIComponent(options.scene) //参数二维码传递过来的参数
      let arr = scene.split("&");
      for (let i of arr) {
        options[i.split("=")[0]] = i.split("=")[1];
      }
    }
    this.data.product_id = options.id;
    this.data.type = options.type;
    this.getData(this.data.product_id);
  },
 

  brokerageInfo() {
    wx.showModal({
      title: '佣金说明',
      content: '此处为佣金的预估金额，实际佣金按照实际成交金额计算，计算公式如下：\r\n实际佣金=(订单金额-运费-优惠金额)*佣金率',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: "#E42727",
    })
  },
  animationfinish(e) {
    if (this.data.viewTab == 0 && this.data.likeCurrent == Math.ceil(this.data.likeView.length / 6) - 1) {
      this.setData({
        viewTab: 1,
        likeCurrent: 0,
      })
    } else {
      this.setData({
        likeCurrent: e.detail.current,
      })

    }

  },

  toSpecial() {
    getApp().globalData.shopIndex.link = '/special/get_list';
    getApp().globalData.shopIndex.index = 1;
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  // 获取数据
  getData: function (id) {
    let _ = this;
    // 商品详情 
    wx.showLoading({
      title: '加载中...'
    })
    http.request({
      url: '/fabric/detail',
      cdn: true,
      data: {
        product_id: id
      },
      
      isCode: true,
      success(res) {
        if (res.data.code == 200) {
          res.data.result.sku_category = res.data.result.sku_category || {};
          _.selectComponent('#requestPage').updata(true);
          let result = res.data.result;
          if (result.special_id) {
            // 限时购商品
            _.data.time = (result.end_time - result.now_time) * 1000;
            clearTimeout(_.data.timer)
            _.timeDown();
          }
          // 预售
          if (result.prepare_list) {

            if (result.prepare_list.prepare_status == 0) {
              // 未开始
              _.data.time = (result.prepare_list.order_begin_time - Math.round(new Date() / 1000)) * 1000
              clearTimeout(_.data.timer)
              _.timeDown();
            } else if (result.prepare_list.prepare_status == 1) {
              _.data.time = (result.prepare_list.order_end_time - Math.round(new Date() / 1000)) * 1000
              clearTimeout(_.data.timer)
              _.timeDown();
            }
          }
          _.setData({
            detail: result,
            title: res.data.result.product_name || '商品详情',
            'main_slide': result.banner,
            userInfo: wx.getStorageSync('userInfo') || {},
          });
          _.getOtherData(result.goods_id);
          if(_.data.userInfo.is_bind_mobile)_.getShareCoupon(result.goods_id);
          
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
  //分销客优惠券
  getShareCoupon(id){
    this.setData({
      isSelectCoupon:true
    })
    http.request({
      url:'/fabric/share_coupon',
      data:{
        goods_id:id
      },
      success:(res)=>{
        if(res.is_valid){
          this.setData({
            zkCoupon:res,
          }) 
          let couponState=[]
          let obj={
            type:'online',
            cpns_id:res.coupon.cpns_id
          }
          couponState.push(obj)
          this.getCouponState(couponState)    
        }
      }
    })
  },
  //分销客优惠券状态
  getCouponState(couponState){
    http.request({
      url:'/travel/check_coupon_status',
      data:{
        coupon:couponState
      },
      success:(result)=>{
        this.setData({
          'zkCoupon.couponState':result[couponState[0].cpns_id],
          showCoupon:true
        })
      }
    })
  },
  //分销客领取优惠券
  useCoupon(e){
    let receive=e.currentTarget.dataset.receive
    let speed=e.currentTarget.dataset.speed
    let zkCoupon=this.data.zkCoupon
    if(speed==1){
      wx.showToast({
          title: '该优惠券已被领取完',
          icon: 'none'
      })
      return
    }
    if(receive==0){
      http.request({
        url: '/activity/receive_coupon',
        data: {
          cpns_id: zkCoupon.coupon.cpns_id,
          cpns_prefix: zkCoupon.coupon.cpns_prefix,
          share_coupon_id:zkCoupon.share_coupon_id,
          goods_id:zkCoupon.goods_id
        },
        isCode: true,
        success:(res)=>{
          if(res.data.code==200){
            wx.showToast({
              title: '优惠劵领取成功',
              icon: 'none'
            })
            this.setData({
              "zkCoupon.couponState.is_receive":1
            })
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '您已领取过该券，不可重复领取',
        icon: 'none'
      })
    }
  },

  // 领取优惠劵
  getCoupon(e) {
    var _ = this;
    var index = e && e.detail;
    http.request({
      url: '/activity/receive_coupon',
      data: {
        cpns_id: _.data.detail.coupons[index].cpns_id,
        cpns_prefix: _.data.detail.coupons[index].cpns_prefix,
      },
      isCode: true,
      success(res) {
        if (res.data.code == 200) {
          _.data.detail.coupons[index].get = 1
          _.setData({
            'detail.coupons': _.data.detail.coupons,
          })
          wx.showToast({
            title: '优惠劵领取成功',
            icon: 'none'
          })
        } else if (res.data.code == 120006) {
          _.data.detail.coupons[index].get = 1
          _.setData({
            'detail.coupons': _.data.detail.coupons,
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }

      }
    })


  },
  // 打开优惠劵促销弹窗
  togglePopup(e) {
    console.log(e)
    if(e.detail == 'share'){
      e.currentTarget.dataset.type = 'share';
    }
    if (e.currentTarget.dataset.type != null) {
      this.setData({
        type: e.currentTarget.dataset.type,
      })
    }
    if (!this.data.userInfo.is_bind_mobile && this.data.type != 'share') return;

    this.setData({
      isPopup: !this.data.isPopup,
    })
  },
  getOtherData: function (id) {
    // 评论列表
    let _ = this;
    http.request({
      url: '/comment/index',
      cdn: true,
      data: {
        goods_id: id,
        type: 0
      },
      success(result){
        _.setData({
          commentItem: result,
          isLogin: true,
        })
      }
    });
    // 购物车数量
    http.request({
      url: '/cart/number',
      success: (result) => {
        this.setData({
          'detail.cart_num': result.cart_number
        })
      }
    })
    // 猜你喜欢
    http.request({
      url: '/product/guess_like',
      cdn: true,
      data: {
        goods_id: id
      },
      success: (result) => {

        this.setData({
          'likeView': result
        })
      }
    })
    // 本周热销
    http.request({
      url: '/product/seven_sale',
      cdn: true,
      data: {
        goods_id: id
      },
      success: (result) => {
        this.setData({
          'saleView': result
        })
      }
    })
  },
  updataGoodStandard(e) {
    this.setData(e.detail)
  },
  editNum(e) {
    this.selectComponent("#goodStandard").editNum(e)
  },
  blurNum(e) {
    this.selectComponent("#goodStandard").blurNum(e)
  },
  selectProductCallback() {
    if (this.data.selectedProduct.goods.special_id) {
      // 加价购商品
      this.data.time = (this.data.selectedProduct.goods.end_time * 1000 - Date.parse(new Date()));
      if (this.data.time <= 0) return;
      clearTimeout(this.data.timer)
      this.timeDown();
    }
  },


  toafterSale() {
    wx.navigateTo({
      url: "/pages/web/index?type=1"
    })
  },

  /** 
   * 转发分享
   */
  onShareAppMessage() {
    var url =this.data.userInfo.is_zhuanke &&  this.data.zkCoupon.coupon && this.data.zkCoupon.coupon.cpns_id ? 
      '/pages/welfare/index?gid='+this.data.zkCoupon.goods_id + '&sid=' + this.data.zkCoupon.share_coupon_id +'&zk='+this.data.userInfo.member_id:
     '/pages/detail/index?id=' + this.data.product_id+'&source='+(this.data.userInfo.is_zhuanke ? 'saler' :'share')+'&zk='+this.data.userInfo.member_id;
    console.log(url)
    return {
      title: this.data.detail.product_name,
      path: url,
      imageUrl: this.data.detail.banner[0] ? this.data.detail.banner[0].imgUrl : null
    }
  },
  // 倒计时
  timeDown: function () {
    var timeArr = getFormat(this.data.time);

    if (this.data.time <= 0) {
      // 结束回调
      // this.getData();
      clearTimeout(this.data.timer)

      //  预售
      if (this.data.detail.prepare_list) {
        var status = 0;
        if (this.data.detail.prepare_list.prepare_status == 0) {
          status = 1;
          this.data.time = (this.data.detail.prepare_list.order_end_time - this.data.detail.prepare_list.order_begin_time) * 1000;
          this.timeDown();
        } else if (this.data.detail.prepare_list.prepare_status == 1) {
          status = 2;
        }
        this.setData({
          'detail.prepare_list.prepare_status': status,
        })
      } else if (this.data.detail.special_id) {
        // 限时购
        this.getData();
      }

      return;
    }
    this.setData({
      timeArr: timeArr
    });
    this.data.time -= 1000;
    this.data.timer = setTimeout(() => {
      this.timeDown()
    }, 1000);
  },

  // 海报
  shareClose() {
    this.setData({
      visible: false
    })
  },
  shareImage() {
    this.setData({
      visible: true,
      isPopup: false
    })
  },
  bindUserCallback(e) {
    if (e.target.dataset.type == 'share') {
      this.setData({
        visible: true,
        isPopup: false
      })
    }
  },
  bindUserFailCallback(e) {
    if (e.target.dataset.type == 'share') {
      this.setData({
        visible: true,
        isPopup: false
      })
    }
  },
  toggleSelect(e) {
    if (e.currentTarget.dataset.type == 'pointer') return;
    this.selectComponent("#goodStandard").toggleSelect();
  },
  tabHandle(e) {
    this.setData({
      viewTab: e.currentTarget.dataset.index,
      likeCurrent: 0,
    })
  },
  onPageScroll(res) {
    if (res.scrollTop > 100) {
      if (!this.data.isHeader) {
        this.setData({
          isHeader: true
        })
      }

    } else {
      if (this.data.isHeader) {
        this.setData({
          isHeader: false
        })
      }
    }

  },
  data: {
    goods_id:'',
    zkCoupon:{
      couponState:{}, 
    },
    coupons:[],
    showCoupon:false,
    isSelectCoupon:false,
    likeCurrent: 0,
    viewTab: 0,
    likeView: [],
    saleView: [],
    isHeader: false,
    title: '',
    visible: false,
    type: "", //时间戳表示从列表跳转过来触发埋点
    isDetail: true,
    userInfo: wx.getStorageSync('userInfo') || {},
    isLogin: false, //用户登录状态
    // 登录弹窗参数
    isShow: false, //绑定手机号弹窗
    isdown: true, //是否可以再次获取验证码
    mobileValue: "", //手机号
    codeValue: "", //验证码
    time: 60,
    getCode: false, //是否可以获取验证码
    codeState: '免费获取',
    token: wx.getStorageSync('token'),
    isDetail: true,
    product_id: "",
    main_slide: [],
    swiper: {
      imgheight: null,
      indicatorDots: false,
      circular: true,
      autoplay: true,
      interval: 5000,
      duration: 300,
      previewImage:true,
    },
    isdescUp: null,
    selectedProduct: {
      goods: {
        marketable: true,
      },
      num: 1,
    }, //选中的商品信息
    selected: null, //选中的规格
    filtrate: {}, //筛选库存为0的商品
    detail: {
      is_marketable: 1,
      is_in_stock: 1,
      zkCoupon:{}
    },
    commentItem: [],
    // 优惠劵跟促销
    isPopup: false,
    type: "",
    // 预售
    time: 0,
    timeArr: {},
    explain: {
      visiblePopup: false
    },
    userRefresh: {}
  }
})