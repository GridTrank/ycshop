
const http = require('../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fansTab:[
      {label:'潜在粉丝'},
      {label:'忠实粉丝'},
      {label:'失效粉丝'}
    ],
    activeTab:0,
    pageInfo:{
      page:1,
      row:20
    },
    dataList:[],
    fans_type:1,
    loyal_fans_count:'',
    fansTotal:'',
    isShowMore:true
  },
  
  selectTab(e){
    if(this.data.activeTab!=e.currentTarget.dataset.index){
      this.setData({
        activeTab:e.currentTarget.dataset.index,
        "pageInfo.page":1,
        dataList:[],
        isShowMore:true
      })
      switch(e.currentTarget.dataset.index){
        case 0 :
          this.setData({
            fans_type:1,
          })
          break;
        case 1 :
          this.setData({
            fans_type:2,
          })
          break;
        case 2 :
          this.setData({
            fans_type:0,
          })
          break;
      }
      this.getFansData()
    }
  },
  modal(){
    wx.showModal({
      title: '粉丝人数说明',
      content:'仅统计忠实粉丝数量，不包括潜在粉丝数量和失效粉丝数量',
      showCancel: false,
      confirmText: '知道了',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    this.getFansData()
  },
  getFansData(){
    wx.showLoading({
      title: '加载中'
    })
    http.request({
      url: '/fans/index',
      data:{
        fans_type:this.data.fans_type,
        ...this.data.pageInfo
      },
      success: (result) => {
        wx.hideLoading()
        let dataArray=[]
        dataArray=this.data.dataList.concat(result.items)
        if(this.data.activeTab==0){
          wx.setStorageSync('potential',result.count)
        }
        this.setData({
          dataList:dataArray,
          loyal_fans_count:result.loyal_fans_count,
          fansTotal:result.count,
          potential:wx.getStorageSync("potential"),
        })
        if(this.data.dataList.length && this.data.dataList.length==this.data.fansTotal){
          this.setData({
            isShowMore:false
          })
        }
      }
    })
  },
  showMore(){
    let num=this.data.pageInfo.page+=1
    this.setData({
      "pageInfo.page":num
    })
    this.getFansData()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})