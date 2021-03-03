const http = require("../../utils/http.js");
Component({
  properties: {
    special: {
      type: Object,
    },
    userInfo: {
      type: Object,
    },
  },

  data: {
    timer: null,
    timeObj: {}
  },
  methods: {
    specialUrl() {
      this.triggerEvent('moreSpecial', {
        name: '/special/get_list',
        cur: 1
      })
    },

    installTime(obj, time) {
      let h = parseInt(time / 3600 % 24),
        m = parseInt(time / 60 % 60),
        s = parseInt(time % (60));

      this.setData({
        'timeObj': Object.assign(obj, {
          h: h < 10 ? '0' + h : h,
          m: m < 10 ? '0' + m : m,
          s: s < 10 ? '0' + s : s
        })
      });

      this.data.timer = setTimeout(() => {

        if (time <= 0 && obj.next_begin_time == '')
          return this.setData({
            'index.viewIndexSpecial': {
              end_time: ''
            }
          });

        if (time <= 0 && obj.next_begin_time != '')
          return this.uploadSpecial()
            .then(result => {
              this.installTime(result, result.end_time - result.now_time);
            })

        time--;
        this.installTime(obj, time);

      }, 1000)
    },
    /**
     * 重新请求倒计时
     */
    uploadSpecial() {
      var _ = this;
      return new Promise(function (s, e) {
        http.request({
          url: '/index/widget',
          
          data: {
            'widget': 'index_special'
          },
          success(result) {
            _.setData({
              'index.viewIndexSpecial': result
            })
            var data = wx.getStorageSync('d5d2b4b8fa30091fc912059fecb3b43b');
            if (data) {
              data.data.data.result.index_special = result;
              wx.setStorageSync('d5d2b4b8fa30091fc912059fecb3b43b', data);
            }
            s(result)
          },
          fail(res) {
            console.log(res)
          }
        })
      })
    },

  },
  ready() {
    this.installTime(this.data.special, this.data.special.end_time - this.data.special.now_time, this);

  }
})