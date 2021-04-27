
import {baseUrl} from './conf.js'
import {getUserInfo} from '../common/js/userInfo.js'
function request(obj){
	uni.request({
		// url:obj.url,
		url:baseUrl+obj.url,
		header:{
			token:uni.getStorageSync('token')
		},
		data:obj.data || {},
		method:obj.method || 'POST',
		success:(res)=>{
			if(res.data.code==200 || res.data.code==100005 || res.code==200){
				obj.success && obj.success(res.data);
			}else if(res.data.code==100002){
				uni.showToast({
					title:'登录过期，请重新登录',
					icon:'none',
					duration:1500
				})
				uni.clearStorageSync()
				return
			}
		},
		fail:(err)=>{
			console.log('请求失败',err)
			obj.fail && obj.fail(err);
		}
	})
}



export default{
	request:request
}