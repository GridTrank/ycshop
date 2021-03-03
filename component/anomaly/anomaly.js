const http = require("../../utils/http.js");
Component({
  properties: {
    anomaly: {
      type: Object
    },
    userInfo: {
      type: Object
    },
    type: {
      type: String,
      value: 'anomaly',
    },
  },
  observers: {
    'anomaly': function (anomaly) {
      var couponState = [];
      if (this.data.userInfo && anomaly.items) {
        anomaly.items.map((item, index) => {
          item.region.map((i, j) => {
            if (i.type == 'coupon') {
              couponState.push({
                type: i.coupon_type,
                cpns_id: i.coupon_type == 'shop' ? i.out_cpns_id : i.coupons[0]
              })
            }
          })
        })
      }

      if (couponState.length) {
        this.getCouponState(couponState)
      }
      this.setData({
        anomalyList: anomaly,
      })
    }
  },
  data: {
    anomalyList: [],
    couponState: {},
    imgLoad: {}
  },
  methods: {
    loadImg(e) {
      var index = e.target.dataset.index;
      this.data.imgLoad[index] = 1;
      this.setData({
        imgLoad: this.data.imgLoad,
      })
    },
    getCoupon(e) {
      var _ = this;
      var coupon = e.currentTarget.dataset.coupon;
      var id = e.currentTarget.dataset.id;
      var type = e.currentTarget.dataset.type;
      var index = e.currentTarget.dataset.index;
      var i = e.currentTarget.dataset.i;
      var j = e.currentTarget.dataset.j;
      var receive = e.currentTarget.dataset.receive;
      if (receive) {
        wx.showToast({
          title: '您已领取过该券，不可重复领取',
          icon: 'none'
        })
        return;
      }
      http.request({
        url: '/travel/receive_coupon',
        
        data: {
          coupon_type: type || 'online',
          cpns_ids: type == "shop" ? coupon : coupon[0],
          region_id: id,
          receive_type: 3,
        },
        isCode:true,
        success(res) {
          if(res.data.code == 200){
            wx.showToast({
              title: '领取优惠券成功',
              icon: 'none'
            })
          }else if(res.data.code == 120006){
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
            
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
            return;
          }
         
          var couponId = type == 'shop' ? coupon : coupon[0];
          if(_.data.couponState.hasOwnProperty(couponId)){
            _.data.couponState[couponId].is_receive = 1;
          }else{
            _.data.couponState[couponId] = {
              is_receive:1
            };
          }
          
          console.log( _.data.couponState)
          _.setData({
            couponState: _.data.couponState
          })

        }
      })

    },
    getCouponState(couponState) {
      http.request({
        url: '/travel/check_coupon_status',
        data: {
          coupon: couponState
        },
        
        success: (result) => {
          this.setData({
            couponState: result
          })
        }
      })
    },
    addCart(e) {
      var _ = this;
      var type = e.currentTarget.dataset.type;
      var gid = e.currentTarget.dataset.gid;
      var pid = e.currentTarget.dataset.pid;
      var img = e.currentTarget.dataset.img;
      var name = e.currentTarget.dataset.name;
      if (name == 'buy') {
        // 立即购买
        wx.navigateTo({
          url: `/pages/detail/index?id=${pid}`,
        })

      } else {
        http.request({
          url: '/cart/add',
          
          data: {
            goods: {
              goods_id: gid,
              product_id: pid,
              num: 1,
            },
            chan_id: getApp().globalData.chanId || '',
            chan_refer_app_id: getApp().globalData.chan_refer_app_id || '',
            is_fastbuy: 0,
            zk_ref: wx.getStorageSync('userInfo').is_zhuanke ? wx.getStorageSync('userInfo').member_id : getApp().globalData.zk_ref || ''
          },
          success(result) {

              // 加入购物车
              wx.showToast({
                title: "加入购物车成功",
                icon: 'none'
              })


         

          }
        })
      }

    },
    groupBuy(e) {
      var _ = this;
      if (!_.data.anomalyList.settings.one_okey_add) {
        if (_.data.anomalyList.settings.goods_to_cart.data.length == 1) {
          wx.navigateTo({
            url: '/pages/detail/index?id=' + _.data.anomalyList.settings.goods_to_cart.data[0].goods.product_id
          });
          return;
        }
      }


      http.request({
        url: '/cart/batchAdd',
        
        data: {
          data: _.data.anomalyList.settings.goods_to_cart.data
        },
        success(res) {
            wx.showToast({
              title: '全部商品已加入购物车',
              icon: 'none'
            })
          
        }
      })

    },

  },
  ready() {

  },

})