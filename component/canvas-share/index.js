const http = require("../../utils/http.js");
const config = require('../../utils/config.js');

function getImageInfo(url, name) {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src: url,
            success: resolve,
            fail: (res) => {
                reject({
                    url,
                    res,
                    name
                })
            },
        })
    })
}


function canvasToTempFilePath(option, context) {
    return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
            ...option,
            success: resolve,
            fail: reject,
        }, context)
    })
}

function saveImageToPhotosAlbum(option) {
    return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
            ...option,
            success: resolve,
            fail: function (res) {
                reject(res)
            },
        })
    })
}

Component({
    properties: {
        visible: {
            type: Boolean,
            value: false,
            observer(visible) {
                if (visible) {
                    this.draw();
                    this.setData({
                        canvasHeight: this.data.type == 'user' ? 1334 : 1260,
                    })
                }
            }
        },
        detail: {
            type: Object,
            value: {
                banner: ''
            }
        },
        zkCoupon: {
            type: Object,
            value: {},
        },
        userInfo: {
            type: Object,
            value: {},
        },
        type: {
            type: String,
            value: 'shop'
        },
        custom: {
            type: String,
            value: ''
        }
    },

    data: {
        isDraw: false,
        canvasWidth: 750,
        canvasHeight: 1260,
        imageFile: '',
        flag: false,
    },

    methods: {
        handleClose() {
            this.triggerEvent('close');
            this.setData({
                imageFile: ''
            })
        },

        save() {
            const {
                imageFile
            } = this.data

            if (imageFile) {
                saveImageToPhotosAlbum({
                    filePath: imageFile,
                }).then(() => {
                    this.handleClose();
                    wx.showToast({
                        icon: 'none',
                        title: '已保存，快去分享朋友圈吧',
                        duration: 2000,
                    })
                    this.setData({
                        imageFile: ''
                    })
                }, (err) => {
                    console.log("保存失败");
                    if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
                        wx.showModal({
                            title: '提示',
                            content: '需要您授权保存相册',
                            showCancel: false,
                            success: modalSuccess => {
                                wx.openSetting({
                                    success(settingdata) {
                                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                            console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                                            this.save();
                                        } else {
                                            console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                                        }
                                    }
                                })
                            }
                        })
                    }

                })
            }
        },
        drawArticle(ctx, kl, width, x, y, rows, size, color) {
            let chr = kl.split('') // 分割为字符串数组
            let temp = ''
            let row = []
            for (let a = 0; a < chr.length; a++) {
                if (ctx.measureText(temp).width < width) {
                    temp += chr[a]
                } else {
                    a--
                    row.push(temp)
                    temp = ''
                }
            }
            row.push(temp)
            ctx.save();
            ctx.setFontSize(size);
            ctx.setFillStyle(color);

            for (var b = 0; b < row.length; b++) {
                // 控制最多显示2行
                if (b < rows) {
                    ctx.fillText(row[b], x, y + b * 42);
                }
            }
            ctx.restore();
            return row;
        },
        roundRect(ctx, img, left, top, width, height, fillet) {
            ctx.beginPath();
            ctx.save();
            ctx.setLineWidth(1);
            ctx.setStrokeStyle('#ffffff');
            ctx.moveTo(left + fillet, top); // 创建开始点
            ctx.lineTo(left + width - fillet, top); // 创建水平线
            ctx.arcTo(left + width, top, left + width, top + fillet, fillet); // 创建弧
            ctx.lineTo(left + width, top + height - fillet); // 创建垂直线
            ctx.arcTo(left + width, top + height, left + width - fillet, top + height, fillet); // 创建弧
            ctx.lineTo(left + fillet, top + height); // 创建水平线
            ctx.arcTo(left, top + height, left, top + height - fillet, fillet); // 创建弧
            ctx.lineTo(left, top + fillet); // 创建垂直线
            ctx.arcTo(left, top, left + fillet, top, fillet); // 创建弧
            ctx.stroke();
            ctx.clip();
            ctx.drawImage(img, left, top, width, height);
            ctx.restore();
            ctx.closePath();
        },
        //圆角矩形
        radiusRect(ctx, x, y, w, h, r, color, left, right) {
            // 开始绘制
            ctx.beginPath()
            ctx.save();
            ctx.setFillStyle(color)
            // 左上角
            ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
            ctx.moveTo(x + r, y)
            ctx.lineTo(x + w - r, y)
            ctx.lineTo(x + w, y + r)

            // 左下角
            ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
            ctx.lineTo(x, y + r)
            ctx.lineTo(x + r, y)


            // 右上角
            ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
            ctx.lineTo(x + w, y + h - r)
            ctx.lineTo(x + w - r, y + h)

            // 右下角
            ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
            ctx.lineTo(x + r, y + h)
            ctx.lineTo(x, y + h - r)
            ctx.fill()

            ctx.closePath()

        },
        logs(data) {
            http.request({
                url: "/log/addlog",
                data: {
                    type: 'share',
                    result: data,
                },
                noRequest: true,

                success(res) {
                    console.log('记录登录日志')
                }
            })
        },
        //分销客优惠券
        getShareCoupon(id) {
            return new Promise((resolve, reject) => {
                if (this.data.zkCoupon.is_valid) {
                    http.request({
                        url: '/fabric/share_coupon',
                        data: {
                            goods_id: id
                        },
                        success: (res) => {
                            if (res.coupon && res.coupon.cpns_id) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        },
                        fail: (err) => {
                            reject(false)
                        }
                    })

                } else {
                    resolve(false)
                }

            })
        },
        draw() {
            if (this.data.flag) return;
            this.data.flag = true;
            wx.showLoading({
                title: "生成图片ing"
            })
            const {
                userInfo,
                canvasWidth,
                canvasHeight,
                detail,
                type,
                custom,
                zkCoupon,
            } = this.data;
            const token = wx.getStorageSync('token')

            var avatarUrl = userInfo.avatarUrl || userInfo.header_img || 'https://s1.miniso.cn/bsimg/ec/public/images/fd/5f/fd5ff165163b8e73f78c052a18f3dfad.jpg?x-oss-process=style/high';
            var nickName = userInfo.nickName || '小M';

            var product_url = detail.banner ? custom || detail.banner[0].imgUrl : detail.image_default || '';
            product_url = product_url.replace(/^http:\/\/[^/]+/, 'https://s1.miniso.cn');
            const avatarPromise = getImageInfo(avatarUrl, 'avatarPic');
            const productPromise = type == 'shop' ? getImageInfo(product_url) : getImageInfo('https://s1.miniso.cn/bsimg/ec/public/images/fd/5f/fd5ff165163b8e73f78c052a18f3dfad.jpg?x-oss-process=style/high', 'productPic');



            const backgroundPromise = getImageInfo(type == 'shop' ? 'https://s1.miniso.cn/bsimg/ec/public/images/aa/3e/aa3ef3c5390f53e41bafaec54a21803a.jpg?x-oss-process=style/high' : detail.poster_image || 'https://s1.miniso.cn/bsimg/ec/public/images/61/0b/610bcc5540cc9b44c0fc08d9d5e6fde0.jpg?x-oss-process=style/high', 'backgroundPic')
            const background2Promise = getImageInfo('https://s1.miniso.cn/bsimg/ec/public/images/68/f9/68f9468ef16e804b7ba3118889912fbf.jpg?x-oss-process=style/high', 'background2Pic')
            const couponPromise = getImageInfo('https://s1.miniso.cn/bsimg/ec/public/images/45/84/4584f33bce82957046b4f1e1e2def91a.png')

            console.log(userInfo)
            this.logs({
                'userInfo': userInfo,
                sharePic: type == 'shop' ? (detail.spread_code_url || detail.product_code_url) : detail.share_code_url,
                productPic: product_url,
                avatarUrl: avatarUrl,
                dec: 'sharePic'
            })
            console.log(detail.share_code_url, detail.spread_code_url || detail.product_code_url);
            var codePromise;
            var darwCoupon;
            new Promise(resolve => {

                this.getShareCoupon(zkCoupon.goods_id).then((res) => {
                    darwCoupon = res;
                    codePromise = getImageInfo(
                        darwCoupon && type == 'shop' ?
                        config.Domain + '/person/make_product_code?gid=' + zkCoupon.goods_id + '&sid=' + zkCoupon.share_coupon_id + '&url=pages/welfare/index' + '&zk=' + userInfo.member_id + '&token=' + token :
                        !darwCoupon && type == 'shop' ?
                        (detail.spread_code_url || config.Domain + '/fabric/make_product_code?product_id=' + detail.product_id + '&token=' + token + '&source=' + (userInfo.is_zhuanke ? 'saler' : 'share')) :
                        config.Domain + '/person/make_product_code?token=' + token + '&zk=' + userInfo.member_id, 'codePic');
                    resolve()
                })
            }).then(() => {
                Promise.all([avatarPromise, backgroundPromise, codePromise, productPromise, couponPromise, background2Promise])
                    .then(([avatar, background, code, product, coupon, background2]) => {
                        const ctx = wx.createCanvasContext('share', this);
                        const canvasW = canvasWidth;
                        const canvasH = canvasHeight;
                        // 绘制背景

                        ctx.drawImage(
                            background.path,
                            0,
                            0,
                            canvasW,
                            type == 'user' ? 1060 : canvasH,
                        )
                        if (type == 'user') {
                            ctx.drawImage(
                                background2.path,
                                0,
                                1060,
                                canvasW,
                                274,
                            )
                        }
                        this.logs({
                            'userInfo': userInfo,
                            dec: 'backgroundSuccess'
                        })
                        console.log('背景成功')

                        // 绘制用户名
                        if (type == 'shop') {
                            ctx.setFontSize(28)
                            ctx.setFillStyle('#333333')
                            ctx.fillText(
                                nickName,
                                186,
                                100,
                            )
                            // 绘制商品图
                            ctx.drawImage(
                                product.path,
                                75,
                                212,
                                600,
                                600,
                            )
                            // 绘制商品名称
                            var row = this.drawArticle(ctx, detail.product_name, 355, 75, 980, 2, 32, '#333');

                            //绘制券后价
                            if (darwCoupon && userInfo.is_zhuanke) {
                                //券价格背景
                                this.radiusRect(ctx, 100, row.length < 2 ? 1025 : 1045, 160, 50, 8, '#FFEBE7', true, false)
                                ///券头图
                                ctx.drawImage(
                                    coupon.path,
                                    75,
                                    row.length < 2 ? 1025 : 1045,
                                    60,
                                    50
                                )
                                //券价格
                                let couponType = zkCoupon.coupon.coupon_type
                                let pStr = ''
                                let couponPrice = zkCoupon.coupon.discount_amount
                                let couponPriceLength = couponPrice.toString().length
                                switch (couponType) {
                                    case 1:
                                        pStr = '¥' + couponPrice
                                        break;
                                    case 2:
                                        pStr = '¥' + couponPrice
                                        break;
                                    case 3:
                                        pStr = couponPrice + '折'
                                        break;
                                    case 4:
                                        pStr = '免邮'
                                        break;
                                    case 5:
                                        pStr = '赠品'
                                        break;
                                }
                                ctx.save();
                                ctx.setFontSize(32)
                                ctx.setFillStyle('#E72722')
                                ctx.fillText(
                                    pStr,
                                    couponPriceLength > 2 ? 150 : 170,
                                    row.length < 2 ? 1062 : 1082
                                )
                                ctx.restore()
                                //券后价
                                let couponAfterPrice = zkCoupon.coupon_money
                                let couponAfterPriceLength = couponAfterPrice.toString().length
                                ctx.save();
                                ctx.setFontSize(32)
                                ctx.setFillStyle('#D9232E')
                                ctx.fillText(
                                    '券后价',
                                    75,
                                    1150,
                                )
                                ctx.restore()
                                ctx.save();
                                ctx.setFontSize(28)
                                ctx.setFillStyle('#D9232E')
                                ctx.fillText(
                                    "¥",
                                    190,
                                    1150,
                                )
                                ctx.restore()
                                ctx.save();
                                ctx.setFontSize(48)
                                ctx.setFillStyle('#D9232E')
                                ctx.fillText(
                                    couponAfterPrice,
                                    210,
                                    1150,
                                )

                                ctx.restore()
                                // 原价
                                let originP = zkCoupon.del_price
                                let originPlength = originP.toString().length
                                let originPrice = '¥' + originP
                                ctx.save();
                                ctx.setFontSize(24)
                                ctx.setFillStyle('#999999')
                                ctx.fillText(
                                    originPrice,
                                    couponAfterPriceLength > 2 ? 330 : 290,
                                    1150,
                                )
                                ctx.restore()

                                ctx.beginPath()
                                let moveX = couponAfterPriceLength > 2 && originPlength > 2 ? 325 :
                                    couponAfterPriceLength > 2 && originPlength <= 2 ? 320 :
                                    couponAfterPriceLength <= 2 && originPlength > 2 ? 280 : 285
                                let lineY = couponAfterPriceLength > 2 && originPlength > 2 ? 400 :
                                    couponAfterPriceLength > 2 && originPlength <= 2 ? 390 :
                                    couponAfterPriceLength <= 2 && originPlength > 2 ? 360 : 345
                                ctx.setStrokeStyle('#999999')
                                ctx.moveTo(moveX, 1142)
                                ctx.lineTo(lineY, 1142)
                                ctx.stroke()

                                // 绘制二维码
                                ctx.drawImage(
                                    code.path,
                                    503,
                                    956,
                                    160,
                                    160,
                                )
                            } else {
                                // 绘制商品描述
                                this.drawArticle(ctx, detail.brief, 355, 75, row.length < 2 ? 1020 : 1070, 1, 28, '#7f7f7f')

                                // 绘制商品价格
                                var price = detail.min_price ? (detail.min_price == detail.max_price ? '¥' + detail.min_price : '¥' + detail.min_price + '~' + '¥' + detail.max_price) : '¥' + detail.price;
                                var price_width = ctx.measureText(price).width;
                                ctx.save();
                                ctx.setFontSize(52)
                                ctx.setFillStyle('#E72722')
                                ctx.fillText(
                                    price,
                                    70,
                                    row.length < 2 ? 1100 : 1150,
                                )
                                ctx.restore();
                                // 绘制二维码
                                ctx.drawImage(
                                    code.path,
                                    503,
                                    956,
                                    160,
                                    160,
                                )
                            }


                        } else {
                            ctx.setFontSize(38);
                            ctx.setFillStyle('#333')
                            ctx.fillText(
                                nickName,
                                165,
                                1130,
                            )
                        }
                        if (type == 'user') {
                            // 开始绘制二维码
                            ctx.drawImage(
                                code.path,
                                490,
                                1090,
                                220,
                                220,
                            )
                        }

                        this.logs({
                            'userInfo': userInfo,
                            dec: 'codeSuccess'
                        })
                        console.log('二维码成功')


                        ctx.beginPath();
                        // 绘制圆，参数（x坐标，y坐标，圆半径，起始角度，终止角度）
                        if (type == 'user') {
                            ctx.arc(80 / 2 + 62, 80 / 2 + 1080, 80 / 2, 0, Math.PI * 2);
                        } else {
                            ctx.arc(100 / 2 + 62, 100 / 2 + 62, 100 / 2, 0, Math.PI * 2);
                        }
                        ctx.save();
                        // 剪切形状
                        ctx.clip();

                        // 绘制头像，参数（图片资源，x坐标，y坐标，宽度，高度）
                        if (type == 'user') {

                            ctx.drawImage(avatar.path, 62, 1080, 80, 80);
                        } else {

                            ctx.drawImage(avatar.path, 62, 62, 100, 100);
                        }
                        ctx.restore();
                        ctx.closePath();
                        this.logs({
                            'userInfo': userInfo,
                            dec: 'avatarSuccess'
                        })
                        console.log('头像成功')
                        ctx.draw(false, () => {
                            canvasToTempFilePath({
                                canvasId: 'share',
                                destWidth: 750,
                                destHeight: type == 'user' ? 1334 : 1260,
                                fileType: 'jpg'
                            }, this).then(({
                                tempFilePath
                            }) => {
                                var imgPromise = getImageInfo(tempFilePath, 'canvasPic');
                                Promise.all([imgPromise]).then(([img]) => {
                                    this.setData({
                                        imageFile: img.path,
                                    })
                                    this.data.flag = false;
                                    if (type == 'user') {
                                        this.save();
                                    }
                                    wx.hideLoading()
                                }).catch((res) => {
                                    this.logs({
                                        'userInfo': userInfo,
                                        res: res,
                                        dec: 'savePicFail'
                                    });
                                    console.log('保存图片失败', res);
                                    this.data.flag = false;
                                    wx.hideLoading();
                                })


                            })
                        })


                    })
                    .catch((result) => {
                        this.logs({
                            'userInfo': userInfo,
                            res: result.res || result,
                            url: result.url,
                            name: result.name,
                            dec: 'loadPicFail'
                        });
                        this.handleClose();
                        console.log('加载图片失败', result);
                        this.data.flag = false;
                        wx.hideLoading()
                    })
            })

        },

    }
})