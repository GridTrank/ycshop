const http = require('../../utils/http.js')
import { formatTime } from '../../utils/util.js';
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
  onLoad() {
    wx.setNavigationBarTitle({ title: '名创优品 - 限时特卖' });
    this.getData();
  },


  /**
   * 获取 Ajax 数据
   */
  getData(e) {
    clearTimeout(this.data.time);
    wx.showNavigationBarLoading();
    let _ = this;

    http.request({
      url: '/special/get_list',
      
      success(res) {
        wx.hideNavigationBarLoading();
        let result = res.data.result;
        _.setData({
          navSize: result.items.length,
          items: result.items,
          timestamp: result.timestamp
        });

        wx.getSystemInfo({
          success(res) {
            let l = _.data.navSize;
            let w = l >= 5 ? res.windowWidth / 5 : res.windowWidth / l;
            _.setData({
              width: w,
              windowHeight: res.windowHeight,
              windowWidth: res.windowWidth
            });

            if (e == undefined) {
              result.items.some((v, i) => {
                if (v.special_status == 2) {
                  _.selectNavData(i);
                }
              })
            } else {
              let index = e.currentTarget.dataset.index;
              _.selectNavData(index);
            }

          }
        })

      },
      complete:function(){
        wx.hideNavigationBarLoading()
      }
    });

  },

  /**
   * 切换时间
   */
  selectNavData(e) {

    let i = typeof e === 'number' ? e : e.currentTarget.dataset.index,
      s = this.data.navSize - 2,
      w = this.data.width,
      scrollLeft = i <= 2 ? 0 : (i >= s ? w * (s - 3) : w * (i - 2)),
      data = this.data.items[i];

    this.setData({
      cur: i,
      scrollLeft: scrollLeft,
      curItem: data
    });

    if (this.data.curItem.special_status == 2)
      this.setStatusTime(this.data.curItem.end_time - this.data.timestamp);
  },

  /** 
   * 设置倒计时
   */
  setStatusTime(v) {
    let h = parseInt(v % (60 * 60 * 24) / 60 / 60),
      m = parseInt(v % (60 * 60) / 60),
      s = parseInt(v % (60)),
      cur = this.data.cur,
      curUp = cur + 1;

    this.setData({ buyStatus: '本场还剩 ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s) });

    if (v > 1) {
      this.data.time = setTimeout(() => {
        v--;
        // console.log(v)
        this.setStatusTime(v)
      }, 1000)
    } else {
      this.getData();
    }

  },

  /** 
   * 图片加载
   */
  imageLoad(e) {
    let $width = e.detail.width, //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height; //图片的真实宽高比例
    let viewHeight = this.data.windowWidth / ratio; //计算的高度值
    this.setData({ bannerHeight: viewHeight });
  },

  /** 
   * 滚动置顶
   */
  scroll(e) {
    let fixed = e.detail.scrollTop >= this.data.bannerHeight ? 'ms-fixed2' : '';
    this.setData({
      fixed: fixed
    })
  },

  /** 
   * 提醒弹窗
   */
  showModal(e) {
    let type = e.currentTarget.dataset.type;
    this.setData({ productID: e.currentTarget.dataset.id })
    if (type == 1) {
      this.setData({ isModal: true });
      setTimeout(() => { this.setData({ isShow: true }) }, 200);
    } else {
      this.setData({ isShow: false });
      setTimeout(() => { this.setData({ isModal: false, tel: '' }) }, 200);
    }
  },

  /** 
   * 兼容 input 输入
   */
  listenInput(e) {
    this.setData({ tel: e.detail.value });
  },

  /** 
   * 短信提醒设置
   */
  noticeSMS(e) {

    let _ = this.data,
        self = this;
    http.request({
      url: '/special/remind',
      
      data: {
        special_id: _.curItem.special_id,
        product_id: _.productID,
        mobile: _.tel
      },
      isCode:true,
      success(res) {
        if (res.data.code == 200) {
          wx.showModal({
            title: '提示',
            content: '提醒设置成功',
            showCancel: false,
            success(res) {
              self.setData({ isShow: false });
              setTimeout(() => { self.setData({ isModal: false, tel: '' }) }, 200);
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: self.data.tel == '' ? '手机号不可以为空' : res.data.msg,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                self.setData({tel: ''})
              }
            }
          });
        }
      }
    });

  },

  data: {
    userInfo: wx.getStorageSync('userInfo'),
    isModal: false,
    isShow: false,
    productID: null,

    fixed: '',
    windowHeight: '',
    windowWidth: '',
    bannerHeight: '',
    width: '',
    time: '',

    tel: '',

    navSize: 0,
    scrollLeft: 0,
    buyStatus: '',
    timestamp: '',

    items: [],
    curItem: {},

    specialStatus: ['已结束', '已开抢', '开抢中', '即将开抢']

  }
})