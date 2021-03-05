const http = require('../../utils/http.js')
const config = require('../../utils/config.js')
const login = require('../../utils/login.js')
Page({
  data: {
    visible: false,
    userInfo:wx.getStorageSync('userInfo') || {},
    person: {
      account_balance: 0,
      brokerage_money: 0,
      account_income: 0,
      settle_money: 0,
      next_settle_money: 0,
      today_money: 0,
      month_money: 0,
      prev_month_money: 0,
      potential_fans_count: 0,
      loyal_fans_count: 0
    },
    version: config.version
  },
  onShow() {
  
  },
  onHide() {

  },
  onLoad(option) {
    this.setData({
      userInfo:wx.getStorageSync('userInfo')
    })
  },
  getPhoneNumber(e){ 
    console.log(e)
  },
  getUserInfo(e){
    console.log(e)
    login.shopLogin(e).then(res=>{
      wx.setStorageSync('userInfo', res.userInfo)
      console.log(res)

      // 已注册的普通用户通过商家分享进来，新增接口修改用户信息

      this.setData({
        userInfo:res.userInfo
      })
    })
    
  },
  register(){
    login.shopRegister().then(res=>{
      console.log(1111,res)
    })
  },

  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          resolve(res.code)
        },
        fail: res => {
          reject(res)
        }
      })
    })
  },
  //邀请好友
  inviteFriend(){
    wx.navigateTo({
      url:'/pages/inviteFriend/index'
    })
  },
  toFans(){
    wx.navigateTo({
      url:'/pages/userFans/index'
    })
  },
  description(){
    wx.showModal({
      title: '粉丝等级规则',
      content:'1. 潜在粉丝：是指通过推手推广海报或分享链接进入商城的新用户，在完成授权注册后锁定成为推手的潜在粉丝，潜在粉丝锁定期为7天，若7天内未完成任意一单交易则解除与推手的粉丝关系\r\n2. 忠实粉丝：是指潜在粉丝在锁定期内，完成了任意一笔订单交易后即可激活成为推手的忠实粉丝，忠实粉丝锁定期为30天，若30天内未完成任意一笔交易则降级为潜在粉丝\r\n3. 失效粉丝：是指已经与推手解除粉丝关系的用户和升级为推手的用户；\r\n4. 以上的日期时间计算按照自然日计算',
      showCancel: false,
      confirmText: '知道了',
    })
  },
  getData() {
    http.request({
      url: '/person/info',
      success: (result) => {
        this.setData({
          person: result,
          'userInfo.is_auth': result.is_auth || false
        })
        wx.setStorageSync('userInfo', this.data.userInfo);
      }
    })
  },
  copy(e) {
    var _ = this;
    wx.setClipboardData({
      data: _.data.person.invite_code,
      success: function () {
        wx.showToast({
          title: '邀请码已复制',
          icon: "none"
        })
      }
    })
  },
  toOrder(e) {
    getApp().globalData.orderType = e.currentTarget.dataset.type;
    wx.switchTab({
      url: '/pages/order/index',
    })
  },
  // 海报
  toggleShare(e) {
    this.setData({
      visible: !this.data.visible,
    })
  },
  withdraw() {
    if (!this.data.userInfo.is_auth) {
      wx.showModal({
        title: '安全提示',
        confirmText: '去认证',
        confirmColor: "#E42727",
        content: '您的账户尚未完成安全认证，请在完成认证后继续申请提现',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/account/index',
            })
          }
        }
      })
      return;
    }
    http.request({
      url: '/withdraw/check',
      isCode: true,
      success: (res) => {
        if (res.data.code == 200) {
          wx.navigateTo({
            url: '/pages/withdraw/index',
          })
        } else {
          wx.showModal({
            title: '温馨提示',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: "#E42727",
            content: res.data.msg,
          })
        }
      }
    })
  },
  modalTip(e) {
    var type = e.currentTarget.dataset.type;
    var title = '提示';
    var content = '';
    switch (type) {
      case 'today_money':
        title = '今日收益';
        content = '下单时间为当天的待结算状态佣金订单收益，取消订单时扣减';
        break;
      case 'month_money':
        title = '本月收益';
        content = '下单时间为本月的待结算状态佣金订单收益，取消订单时扣减。';
        break;
      case 'prev_month_money':
        title = '上月收益';
        content = '下单时间为上月的待结算和已结算状态佣金订单收益，取消订单时扣减';
        break;
      case 'brokerage_money':
        title = '平台累计收入';
        content = '累计的已结算佣金收入';
        break;
      case 'account_income':
        title = '累计到账收入';
        content = '累积提现并到账的收入';
        break;
      case 'settle_money':
        title = '本月预估结算金额';
        content = '在本月之前已收货未结算的推广订单可能在本月获得的佣金收入，扣除已取消订单佣金、全额退款订单佣金和部分退款订单中退款商品的佣金（由于订单收货后仍在售后期，故为预估）。';
        break;
      case 'next_settle_money':
        title = '下月预估结算金额';
        content = '在本月收货的推广订单可能在下个月获得的佣金收入，扣除已取消订单佣金、全额退款订单佣金和部分退款订单中退款商品的佣金（由于订单可能会取消或退货，故为预估）';
        break;
      case 'withdrawTip':
        title = '提现说明';
        content = '1. 每月25日系统会给自动结算上个自然月及其之前的收货满30天但尚未结算的订单佣金，结算后资金会记入您的余额账户中，余额账户内的资金均可体现。\r\n2. 提现金额最低为1元，每位用户每月仅限提现一次。\r\n3. 余额仅在每月25-27号全天可以申请提现，请您在此期间进行提现操作，逾期需要等待下一个提现期。\r\n4. 提现申请后，将在5个工作日内完成审核，审核通过后系统会直接将提现金额支付到您的收款银行账户内，预计到账时间为10个工作日。\r\n5. 提现前必须完成账户收款信息和税务代缴认证（请前往“个人中心-账户信息”中确认）。';
        break;
      default:
        break;
    }
    wx.showModal({
      title: title,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: "#E42727",
      content: content,

    })
  },

})