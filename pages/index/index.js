// pages/default/index.js

const http = require('../../utils/http');
const tool = require('../../utils/util.js');
const app = getApp()


import {
  formatTime
} from '../../utils/util.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isTop: false,
    scrollPosition: {},
    globalSystemInfo: getApp().globalData.globalSystemInfo,
    // 新人弹窗
    isLoadNewPopup: false,
    isGetNew: false, //是否领取优惠劵
    isNew: false, //是否新人
    userInfo: wx.getStorageSync('userInfo'),
    isLoad: false,
    block: '/index/index',
    scrollTop: 0,
    tabLink: '/index/index',
    searchLabel: '名创优品自营',
    cur: 0,
    navList: [],
    page: 'index',
    swiper: {

      extraData: {
        source: 'youxuanb2c'
      },
      circular: true,
      swiperUpdata: false,
      isLoad: false,
      indicatorDots: true,
      autoplay: true,
      circular: true,
      interval: 5000,
      duration: 300,
      imgheight: null,
      swiperNav: [{
        name: '名创优品自营',
        icon: "https://s1.miniso.cn/bsimg/ec/public/images/89/26/892688eebcfb13cbc813b464e291ba82.png"
      }, {
        name: '30天无忧退货',
        icon: "https://s1.miniso.cn/bsimg/ec/public/images/6b/a5/6ba5a74cbab949f75490e26acee6060b.png"
      }, {
        name: '全场包邮',
        icon: "https://s1.miniso.cn/bsimg/ec/public/images/4d/87/4d8708bdc0c01c68333e76aaf591f1cb.png"
      }]
    },
    timer: null,
    indexList: [],
    newData: {
      viewItem: [],
      index_recommend_goods: [],
      main_slide: []
    },
    catData: {
      viewItem: [],
      main_slide: []
    },
    setting: {},
    productInfo: {},
    parabolaArr: [],
    parabola: {},
    parabolaEndPoint: null,
  },


  scroll(e) {
    if (e.detail.scrollTop > 200) {
      if (!this.data.isTop) {
        this.setData({
          isTop: true
        })
      }
    } else {
      if (this.data.isTop) {
        this.setData({
          isTop: false
        })
      }
    }

  },
  goTop() {
    this.setData({
      scrollTop: 0,
    })
  },

  standardData(e) {
    this.data.event = e.detail.event;
    this.setData({
      productInfo: e.detail.item,
    })
  },
  selectTag(e) {
    let _ = this,
      cur = e.target.dataset.cur,
      link = e.target.dataset.link,
      name = link.split('/').length > 2 ? link : '/category/channel';

    this.getData(name, cur, Number(link), true);
  },
  scrollCustom(e) {
    var rpx = 750 / getApp().globalData.globalSystemInfo.windowWidth;
    var _totalLength = e.detail.scrollWidth * rpx;
    this.data.scrollPosition[e.target.dataset.id] = (54 / (_totalLength - 690)) * (e.detail.scrollLeft * rpx)
    this.setData({
      scrollPosition: this.data.scrollPosition
    })

  },


  specialUrl() {
    this.getData('/special/get_list', 1);
  },
  // 新人弹窗关闭
  closePopup() {
    wx.setStorageSync('newPopup', true)
    this.setData({
      "isNew": false
    })
  },
  // 新人弹窗图
  newPopup(e) {
    console.log(e)
    this.setData({
      isLoadNewPopup: true,
    })
  },
  // 领取新人优惠劵
  getNewCoupon() {
  
    http.request({
      
      // url: '/activity/receive_coupon',
      url: 'store/storeList',
      success(res) {
        console.log(res)
        // if (res.data.code == 200) {
        //   _.setData({
        //     isGetNew: true,
        //     isNew: false,
        //   })
        //   wx.setStorageSync('newPopup', true)
        //   wx.showToast({
        //     title: '优惠劵领取成功',
        //     icon: 'none'
        //   })
        // } else if (res.data.code == 120006) {
        //   _.setData({
        //     isGetNew: true,
        //   })
        //   wx.showToast({
        //     title: res.data.msg,
        //     icon: 'none'
        //   })
        // } else {
        //   wx.showToast({
        //     title: res.data.msg,
        //     icon: 'none'
        //   })
        // }

      }
    })
  },


  onShow(options) {
    if(this.data.userInfo.is_zhuanke != wx.getStorageSync('userInfo').is_zhuanke){
      this.getData()
    }
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
    })

  },
  onLaunch(options) {
    this.data.isLoad = true;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNewCoupon()
    // if (!!options.share) {
    //   wx.navigateTo({
    //     url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?home_page=${options.home_page}&room_id=${options.room_id}`
    //   })
    // }
    // this.setData({
    //   globalSystemInfo: getApp().globalData.globalSystemInfo
    // })

    // this.getData(this.data.block, this.data.cur);
  },

  watckAll() {
    for (var i = 0; i < this.data.navList.length; i++) {
      if (this.data.navList[i].title == '新品') {
        this.getData('/new/index', i);
        return;
      }
    }
  },

  onHide() {
    this.data.isLoad = true;
    getApp().globalData.shopIndex = {}
  },
  getData(name, cur, id, state) {
    // state 是否点击切换加载
    if (name && name.detail) {
      // 限时特惠更多兼容
      cur = name.detail.cur || 1;
      name = name.detail.name;
    }
    let _ = this;
    wx.showNavigationBarLoading();
    if (name == '/index/index') {
      _.data.tabLink = '/index/index';
      http.request({
        url: '/index/index',
        data:{is_zhuanke:_.data.userInfo.is_zhuanke?1:0},
        storage: true,
        cdn: true,
        isCode: true,
        isLogin:true,
        
        success: (res) => {
          if (res.data.code == 200) {
            var result = res.data.result;
            _.selectComponent('#requestPage').updata(true);
            var userInfo = wx.getStorageSync('userInfo');
            var data = {
              isNew: ((userInfo == '' && !wx.getStorageSync('newPopup')) || (userInfo.is_new_member && !wx.getStorageSync('newPopup'))) || false,
              isShowQrCode: true,
              userInfo: userInfo,
              "cur": cur,
              setting: result[0].setting,
              indexList: result,
              "block": name,
            };
            for (var i = 0; i < result.length; i++) {
              if (result[i].type == 'cat') {
                data.navList = result[i].items;
              }
            }
            state ? data.scrollTop = 0 : '';
            _.setData(data)



            wx.hideNavigationBarLoading();
            if (result.index_special == null) return;
            clearTimeout(this.data.timer);

          } else {
            _.selectComponent('#requestPage').updata(false);
          }
        }
      })
    } else if (name == '/special/get_list') {
      wx.hideNavigationBarLoading();
      var data = {
        "cur": 1,
        "block": name
      }
      state ? data.scrollTop = 0 : '';
      this.setData(data);



    } else if (name == '/new/index') {
      _.data.tabLink = '/new/index';
      http.request({
        url: '/new/index',
        storage: true,
        cdn: true,
        isCode: true,
        
        success: (res) => {
          if (res.data.code == 200) {
            _.selectComponent('#requestPage').updata(true);
            var result = res.data.result;
            wx.hideLoading()
            var data = {
              "cur": cur,
              "block": name,
              "newData.index_recommend_goods": result.index_recommend_goods,
              "newData.viewItem": result.items || [],
              "newData.main_slide": result.main_slide,
            }
            state ? data.scrollTop = 0 : '';
            _.setData(data);
            wx.hideNavigationBarLoading();
          } else {
            _.selectComponent('#requestPage').updata(false);
          }
        }
      })
    } else if (name == '/category/channel') {
      http.request({
        url: '/genre/channel',
        storage: true,
        cdn: true,
        isCode: true,
        data: {
          cat_id: id
        },
        success: (res) => {
          if (res.data.code == 200) {
            var result = res.data.result;
            _.selectComponent('#requestPage').updata(true);
            _.data.tabLink = id;
            wx.hideLoading()

            var data = {
              "cur": cur,
              "block": name,
              "catData.viewItem": result.cat_list,
              "catData.main_slide": result.main_slide,
            }
            state ? data.scrollTop = 0 : '';
            _.setData(data);
            wx.hideNavigationBarLoading();
          } else {
            _.selectComponent('#requestPage').updata(false);
          }
        }
      })
    }
  },

  /**
   * 搜索
   */
  gotoSearch() {
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },

  /** 
   * 转发分享
   */
  onShareAppMessage() {

    var url = '/pages/index/index?source='+(this.data.userInfo.is_zhuanke ? 'saler' :'share')+'&zk_ref='+this.data.userInfo.member_id;
    return {
      title: '名创优选-让人惊喜的好物平台',
      path: url,
      imageUrl: 'https://s1.miniso.cn/bsimg/ec/public/images/d8/42/d84283c9e19d2c50aa61e5a7db4331fb.jpg?x-oss-process=style/high'
    }
  },

})