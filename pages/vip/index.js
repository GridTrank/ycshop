const http = require('../../utils/http.js')
Page({
  data: {
   
    lv:{
     
    }
  },
  onShow(){
  }, 
  onHide() {
  },
  onLoad(option) {
    this.getData()

  },
  getData() {
    http.request({
      url: '/person/member_lv',
      success: (result) => {
        this.setData({
          lv: result
        })
      }
    })
  },


})
