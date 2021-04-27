<template>
	
	<view class="footer">
		<view class="footer_item" :class="{'active': curpage == item.pagePath}" @click="changeNav(item.pagePath)" v-for="(item,index) in list" :key="index">
			<image :src="curpage == item.pagePath ? item.selectedIconPath : item.iconPath" mode="widthFix" class="image"></image>
			<text class="text">{{item.text}}</text>
			<!-- <text class="cart" :class="{'active':cartNumber > 9}" v-if="index == 3 && cartNumber > 0">{{cartNumber}}</text> -->
		</view>
	</view>

</template>

<script>
	import { mapState } from 'vuex'
	export default {
		props:['curpage'],
		data() {
			return {
				curIndex:0,
				list : [
				  {
				      "pagePath" : "pages/index/index",
				      "iconPath" : "../../static/tabBar/tabBar_1.png",
				      "selectedIconPath" : "../../static/tabBar/tabBar_cur_1.png",
				      "text" : "首页"
				  },
				  {
				      "pagePath" : "pages/store/store",
				      "iconPath" : "../../static/tabBar/tabBar_1.png",
				      "selectedIconPath" : "../../static/tabBar/tabBar_cur_1.png",
				      "text" : "店铺"
				  },
				  {
				      "pagePath" : "pages/cart/cart",
				      "iconPath" : "../../static/tabBar/tabBar_3.png",
				      "selectedIconPath" : "../../static/tabBar/tabBar_cur_3.png",
				      "text" : "购物车"
				  },
				  {
				      "pagePath" : "pages/user/user",
				      "iconPath" : "../../static/tabBar/tabBar_4.png",
				      "selectedIconPath" : "../../static/tabBar/tabBar_cur_4.png",
				      "text" : "个人中心"
				  }
			  ]
			};
		},
		methods:{
			changeNav(url){
				if(url != this.curpage){
					uni.switchTab({
						url:'/' + url
					})
				}
			}
		},
		computed:{
			
		}
	}
</script>
<style>
.footer{
	position: fixed;
	bottom: 0;
	width: 100%;
	background-color: #FFFFFF;
	color: #6e6d6b;
	flex-shrink: 0;
	height: 102upx;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	border-top: 2upx solid #e2e2e2;
	box-shadow: 2upx 2upx 4upx 0 rgba(0,0,0,.05);
	z-index: 999;
	padding-bottom: env(safe-area-inset-bottom);
}
.footer_item{
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 20%;
	font-size: 26upx;
	height: 120upx;
	position: relative;
}
.footer_item.active{
	color: #f23030;
}
.footer_item .image{
	width: 40upx;
	height: 40upx;
}
.footer_item .text,
.footer_item .cart{
	margin-top: 10upx;
}
.footer_item.big_item{
	position: relative;
	top: -30upx;
	height: 200upx;
}
.footer_item.big_item .image{
	width: 100upx;
	height: 100upx;
}
.footer_item.big_item .text{
	color: #b88f56;
}
.footer_item .cart{
	position: absolute;
	width: 22upx;
	height: 22upx;
	border: 2upx solid #f23030;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	border-radius: 100%;
	color: #f23030;
	top: -2upx;
	right: 45upx;
	font-size: 18upx;
	background: #FFFFFF;
}
.footer_item .cart.active{
	padding: 0 6upx;
	border-radius: 30upx;
	right: 30upx;
}
</style>
