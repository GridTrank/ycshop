import {
  formatTime
} from '../../utils/util.js';
const http = require('../../utils/http');
Page({
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    payState: true,
    pageLoad: false,
    notFound: {
      url: 'https://s1.miniso.cn/bsimg/ec/public/images/e0/d1/e0d138e3602411ef4dbf9f2566d4bc48.png',
      text: '还没有订单哦~'
    },
    orderTab: [{
      name: "全部",
      id: ''
    }, {
      name: "待付款",
      id: '0'
    }, {
      name: "待发货",
      id: '1'
    }, {
      name: "已发货",
      id: '2'
    }, {
      name: "待评价",
      id: '8'
    }],
    pageInfo: [1, 1, 1, 1, 1], //页码
    dataType: [true, true, true, true, true], // 是否还可以加载
    orderData: [
      [],
      [],
      [],
      [],
      []
    ],
    selected: 0,
  },
  selectTab(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selected: index,
    })
    if (this.data.pageInfo[index] == 1) {
      this.getData();
    }

  },
  // 获取订单列表信息
  getData: function (e, state, rows, page, status) {

    // 防重复加载
    if (!this.data.dataType[this.data.selected]) {
      return
    };
    wx.showLoading({
      title: '加载中...'
    })

    if (!state) {
      wx.showNavigationBarLoading({
        title: "订单"
      });
    }
    let _ = this;
    var reData = {
      status: status || _.data.selected,
      page: page || _.data.pageInfo[_.data.selected],
      rows: rows || 20,
    }

    http.request({
      url: '/order/orders',
      
      data: reData,
      success(result) {
        wx.hideNavigationBarLoading();
        wx.hideLoading()
        if (!!state) {
          // 倒计时更新数据不更新页码并且清空数据
          _.data.orderData[reData.status] = [];
        } else {
          _.data.pageInfo[reData.status] = result.pager.page + 1;
        }

        _.data.orderData[reData.status] = _.data.orderData[reData.status].concat(result.orders);
        _.setData({
          pageLoad: true,
          orderData: _.data.orderData,
          pageInfo: _.data.pageInfo
        });
        if (_.data.orderData[reData.status].length >= result.pager.count) {
          _.data.dataType[reData.status] = false;
          _.setData({
            dataType: _.data.dataType
          });
        }


      },
      fail: function () {
        wx.hideLoading()
        wx.hideNavigationBarLoading();

      }
    })
  },
  updata() {
    var data = {};
    data.pageInfo = [1, 1, 1, 1, 1]; //页码
    data.dataType = [true, true, true, true, true];
    data.orderData = [
      [],
      [],
      [],
      [],
      []
    ];
    this.setData(data)
    this.getData();
  },
  // tab切换数据
  tabSelect(currentIndex) {
    console.log(currentIndex)

    this.setData({
      selected: currentIndex
    })
    this.getData();
  },
  toafterSale() {
    wx.navigateTo({
      url: "/pages/web/index?type=1"
    })
  },

  onLoad(option) {
    this.setData({
      selected: option.state || 0,
    })
    this.getData();
  }

})