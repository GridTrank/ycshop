// pages/default/index.js

const http = require('../../utils/http');
const config=require('../../utils/config')


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
    productList:[]
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

    this.getData()
    
  },



  onHide() {
    
  },
  getData() {
    http.request({
      url:'/product/index',
      data:{
        store_id:2
      },
      success:(res)=>{
        let result=res.data
        result.forEach(el=>{
          el.imgUrl= 'http://47.112.113.38:3000/uploads/'+ el.banners.split(',')[0]
        })
        this.initPro(result)
      }
    })
  },
  initPro(data){
    let list=this.data.productList
    let types=[]
    data.forEach(item=>{
      if(types.indexOf(item.type)==-1){
        types.push(item.type)
      }
    })
    types.forEach(tt=>{
      var ss=[]
      data.forEach(dd=>{
        if(tt==dd.type){
          ss.push(dd)
        }
      })
      list.push({
        type:tt,
        items:ss
      })
    })
    this.setData({
      productList:list
    })
    
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

   
  },

})