import http from '../../utils/http'

import {
  formatTime
} from '../../utils/util.js';
const app = getApp();

Page({
  onShow(options) {

  
    this.getData();
  },

  standardData(e) {
    this.setData({
      detail: e.detail.item
    })
  },


  onLoad(options) {

    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      let arr = scene.split("&");
      for (let i of arr) {
        options[i.split("=")[0]] = i.split("=")[1];
      }
    }
    this.setData({
      tmpl_id: options.id || '20190227001',
      globalSystemInfo: getApp().globalData.globalSystemInfo,
    })


  },
  togglePopup(){
    this.setData({
      visible: !this.data.visible,
    })
  },
  // 导航切换
  menuTab(e) {
    var id = e.currentTarget.dataset.id;
    if (this.data.tmpl_id == id) return;
    this.setData({
      tmpl_id: id
    })
    this.getData();
  },
  getData() {
    var _ = this;
    wx.showLoading({
      title: '加载中...'
    })
    http.request({
      url: "/activity/index",
      cdn:true,
      data: {
        tmpl_id: this.data.tmpl_id
      },
      
      isCode:true,
      isLogin:true,
      success(res) {
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          clearTimeout(this.data.bannerTime)
          let result = res.data.result;
          for (var i in result) {

            if (result[i].type == 'nav') {
              _.data.navIndex = i;
              _.data.isNav = true;
              break;
            }
          }
          // 加入购物车
          wx.setNavigationBarTitle({
            title: String(result[0].setting.title) || '名创优品'
          });
          
          _.setData({
            anomalyImgLoad: _.data.dataList.length ? true : false,
            'dataList': result,
            userInfo: wx.getStorageSync('userInfo'),

          }, () => {

            if (_.data.navIndex !== null) {
              _.initNav('init');
            }

            setTimeout(() => {
              if (_.data.navIndex !== null) {
                _.initNav();
              }
            }, 10000)
          })
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
  initNav(state) {
    var _ = this;
    var query = wx.createSelectorQuery();
    this.data.dataList[this.data.navIndex].setting.floor.forEach((item) => {
      query.select(`#floor${item.widget_id}`).boundingClientRect();
    })
    query.exec(function (rect) {
      if (rect.length == 1 && rect[0] == null) return;
      if (rect[0] != null) {
        if (state == 'init' && rect[0].top <= 0) {
          _.setData({
            scrollId: rect[0].id,
          })
        }

      }
      _.setData({
        queryArr: rect
      })
    });
  },
  onPageScroll(e) {
    if (!this.data.isNav) return;
    for (var i in this.data.queryArr) {
      if (this.data.queryArr[i] == null) return;

      if (e.scrollTop < parseInt(this.data.queryArr[0].top)) {
        if (this.data.scrollId != 'floor0') {
          this.setData({
            scrollId: 'floor0'
          })
        }
      } else if (i < this.data.queryArr.length - 1) {
        if (this.data.queryArr[Number(i) + 1] == null) return;
        if (e.scrollTop >= parseInt(this.data.queryArr[i].top) && e.scrollTop < this.data.queryArr[Number(i) + 1].top) {
          if (this.data.scrollId != this.data.queryArr[i].id) {
            this.setData({
              scrollId: this.data.queryArr[i].id
            })
          }
        }
      } else if (i == this.data.queryArr.length - 1) {
        if (e.scrollTop >= parseInt(this.data.queryArr[i].top)) {
          if (this.data.scrollId != this.data.queryArr[i].id) {
            this.setData({
              scrollId: this.data.queryArr[i].id
            })
          }
        }
      }

    }


  },


  floorNav(e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;
    if (this.data.queryArr[index] === null) return;
    console.log(parseInt(this.data.queryArr[index].top))
    wx.pageScrollTo({
      scrollTop: parseInt(this.data.queryArr[index].top),
      duration: 0,
    });

  },


  // 弹窗开关
  toggleShow() {
    this.setData({
      'popupSet.isShow': !this.data.popupSet.isShow
    })
  },
  // 发起活动
  inviteStart(e) {
    var id = e.currentTarget.dataset.id;
    if (this.flag) return;
    this.flag = true;
    var _ = this;
    http.request({
      url: '/invite/launch',
      
      data: {
        activity_id: id,
        openid:  wx.getStorageSync('userInfo').openid
      },
      isCode:true,
      success(res) {
        var result = res.data.result;
        if (res.data.code == 200 || res.data.code == 130005) {
          wx.navigateTo({
            url: "/pages/invite/index?id=" + result.invite_id
          })
        } else {
          _.setData({
            'popupSet.dec': res.data.msg
          }, function () {
            _.toggleShow();
          })

        }

      },
      complete() {
        _.flag = false;

      }
    })

  },
  //取消弹窗回调
  cancleCallback() {
    wx.switchTab({
      url: '/pages/index/index',
    })

  },
  data: {
    visible:false,
    globalSystemInfo: getApp().globalData.globalSystemInfo,
    scrollPosition:{},
    navIndex:null,
    anomalyImgLoad: false,
    isNav: false,
    queryArr: [
      []
    ],
    scrollId: 'floor0',
    floorId: '0',
    explain: {
      visiblePopup: false,
    },
    userRefresh: {},
    popupSet: {
      type: 'invite',
      isShow: false,
      title: '助力发起失败',
      dec: "活动已结束",
      img: 'https://s1.miniso.cn/bsimg/ec/public/images/d5/5e/d55e5a49d913557d0ff167c2c714f4f0.png',
      cancleText: '去商城逛逛',
      cancleClass: 'gradient',
      cancleShow: true,
      enterShow: false,
    }, //弹窗配置
    tmpl_id: '',
    main_slide: [{
      "id": "315",
      "type": "product",
      "linkUrl": "/product/detail",
      "imgUrl": "https://s1.miniso.cn/bsimg/ec/public/images/6c/f6/6cf6d4056c61430e8fc6cda466138b93.jpg#h"
    }],
    swiper: {
      swiperUpdata: false,
      isLoad: false,
      isActivity: true,
      indicatorDots: true,
      autoplay: true,
      circular: true,
      interval: 5000,
      duration: 300,
      imgheight: null,
    },
    dataList: [],
    userInfo: wx.getStorageSync('userInfo'),

    detail: {
      is_marketable: 1,
      is_in_stock: 1,
    },
  },
  scrollCustom(e){
    var rpx = 750 / getApp().globalData.globalSystemInfo.windowWidth;
    var _totalLength = e.detail.scrollWidth * rpx;
    this.data.scrollPosition[e.target.dataset.id] = (54/(_totalLength - 690))*(e.detail.scrollLeft*rpx)
    this.setData({
      scrollPosition:this.data.scrollPosition
    })
    console.log(this.data.scrollPosition,rpx,_totalLength)
  },  
  

  /** 
   * 转发分享
   */
  onShareAppMessage() {
    
    var link = '/pages/activity/index?id=' + this.data.tmpl_id
    if (this.data.dataList[0].type == 'setting') {
      if (this.data.dataList[0].setting.weixin.share_status == 'off') {
        link = '/pages/index/index?source='+(this.data.userInfo.is_zhuanke ? 'saler' :'share')+'&zk_ref=' +this.data.userInfo.member_id;
   
      } else {
        link += '&source='+(this.data.userInfo.is_zhuanke ? 'saler' :'share')+'&zk_ref=' + this.data.userInfo.member_id
      }

    }
    return {
      title: '名创优选-让人惊喜的好物平台',
      path: link,
      imageUrl: ''
    }
  }

})