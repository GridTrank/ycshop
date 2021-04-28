<template>
	<view class="recommend">
		<view class="bg-img">
			<image class="img" src="http://t-dscmall.miniso.cn/storage/data/gallery_album/2/original_img/2_P_1617903630145.png" ></image>
		</view>
		<view class="scroll-view">
			<scroll-view class="scroll-view-item" scroll-x="true" >
				<navigator hover-class="none" :url="'/pages/goodDetail/goodDetail?id='+item.pid" class="scroll-list" v-for="(item,index) in items" :key="index" >
					<image class="image" :src="item.img" ></image>
					<view class="good-info">
						<view class="name two-hidden">{{item.product_name}}</view>
						<view class="info">
							<text class="price">¥{{item.product_price}}</text>
							<image @click.stop="addCart(item)" class="addimg" src="https://s1.miniso.cn/bsimg/ec/public/images/d1/53/d153b775fd5b607ac1737ceeb39f2cfb.png" ></image>
						</view>
					</view>
				</navigator>
			</scroll-view>
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
	.recommend{
		padding: 20upx;
		overflow: hidden;
		position: relative;
		.bg-img{
			height: 800upx;
			border-radius: 20upx;
			overflow: hidden;
			.img{
				width: 100%;
				height: 100%;
			}
		}
		.scroll-view{
		    overflow: visible;
			margin-top: -100upx;
			.scroll-view-item{
				white-space: nowrap;
			    .scroll-list{
					width: 30%;
					display: inline-block;
					border-radius: 22upx;
					overflow: hidden;
					background-color: #fff;
					margin-left: 18upx;
					.image{
						width: 100%;
						height: 220upx;
					}
					.good-info{
						padding: 10upx 20upx;
						.name{
							display: inline-block;
							margin-bottom: 10upx;
							font-size: 26upx;
							height: 80upx;
						}
						.info{
							display: flex;
							align-items: center;
							justify-content: space-between;
							.price{
								display: block;
								color: #f20e28;
								font-size: 32upx;
							}
							.addimg{
								width: 34upx;
								height: 34upx;
							}
						}
					}
					
					
				}
			}
		}
	}
</style>
