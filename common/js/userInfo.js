

import * as config from '@/config/conf.js'
import http from '@/config/request.js'

import store from '@/store/index.js'


function getUserProfile(e) {
	return new Promise((resolve, reject) => {
		uni.getUserProfile({
		    desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
		    success: (res) => {
				uni.setStorageSync('isLogin',true)
				var obj=Object.assign({},uni.getStorageSync('userInfo'),res.userInfo)
				store.dispatch('GetUserInfo',obj)
				uni.setStorageSync('userInfo',obj)
				resolve(obj)
		    }
		})
	})
}

function getUserInfo(option) {
	return new Promise((resolve, reject) => {
		let data = {}
		uni.login({
			provider: 'weixin',
			success: (res) => {
				uni.getUserInfo({
					provider: 'weixin',
					success: (infoRes) => {
						var code = res.code;
						uni.setStorageSync("scopeUserInfo", infoRes)
						data = {
							code: code,
							appid: config.appid,
						}
						http.request({
							url:'/mpuser/getOpenid',
							data:data,
							success:(userRes)=>{
								if(userRes.code==200){
									uni.setStorageSync('openid',userRes.data.openid)
									shopLogin(userRes.data.openid,infoRes,option)
								}
							}
						})
					}
				})
			},
			fail:(err)=>{
				console.log('登录失败',err)
			}
		})

	})
}

function shopLogin(openId,infoRes,option){
	return new Promise((resolve,reject)=>{
		http.request({
			url:'/mpuser/shopLogin',
			data:{
				openId,
				userInfo:infoRes.userInfo,
				option:option
			},
			success:(res)=>{
				uni.setStorageSync('token',res.token)
				if(res.code==200){
					store.dispatch('GetUserInfo',res.data.userInfo)
					uni.setStorageSync('userInfo',res.data.userInfo)
				}else if(res.code==100005){
					// 没有手机号码-游客
					let userInfo=uni.getStorageSync("scopeUserInfo").userInfo
					var obj=Object.assign({},userInfo,res.data.userInfo)
					uni.setStorageSync('userInfo',obj)
					store.dispatch('GetUserInfo',obj)
				}
			}
		})
	})
}

function userRegister(){
	return new Promise((resolve,reject)=>{
		http.request({
			url: '/mpuser/shopRegister',
			data: {
				open_id:uni.getStorageSync('openid')
			},
			success: res => {
				
			},
		});
	})
}



export {
	getUserInfo,
	getUserProfile,
	userRegister
}
