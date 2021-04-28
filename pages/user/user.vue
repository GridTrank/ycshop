<template>
	<view class="user-wrap">
		<view class="user-info">
			<view class="user-info-wrap" v-if="userInfo.mobile" @click="login">
				<image class="user-img" :src="userInfo.avatarUrl" ></image>
				<view class="user-name">{{userInfo.nickName}}</view>
			</view>
			
			<!-- <button class="user-info-wrap login-btn" plain="true" v-else  open-type="getPhoneNumber">
				<image class="user-img" :src="userInfo.avatarUrl" ></image>
				<view class="user-name">{{userInfo.nickName}}</view>
			</button> -->
			
			<view class="user-info-wrap login-btn" plain="true" v-else  @click="register">
				<image class="user-img" :src="userInfo.avatarUrl" ></image>
				<view class="user-name">{{userInfo.nickName}}</view>
			</view>
			
			
		</view>
		<view class="user-content">
			<view class="card-wrap">
				<view class="card-title">
					<view class="tit">我的订单</view>
					<view class="more">
						查看全部
						<text class="iconfont icon-gengduo2"></text>
					</view>
				</view>
				<view class="card-item">
					<view class="card-list" @click="orderList(1)">
						<image class="list-img" src="../../static/user/icon-1.png" mode="widthFix"></image>
						<view class="list-label" >待付款</view>
					</view>
					<view class="card-list" @click="orderList(2)">
						<image class="list-img" src="../../static/user/icon-2.png" mode="widthFix"></image>
						<view class="list-label">待发货</view>
					</view>
					<view class="card-list" @click="orderList(3)">
						<image class="list-img" src="../../static/user/icon-3.png" mode="widthFix"></image>
						<view class="list-label" >待收货</view>
					</view>
					<view class="card-list" @click="orderList(4)">
						<image class="list-img" src="../../static/user/icon-4.png" mode="widthFix"></image>
						<view class="list-label">待评价</view>
					</view>
				</view>
			</view>
			
			<view class="card-wrap">
				<view class="card-title">
					<view class="tit">全部工具</view>
					
				</view>
				<view class="card-item">
					<view class="card-list" @click="orderList(1)">
						<image class="list-img" src="../../static/user/icon-1.png" mode="widthFix"></image>
						<view class="list-label" >待付款</view>
					</view>
					<view class="card-list" @click="orderList(2)">
						<image class="list-img" src="../../static/user/icon-2.png" mode="widthFix"></image>
						<view class="list-label">待发货</view>
					</view>
					<view class="card-list" @click="orderList(3)">
						<image class="list-img" src="../../static/user/icon-3.png" mode="widthFix"></image>
						<view class="list-label" >待收货</view>
					</view>
					<view class="card-list" @click="orderList(4)">
						<image class="list-img" src="../../static/user/icon-4.png" mode="widthFix"></image>
						<view class="list-label">待评价</view>
					</view>
				</view>
			</view>
		</view>
		
		
		<tabbar :curpage="curpage"></tabbar>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import {getUserProfile,userRegister} from '@/common/js/userInfo'
	import tabbar from '@/components/tabbar/tabbar.vue'
	export default {
		data() {
			return {
				curpage:'',
				userInfo:{}
			}
		},
		components:{
			tabbar
		},
		computed:{
			// ...mapState({
			// 	userInfo: state=>state.common.userInfo
			// })
		},
		onShow() {
			this.userInfo=uni.getStorageSync('userInfo')
			let pages = getCurrentPages()
			this.curpage = pages[pages.length - 1].route
		},
		
		methods: {
			orderList(val){
				console.log(val)
			},
			login(e){
				if(uni.getStorageSync('isLogin'))return
				getUserProfile(e).then(userInfo=>{
					this.userInfo=userInfo
				})
			},
			register(){
				userRegister().then(userInfo=>{
					this.userInfo=uni.getStorageSync('userInfo')
				})
			},
			getphonenumber(e){
				console.log(e)
			}
		}
	}
</script>

<style scoped lang="scss">
.user-wrap{
	width: 100%;
	.user-info{
		width: 100%;
		height: 350upx;
		background: linear-gradient(-88deg, rgba(255, 76, 48, 1), rgba(234, 10, 33, 1));
		position: relative;
		.user-info-wrap{
			position: absolute;
			top: 120upx;
			left: 90upx;
			display: flex;
			align-items: center;
			.user-img{
				width: 140upx;
				height: 140upx;
				border-radius: 50%;
			}
			.user-name{
				margin-left: 20upx;
				color: #FFFFFF;
			}
		}
		
	}
	.login-btn{
		border: none;
	}
	.user-content{
		padding: 20upx;
		.card-wrap{
			border-radius: 20upx;
			background-color: #fff;
			margin-bottom: 20upx;
			.card-title{
				padding: 30upx 20upx;
				display: flex;
				justify-content: space-between;
				position: relative;
				.tit{
					font-size: 28upx;
					color: #333;
					font-weight: 500;
				}
				.more{
					font-size: 24upx;
					color: #666;
				}
				&:after{
					content: '';
					position: absolute;
					height: 2upx;
					background-color: #E5E5E5;
					left: 20upx;
					right: 20upx;
					bottom:0;
					
				}
			}
			.card-item{
				display: flex;
				justify-content: space-around;
				.card-list{
					display:flex;
					flex-direction: column;
					justify-content: center;
					padding: 40upx 0;
					.list-img{
						width: 60upx;
					}
					.list-label{
						color: #333;
						font-size: 24upx;
						margin-top: 10upx;
					}
				}
			}
		}
	}
	
}

</style>
