const http = require('../../utils/http');
Component({
  properties: {},

  data: {
    _observer: {},
    special: {
      globalSystemInfo:getApp().globalData.globalSystemInfo,
      isModal: false,
      isShow: false,
      productID: null,
      fixed: '',
      windowHeight: '',
      windowWidth: '',
      bannerHeight: '',
      width: '',
      time: '',
      tel: wx.getStorageSync('information').membershipMobile,
      navSize: 0,
      scrollLeft: 0,
      buyStatus: '',
      timestamp: '',
      items: [],
      curItem: {},
      userInfo: wx.getStorageSync('userInfo'),
      specialStatus: ['已结束', '已开抢', '抢购中', '即将开始']
    }
  },
  methods: {

    getSpecialData(e) {
      clearTimeout(this.data.special.time);
      wx.showNavigationBarLoading();
      let _ = this;

      http.request({
        url: '/special/get_list',
        
        success(result) {
          wx.hideNavigationBarLoading();
          wx.hideLoading()
          _.setData({
            'special.navSize': result.items.length,
            'special.items': result.items,
            'special.timestamp': result.timestamp
          });

          wx.getSystemInfo({
            success(res) {
              let l = _.data.special.navSize;
              let w = l >= 5 ? res.windowWidth / 5 : res.windowWidth / l;
              _.setData({
                'special.width': w,
                'special.windowHeight': res.windowHeight,
                'special.windowWidth': res.windowWidth,
                globalSystemInfo:getApp().globalData.globalSystemInfo
              });

              if (e == undefined) {
                result.items.some((v, i) => {
                  if (v.special_status == 2) {
                    _.selectNavData(i);
                  }
                })
              } else {
                let index = e.currentTarget.dataset.index;
                _.selectNavData(index);
              }

            }
          })



        },
        complete: function () {
          wx.hideNavigationBarLoading();
          wx.hideLoading()
        }
      });

    },
    /**
     * 切换时间
     */
    selectNavData(e) {

      let i = typeof e === 'number' ? e : e.currentTarget.dataset.index,
        s = this.data.special.navSize - 2,
        w = this.data.special.width,
        scrollLeft = i <= 2 ? 0 : (i >= s ? w * (s - 3) : w * (i - 2)),
        data = this.data.special.items[i];

      this.setData({
        'special.cur': i,
        'special.scrollLeft': scrollLeft,
        'special.curItem': data
      });
      wx.setNavigationBarTitle({
        title: data.name,
      })
      if (this.data.special.curItem.special_status == 2)

        this.setStatusTime(this.data.special.curItem.end_time - this.data.special.timestamp);

    },

    /** 
     * 图片加载
     */
    imageLoad(e) {
      let $width = e.detail.width, //获取图片真实宽度
        $height = e.detail.height,
        ratio = $width / $height;
      let viewHeight = this.data.special.windowWidth / ratio;
      this.setData({
        'special.bannerHeight': viewHeight
      });
    },

    /** 
     * 设置倒计时
     */
    setStatusTime(v) {

      let h = parseInt(v % (60 * 60 * 24) / 60 / 60),
        m = parseInt(v % (60 * 60) / 60),
        s = parseInt(v % (60)),
        cur = this.data.cur,
        curUp = cur + 1;

      this.setData({
        'special.buyStatus': '本场还剩 ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
      });

      if (v > 1) {
        this.data.special.time = setTimeout(() => {
          v--;
          this.setStatusTime(v)
        }, 1000)
      } else {
        this.getSpecialData();
      }

    },
    /** 
     * 短信提醒设置
     */
    noticeSMS(e) {

      let _ = this.data.special,
        self = this;
      if (!_.tel) {
        wx.showToast({
          title: '手机号不能为空',
          icon: 'none'
        })
        return;
      }
      http.request({
        url: '/special/remind',
        
        data: {
          special_id: _.curItem.special_id,
          product_id: _.productID,
          mobile: _.tel
        },
        success(res) {

          wx.showModal({
            title: '提示',
            content: '提醒设置成功',
            showCancel: false,
            success(res) {
              self.setData({
                'special.isShow': false
              });
              setTimeout(() => {
                self.setData({
                  'special.isModal': false,
                })
              }, 200);
            }
          });

        }
      });

    },
    /** 
     * 提醒弹窗
     */
    showModal(e) {
      let type = e.currentTarget.dataset.type;
      this.setData({
        'special.productID': e.currentTarget.dataset.id || 0
      })
      if (type == 1) {
        this.setData({
          'special.isModal': true
        });
        setTimeout(() => {
          this.setData({
            'special.isShow': true
          })
        }, 200);
      } else {
        this.setData({
          'special.isShow': false
        });
        setTimeout(() => {
          this.setData({
            'special.isModal': false,
          })
        }, 200);
      }
    },
    /**
     * 重新请求倒计时
     */
    uploadSpecial() {
      return new Promise(function (s, e) {
        http.request({
          url: '/index/widget',
          
          data: {
            'widget': 'index_special'
          },
          isCode:true,
          success(res) {
            if (res.data.code == 200) return;
            return res.data.result;
          },
          fail(res) {
            console.log(res)
          }
        })
      })
    },
    /** 
     * 兼容 input 输入
     */
    listenInput(e) {
      this.setData({
        'special.tel': e.detail.value
      });
    },
    /** 
     * 滚动置顶
     */
    scroll(e) {
      let fixed = '';
      if (this.data.special.bannerHeight) {
        fixed = e.detail.scrollTop >= this.data.special.bannerHeight ? 'ms-fixed' : '';
      }
      this.setData({
        'special.fixed': fixed
      })
    },
  },
  ready() {
    this.getSpecialData();
  }
})