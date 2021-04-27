<template>
	<view class="product">
		<view class="detail">
			<swiper class="swiper"  :autoplay="true" :interval="3000" :duration="1000" :circular="true" @change="changeIndex">
				<swiper-item class="swiper-item" v-for="(item,index) in productDetail.banners" >
					<image :src="item" class="p-img" ></image>
				</swiper-item>
			</swiper>
			<view class="indicator_dots" v-if="length>1">
				<text class="curr_dots">{{ currentIndex + 1 }}</text>/{{length}}
			</view>
			<view class="good-info">
				<view class="name two-hidden">{{productDetail.product_name}}</view>
				<view class="desc">{{productDetail.product_describe}}</view>
				<view class="price">¥{{productDetail.product_price}}</view>
			</view>
		</view>
		
		<view class="good-mode" @click="selectPop('spec')">
			<view class="good-select" >
				<text class="sel">已选</text>  <text class="num">{{selectNum}}件</text>  
			</view>
			<text class="iconfont icon-gengduo2"></text>
		</view>
		
		<view class="good-mode" @click="selectPop('distribution')">
			<view class="good-select">
				<text class="sel">配送</text>  <text class="num"></text>  
			</view>
			<text class="iconfont icon-gengduo2"></text>
		</view>
		
		<view class="good-mode" @click="selectPop('address')">
			<view class="good-select">
				<text class="sel">送至</text>  <text class="num"></text>  
			</view>
			<text class="iconfont icon-gengduo2"></text>
		</view>
		
		<!-- 商品选择 -->
		<uni-popups type="bottom" ref='spec'>
			<specifications @close="close" :data="childData"></specifications>
		</uni-popups>
		
		<!-- 配送方式 -->
		<uni-popups type="bottom" ref='distribution'>
			<view class="">
				配送方式
			</view>
		</uni-popups>
		
		<!-- 选择地址 -->
		<uni-popups type="bottom" ref='address'>
			<view class="">
				选择地址
			</view>
		</uni-popups>
		
	</view>
</template>

<script>
	import http from '@/config/request.js'
	import uniPopups from '@/components/uni-popup/uni-popup.vue';
	
	import specifications from '@/components/common/specifications.vue'
	export default {
		data() {
			return {
				productDetail:{},
				currentIndex:'',
				length:'',
				selectNum:1,
				childData:{}
			}
		},
		components:{
			uniPopups,
			specifications
		},
		onLoad(e) {
			this.getData(e.id)
		},
		methods: {
			getData(id){
				http.request({
					url:'/product/detail',
					data:{
						pid:id
					},
					success:(res)=>{
						this.productDetail=res.result
						this.length=res.result.banners.length
					}
				})
			},
			changeIndex(e){
				this.currentIndex=e.detail.current
			},
			selectPop(type){
				this.$refs[type].open()
				this.childData.img=this.productDetail.banners[0]
				this.childData=this.productDetail
			},
			close(){
				this.$refs.spec.close()
			}
		}
	}
</script>

<style scoped lang="scss">
.product{
	position: relative;
	.detail{
		.swiper{
			width: 100%;
			height: 700upx;
			position: relative;
			.swiper-item{
				width: 100%;
				.p-img{
					width: 100%;
					height: 700upx;
				}
			}
		}
		.indicator_dots {
			position: absolute;
			bottom: 340upx;
			right: 0;
			min-width: 100upx;
			height: 50upx;
			padding: 0 10upx;
			line-height: 50upx;
			border-top-left-radius: 25upx;
			border-bottom-left-radius: 25upx;
			text-align: center;
			box-sizing: border-box;
			color: #fff;
			z-index:10;
			background-color: rgba(41, 47, 54, 0.4);
			.curr_dots {
				font-size: 34upx;
			}
		}
		.good-info{
			background: #fff;
			overflow: hidden;
			padding:10upx 30upx 30upx;
			
			.name{
				font-size: 30upx;
				font-weight: 700;
			}
			.desc{
				font-size: 28upx;
				color: #999;
			}
			.price{
				font-size: 40upx;
				font-weight: bold;
				color: #f20e28;
			}
		}
	}
	
	.good-mode{
		margin-top: 20upx;
		background: #fff;
		padding: 20upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		.good-select{
			display: inline-block;
			.sel{
				display: inline-block;
				font-weight: 700;
				font-size: 28upx;
			}
			.num{
				font-size: 28upx;
				margin-left: 20upx;
			}
		}
	}
}
</style>
