const http = require('../../utils/http');
const wxPay = require('../../utils/wxPay');

Component({
    properties: {
        orderItem: {
            type: Object,
        },
        page: {
            type: String
        },
    },
    observers: {
        'orderItem': function(orderItem) {
            if (orderItem.status && orderItem.status[0] == 1 && !this.data.timer) {
                var longTime = orderItem.prepare_list ? orderItem.prepare_list.order_timeout : 3600;
                this.data.timestamp = longTime - (orderItem.nowtime - orderItem.createtime);
                this.downTime()
            }
        }
    },
    data: {
        timestamp: 0,
        time: 0,
        timer:null,
    },
    
    methods: {
        // 订单倒计时
        downTime() {
            let m = parseInt(this.data.timestamp % (60 * 60) / 60),
                s = parseInt(this.data.timestamp % (60));
            this.data.time = (m < 10 ? '0' + m : m) + ' : ' + (s < 10 ? '0' + s : s);
            this.setData({
                time: this.data.time
            });

            this.data.timer = setTimeout(() => {
                if (this.data.timestamp > 1) {
                    this.data.timestamp--;
                    this.downTime();
                } else {
                    // 过期
                    this.uploadData()

                }
            }, 1000)

        },
        // 更新数据
        uploadData() {
            this.triggerEvent("updataData")
        },

        // 订单操作按钮
        orderBtn(e) {

            let _ = this;

            var orderInfo = {
                type: e.currentTarget.dataset.type,
                api: e.currentTarget.dataset.api,
                id: e.currentTarget.dataset.id,
                index: e.currentTarget.dataset.index,
                data: {
                    order_id: e.currentTarget.dataset.id
                }
            }
            var content = "";
            switch (orderInfo.type) {
                case 'pay':

                    wxPay.getPayParam(orderInfo.id, function(obj) {
                        if (obj.msg == "pay:cancel") {

                        } else {
                            wx.navigateTo({
                                url: '/pages/payBox/index?id=' + orderInfo.id + '&type=1&delay=true'
                            })
                        }
                    }, false);
                    break;
                case 'cancel':
                    content = "确认取消该订单？";
                    break;
                case 'del':
                    content = "删除后订单将无法找回，是否继续操作？";
                    break;
                case 'rebuy':
                    orderInfo.api = '/cart/rebuy';
                    this.orderRequest(e, orderInfo);
                    break;
                case 'receive':
                    content = "确认已收到商品？";
                    break;
                case 'discussed':
                case 'discussing':
                    wx.navigateTo({
                        url: "/pages/evaluate/index?id=" + orderInfo.id,
                    })
                    break;
                case 'logistic':
                    wx.navigateTo({
                        url: "/pages/logistics/index?id=" + orderInfo.id,
                    })
                    break;
                case 'caller':
                    wx.navigateTo({
                        url: "/pages/web/index?type=1",
                    })
                    break;

            };

            if (content != '') {
                wx.showModal({
                    title: '提示',
                    content: content,
                    confirmColor: '#E72722',
                    success: function(res) {
                        if (res.confirm) {
                            _.orderRequest(e, orderInfo);
                        }
                    }
                })
            }
        },
        // 订单操作请求
        orderRequest(e, orderInfo) {
            wx.showLoading({
                mask: true,
            });
            let _ = this;
            http.request({
                url: orderInfo.api,
                
                data: orderInfo.data,
                isCode:true,
                success(res) {
                    wx.hideLoading();
                    if (res.data.code == 200) {
                        switch (orderInfo.type) {
                            case 'cancel':
                                _.uploadData();
                                wx.showToast({
                                    title: "取消订单成功",
                                    icon: 'none'
                                })
                                break;
                            case 'del':
                                if (_.data.page == 'detail') {
                                    wx.redirectTo({
                                        url: '/pages/order/index',
                                    })
                                    return;
                                }
                                _.uploadData();
                                wx.showToast({
                                    title: "删除订单成功",
                                    icon: 'none'
                                })
                                _.setData({
                                    orderData: _.data.orderData,
                                })
                                break;
                            case 'rebuy':
                                wx.switchTab({
                                    url: "/pages/cart/index",
                                })
                                break;
                            case 'receive':
                                _.uploadData();
                                break;

                        };

                    } else if (res.data.code == 300016) {
                        wx.showToast({
                                title: res.data.msg,
                                icon: 'none'
                            })
                            // 订单配货中无法取消
                        if (_.data.page == 'detail') {
                            setTimeout(function() {
                                _.uploadData();
                            }, 2000)

                            return;
                        }
                        _.uploadData();

                    } else {
                        wx.showToast({
                            title: res.data.msg,
                            icon: 'none'
                        })
                    }
                }
            })
        }
    },
    ready() {},
})