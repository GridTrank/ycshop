
import {
  formatTime
} from '../../utils/util.js';
const http = require('../../utils/http');
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
      title: "我的助力"
    });
    this.data.dataType = [true, true, true];
    this.data.loadingData = true;
    this.data.powerData = [
      [],
      [],
      []
    ];
    this.data.pageInfo = [1, 1, 1];
    this.getData();

  },

  tabComment(e) {
    this.setData({
      selected: e.target.dataset.id,
    })
    if (this.data.pageInfo[this.data.selected] == 1 && this.data.dataType[this.data.selected]) {
      this.getData();
    }
  },
  onLoad(options) {
    this.setData({
      selected: options.type || 0,
    })


  },

  // 获取助力列表信息
  getData: function (e, state, rows, page, status) {

    // 防重复加载
    if (!this.data.loadingData || !this.data.dataType[this.data.selected]) {
      return
    };
    wx.showLoading({
      title: '加载中...'
    })
    this.data.loadingData = false;
    wx.showNavigationBarLoading({
      title: "我的助力"
    });

    let _ = this;
    var reData = {
      status: status || _.data.selected + 1,
      page: page || _.data.pageInfo[_.data.selected],
      rows: rows || 20,
    }

    http.request({
      url: '/invite/helps',
      
      data: reData,
      isCode:true,
      success(res) {
        wx.hideNavigationBarLoading();
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          let result = res.data.result;

          _.data.pageInfo[reData.status - 1] = Number(result.page) + 1;


          _.data.powerData[reData.status - 1] = _.data.powerData[reData.status - 1].concat(result.items);
          _.setData({
            loadingData: true,
            powerData: _.data.powerData,
            pageInfo: _.data.pageInfo
          });
          if (_.data.powerData[reData.status - 1].length >= Number(result.count)) {
            _.data.dataType[reData.status - 1] = false;
            _.setData({
              dataType: _.data.dataType
            });
          }

        } else {
          _.data.loadingData = true;
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        wx.hideLoading()
      },
      fail: function () {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        _.data.loadingData = true;
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },


  data: {
    userInfo: wx.getStorageSync('userInfo'),
    payState: true,
    pageName: "list",
    popup: {
      isHide: false,
      token: wx.getStorageSync("token"),
    },
    notFound: {
      url: 'https://s1.miniso.cn/bsimg/ec/public/images/e0/d1/e0d138e3602411ef4dbf9f2566d4bc48.png',
      text: '还没有助力哦~'
    },
    selected: 0,
    pageInfo: [1, 1, 1], //页码
    loadingData: true, //防重复加载
    dataType: [true, true, true], // 是否还可以加载
    tabData: [{
        name: "全部",
        filtrate: "",
      },
      {
        name: "进行中",
        filtrate: "",
      },
      {
        name: "已结束",
        filtrate: "",
      },

    ],
    powerData: [
      [],
      [],
      []
    ],
  }
})