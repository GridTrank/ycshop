const http = require('../../utils/http.js')
Page({
  data: {

    withdrawList: [],
    state:{
      0:{
        name:'待审核',
        class:"gray"
      },
      1:{
        name:'已付款',
        class:"blue"
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
    page: 1,
    isLoad: true,
  },
  onShow() {},
  onHide() {},
  onLoad(option) {
    this.getData()

  },

  getData() {
    if(!this.data.isLoad) return;
    http.request({
      url: '/withdraw/index',
      data: {
        page: this.data.page,
        rows: 20,
      },
      success: (result) => {
        this.setData({
          withdrawList: this.data.withdrawList.concat(result.items),
        })
        this.data.page++;
        if (result.items.length >= result.total) {
          this.data.isLoad = false;
        }
      }
    })
  }

})