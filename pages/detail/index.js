const http = require('../../utils/http');
const {
  getFormat
} = require('../../utils/util.js');
import {shopLogin} from '../../utils/login'
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
    let mid=wx.getStorageSync('userInfo').mid
    if(!mid){
      wx.showToast({
        title:'请先登录',
        icon:'none',
        duration:1500,
        success:()=>{
          setTimeout(()=>{
            wx.switchTab({
              url:'/pages/user/index'
            })
          },1500)
          
        }
      })
      
      return
    }
    http.request({
      url:'/cart/addCart',
      data:{
        pid:this.data.detail.pid,
        mid:wx.getStorageSync('userInfo').mid,
        product_num:1111
      },
      success:(res)=>{
        if(res.code==200){
          wx.showToast({
            title:'添加成功',
            icon:'none'
          })
        }else{
          wx.showToast({
            title:'添加失败',
            icon:'none'
          })
        }
      }
    })
  },


 

  /** 
   * 转发分享
   */
  onShareAppMessage() {
    
  },



 
  
})