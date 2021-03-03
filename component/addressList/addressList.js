const http = require("../../utils/http.js");
Component({
  properties: {
    page: {
      type: String
    },
    addressList: {
      type: Object
    },
    is_fastbuy: {
      type: String
    }
  },

  data: {
    isEdit: false,
    open: false,
    disabled: true,
    editAddressData: {}, //地址信息数据
    address: {}, //修改地址详情
    default: 0,
    tabData: [{
      name: "省份",
      id: "0"
    }],
    enterAddress: [ //确认的地区信息数据
    ],
  },
  methods: {
    // 编辑地址
    updataData() {
      this.triggerEvent('updataData');
    },
    // 删除地址
    deteleAddress: function (e) {
      let _ = this;
      let id = e.target.dataset.id;
      let index = e.target.dataset.index;
      wx.showModal({
        content: "您确定删除该地址？",
        confirmColor: "#D9232F",
        success: (res) => {
          if (res.confirm) {
            http.request({
              url: "/member/del_rec",
              data: {
                area_id: id
              },
              success: (res) => {

                wx.showToast({
                  title: '删除地址成功',
                  icon: 'none'
                })
                this.updataData()

              }
            })
          }
        }
      })
    },
    editAdd: function (e) {
      let _ = this;
      let id = e.currentTarget.dataset.id;
      let index = e.currentTarget.dataset.index;
      let type = e.currentTarget.dataset.type;

      if (this.data.page == 'address' || type == 'edit') {

        this.toggleEdit(this.data.addressList[index]);

      } else {
        // 订单选择
        this.orderSelectAddress(e);
      }
    },
    toggleEdit(data) {
      this.triggerEvent('toggleEdit', data)
    },
    // 确认订单也选择地址
    orderSelectAddress(e) {
      let id = e.currentTarget.dataset.id;
      let index = e.currentTarget.dataset.index;
      http.request({
        url: '/cart/total',
         
        data: {
          isfastbuy: this.data.is_fastbuy,
          addr_id: id
        },
        success: (result) => {

            var orderData = {
              address: this.data.addressList[index],
              total: result,
            }
            wx.setStorage({
              key: "orderAddress",
              data: orderData,
              success: (res) => {
                wx.navigateBack();
              }
            })
          


        }
      })

    },

  },
  ready() {


  }
})