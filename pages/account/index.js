const http = require('../../utils/http');
const {
  validateTel,
  validateIdcard,
  validateEmail
} = require('../../utils/util');
Page({
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    info: {
      "email": "", //邮箱
      "wx_account": "", //微信号
      "bank_card_no": "", //卡号
      "bank_name": "", //银行名
      "reserve_tel": "", //预留手机号
      "real_name": "", //真实姓名
      "id_card_no": "", //身份证
      message: false,
    },
    isChaneBrand: false,
    errorInfo: {},
    is_auth: false,
    baseInfo: {}
  },
  onShow() {},
  onHide() {},
  onLoad(option) {

    this.setData({
      is_auth: wx.getStorageSync('userInfo').is_auth || false,
      userInfo: wx.getStorageSync('userInfo')
    })

    if (this.data.is_auth) {
      // 已实名
      http.request({
        url: '/realnameauth/view',
        success: (result) => {

          result.message = true;
          this.setData({
            info: result,
            baseInfo: JSON.stringify(result) ,
          })
        }
      })
    }
  },
  chaneBrand() {
    this.setData({
      isChaneBrand: true,
      'info.bank_card_no': this.brandFormat(this.data.info.bank_card_no),
    })
  },
  inputcustom(e) {
    var name = e.currentTarget.dataset.name;

    this.data.info[name] = e.detail.value;
    if (name == 'message') {
      this.data.info[name] = e.detail.value[0] || false;
    } else if (name == 'bank_card_no') {

      this.data.info.bank_card_no = this.brandFormat(e.detail.value);
    }else if(name == 'email'|| name == 'wx_account'){
      this.data.info[name] = e.detail.value.replace(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/g,'');
    }
    this.data.errorInfo[name]='';
    this.setData({
      info: this.data.info,
      errorInfo:this.data.errorInfo,
    })
  },
  brandFormat(brandNo) {
    var brandNoFormat = '';
    brandNo = brandNo.replace(/\s/ig, "");
    for (var i = 0; i < brandNo.length; i++) {
      if ((i + 1) % 4 == 0 && i + 1 != brandNo.length) {
        brandNoFormat += brandNo[i] + ' ';
      } else {
        brandNoFormat += brandNo[i];
      }
    }
    return brandNoFormat
  },
  cardNoCheck(e) {
    var bank_card_no = this.data.info.bank_card_no.replace(/\s/ig, "");
    if (bank_card_no === ''){
      this.setData({
        'info.bank_name': ''
      })
      return;
    }
    if (bank_card_no.length < 16) {
      this.setData({
        'errorInfo.bank_card_no': '输入有误'
      })
      return;
    }
    http.request({
      url: '/bank/get_card_info',
      data: {
        bank_card_no: this.data.info.bank_card_no.replace(/\s/ig, ""),
      },
      success: (result) => {
        if (result.validated && result.stat == 'ok' && result.messages == null) {
          // 卡号有效并且银行卡状态ok
          this.setData({
            'errorInfo.bank_card_no': '',
            'errorInfo.bank_name': '',
            'info.bank_name': result.bank_name
          })
        } else {
          if (result.messages.bank_card_no) {
            this.setData({
              'errorInfo.bank_card_no': '输入有误'
            })
          }else if(result.messages.cardType){
            this.setData({
              'errorInfo.bank_card_no': '仅支持储蓄卡'
            })
          } else {
            this.setData({
              'errorInfo.bank_card_no': '',
              'errorInfo.bank_name': result.messages.bank_name,
              'info.bank_name': result.messages.bank_name
            })
          }

        }
      }
    })
  },
  blurCheck(e) {
    console.log(e)
    var name = e.currentTarget.dataset.name;
    switch (name) {
      case 'reserve_tel':
        if (this.data.info.reserve_tel == '') return;
        this.setData({
          'errorInfo.reserve_tel': validateTel(this.data.info.reserve_tel) ? '' : '输入有误',
        })
        break;
      case 'bank_card_no':
        this.cardNoCheck()
        break;
      case 'id_card_no':
        if (this.data.info.id_card_no == '') return;
        this.setData({
          'errorInfo.id_card_no': validateIdcard(this.data.info.id_card_no) ? '' : '输入有误',
        })
        break;
    }

  },
  modal(e) {
    var name = e.currentTarget.dataset.name;
    var title = '';
    var con = '';
    switch (name) {
      case 'brand':
        title = '绑定收款银行卡说明'
        con = '用于收取佣金的银行卡需满足以下条件：\r\n1. 银行账户需为收款人本人的I类账户，具体可向开户银行客服咨询（一般工资储蓄卡为I类账户，平台不支持绑定信用卡）；\r\n2. 请准确填写您的银行卡和银行预留手机号码，平台支持各大国内银行提现转账业务，如您的银行卡暂未支持可更换其他银行卡后重试（建议绑定国有四大行账户）；\r\n3. 收到佣金前，请保持您的银行账户状态正常。如果您的银行账户处于注销、挂失、冻结等异常状态，可能会影响您的提现到账；';
        break;
      case 'card':
        title = '税务代缴说明'
        con = '根据个人所得税法及国家其他相关法律法规要求，佣金收入需要缴纳个人所得税，本平台已委托第三方代理公司进行个税代扣代缴服务，请您根据页面指引真实填写您的个人信息，我们将对您的隐私信息严格保密。填写时请注意一下事项：\r\n1. 收款人的姓名和身份证号码必须为真实信息，且与银行卡开户人信息一致，否则无法完成实名认证；\r\n2. 收款人须为年满18周岁且不超过65周岁的自然人；';
        break;
    }
    wx.showModal({
      title: title,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: "#E42727",
      content: con,

    })
  },
  sub() {
  
    var info = JSON.parse(JSON.stringify(this.data.info));
    info.bank_card_no = this.data.info.bank_card_no.replace(/\s/ig, "");
    if (this.data.baseInfo === JSON.stringify(info)) {
      wx.showToast({
        title: '保存成功',
        icon: 'none'
      })
      this.setData({
        isChaneBrand: false,
      })
      return;
    }
    wx.showLoading({
      title: '验证中...',
      icon:'none'
    })
    http.request({
      url: '/realnameauth/submit',
      data: {
        email: this.data.info.email,
        wx_account: this.data.info.wx_account,
        bank_card_no: this.data.info.bank_card_no.replace(/\s/ig, ""),
        bank_name: this.data.info.bank_name,
        reserve_tel: this.data.info.reserve_tel,
        real_name: this.data.info.real_name,
        id_card_no: this.data.info.id_card_no,
      },
      isCode: true,
      success: (res) => {
        if (res.data.code == 200) {
          this.setData({
            is_auth: true,
            isChaneBrand: false,
            'info.bank_card_no': this.data.info.bank_card_no.replace(/\s/ig, ""),
          })
          var userInfo = wx.getStorageSync('userInfo');
          userInfo.is_auth = true;
          wx.setStorageSync('userInfo', userInfo)
          wx.showModal({
            title: '验证通过',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: "#E42727",
            content: '账户信息已验证通过，可以进行提现',
          })
          this.data.baseInfo =  JSON.stringify(this.data.info);
        } else if (res.data.code == 171002) {
          wx.showModal({
            title: '提交次数过多，请明天再试',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: "#E42727",

          })
        } else {
          wx.showModal({
            title: '信息有误，请核对以下事项后重试',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: "#E42727",
            content: '1. 请确认您的身份证、姓名与银行卡开户信息一致；\r\n2. 请核实您在银行预留的手机号码，详情请咨询银行客服进行确认；\r\n3. 如核实后依然存在此提示，请联系平台客服处理。'
          })
        }
      },
      complete:(res)=>{
        wx.hideLoading();
      }
    })
  }



})