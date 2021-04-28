<script>
	import {getUserInfo} from '@/common/js/userInfo'
	export default {
		onLaunch: function(e) {
			if(!uni.getStorageSync('token')){
				getUserInfo(e.query)
			}
		},
		onShow: function() {
		},
		onHide: function() {
		},
		globalData:{
			isLogin:''
		}
	}
</script>

<!-- 测试appid wx4f4bc4dec97d474b -->
<!--  wx8aaa7733adaf6b38 -->
<style>
	@import "./common/css/iconfont.css";
	@import "./common/css/common.css";
	/*每个页面公共css */
	body{ background-color: #F5F5F5;}
	
</style>
