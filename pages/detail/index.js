const http = require('../../utils/http');
const {
  getFormat
} = require('../../utils/util.js');


Page({
  data: {
    main_slide:[],
    detail:{}
  },
  onShow(options) {
   
  },
  onUnload() {


  },

  onLoad(options) {
    if (options.scene) {
      var scene = decodeURIComponent(options.scene) //参数二维码传递过来的参数
      let arr = scene.split("&");
      for (let i of arr) {
        options[i.split("=")[0]] = i.split("=")[1];
      }
    }
    this.data.product_id = options.id;
    this.getData(this.data.product_id);
  },
 
  // 获取数据
  getData: function (id) {
    let _ = this;
    // 商品详情 
    wx.showLoading({
      title: '加载中...'
    })
    http.request({
      url: '/product/detail',
      cdn: true,
      data: {
        pid: id
      },
      
      success:(res)=> {
        this.setData({
          detail:res.result
        })
        wx.hideLoading()
      },
      fail: function () {
        wx.hideLoading()

      }
    })
  },
  addCart(){
    http.request({
      url:'/cart/addCart',
      data:{
        pid:this.data.detail.pid,
        mid:wx.getStorageSync('userInfo').mid,
        product_num:1111
      },
      success:(res)=>{
        console.log(res)
      }
    })
  },


 

  /** 
   * 转发分享
   */
  onShareAppMessage() {
    
  },



 
  
})