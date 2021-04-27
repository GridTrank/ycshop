<template>
	<view class="picnav">
		<navigator hover-class="none" :url="'/pages/goodDetail/goodDetail?id='+item.pid" class="item" v-for="(item,index) in items" :key="index">
			<image class="img" :src="item.img" mode="widthFix"></image>
			<view class="goods-info">
				<view class="name two-hidden">
					{{item.product_name}}
				</view>
				<view class="desc">
					{{item.product_describe}}
				</view>
				<view class="info">
					<text class="price">¥{{item.product_price}}</text>
					<image @click.stop="addCart(item)" class="addimg" src="https://s1.miniso.cn/bsimg/ec/public/images/d1/53/d153b775fd5b607ac1737ceeb39f2cfb.png" ></image>
				</view>
			</view>
		</navigator>
		
		<!-- 选择规格 -->
		<uni-popups type="bottom" ref='spec'>
			<specifications @close="close" :data="childData"></specifications>
		</uni-popups>
	</view>
</template>

<script>
	import specifications from '@/components/common/specifications.vue'
	import uniPopups from '@/components/uni-popup/uni-popup.vue';
	export default{
		props:{
			items:Array
		},
		data(){
			return {
				childData:{}
			}
		},
		components:{
			specifications,
			uniPopups
		},
		methods:{
			addCart(data){
				this.$refs.spec.open()
				this.childData=data
			},
			close(){
				this.$refs.spec.close()
			}
		}
	}
</script>

<style scoped lang="scss">
	.picnav{
		position: relative;
		padding:0 20upx;
		.item{
			overflow: hidden;
			border-radius: 16upx;
			background: #fff;
			margin-bottom: 20upx;
			.img{
				width: 100%;
			}
			.goods-info{
				padding:10upx 20upx 20upx 20upx;
				.name{
					font-size: 28upx
				}
				.desc{
					font-size: 26upx;
					color: #999;
				}
				.info{
					display: flex;
					justify-content: space-between;
					align-items: center;
					.price{
						font-size: 32upx;
						color:#f20e28;
						display: inline-block;
					}
					.addimg{
						width: 36upx;
						height: 36upx;
					}
				}
			}
		}
	}
</style>
