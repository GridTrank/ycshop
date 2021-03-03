const http = require("../../utils/http.js");
const validate = require('../../utils/validate');
Component({
  properties: {
    show_type: {
      type: Number,
    },
    userInfo: {
      type: Object
    },
    coupon: {
      type: Object
    },
    settings: {
      type: Object
    }
  },

  data: {
    couponCode: '',
    codeState: '获取验证码',
    isdown: true,
    getCode: false,
    couponCode: '',
    mobileValue: '',
    codeValue: '',
    isCouponPopup: false,
    isRulePopup: false,
    time: 60,
  },
  methods: {
    //   手机号码监听事件
    mobileInput(e) {
      var value = e.detail.value
      if (!validate.tel(value)) {
        this.setData({
          getCode: false,
          mobileValue: value,
        })
      } else {
        this.setData({
          getCode: true,
          mobileValue: value,
        })
      }
    },
    codeInput(e) {
      this.setData({
        codeValue: e.detail.value
      })
    },
    // 手机号领取优惠劵
    getCouponPhone(e) {
      var _ = this;
      var coupon = e.target.dataset.coupon;
      var biaoshi = e.target.dataset.biaoshi;
      var index = e.target.dataset.index;
      var type = e.target.dataset.type;
      http.request({
        url: "/activity/mobile_receive_coupon",
        data: {
          mobile: this.data.mobileValue,
          vcode: this.data.codeValue,
          vcode_type: 'login',
          coupon: coupon,
          allow_type: type,
          biaoshi: biaoshi,
        },
        success: function (res) {
          // 领取成功
          _.toggleCoupon();
        }
      })
    },
    // 获取验证码
    _getCode(e) {
      var _ = this;
      http.request({
        url: '/passport/send_vcode_sms',
        
        data: {
          mobile: this.data.mobileValue,
          type: e.target.dataset.type ? e.target.dataset.type : "bind_mobile",
        },
        success(res) {

          _.setData({
            getCode: false,
            time: 60,
            isdown: false,
          })
          _.downTime();

        }
      })
    },
    toggleRule(e) {
      var type = e.currentTarget.dataset.type;
      var link = e.currentTarget.dataset.link;
      var isNav = e.currentTarget.dataset.nav;
      if (type == 1) {
        // 规则
        this.setData({
          isRulePopup: !this.data.isRulePopup
        })
      } else {
        // 优惠劵
        if (isNav == 1) {
          wx.switchTab({
            url: link,
          })
        } else {
          wx.navigateTo({
            url: link,
          })
        }


      }
    },

    getCouponId(e) {
      var _ = this;
      var id = e.target.dataset.id;
      var status = e.target.dataset.status;
      if (status == 2) {
        wx.showToast({
          title: "优惠券已领取",
          icon: 'none'
        })
        return;
      }
      // 领取优惠劵
      http.request({
        url: "/activity/receive_coupon",
        data: {
          cpns_ids: id,
        },
        success: function (res) {
          // 领取成功

          wx.showToast({
            title: '领取成功',
            icon: 'none'
          })

        },
        fail: function (res) {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          })
        }
      })

    },
    downTime() {
      var _ = this;
      setTimeout(() => {
        var nowTime = this.data.time - 1;
        this.setData({
          time: nowTime,
          codeState: "已发送(" + this.data.time + ")s",
        })
        if (nowTime > 1) {
          this.downTime();
        } else {
          this.setData({
            getCode: true,
            codeState: "重新获取",
            isdown: true,
          })
        }
      }, 1000);
    },
    /**
     * 获取输入框优惠券码
     */
    bindKeyInput(e) {
      this.setData({
        couponCode: e.detail.value
      });
    },
    /**
     * button兑换券码判断 提示
     */
    getExchange(e) {
      let v = this.data.couponCode;
      let img = e.target.dataset.img;
      let _ = this;
      if (v == '') return;
      http.request({
        url: "/member/exchange_coupon",
        data: {
          coupon_code: v
        },
        success: function (res) {
  
            if (img != '') {
              _.toggleCoupon();
              return;
            }
            wx.showToast({
              title: "兑换成功",
              icon: 'none'
            })

          
        }
      });

    },
    toggleCoupon() {
      this.setData({
        isCouponPopup: !this.data.isCouponPopup
      });
    },
  },

  ready() {


  }
})