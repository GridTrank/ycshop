const http = require('../../utils/http');
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
  onShow() {
    wx.setNavigationBarTitle({
      title: "评价"
    });

  },

  onLoad(options) {
    this.setData({
      goods_id: options.id,
    })
    this.getData();
    wx.showNavigationBarLoading({
      title: "评价"
    });
  },
  tabComment(e) {
    this.setData({
      selected: e.target.dataset.id,
    })
    if (this.data.pageInfo[this.data.selected] == 1) {
      this.getData();
    }
  },


  refresh() {
    this.data.loadingData = true;
    this.data.dataType = [true, true];
    this.data.pageInfo = [1, 1];
    this.getData();
  },
  getData: function (e) {
    // 防重复加载
    if (!this.data.loadingData || !this.data.dataType[this.data.selected]) return;
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({
      loadingData: false,
    });

    let _ = this;
    http.request({
      url: '/comment/index',
      cdn:true,
      data:{
        goods_id:this.data.goods_id,
        type:this.data.selected,
        page:_.data.pageInfo[_.data.selected]
      },
      isCode:true,
      success(res) {
        wx.hideNavigationBarLoading();
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          let result = res.data.result;
          let updateData = {
            pageLoad: true,
            'tabData[0].num': result.count_all,
            'tabData[1].num': result.count_img,
            'loadingData': true
          }
          if (_.data.selected) {
            // 有图
            updateData['pageInfo[1]'] = result.page + 1;
            updateData['comment.img'] = _.data.comment.img.concat(result.items);
            _.setData(updateData)
            if (_.data.comment.img.length >= result.count_img) {
              _.setData({
                'dataType[1]': false,
              })
            }


          } else {
            // 全部
            updateData['pageInfo[0]'] = result.page + 1;
            updateData['comment.all'] = _.data.comment.all.concat(result.items);
            _.setData(updateData)
            if (_.data.comment.all.length >= result.count_all) {
              _.setData({
                'dataType[0]': false,
              })
            }

          }
        } else {
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        wx.hideLoading()
        wx.hideNavigationBarLoading();
      },
      fail: function () {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },
  getCommentData: function (e) {
    console.log(e);
  },
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    pageLoad: false,
    notFound: {
      url: 'https://s1.miniso.cn/bsimg/ec/public/images/72/59/7259930fa9df9565232bd875737b1591.png',
      text: '还没有留言哦~'
    },
    loadingData: true, //防重复加载
    dataType: [true, true], // 是否还可以加载
    pageInfo: [1, 1],
    goods_id: "",
    selected: 0,
    tabData: [{
        name: "全部",
        num: ""
      },
      {
        name: "有图",
        num: "",
      }
    ],
    comment: {
      "all": [],
      "img": [],
    },
  }

})