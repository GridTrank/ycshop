
Page({


  /** 
   * 转发分享
   */
  onShareAppMessage() {
    return {
      title: '名创优选-让人惊喜的好物平台',
      path: '/pages/index/index',
      imageUrl: 'https://s1.miniso.cn/bsimg/ec/public/images/4f/a5/4fa50b410a8462864c429fcc98d68e74.png'
    }
  },
  onLoad(options) {
    this.setData({
      type: options.type
    });

    wx.setNavigationBarTitle({ title: this.data.tittle[options.type] })
  },

  /**
   * 页面的初始数据
   */
  data: {
    type: null,
    tittle: ["服务说明", "服务说明", "优惠券使用说明", "名创优品服务协议"]
  },
})