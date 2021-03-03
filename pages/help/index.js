import http from '../../utils/http.js';
Page({
  data: {
    list:[],
    type:'1'
  },
  onShow(){
    
  }, 
  onHide() {
   
  },
  getData(){
     http.request({
       url:'/write/index',
       data:{
        page_mark:this.data.type == 1 ? 'help':'zhuanke',
       },
       success:(result)=>{
         this.setData({
          list:result
         })
       }
     })   
  },
  onLoad(option) {
    this.setData({
      type:option.type || 1,
    })
    wx.setNavigationBarTitle({
      title: this.data.type == 1 ? '帮助中心' :'推手宝典',
    })
    this.getData()

  },
  
})