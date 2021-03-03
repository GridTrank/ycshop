// id=1&shareOpenid=oJGoh0exslg_fPpzf1NQQ-zscDco
const http = require('../../utils/http');
import {
  getFormat
} from '../../utils/util.js';
Page({

  /** 
   * 转发分享
   */
  onShareAppMessage() {

    return {
      title: this.data.detail.share_title,
      imageUrl: this.data.detail.share_image,
      path: '/pages/invite/index?id=' + this.data.invite_id
    }
  },
  onShow(options) {
    wx.setNavigationBarTitle({
      title: "助力详情"
    });


    this.getData();
  },

  onLoad(options) {
    this.data.invite_id = options.id;
  },
  enterCallback(e) {
    if (e.detail.type == 'getphonenumber') {
      this.getPhoneNumber(e.detail)
    }
  },

  // 获取助力列表信息
  getData: function () {
    var _ = this;
    http.request({
      url: '/invite/detail',
      data: {
        invite_id: this.data.invite_id,
        openid:  wx.getStorageSync('userInfo').openid
      },
      success: function (result) {
        var openId =  wx.getStorageSync('userInfo').openid;
        var time = result.invite_status == 2 ? (result.end_time - result.now_time) : 0;
        if (result.role == 1) {
          // 发起者
          // 成功发起助力弹窗缓存
          if (!(wx.getStorageSync('successInviteId')[_.data.invite_id]) && result.invite_status == 2) {
            _.data.popupSet = {
              type: 'invite',
              state: 'start',
              isShow: true,
              title: '成功发起助力',
              dec: "快快邀请好友助力吧！",
              img: 'https://s1.miniso.cn/bsimg/ec/public/images/e0/04/e004fb06fa56baaf0426548dae3bd3e3.png',
              enterText: '邀请微信好友',
              enterClass: 'gradient',
              cancleShow: false,
              enterShow: true,
              enterOpentype: "share"
            };
            var invite = wx.getStorageSync('successInviteId') || {};
            invite[_.data.invite_id] = true;
            wx.setStorageSync('successInviteId', invite)
          }
          // 活动达标 && 活动结束
          if (!(wx.getStorageSync('endGetInviteId')[_.data.invite_id]) && result.invite_status == 1 && time <= 0) {
            _.data.isTip = false;
            _.data.popupSet = {
              type: 'invite',
              state: 'coupon',
              isShow: true,
              title: '恭喜，助力成功啦',
              dec: "优惠劵一小时内发送您的账户",
              img: 'https://s1.miniso.cn/bsimg/ec/public/images/88/8d/888d6e44a708ee3d0f7b515bcb85e4cb.png',
              cancleText: '立即使用',
              cancleClass: 'gradient',
              cancleShow: true,
              enterShow: false,
            };
            var invite = wx.getStorageSync('endGetInviteId') || {};
            invite[_.data.invite_id] = true;
            wx.setStorageSync('endGetInviteId', invite)
          }

          // 活动结束未达标
          if (result.invite_status == 3 && !(wx.getStorageSync('endInviteId')[_.data.invite_id])) {
            _.data.isTip = false;
            _.data.popupSet = {
              type: 'invite',
              state: 'end',
              isShow: true,
              title: '还差一点就成功了',
              dec: "助力已结束，继续加油吧",
              img: 'https://s1.miniso.cn/bsimg/ec/public/images/d5/5e/d55e5a49d913557d0ff167c2c714f4f0.png',
              cancleText: '知道了',
              cancleClass: 'gradient',
              cancleShow: true,
              enterShow: false,
            };
            var invite = wx.getStorageSync('endInviteId') || {};
            invite[_.data.invite_id] = true;
            wx.setStorageSync('endInviteId', invite)
          }
        }
        // 计算精度条比例%
        result.speed = _.countPercentage(result.speed);
        _.setData({
          popupSet: _.data.popupSet,
          openid: openId,
          userInfo: wx.getStorageSync('userInfo'),
          detail: result,
          assistance_list: result.assistance_list,
          speed: result.speed,
          'main_slide': result.banner,
          time: time * 1000,
        }, function () {
          if (time > 0) {
            clearTimeout(this.data.timer);
            _.timeDown();
          };

        })
        if (result.role == 2) {
          if (result.login_required == 1) {
            // 登录助力
            if (_.data.userInfo.is_bind_mobile && result.invite_status == 2) {
              // 已登录直接助力
              _.friendsHple();
            }
          } else if (wx.getStorageSync('userInfo')) {
            if (result.invite_status == 2) {
              // 自动助力
              _.friendsHple();
            }
          }
        }

        if (result.invite_status != 2 && _.data.isTip) {
          wx.showToast({
            title: '本场助力已结束',
            icon: 'none'
          })
        } else {
          _.data.isTip = true;
        }


      }
    })
  },
  // 助力
  friendsHple() {
    var _ = this;
    if (_.data.isInvite) return;
    http.request({
      url: '/invite/assistant',
      data: {
        activity_id: this.data.detail.activity_id,
        openid:  wx.getStorageSync('userInfo').openid,
        avatar: this.data.userInfo.avatarUrl,
        nickname: this.data.userInfo.nickName,
        invite_id: this.data.invite_id,
      },
      success: function (result) {

        _.data.assistance_list.items.unshift({
          avatar: result.avatar,
          nickname: result.nickname,
        })
        _.data.assistance_list.count++;
        result.speed = _.countPercentage(result.speed);
        _.setData({
          isInvite: true,
          speed: result.speed,
          assistance_list: _.data.assistance_list,
        })
        wx.showToast({
          title: '助力成功',
          icon: "none"
        })


      },
      fail: function (res) {
        console.log('2:' + res)
      },
      complete: function (res) {
        _.setData({
          isHelp: true,
        })
      }

    })
  },
  countPercentage(speed) {
    // 计算精度条比例%
    // 平均数值
    var average = 100 / (speed.items.length);
    var length = speed.items.length;
    var perNum = speed.assistance_num_index == -1 ? 0 : Number(speed.items[speed.assistance_num_index].assistance_num);
    var nextNum = speed.assistance_num_index >= length - 1 ? Number(speed.items[speed.assistance_num_index].assistance_num) : Number(speed.items[speed.assistance_num_index + 1].assistance_num);
    // 平均百分值*当前达标index + （当前人数 - 上一级人数）/（下一级 -上一级人数）*(平均百分（小数）*100)）;
    if (nextNum == perNum) {
      speed.assistanceRate = 100;
    } else {
      speed.assistanceRate = (average * (speed.assistance_num_index + 1)) + (((Number(speed.assistance_num) - perNum) / (nextNum - perNum)) * (average / 100) * 100);
    }
    return speed;
  },
  // 发起助力
  inviteStart() {
    var _ = this;
    if (_.flag) return;
    _.flag = true;
    http.request({
      url: '/invite/launch',
      
      data: {
        activity_id: this.data.detail.activity_id,
        openid:  wx.getStorageSync('userInfo').openid
      },
      isCode: true,
      success(res) {
        var result = res.data.result;
        if (res.data.code == 200 || res.data.code == 130005) {
          _.data.invite_id = result.invite_id;
          _.getData();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }

      },
      complete() {
        setTimeout(() => {
          _.flag = false;
        }, 500)


      }
    })
  },
  //立即领取
  getCoupon() {
    if (Number(this.data.speed.assistance_num) < Number(this.data.speed.items[0].assistance_num)) {
      wx.showToast({
        title: '邀请助力达标后方可领取',
        icon: "none"
      })
    } else {

      if (Number(this.data.speed.assistance_next_num) == 0) {
        this.data.popupSet.state = 'get';
        this.cancleCallback();
        return;
      } else {
        this.data.popupSet = {
          type: 'invite',
          state: 'get',
          isShow: true,
          subhead: `再邀请${this.data.speed.assistance_next_num}位好友可享受更高优惠，是否继续领取？`,
          img: 'https://s1.miniso.cn/bsimg/ec/public/images/88/8d/888d6e44a708ee3d0f7b515bcb85e4cb.png',
          enterText: '邀请好友',
          cancleText: '立即领取',
          enterClass: 'gradient',
          cancleClass: 'lineRed',
          cancleShow: true,
          enterShow: true,
          enterOpentype: "share",

        }
      }

      this.setData({
        popupSet: this.data.popupSet,

      })
    }
  },
  // 倒计时
  timeDown: function () {

    var timeArr = getFormat(this.data.time);
    this.setData({
      timeArr: timeArr
    });
    if (this.data.time <= 0) {
      // 结束回调
      this.getData();
      clearTimeout(this.data.timer);
      return;
    }
    this.data.time -= 1000;
    this.data.timer = setTimeout(this.timeDown, 1000);

  },

  // 加载更多好友列表
  getMoreFriends() {
    var _ = this;
    if (_.data.isLoadingFriend) return;
    if (this.data.assistance_list.count > this.data.assistance_list.items.length) {
      // 加载
      _.data.isLoadingFriend = true;
      _.data.assistance_list.page++;
      http.request({
        url: '/invite/rank',
        data: {
          invite_id: _.data.invite_id,
          page: _.data.assistance_list.page,
          rows: _.data.assistance_list.rows,
          openid:  wx.getStorageSync('userInfo').openid,
        },
        success: function (result) {
          _.data.isLoadingFriend = false;

          _.data.assistance_list.items = _.data.assistance_list.items.concat(result.items);
          _.setData({
            'assistance_list.items': _.data.assistance_list.items
          })


        }
      })

    }
  },
  // 显示更多
  getMore() {
    this.setData({
      isMore: !this.data.isMore
    })
  },
  // 弹窗开关
  toggleShow() {
    this.setData({
      'popupSet.isShow': !this.data.popupSet.isShow
    })
  },
  // 规则弹窗初始化
  rulePopup() {
    this.data.popupSet = {
      type: 'userDefined',
      name: 'rule',
      isShow: true,
      cancleShow: false,
      enterShow: false,
    }
    this.setData({
      popupSet: this.data.popupSet
    })
  },
  //取消弹窗回调
  cancleCallback() {
    var _ = this;
    if (this.data.popupSet.state == 'get') {
      //立即领取
      http.request({
        url: "/invite/receive",
        data: {
          invite_id: this.data.invite_id,
          openid:  wx.getStorageSync('userInfo').openid,
        },
        success: function (res) {

          // _.data.popupSet = {
          //   type: 'invite',
          //   state: 'coupon',
          //   isShow: true,
          //   title: '恭喜领取成功啦',
          //   dec: '优惠劵一小时内发送您的账户',
          //   img: 'https://s1.miniso.cn/bsimg/ec/public/images/88/8d/888d6e44a708ee3d0f7b515bcb85e4cb.png',
          //   cancleText: '立即使用',
          //   cancleClass: 'gradient',
          //   cancleShow: true,
          //   enterShow: false,
          // }
          _.setData({
            // popupSet: _.data.popupSet,
            'detail.invite_status': 1,
            time: 0,
            isTip: false,
          })

        }
      })
    } else if (this.data.popupSet.state == 'coupon') {
      if (_.data.detail.product_id == '0') {
        if (_.data.detail.poputype.type == '0') {
          wx.switchTab({
            url: '/pages/index/index',
          })
        } else {
          if (_.data.detail.poputype.is_nav == '1') {
            wx.switchTab({
              url: _.data.detail.poputype.populink,
            })
          } else {
            wx.navigateTo({
              url: _.data.detail.poputype.populink,
            })
          }
        }

      } else {
        wx.navigateTo({
          url: '../detail/index?id=' + _.data.detail.product_id,
        })
      }
    } else if (this.data.popupSet.state == 'end') {
      this.toggleShow();
    }
  },
  data: {
    isHelp: false,
    isInvite: false,
    popupSet: {
      type: 'invite',
      state: 'start',
      isShow: false,
      title: '成功发起助力',
      dec: "快快邀请好友助力吧！",
      img: 'https://s1.miniso.cn/bsimg/ec/public/images/e0/04/e004fb06fa56baaf0426548dae3bd3e3.png',
      enterText: '邀请微信好友',
      enterClass: 'gradient',
      cancleShow: false,
      enterShow: true,
      enterOpentype: "share"
    }, //弹窗配置
    openid: '',
    speed: {}, //进度条数据
    assistance_list: {}, //助力用户列表
    invite_id: '', //助力单id
    isRule: false, //规则弹窗状态
    isMore: false, //显示更多助力好友状态
    timeArr: {
      ss: '00',
      mm: '00',
      hh: '00',
      dd: '00'
    }, //倒计时时间数组
    time: 10000, //倒计时时间戳
    userInfo: wx.getStorageSync('userInfo'),
    main_slide: [],
    swiper: { //banner

      imgheight: null,
      indicatorDots: true,
      circular: true,
      autoplay: true,
      interval: 5000,
      duration: 300,
    },
    isTip: true,
    isLoadingFriend: false,
    //页面信息数据
    detail: {},
    explain: {
      visiblePopup: false
    },
    userRefresh: {},
    flag: false
  }
})