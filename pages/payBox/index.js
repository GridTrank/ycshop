const http = require('../../utils/http.js')
const wxPay = require('../../utils/wxPay');
import { formatTime } from '../../utils/util.js';
Page({

  onUnload() {
    if (this._observer) this._observer.disconnect();
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
  onShow(){
    wx.setNavigationBarTitle({ title: "支付结果" });

  },

  /**
   * 初始化获取数据
   */
  onLoad(e) {
    this.setData({ 'param.id': e.id, 'param.type': e.type, lock: false, delay: e.delay});
    this.getData({ id: e.id, type: e.type }, e.delay);
    console.log("e-----------------------")   
  },
  getData(obj, delay) {
    let _ = this;
    wx.showNavigationBarLoading();
    http.request({
      url: '/paycenter/result_pay',
      data: {
        "id": obj.id,
        "type": obj.type,
        "delay": delay
      },
      success: (result) => {
      
          _.setData({
            status: _.data.stateText[result.pay_status],
            items: result.items,
            name: result.name,
            mobile: result.mobile,
            shipping_addr: result.shipping_addr,
            order_total: result.order_total,
            isLoad :true,
            order_id: result.order_id,
            statu: result.pay_status,
            lock: false
          })

        wx.hideNavigationBarLoading();
        wx.setNavigationBarTitle({ title: "支付结果" })
      },
      fail: (error) => {
        wx.hideNavigationBarLoading();
        console.log("error------------")
      }
    })
  },

  data: {
    _observer:{},
    nowTime: Date.parse(new Date()),
    userInfo: wx.getStorageSync('userInfo'),
    isLoad: false,            // 加载完成状态
    status: {},               // 订单状态
    items: [],                // “其他人也在买” 推荐
    name : "",                // 名字
    mobile: 0,                // 手机号
    shipping_addr: "",        // 地址 
    order_total: 0,           // 金额V
    order_id : 0,             // 订单id
    statu : 0,                // 状态id
    delay: true, //是否延迟查询（用于避免支付回调延迟导致支付结果错误的问题）
    param: {
      id: null,
      type: null
    },
    extraData: { source: 'youxuanb2c' },
    stateText: [
      {
        title: "付款失败",
        info: "请在1小时内完成付款否则订单会被系统取消，如你已付款，请稍后查看订单，无需再次支付",
        clas: 'failRed',
        img:'https://s1.miniso.cn/bsimg/ec/public/images/0f/62/0f62a4018a15ce67c6274cedefdf2a05.png'
      },
      {
        title: "支付超时",
        info: "支付超时，订单已被系统自动取消",
        clas: 'failRed',
        img: 'https://s1.miniso.cn/bsimg/ec/public/images/91/90/9190888cd678784f0a3f1d84fb53978e.png'
      },
      {
        title: "支付成功",
        info: "付款成功，正在为您安排发货...",
        clas: 'success',
        img: 'https://s1.miniso.cn/bsimg/ec/public/images/3b/6d/3b6de6391226bd5c0a5ed739685d991e.png'
      }
    ],
    lock : false
  },

  /**
   * 申请支付
   */
  pay(){
    let _ = this;

    if(_.data.lock) return;

    wxPay.getPayParam(_.data.order_id, function(obj) {
      if (obj.msg == "pay:cancel"){
        _.setData({
          lock: false
        })
      }else{
        _.getData(_.data.param, obj.delay)
      }
    },false)

    _.setData({
      lock : true
    })
  },

})