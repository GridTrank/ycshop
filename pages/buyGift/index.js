const http = require('../../utils/http.js')
import {
  formatTime
} from '../../utils/util.js';
Page({

  // 初始化数据
  onLoad(options) {
    this.setData({
      rule_id: options.rule_id,
      is_satisfy: options.is_satisfy
    });
    this.getData();

    wx.setNavigationBarTitle({
      title: "换购列表"
    })
  },

  getData() {
    let _ = this;
    wx.showLoading({
      title: '加载中...'
    })
    wx.showNavigationBarLoading();
    http.request({
      url: '/cart/abgoods',
      data: {
        "rule_id": _.data.rule_id
      },
      isCode:true,
      success: function(res) {
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          var gift_list = res.data.result.gift_list;

          gift_list.forEach((item) => {
            if (item.selected) {
              _.data.productIdArr.push(item.product_id)
            }
          })
          _.setData({
            rule_info: res.data.result.rule_info,
            gift_list: res.data.result.gift_list,
            productIdArr: _.data.productIdArr,
          });
        } else {
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      },
      fail: function() {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },

  data: {
    userInfo: wx.getStorageSync('userInfo'),
    rule_id: "", //  活动规则id
    gift_list: [], //	赠品列表
    is_satisfy: '', //是否满足活动规则
    productIdArr: [],
  },


  /**
   * 选择商品
   */
  seletActive(e) {
    if (this.data.is_satisfy != '1') {
      wx.showToast({
        title: '不满足该优惠的使用条件',
        icon: 'none',
        duration: 2000,
      })
      return;
    }
    let _ = this,
      id = e.currentTarget.dataset.id,
      index = _.data.productIdArr.indexOf(id);

    if ((_.data.productIdArr.length >= _.data.rule_info.addbuy_limit && index == -1) && _.data.rule_info.addbuy_limit ){
      
      return;
    }
    if (index == -1) {
      // 选中
      _.data.productIdArr.push(id)
    } else {
      // 取消选中
      _.data.productIdArr.splice(index, 1);
    }

    _.setData({
      'productIdArr': _.data.productIdArr,
    })

  },
  subBug() {
    var _ = this;
    if (_.data.is_satisfy == 0) {
      wx.navigateBack({
        delta: 1
      })
      return;
    }
    wx.showLoading()

    http.request({
      url: '/cart/abgoods_select',
      data: {
        product_ids: _.data.productIdArr.join(',') || 0,
        rule_id: _.data.rule_id
      },
      success: function(res) {
        wx.navigateBack();
      },
      complate: function() {
        wx.hideLoading();
      }
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
  }
})