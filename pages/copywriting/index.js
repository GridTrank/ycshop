const http = require('../../utils/http');
Page({
  data: {
    type: 1,
  },
  onShow() {

  },
  onHide() {

  },
  onLoad(option) {
    var name = '';
    switch (option.type) {
      case "1":
        name = '常见问题';
        break;
      case "2":
        name = '推广说明';
        break;
      case "3":
        name = '佣金计算';
        break;
      case "4":
        name = '提现说明';
        break;
      case "5":
        name = '名词解释';
        break;
      case "6":
        name = '服务协议';
        break;
      case "7":
        name = '隐私政策';
        break;
      case "8":
        name = '自由职业者服务协议';
        break;
    }
    wx.setNavigationBarTitle({
      title: name
    })
    this.setData({
      type: option.type
    })
  },


})