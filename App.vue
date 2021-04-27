<script>
	import {getUserInfo} from '@/common/js/userInfo'
	export default {
		onLaunch: function() {
			if(!uni.getStorageSync('token')){
				getUserInfo()
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

<style>
	@import "./common/css/iconfont.css";
	@import "./common/css/common.css";
	/*每个页面公共css */
	body{ background-color: #F5F5F5;}
	
</style>
