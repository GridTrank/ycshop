const http = require("../../utils/http.js");
Component({
    properties: {
        // 商品信息
        detail: {
            type: Object,
            value: {},
        },
        userInfo: {
            type: Object
        },
        page: {
            type: String,
            value: 'detail'
        },
        rule: {
            type: Number
        }
    },
    observers: {
        'detail': function (detail) {
            if (this.data.productDetail.goods_id != detail.goods_id && detail.goods_id) {
                this.standardData(detail.goods_id);
            } else if (this.data.productDetail.goods_id == detail.goods_id && this.data.page != 'detail' && detail.goods_id) {
                if (this.data.standard.products && this.data.standard.products.length == 1) {
                    this.goCart({
                        currentTarget: {
                            dataset: {}
                        }
                    })
                } else {
                    if (!this.data.productDetail.all_store && this.data.page != 'detail') {
                        // 规格没选全
                        wx.showToast({
                            title: "该商品无库存",
                            icon: 'none'
                        })
                        return;
                    }
                    this.toggleSelect()
                }

            }

            this.setData({
                productDetail: detail || {},
                defaultPic: ''
            })
        }
    },
    data: {
        open: false,
        selectedLength: 0,
        standard: {},
        selected: {},
        selectedProduct: {
            goods: {
                marketable: true,
            },
            num: 1,
        },
        productDetail: {},
        defaultPic: '',
        filtrate: {},
    },
    methods: {
        toggleSelect(e) {
            this.setData({
                "open": !this.data.open
            })

            // typeof this.toggleCallback === 'function' ? this.toggleCallback() : "";

        },
        togglePopup() {
            this.setData({
                "open": false,
            })
            this.triggerEvent('togglePopup', 'share')
        },
        // 只有单个商品默认选择规格
        onlyProduct: function () {

            var that = this.data.standard.spec;
            for (var i = 0; i < that.length; i++) {

                if (this.data.standard.products[0].stock == 0) {
                    this.data.filtrate[that[i].info[0].private_spec_value_id] = 0;
                    this.data.selectedLength = 0;
                } else {
                    this.data.selected[that[i].spec_id] = that[i].info[0];
                    this.data.selectedLength = that.length;

                }
            }
            this.setData({
                'selectedProduct.goods': this.data.standard.products[0],
                selected: this.data.selected,
                selectedLength: this.data.selectedLength,
                filtrate: this.data.filtrate
            })
            this.triggerEvent('updataGoodStandard', {
                selectedProduct: this.data.selectedProduct,
                selected: this.data.selected
            })
        },
        toafterSale() {
            wx.navigateTo({
                url: "/pages/web/index?type=1"
            })
        },
        // 预售未开始
        presellNotStart() {
            wx.showToast({
                title: '预售未开始，请稍后',
                icon: "none"
            })
        },

        defaultStandard: function () {
            // 一级规格  初始化默认状态
            var that = this.data.standard.products;
            for (var i = 0; i < that.length; i++) {
                this.data.filtrate[that[i].spec_private_value_id[0].private_spec_value_id] = that[i].stock;
                this.setData({
                    filtrate: this.data.filtrate,
                });
            }
        },
        // 开售提醒
        saleRemind(e) {
            var _ = this;
            if (this.data.productDetail.prepare_list.is_remind) {
                wx.showToast({
                    title: '已经设置过提醒',
                    icon: 'none'
                })
                return;
            }
            wx.showModal({
                title: '预售提醒设置成功',
                content: '小优将在预售商品开售前第一时间通知您，请留意您的手机短信！',
                showCancel: false,
                confirmColor: "#E72722",
                success(res) {
                    if (res.confirm) {
                        http.request({
                            url: '/prepare/remind',
                            data: {
                                prepare_id: _.data.standard.prepare_list.prepare_id,
                                product_id: _.data.productDetail.product_id,
                                goods_id: _.data.productDetail.goods_id
                            },
                            isCode: true,
                            success(res) {
                                var result = res.data.result;
                                if (res.data.code == 200) {
                                    _.setData({
                                        'productDetail.prepare_list.is_remind': 1,
                                    })
                                    this.triggerEvent('updataGoodStandard', {
                                        detail: this.data.productDetail
                                    })
                                    wx.showToast({
                                        title: '设置提醒成功',
                                        icon: "none"
                                    })
                                } else if (res.data.code == 140004) {
                                    _.setData({
                                        'productDetail.prepare_list.is_remind': 1,
                                    })
                                    this.triggerEvent('updataGoodStandard', {
                                        detail: this.data.productDetail
                                    })
                                    wx.showToast({
                                        title: res.data.msg,
                                        icon: "none"
                                    })
                                } else {
                                    wx.showToast({
                                        title: res.data.msg,
                                        icon: "none"
                                    })
                                }
                            }
                        })

                    }
                }
            })
        },
        selectStandard(e) {
            //   选择规格数据

            var index = e.target.dataset.index; //当前选中的规格大（index）
            var cid = e.target.dataset.cid; //当前选中的规格大（spec_id）id
            this.data.selected[cid] = this.data.standard.spec[index].info[e.target.dataset.minindex]; //当前选中的规格信息
            this.data.defaultPic = this.data.standard.spec[index].info[e.target.dataset.minindex].spec_goods_images;
            //更新selected（选中的规格）值
            for (var i in this.data.selected) {
                if (this.data.selected[i].spec_goods_images != '') {
                    this.data.defaultPic = this.data.selected[i].spec_goods_images;
                    break;
                }
            }
            this.setData({
                selected: this.data.selected,
                defaultPic: this.data.defaultPic
            });


            this.filtrate(e);
        },
        selectProductCallback() {
            this.triggerEvent('selectProductCallback');
        },
        filtrate(e) {
            //   根据当前的选择查找对应商品的库存
            var that = this.data.standard.products; //  全部商品数据
            var cid = e.target.dataset.cid; //当前选中的规格大（spec_id）id
            var vid = e.target.dataset.vid; //当前选中的规格小（private_spec_value_id）id
            var index = e.target.dataset.index; //当前选中的规格大（index）
            var minindex = e.target.dataset.minindex; //当前选中的规格小（index）
            var lengthSpec = this.data.standard.spec.length; //获取当前商品的规格数

            var otherSelected = 0; //两个规格另外一个没选选中规格的大（index)
            var selectedL = Object.keys(this.data.selected).length; //记录选中的规格的个数
            this.setData({
                selectedLength: selectedL,
            })

            var ishaverShop = false;
            if (lengthSpec >= 2) {
                var orderSpec = '';
                index ? orderSpec = '0' : orderSpec = '1';
                var obj = this.data.standard.spec[orderSpec].info;
                for (var o = 0; o < obj.length; o++) {
                    for (var i = 0; i < that.length; i++) {
                        if (obj[o].private_spec_value_id == that[i].spec_private_value_id[orderSpec].private_spec_value_id && that[i].spec_private_value_id[index].private_spec_value_id == vid) {
                            ishaverShop = true;
                        }
                    }

                    if (!ishaverShop) {
                        // 商品不存在设置库存为0
                        this.data.filtrate[obj[o].private_spec_value_id] = 0;
                        this.setData({ //更新filtrate（库存）值
                            filtrate: this.data.filtrate,
                        });
                    }
                    ishaverShop = false;
                }
            };
            // 选择规格
            var isSelectedShop = false;
            for (var i = 0; i < that.length; i++) {
                for (var j = 0; j < that[i].spec_private_value_id.length; j++) {
                    if (lengthSpec == 1 && that[i].spec_private_value_id[0].private_spec_value_id == vid) {
                        //一级规格
                        isSelectedShop = true
                        this.setData({
                            'selectedProduct.goods': that[i],
                            'selectedProduct.state': true,
                        })
                        this.triggerEvent('updataGoodStandard', {
                            selectedProduct: this.data.selectedProduct,
                            selected: this.data.selected
                        })
                        this.selectProductCallback && this.selectProductCallback();
                    } else if (lengthSpec == 2 && that[i].spec_private_value_id[j].private_spec_value_id == vid) {
                        // 两级
                        j ? otherSelected = '0' : otherSelected = '1';
                        // 小id匹配获取另一个规格的id跟库存
                        this.data.filtrate[that[i].spec_private_value_id[otherSelected].private_spec_value_id] = that[i].stock;
                        this.setData({ //更新filtrate（库存）值
                            filtrate: this.data.filtrate
                        });

                        if (selectedL == 2) {
                            for (var n in this.data.selected) {
                                if (this.data.selected[n].private_spec_value_id == that[i].spec_private_value_id[otherSelected].private_spec_value_id) {
                                    isSelectedShop = true
                                    this.setData({
                                        'selectedProduct.goods': that[i],
                                        'selectedProduct.state': true,
                                    });
                                    this.triggerEvent('updataGoodStandard', {
                                        selectedProduct: this.data.selectedProduct,
                                        selected: this.data.selected
                                    })
                                    this.selectProductCallback && this.selectProductCallback();
                                }
                            }

                        }
                    }
                }
            }
            if (!isSelectedShop && selectedL == 2) {
                // 选中商品没有商品信息
                this.setData({
                    'selectedProduct.goods': {
                        marketable: false
                    },
                    'selectedProduct.state': true,
                });
            }
            if (this.data.selectedProduct.goods.stock < this.data.selectedProduct.num) {
                this.setData({
                    'selectedProduct.num': this.data.selectedProduct.goods.stock
                })
            } else if (this.data.selectedProduct.goods.stock > 0 && this.data.selectedProduct.num == 0) {
                this.setData({
                    'selectedProduct.num': 1
                })
            }
            this.triggerEvent('updataGoodStandard', {
                selectedProduct: this.data.selectedProduct
            })
        },

        // 加入购物车(立即购买)
        goCart(e) {
            let _ = this;
            let goodid = e.currentTarget.dataset.id || _.data.detail.goods_id;
            let is_fastbuy = "0"
            e.currentTarget.dataset.type == 'buy' ? is_fastbuy = '1' : is_fastbuy = '0';
            if (!this.data.standard.hasOwnProperty('spec')) {
                console.log('规格数据加载失败')
                return;
            }
            if (!this.data.productDetail.all_store && this.data.page != 'detail') {
                // 规格没选全
                wx.showToast({
                    title: "该商品无库存",
                    icon: 'none'
                })
                return;
            }
            if (this.data.selectedLength != this.data.standard.spec.length) {
                // 规格没选全
                wx.showToast({
                    title: "请选全规格信息",
                    icon: 'none'
                })
                return;
            }
            console.log(getApp().globalData)
            http.request({
                url: '/cart/add',

                data: {
                    goods: {
                        goods_id: goodid,
                        product_id: _.data.selectedProduct.goods.product_id,
                        num: _.data.selectedProduct.num,
                    },
                    is_fastbuy: is_fastbuy,
                    rule_id: this.data.rule,
                    chan_id: getApp().globalData.chanId || '',
                    chan_refer_app_id: getApp().globalData.chan_refer_app_id || '',
                    zk_ref: wx.getStorageSync('userInfo').is_zhuanke ? wx.getStorageSync('userInfo').member_id : getApp().globalData.zk_ref || ''
                },
                success(result) {
                    if (is_fastbuy == '1') { // 立即购买
                        wx.navigateTo({
                            url: "/pages/orderConfirm/index?is_fastbuy=1&id=" + _.data.selectedProduct.goods.product_id
                        }); // 跳转确定订单
                    } else {
                        // 加入购物车

                        wx.showToast({
                            title: "加入购物车成功",
                            icon: 'none'
                        })

                        _.setData({
                            'open': false,
                            'productDetail.cart_num': Number(_.data.productDetail.cart_num) + Number(_.data.selectedProduct.num),
                        })
                        if (_.data.page != 'detail') {
                            _.triggerEvent('updataGoodStandard', {
                                cart_total: result.cart_amount,
                                rule_name: result.rule_name,
                                type: 'cartSuccess'
                            })
                        } else {
                            _.triggerEvent('updataGoodStandard', {
                                detail: _.data.productDetail,
                                type: 'cartSuccess'
                            })
                        }

                    }



                }
            })
        },
        // 规格数据
        standardData(id) {
            var _ = this;
            http.request({
                url: '/product/specification',
                cdn: true,
                data: {
                    goods_id: id
                },
                success(result) {

                    _.setData({
                        selectedLength: 0,
                        standard: result,
                        selected: {},
                        selectedProduct: {
                            goods: {
                                marketable: 1
                            },
                            num: 1,
                        },
                    })

                    if (_.data.standard.products.length == 1) {
                        // 单个商品
                        _.onlyProduct();
                        if (_.data.page != 'detail') {
                            _.goCart({
                                currentTarget: {
                                    dataset: {}
                                }
                            })
                            return;
                        }
                    }
                    if (_.data.standard.spec.length == 1) {
                        _.defaultStandard();
                    }
                    if (_.data.page != 'detail') {
                        if(!_.data.productDetail.all_store){
                            wx.showToast({
                                title: "该商品无库存",
                                icon: 'none'
                            })
                            return;
                        }
                        _.toggleSelect()
                    }

                }
            });
        },


        // 产品数量修改
        editNum(e) {
            var type = e.target.dataset.type;
            if (type == 'edit') {
                if (e.detail.value > this.data.selectedProduct.goods.stock) {
                    if (this.data.selectedProduct.goods.stock > 99) {
                        this.setData({
                            'selectedProduct.num': 99,
                        });
                    } else {
                        this.setData({
                            'selectedProduct.num': this.data.selectedProduct.goods.stock,
                        });
                    }
                } else {
                    if (e.detail.value > 99) {
                        this.setData({
                            'selectedProduct.num': 99,
                        });
                    } else {
                        this.setData({
                            'selectedProduct.num': e.detail.value,
                        });
                    }
                }

                if (e.detail.value === 0 || this.data.selectedProduct.num === 0) {
                    this.setData({
                        'selectedProduct.num': 1,
                    });
                    return;
                }
            } else {
                var numNum = Number(this.data.selectedProduct.num)
                if (type == 'add') {
                    // 加

                    this.setData({
                        'selectedProduct.num': numNum + 1,
                    })
                } else if (type == 'minus') {
                    // 减
                    this.setData({
                        'selectedProduct.num': numNum - 1,
                    })
                }
            }
            this.triggerEvent('updataGoodStandard', {
                selectedProduct: this.data.selectedProduct
            })
        },
        blurNum(e) {
            if (e.detail.value <= 0 || this.data.selectedProduct.num <= 0) {
                this.setData({
                    'selectedProduct.num': 1,
                });
                this.triggerEvent('updataGoodStandard', {
                    selectedProduct: this.data.selectedProduct
                })
                return;
            }
        },
    },
    ready() {

    }
})