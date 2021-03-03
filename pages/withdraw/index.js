const http = require('../../utils/http.js')
Page({
  data: {
    withdraw_amount: '',
    withdrawInfo: {},
    isWithdraw:true,
  },
  onShow() {},
  onHide() {},
  onLoad(option) {
    this.getData()

  },
  getData() {
    http.request({
      url: '/withdraw/view',
      success: (result) => {
        this.setData({
          withdrawInfo: result,
        })
      }
    })
  },
  allWithdraw() {
    this.setData({
      withdraw_amount: this.data.withdrawInfo.balance,
    })
  },
  withdraw() {
    wx.showModal({
      title: '提现说明',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: "#E42727",
      content: '1. 每月25日系统会给自动结算上个自然月及其之前的收货满30天但尚未结算的订单佣金，结算后资金会记入您的余额账户中，余额账户内的资金均可体现。\r\n2. 提现金额最低为1元，每位用户每月仅限提现一次。\r\n3. 余额仅在每月25-27号全天可以申请提现，请您在此期间进行提现操作，逾期需要等待下一个提现期。\r\n4. 提现申请后，将在5个工作日内完成审核，审核通过后系统会直接将提现金额支付到您的收款银行账户内，预计到账时间为10个工作日。\r\n5. 提现前必须完成账户收款信息和税务代缴认证（请前往“个人中心-账户信息”中确认）。',

    })
  },
  amountInput(e) {
    var money = e.detail.value;
    var balance = Number(this.data.withdrawInfo.balance);
    if(Number(money) > balance && money != ''){
      money = this.data.withdrawInfo.balance;
    }else if(Number(money) < 1 && Number(money) != '' && balance > 0 ){
      money = '1';
    }
    var re = /([0-9]+\.{1}[0-9]{2})[0-9]*/;
    money = money.replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')
    this.setData({
      withdraw_amount: money
    })
  },

  applyWithdraw() {
    if (this.data.withdraw_amount <= 0) {
      wx.showToast({
        title: '请输入正确的提现金额',
        icon: 'none'
      })
      return;
    }
    http.request({
      url: '/withdraw/add',
      isCode:true,
      data: {
        withdraw_amount: this.data.withdraw_amount
      },
      success: (res) => {
        if(res.data.code == 200){
          this.setData({
            isWithdraw:false,
          })
          var userInfo = wx.getStorageSync('userInfo');
          userInfo.isWithdraw = true;
          wx.setStorageSync('userInfo', userInfo);
        }else{
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
  }


})