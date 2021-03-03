
const http = require('../../utils/http');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: wx.getStorageSync('userInfo') || {},
        zkCoupon:{
            couponState:{}
        },
        couponTypeName:'',
        couponSpec:'',
        showCoupon:false, 
        goods_id:'',
        queryCouponData:{},
        product_id:'',
        canUse:''
    },
    
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.scene) {
            var scene = decodeURIComponent(options.scene) //参数二维码传递过来的参数
            let arr = scene.split("&");
            for (let i of arr) {
              options[i.split("=")[0]] = i.split("=")[1];
            }
        }
        let data={
            goods_id:options.gid || "23",
            share_coupon_id:options.sid || 1,
        }
        this.setData({
            queryCouponData:data,
        })
        this.getShareCoupon(data)
    },
    //分销客优惠券
    getShareCoupon(data){
        wx.showLoading({
            title: '加载中...'
        })
        http.request({
            url:'/fabric/share_coupon',
            data:data,
            success:(res)=>{
                wx.hideLoading()
                this.setData({
                    zkCoupon:res,
                    product_id:res.product_id,
                    canUse:res.is_valid
                }) 
                if(res.coupon && res.coupon.cpns_id){
                    let couponState=[]
                    var obj={
                        type:'online',
                        cpns_id:res.coupon.cpns_id,
                    }       
                    couponState.push(obj)
                    if(this.data.userInfo.is_bind_mobile)this.getCouponState(couponState) 
                    this.getCouponType(res.coupon)
                }
                if(!res.is_valid){
                    wx.showToast({
                        title: '该活动已结束',
                        icon: 'none',
                        success:function(){
                            setTimeout(function(){
                                wx.reLaunch({
                                    url: `/pages/detail/index?id=${res.product_id}`,
                                })
                            },2000)
                        }
                    })
                }
            },
            fail: function() {
                wx.hideLoading()
            }
        })
    },  
    //分销客优惠券状态
    getCouponState(couponState){
        http.request({
            url:'/travel/check_coupon_status',
            data:{
                coupon:couponState
            },
            success:(result)=>{
                this.setData({
                    'zkCoupon.couponState':result[couponState[0].cpns_id],
                    showCoupon:true
                })
            }
        })
    },
    //分销客领取优惠券
    useCoupon(e){
        if(!this.data.canUse)return
        let receive=e.currentTarget.dataset.receive
        let speed=e.currentTarget.dataset.speed
        let zkCoupon=this.data.zkCoupon
        if(speed==1){
            wx.showToast({
                title: '该优惠券已被领取完',
                icon: 'none'
            })
            return
        }
        if(receive==0){
            http.request({
                url: '/activity/receive_coupon',
                data: {
                    cpns_id: zkCoupon.coupon.cpns_id,
                    cpns_prefix: zkCoupon.coupon.cpns_prefix,
                    share_coupon_id:zkCoupon.share_coupon_id,
                    goods_id:zkCoupon.goods_id
                },
                isCode: true,
                success:(res)=>{
                    if(res.data.code==200){
                        this.setData({
                            "zkCoupon.couponState.is_receive":1
                        })
                        wx.showLoading({
                            title: '领取成功，正在跳转到详情页',
                            icon: 'none',
                        })
                        setTimeout(()=>{
                            wx.hideLoading()
                            wx.reLaunch({
                                url: `/pages/detail/index?id=${this.data.product_id}`,
                            })
                        },2000)
                        
                    }else{
                        wx.showToast({
                            title: res.data.msg,
                            icon: 'none'
                        })
                    }
                }
            })
        }else{
            wx.showToast({
                title: '您已领取过该券，不可重复领取，正在跳转至详情页',
                icon: 'none'
            })
            setTimeout(()=>{
                wx.reLaunch({
                    url: `/pages/detail/index?id=${this.data.product_id}`,
                })
            },2000)
        }
    },
    
    //判断优惠券类型
    getCouponType(data){
        switch(data.coupon_type){
            case 1:
                this.setData({
                    couponTypeName:'直减券',
                    couponSpec:'¥'+data.discount_amount
                })
                break;
            case 2:
                this.setData({
                    couponTypeName:'满减券',
                    couponSpec:'¥'+data.discount_amount
                })
                break;
            case 3:
                this.setData({
                    couponTypeName:'折扣券',
                    couponSpec:data.discount_amount+'折'
                })
                break;
            case 4:
                this.setData({
                    couponTypeName:'包邮券',
                    couponSpec:'包邮'
                })
                break;
            case 5:
                this.setData({
                    couponTypeName:'赠品券',
                })
                break;
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
  
    },
  
    /**
     * 生命周期函数--监听页面显示
     */
    onShow(options) {
        this.setData({
          userInfo: wx.getStorageSync('userInfo') || {},
        })
        if(this.data.userInfo.is_bind_mobile)this.getShareCoupon(this.data.queryCouponData) 
    },
    //领取优惠券
    getCoupon(){
        
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
  
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
  
    }
  })