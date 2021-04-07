
import {baseUrl} from './conf.js'

function request(obj){
	console.log(baseUrl)
	uni.request({
		url:baseUrl+obj.url,
		data:obj.data || {},
		method:obj.method || 'POST',
		success:(res)=>{
			obj.success && obj.success(res);
		},
		fail:(err)=>{
			obj.fail && obj.fail(err);
		}
	})
}

export default{
	request:request
}