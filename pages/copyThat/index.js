const http = require('../../utils/http');
const config = require('../../utils/config');
import { formatTime } from '../../utils/util.js';
Page({

    onLoad(options){
        this.setData({
            type:options.type,
        })
        // this.getData();
    },


    getData(){
        http.request({
            url:"/html5/index",
             
            data:{
                html5_type:'0,1,2,3,4,5,6,7,8,9,10',
            },
            success(res){
                this.setData({
                    srcArr:res.data.result
                })

            }
        })
    },
    data:{
        userInfo: wx.getStorageSync('userInfo'),
        type:'',
        srcArr:[
            //不支持无理由退换货
            config.Domain+"/html5/product_service/service_support/0",
            //支持无理由退换货
            config.Domain+"/html5/product_service/service_support/1",
            //优惠券使用方法及规则
            config.Domain+"/html5/coupon_agreement",
            // 常见问题
            config.Domain+"/html5/common_question",
            // 配送与验收
            config.Domain+"/html5/distribution_acceptance",
            //"售后服务"
            config.Domain+"/html5/after_sale",
            //"优惠券获取途径"
            config.Domain+"/html5/coupon_get",
            //"发票常见问题"
            config.Domain+"/html5/invoice_question",
            //"限时购"
            config.Domain+"/html5/specil_agreement",
            //"服务协议"
            config.Domain+"/html5/service_agreement",
            //"隐私政策"
            config.Domain+"/html5/privacy_agreement",
         ]
    }
})