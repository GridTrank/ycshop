const http = require('../../utils/http.js')
import {
  formatTime
} from '../../utils/util.js';
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
      options:options
    })
  },


  data: {
    options:{}
  },





});