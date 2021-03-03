const http = require('../../utils/http.js')
Page({
  data: {
    withdraw_id:'',
    withdrawDetail:{},
    state:{
      0:{
        name:'待审核',
        class:"gray"
      },
      1:{
        name:'已付款',
        class:"gray"
      },
      2:{
        name:'待付款',
        class:"gray"
      },
      3:{
        name:'付款中',
        class:"gray"
      },
      4:{
        name:'付款失败',
        class:"red"
      },
      5:{
        name:'审核拒绝',
        class:"red"
      }
    },
  },
  onShow(){
  }, 
  onHide() {
  },
  onLoad(option) {
    this.data.withdraw_id = option.id;
    this.getData()
  },
  getData(){
    http.request({
      url:'/withdraw/detail',
      data:{
        withdraw_id:this.data.withdraw_id
      },
      success:(result)=>{
        this.setData({
          withdrawDetail:result
        })
      }
    })
  },
  copy(){
    wx.setClipboardData({
      data:this.data.withdrawDetail.withdraw_trade_no,
      success:(res)=>{
        wx.showToast({
          title: '复制成功',
          icon:'none'
        });
      }
    }) 
  }

})
