const http = require("../../utils/http.js");
Component({

  data:{
    requestState : true,
  },
  methods: {
    refresh(){
      this.triggerEvent('refresh');
    },
    updata(state) {
      var _ = this
      this.setData({
        requestState: state,
      })
    },
    goHome(){
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  ready(){
    
  }
})