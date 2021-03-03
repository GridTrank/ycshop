const http = require('../../utils/http');
Component({
  properties: {
    couponList: {
      type: Object,
    },
    userInfo: {
      type: Object,
    },
    type: {
      type: Object,
    },
    pageName: {
      type: String,
      value: 'coupon'
    }
  },
  observers: {
    'couponList': function (couponList) {
      if (couponList && this.data.pageName == 'detail') {
        // 检车优惠劵领取状态
        var couponState = [];
        if (this.data.userInfo) {
          couponList.map((item, index) => {
            couponState.push({
              type: 'online',
              cpns_id: item.cpns_id
            })

          })
        }

        if (couponState.length) {
          this.getCouponState(couponState)
        }
      }
    }
  },
  data: {
    isdescUp: false,
    couponType: {
      1: {
        name: '直减券',
        class: 'red'
      },
      2: {
        name: '满减券',
        class: 'red'
      },
      3: {
        name: '折扣券',
        class: 'yellow'
      },
      4: {
        name: '免邮券',
        class: 'blue'
      }
    },
    states: {
      1: "",
      2: "use",
      3: "timeout",
      4: "none",
    },
    couponState:{}
  },
  methods: {
    getCouponState(couponState){
      http.request({
        url:'/travel/check_coupon_status',
        data:{
          coupon:couponState
        },       
        success:(result)=>{
          this.setData({
            couponState:result
          })
        },

      })
    },
    descUp(e) {
      var id = e.currentTarget.dataset.id;
      var code = e.currentTarget.dataset.code;
      this.data.isdescUp != id + code ?
        this.setData({
          isdescUp: id + code
        }) :
        this.setData({
          isdescUp: false
        });
    },
    getCoupon(e) {
      this.triggerEvent('getCoupon', e.currentTarget.dataset.index)
    },
    /**
     * 点击选择优惠券
     */
    selectCoupon(e) {

      this.triggerEvent('selectCoupon', e.currentTarget.dataset.index)
    }
  },
  ready() {

  }
})