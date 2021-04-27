<template>
	<view class="guess">
		<view class="guess-wrap">
			<view class="title">
				猜你喜欢
			</view>
			<view class="guess-item">
				<navigator hover-class="none" :url="'/pages/goodDetail/goodDetail?id='+item.pid" class="guess-list" v-for="(item,index) in items" :key="index">
					<image class="image" :src="item.img" mode="widthFix"></image>
					<view class="goods-info">
						<view class="name two-hidden">
							{{item.product_name}}
						</view>
						<view class="desc">
							{{item.product_describe}}
						</view>
						<view class="info">
							<text class="price">¥{{item.product_price}}</text>
							<image @click.stop="addCart(item)"  class="addimg" src="https://s1.miniso.cn/bsimg/ec/public/images/d1/53/d153b775fd5b607ac1737ceeb39f2cfb.png" ></image>
						</view>
					</view>
				</navigator>
			</view>
		</view>
		
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
	.guess{
		padding:0 20upx;
		.guess-wrap{
			border-radius: 16upx;
			overflow: hidden;
			padding: 0upx 10upx 10upx;
			.guess-item{
				width: 100%;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				.guess-list{
					background-color: #fff;
					flex-shrink: 0;
					border-radius: 20upx;
					overflow: hidden;
					width: 49%;
					display: inline-block;
					margin-top: 20upx;
					.image{
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
		}
	}
</style>
