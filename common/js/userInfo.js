

import * as config from '@/config/conf.js'
import http from '@/config/request.js'

import store from '@/store/index.js'
function getMemberInfo() {
	return new Promise((resolve, reject) => {
		const vm = this;
		let data = {},
			body = '';
		let jm = '';
		data = {
			uid: uni.getStorageSync("reqhead").uid,
			skey: uni.getStorageSync("reqhead").skey,
			_platform_num: 900018,
		}
		body = 'uid=' + data.uid + '&skey=' + data.skey + '&_platform_num=900018';
		jm = CryptoJS.AesEncrypt(body);
		uni.request({
			url: config.cjyUserUrl + '/user/user/GetUserInfo',
			data: jm,
			header: getCJYHead(data),
			method: "post",
			success: (res) => {
				var scopeUserInfo = uni.getStorageSync('scopeUserInfo')  || {};
				scopeUserInfo.userInfo = res.data.data;
				console.log('scopeUserInfo',scopeUserInfo)
				uni.setStorageSync('scopeUserInfo', scopeUserInfo);
				
			}
		})

	})
};
function getUserProfile(e) {
	return new Promise((resolve, reject) => {
		uni.getUserProfile({
		    desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
		    success: (res) => {
				uni.setStorageSync('isLogin',true)
				var obj=Object.assign({},uni.getStorageSync('userInfo'),res.userInfo)
				resolve(obj)
		    }
		})
	})
}
// 更新用户信息
function updateUserInfo(e) {
	return new Promise((resolve, reject) => {
		const vm = this;
		let data = {},
			body = '';
		let jm = '';
		data = {
			uid: uni.getStorageSync("reqhead").uid,
			skey: uni.getStorageSync("reqhead").skey,
			_platform_num: 900018,
			nick: uni.getStorageSync('userProfile').nickName,
			photo:uni.getStorageSync('userProfile').avatarUrl,
		}
		body = 'uid=' + data.uid + '&skey=' + data.skey + '&_platform_num=900018' + '&nick=' + data.nick + '&photo=' + data.photo;
		jm = CryptoJS.AesEncrypt(body);
		
		uni.request({
			url: config.cjyUserUrl + '/user/user/ModifyBasicUserInfo',
			data: jm,
			header: getCJYHead(data),
			method: "post",
			success: (res) => {
				getMemberInfo()
			}
		})
	
	})
}
function getUserInfo(delta) {
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
									shopLogin(userRes.data.openid,infoRes)
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

function shopLogin(openId,infoRes){
	return new Promise((resolve,reject)=>{
		http.request({
			url:'/mpuser/shopLogin',
			data:{
				openId,
				userInfo:infoRes.userInfo
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
					// store.dispatch('GetUserInfo',obj)
				}
			}
		})
	})
}


function getPhoneNumber(e, delta) {
	//读取本地scopeSession
	return new Promise((resolve, reject) => {
		var scopeSession = uni.getStorageSync("scopeSession");
		var data = {
			openid: scopeSession.openid,
			appid: config.appid,
			_platform_num: 900018,
			iv: uni.getStorageSync("scopeUserInfo").iv,
			encryptedData: uni.getStorageSync("scopeUserInfo").encryptedData,
			iv4Mobile: e.detail.iv,
			encryptedMobile: e.detail.encryptedData,
			isreturnuserinfo: 1,
			membersource: getApp().globalData.queryFrom ? 2 : '',
			FregisterSource: 101
		}
		var jm = CryptoJS.AesEncrypt('openid=' + scopeSession.openid + '&appid=' + config.appid +
			'&_platform_num=900018&iv=' + data.iv + '&encryptedData=' + data.encryptedData + '&iv4Mobile=' +
			data.iv4Mobile + '&encryptedMobile=' + data.encryptedMobile + '&membersource=' + data
			.membersource + '&FregisterSource=101&isreturnuserinfo=1');
		wx.request({
			url: config.cjyUserUrl + "/user4wechat/user4wechat/RegisterByWechatApplet",
			data: jm,
			method: "POST",
			header: getCJYHead(data),
			success: function(res) {
				console.log(res);
				if (res.data.errno == 0) {
					if (res.data.data) { //正常能拿到用户手机号，及用户信息
						const member = res.data.data;
						if (member.userlevel) {
							uni.setStorageSync('bindMobilePhone', member.mobile);
							var reqheadData = reqhead(scopeSession.openid, member.unionid, member
								.uid, member.skey);
							uni.setStorageSync("reqhead", reqheadData);
							let parent_id = getApp().globalData.parent_id ? getApp().globalData
								.parent_id : 0;
							
							var o = {
								scopeSessions: uni.getStorageSync('scopeSession'),
								phoneNumber: member.mobile,
								userInfo: Object.assign({},member,uni.getStorageSync('userProfile')),
								parent_id: parent_id,
								platform: uni.getStorageSync('platform'),
							}
							if (delta) {
								o.delta = delta
							}
							store.dispatch('getScopeAppLogin', o);
						}
						updateUserInfo();
						wx.showToast({
							title: '登录成功',
							icon: 'none'
						});
					}
				} else {
					if (res.data.errno == 3647) {
						uni.showToast({
							title: '请移步微信-设置-账号与安全绑定手机号',
							icon: 'none'
						})
						console.warn('注册，没有绑定手机号====，已提示用户去微信绑手机号')
						return
					}
					if (res.data.errmsg && res.data.errmsg.indexOf('timeout') > -
						1) { //接口获取的解密key过期，需要重新获取
						uni.showToast({
							title: "登录已失效，即将重新登录",
							icon: 'none'
						})

						setTimeout(() => {
							uni.clearStorageSync();
							util.routerData();
							wx.reLaunch({
								url: '/pages/index/index',
							})
						}, 2000)
						console.warn('注册，请求接口超时')
					} else if (res.data.errno == 3456) {
						uni.showToast({
							title: res.data.errmsg,
							icon: 'none'
						})
						setTimeout(() => {
							wx.clearStorageSync();
							wx.reLaunch({
								url: '/pages/index/index',
							})
						}, 2000)
						console.error('注册，其他异常错误===', res.data.errmsg)
					} else {
						uni.showToast({
							title: '注册失败，请重试',
							icon: 'none'
						})

						setTimeout(() => {
							wx.clearStorageSync();
							wx.reLaunch({
								url: '/pages/index/index',
							})
						}, 2000)
						console.error('注册失败===', res.data.errmsg)
					}
				}
			}
		})

	})
}



export {
	getPhoneNumber,
	getUserInfo,
	getUserProfile
}
