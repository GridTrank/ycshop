
Component({
  properties: {
    page:{
      type:String,
    }
  },
 
  data:{
    isTip:false,
    globalSystemInfo: getApp().globalData.globalSystemInfo,
  },
  methods: {
    closeTip(){
      this.setData({
        isTip: !this.data.isTip
      })
    }
  },
  ready(){
    this.setData({
      globalSystemInfo: getApp().globalData.globalSystemInfo,
    })
    if(!wx.getStorageSync('tip')){
      this.setData({
        isTip: true
      })
      wx.setStorageSync('tip', true)
      setTimeout(() => {
        this.closeTip();
      }, 5000)
    }
  }
})