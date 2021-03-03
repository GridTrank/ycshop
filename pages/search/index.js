const http = require('../../utils/http.js')
import {
  formatTime
} from '../../utils/util.js';
Page({


  onshow() {
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
    })
  },
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

  /**
   * 页面的初始数据
   */
  data: {
    productInfo:{},
    isCategory: false,
    screenType: 1, //（例如：1:综合排序(销量) 2:价格升序(低->高) 3;价格降序(高->低)）
    catId: 0,
    catData: [],
    hotItem: [],
    is_search: true,
    userInfo: wx.getStorageSync('userInfo'),
    page: 1,
    isLoad: false,
    isOver: false,
    placeholder: "名创优品自营",
    searchValue: '', // 搜索值
    historyValue: [], // 搜索记录数组
    hotValue: [], // 热门搜索数组
    viewItem: [], // 数据数组
    notFound: {
      url: 'https://s1.miniso.cn/bsimg/ec/public/images/44/6f/446f4e16a02b0a3e02966b118dcfe43d.png',
      text: '抱歉，您搜索的商品还未上架，看看推荐商品吧'
    },
    userInfo: wx.getStorageSync('userInfo'),
    isNotFound: false
  },
  standardData(e) {
    this.data.event = e.detail.event;
    this.setData({
      productInfo: e.detail.item,
    })
  },
  /** 
   * 返回上一页 
   */
  back() {
    wx.navigateBack()
  },

  getSearchHot() {
    var _ = this;
    http.request({
      url: '/search/index',
      
      success(result) {

        _.setData({
          hotValue: result || []
        })

      }
    })


  },
  getHot() {
    var _ = this;
    http.request({
      url: '/hot/index',
      
      success(result) {

        _.setData({
          hotItem: result || []
        })

      }
    })
  },
  category(e) {
    if (this.data.catId == e.currentTarget.dataset.id) return;
    this.setData({
      catId: e.currentTarget.dataset.id,
      isCategory: false,
      isLoad: false,
      isOver: false,
      page: 1,
      isNotFound: false,
    })
    this.getData()
  },
  screen(e) {
    var type = e.currentTarget.dataset.type;
    console.log(type);
    switch (Number(type)) {
      case 0:
        // 分类
        this.setData({
          isCategory: !this.data.isCategory,
          screenType: 0,
        })
        break;
      case 1:
        // 综合
        if (this.data.screenType == type) return;
        this.setData({
          screenType: 1,
          isLoad: false,
          isOver: false,
          page: 1,
          isNotFound: false,
        });
        this.getData();
        break;
      case 2:
      case 3:
        //价格
        this.data.screenType == 3 ? this.data.screenType = 2 : this.data.screenType = 3;
        this.setData({
          screenType: this.data.screenType,
          isLoad: false,
          isOver: false,
          page: 1,
          isNotFound: false,
        });
        this.getData();
    }
  },
  /**
   * 监听输入搜索函数
   */
  inputValue(e) {
    e.detail.value == '' ?
      this.setData({
        searchValue: e.detail.value,
        viewItem: []
      }) :
      this.setData({
        searchValue: e.detail.value
      });
    this.getHistory();
  },
  /**
   * 搜索触发函数
   */
  search() {
    if (this.data.searchValue == '') return;
    this.sendSearch();

  },
  /** 
   * 标签触发函数
   */
  searchTag(e) {
    this.setData({
      searchValue: e.currentTarget.dataset.value
    });
    this.sendSearch();
  },
  /**
   * 搜索
   */
  sendSearch() {
    this.setHistory(this.data.searchValue); // 设置搜索记录
    wx.showNavigationBarLoading();

    this.setData({
      isLoad: false,
      isOver: false,
      page: 1,
      catId: 0,
      screenType: 1,
      isNotFound: false,
      viewItem: []
    })
    this.getData()
  },
  /**
   * 获取数据
   */
  getData() {
    if (!this.data.is_search) return;
    if (this.data.isOver) return;
    if (this.data.isLoad) return;
    this.setData({
      isLoad: true
    });
    this.data.is_search = false;
    let _ = this;
    http.request({
      url: '/inquire/index',
      
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        search_keywords: _.data.searchValue,
        type: 'is_search',
        page: _.data.page,
        cat_id: _.data.catId,
        orderBy: _.data.screenType,
      },
      success(result) {

          wx.hideNavigationBarLoading();
          if (_.data.page == 1) _.data.viewItem = [];
          if (result.items.length <= 0 && _.data.page == 1) return _.setData({
            isNotFound: true,
            searchValue: ''
          });
          _.setData({
            viewItem: _.data.viewItem.concat(result.items),
            catId: _.data.catId,
            catData: result.catData || [],
            page: _.data.page + 1,
            isLoad: false,
          });
          if (result.count <= _.data.viewItem.length) {
            _.setData({
              isOver: true
            });
          }

        
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        _.data.is_search = true;
      }
    })
  },
  /** 
   * 清除搜索值函数
   */
  cleanValue() {
    this.getHistory(); // 获取历史记录
    this.setData({
      searchValue: '',
      viewItem: [],
      page: 1,
      isNotFound: false
    }); // 清除对应的搜索值，数据数组
  },


  /**
   * 设置 history 函数
   * @param {String} [searchValue]
   */
  setHistory(searchValue) {
    let self = this;
    wx.getStorage({
      key: 'historyArray',
      success: function (res) {
        let value = res.data.split('|');
        let index = value.indexOf(searchValue);

        // 删除多余
        if (value.length >= 10 && index > -1) value.splice(index, 1);
        if (value.length >= 10 && index <= -1) value.pop();
        if (index > -1) value.splice(index, 1);

        // 设置历史记录
        value.unshift(searchValue);
        let history = value.join('|');
        wx.setStorage({
          key: "historyArray",
          data: history
        })

      },
      fail: function () {
        wx.setStorage({
          key: "historyArray",
          data: searchValue,
        })
      },
      complete: function (res) {
        console.log(res)
      }
    })
  },
  /**
   * 获取 history 函数
   */
  getHistory() {
    let self = this;
    wx.getStorage({
      key: 'historyArray',
      success: function (res) {
        let data = res.data ? res.data.split('|') : '';
        self.setData({
          historyValue: data
        })
      }
    })
  },
  /**
   * 删除 history 函数
   */
  delHistory() {
    let self = this;
    wx.removeStorage({
      key: 'historyArray',
      success() {
        self.setData({
          historyValue: []
        })
      }
    })
  },

  infocus(e) {
    this.setData({
      isNotFound: false
    });
    this.getHistory();
  },

  scroll() {
    this.getData();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _ = this;
    _.getHistory();
    _.getSearchHot();
    _.getHot();
  }

})