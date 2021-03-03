const http = require("../../utils/http.js");
const validate = require('../../utils/validate');
const {
  chooseAddress
} = require('../../utils/util');
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    address: {
      type: Object
    },
    page: {
      type: String
    }
  },
  observers: {
    'address': function (address) {
      var data = {
        enterAddress: address || {},
      }
      if (address && address.regionInfo) {
        data.selected = address.regionInfo.length - 1 || 0;
        data.tabData = address.regionInfo
      } else {
        data.tabData = [{
          'local_name': '省份',
          'region_id': 0
        }]

      }
      this.setData(data)
      this.init()

    }
  },
  data: {
    series: 3,
    enterAddress: {},
    isEdit: false,
    selected: 0,
    tabData: [{
      'local_name': '省份',
      'region_id': 0
    }],
    isSelect: false,
    editAddressData: {}
  },
  methods: {
    // 添加微信地址
    addWXaddress() {
      chooseAddress(false, (res) => {
        if (res.provinceName == '台湾省' || res.provinceName == '香港特别行政区' || res.provinceName == '澳门特别行政区') {
          wx.showToast({
            title: '暂不支持港澳台地区',
            icon: 'none'
          })
          return;
        }
        this.data.enterAddress.name = res.userName;
        this.data.enterAddress.mobile = res.telNumber;
        this.data.enterAddress.addr = res.detailInfo;
        this.data.enterAddress.regionInfo = res.arr;
        this.setData({
          tabData: res.arr,
          selected: res.arr.length - 1,
          enterAddress: this.data.enterAddress,
        })
      })
    },
    // 输入框数据绑定
    bingData(e) {
      var param = {};
      var name = e.target.dataset.name;
      var string = 'enterAddress.' + name;
      if (name == 'def_addr') {
        param[string] = e.detail.value.length;
      } else {
        param[string] = e.detail.value;
      }

      this.setData(param)
    },
    // 地址三级联动
    selectProvince(e) {
      var type = e.target.dataset.type;
      if (type == 0) {
        // 省
        this.setData({
          'tabData[0]': {
            'local_name': e.target.dataset.name,
            'region_id': e.target.dataset.id
          },
          'tabData[1]': {
            'local_name': "城市",
            'region_id': 0
          },
          'tabData[2]': {
            'local_name': "",
            'region_id': 0
          },
          selected: 1,

        })
        if (e.target.dataset.id == '3235' || e.target.dataset.id == '3239' || e.target.dataset.id == '3242') {
          this.setData({
            'series': 2
          })
        }

      } else if (type == 1) {
        //城市

        if (this.data.series == 2) {
          this.setData({
            'tabData[1]': {
              'local_name': e.target.dataset.name,
              'region_id': e.target.dataset.id
            },
          });
        } else {
          this.setData({
            'tabData[1]': {
              'local_name': e.target.dataset.name,
              'region_id': e.target.dataset.id
            },
            'tabData[2]': {
              'local_name': "区县",
              'region_id': 0
            },
            selected: 2,
          });
        }
      } else {
        // 区县
        this.setData({
          'tabData[2]': {
            'local_name': e.target.dataset.name,
            'region_id': e.target.dataset.id
          },
        })
      }
    },
    // 确认选择地址
    enterSelect(e) {

      this.setData({
        'isSelect': false,
        'enterAddress.regionInfo': this.data.tabData,
      });
    },
    tabComment(e) {
      this.setData({
        selected: e.target.dataset.id,
      })
    },
    toggleEdit() {
      this.setData({
        isEdit: !this.data.isEdit
      })
    },
    // 切换地址选择
    toggleSelect(e) {
      this.setData({
        'isSelect': !this.data.isSelect,
      })
    },
    // 提交保存
    subAddress(e) {
      if (this.data.enterAddress.regionInfo[0].local_name == '台湾省' || this.data.enterAddress.regionInfo[0].local_name == '香港特别行政区' || this.data.enterAddress.regionInfo[0].local_name == '澳门特别行政区') {
        wx.showToast({
          title: '暂不支持港澳台地区',
          icon: 'none'
        })
        return;
      }
      if (!validate.tel(this.data.enterAddress.mobile)) {
        wx.showToast({
          title: '请输入正确的手机号！',
          icon: 'none'
        })
        return;
      }
      var area = 'mainland:';
      for (var i = 0; i < this.data.enterAddress.regionInfo.length; i++) {
        if (i == this.data.enterAddress.regionInfo.length - 1) {
          area += this.data.enterAddress.regionInfo[i].local_name + ":" + this.data.enterAddress.regionInfo[i].region_id;
          break;
        }
        area += this.data.enterAddress.regionInfo[i].local_name + "/"
      }

      if (e) {
        // 提交数据
        var dataInfo = {
          name: this.data.enterAddress.name,
          mobile: this.data.enterAddress.mobile,
          area: area,
          addr: this.data.enterAddress.addr,
          def_addr: this.data.enterAddress.def_addr,
        };
        if (this.data.enterAddress.addr_id) {
          dataInfo.addr_id = this.data.enterAddress.addr_id;
        }
        http.request({
          url: '/member/save_rec',
          
          data: dataInfo,
          success: (result) => {
            wx.showToast({
              title: '保存地址成功',
              icon: 'none'
            })
            this.setData({
              'isEdit': false,
            })
            this.updataData()
          }
        })
      }

    },
    updataData() {
      this.triggerEvent('updataData');
    },
    init() {
      // 是否请求地址数据
      if (wx.getStorageSync('editAddressData')) {
        // 读取缓存地址信息
        this.setData({
          editAddressData: wx.getStorageSync('editAddressData'),
        })
      } else {
        // 获取地址信息
        this.addressInfo()
      }
    },

    // 获取地址信息数据
    addressInfo() {
      wx.showNavigationBarLoading();
      let _ = this;
      http.request({
        url: '/member/get_area_all',
        
        data: {},
        success(result) {
          wx.hideNavigationBarLoading();
     
            _.setData({
              editAddressData: result
            })
            wx.setStorage({
              key: "editAddressData",
              data: result,
            })
          
        },
        complete: function () {
          wx.hideNavigationBarLoading()
        }
      })
    },
  },
  ready() {


  }
})