<template>
	<view class="banner">
		<swiper class="swiper" :indicator-dots="true" :autoplay="false" :interval="3000" :duration="1000" :circular="true">
			<swiper-item class="swiper-item" v-for="(item,index) in items" :key="index" @click="toDetail(item)">
				<image class="swiper-img" :src="item.img" ></image>
			</swiper-item>
			
		</swiper>
		
	</view>
</template>

<script>
	export default{
		props:{
			items:Array
		},
		data(){
			return{
				imgSize:{}
			}
		},
		mounted() {
		},
		methods:{
			toDetail(data){
				uni.navigateTo({
					url:'/pages/goodDetail/goodDetail?id='+data.pid
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.banner{
		.swiper{
			width: 100%;
			height: 450upx;
		}
		.swiper-item{
			width: 100%;
			height: 100%;
			.swiper-img{
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
