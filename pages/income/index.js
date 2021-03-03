// pages/order/index.js
const http = require('../../utils/http.js')
const getFormat = require('../../utils/util.js')
Page({


  /**
   * 页面的初始数据
   */
  data: {
    subscribeStatus:'',
    triggered:false,
    globalSystemInfo: getApp().globalData.globalSystemInfo,
    userInfo: wx.getStorageSync('userInfo'),
    selected: 0,
    incomeTab: ['销售收入', '推广收入'],
    type: 1,
    orderTab: [{
      name:"全部",
      id:0
    },{
      name:"待结算",
      id:'wait'
    },{
      name:"已结算",
      id:'1'
    },{
      name:"已失效",
      id:'3'
    }],
    pageInfo: {
      1:[1, 1, 1, 1, 1],
      2:[1, 1, 1, 1, 1]
    }, //页码
    loadingData: true, //防重复加载
    dataType: {
      1:[true, true, true, true, true],
      2:[true, true, true, true, true]
    }, // 是否还可以加载
    orderData: {
      1:[[],[],[],[],[]],2:[[],[],[],[],[]],
    },
    orderCount:{
      1:{
        state:false,
        count:[]
      },
      2:{
        state:false,
        count:[]
      }
    },
    templateIds:['Buv_Ty27w3lWun5ziTrGFCSYxM7iOu-A9TarAFmwcyY']

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    setTimeout(() => {
      this.setData({
        globalSystemInfo: getApp().globalData.globalSystemInfo,
      })
    }, 300);
  },
  subscription(){
    wx.requestSubscribeMessage({
      tmplIds:this.data.templateIds,
      success:(res)=>{
        console.log(res)
        http.request({
          url:'/message/subscribe',
          data:{
            message_type:'wx',
            template_id:this.data.templateIds
          },
          success:(res)=>{
            this.setData({
              subscribeStatus:1
            })
          }
        })
      },
      fail:(res)=>{
        console.info(res);
        if(res.errCode == 20004){
          wx.showToast({
            title: '请在小程序设置中开启接收订阅消息',
            icon:'none'
          })
        }
      }
    })
  },
  pullDownUpdata(){
    this.data.dataType= {
      1:[true, true, true, true, true],
      2:[true, true, true, true, true]
    }
    this.data.pageInfo={
      1:[1, 1, 1, 1, 1],
      2:[1, 1, 1, 1, 1]
    }; //页码
    this.data.orderData={
      1:[[],[],[],[],[]],2:[[],[],[],[],[]],
    };
    this.data.orderCount={
      1:{state:false,count:[]},
      2:{state:false,count:[]}
    }
    this.getData();
    this.orderCount();
  },
  // 获取订单列表信息
  getData: function () {
    // 防重复加载
    if (!this.data.loadingData || !this.data.dataType[this.data.type][this.data.selected]) {
      return
    };
    wx.showLoading({
      title: '加载中...'
    })
    this.data.loadingData = false;
    let _ = this;
    var select = 0;
    switch (Number(_.data.selected)) {
      case 1:
        select = 2;
        break;
      case 2:
        select = 1;
        break;
      default:
        select = _.data.selected;
    }
    var reData = {
      order_type:this.data.type,
      status: select,
      page: _.data.pageInfo[_.data.type][_.data.selected],
    }
    http.request({
      url: '/waybill/orders',
      isCode: true,
      data: reData,
      isCode:true,
      success(res) {
        wx.hideLoading()
        if (res.data.code == 100001) {
          // 未登陆
          _.setData({
            orderData: [],
            dataType: {
              1:[false, false, false, false, false],
              2:[false, false, false, false, false]
            },
          }, () => {
            _.data.loadingData = true;
          });
        } else if (res.data.code == 200) {
          
          var result = res.data.result;

          _.data.orderData[_.data.type][_.data.selected] = _.data.orderData[_.data.type][_.data.selected].concat(result.orders);
          _.data.pageInfo[_.data.type][_.data.selected]++;
          _.setData({
            subscribeStatus:result.subscribe_msg_status,
            orderData: _.data.orderData,
            triggered:false,
          }, () => {
            _.data.loadingData = true;
          });
          if (_.data.orderData[_.data.type][_.data.selected].length >= result.pager.count) {
            _.data.dataType[_.data.type][_.data.selected] = false;
            _.setData({
              dataType: _.data.dataType
            });
          }
        }
      },
      fail: function () {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        _.data.loadingData = true;
      },
 
    })
  },
  orderCount(){
    if(this.data.orderCount[this.data.type].state) return;
    
    http.request({
      url:'/person/order_count',
      isCode:true,
      data:{
        order_type:this.data.type
      },
      success:(result)=>{
    
          this.data.orderCount[this.data.type] = {
            state:true,
            count:result
          }
          this.setData({
            orderCount:this.data.orderCount,
          })
        }
        
      
    })
  },
  selectType(e){
    var type = e.currentTarget.dataset.type;
    console.log(type);

    this.setData({
      type: type,
    })
    if (this.data.pageInfo[this.data.type][this.data.selected] == 1) {
      this.getData();
      this.orderCount();
    }
  },
  selectTab(e) {
    if(!this.data.loadingData) return;
    var index = e.currentTarget.dataset.index;
    this.setData({
      selected: index,
    })
    if (this.data.pageInfo[this.data.type][index] == 1) {
      this.getData();
    }

  },

  togglePopup() {
    this.setData({
      'popup.isHide': !this.data.popup.isHide,
    })
  },
  toafterSale() {
    wx.navigateTo({
      url: "/pages/web/index?type=1"
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (getApp().globalData.orderType !== '') {
      var type = getApp().globalData.orderType;
      this.setData({
        type: type
      })
      getApp().globalData.orderType = '';
    }

    this.getData();
    this.orderCount();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})