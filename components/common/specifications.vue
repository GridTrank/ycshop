<template>
	<view class="spec-wrap">
		<view class="good-info">
			<image class="img" :src="data.img" mode="widthFix"></image>
			<view class="good-detail">
				<view class="name two-hidden">{{data.product_name}}</view>
				<view class="price">¥{{data.product_price}}</view>
				<view class="stock">库存：{{data.stock}}</view>
			</view>
			<image @click="closePop" class="close" src="https://s1.miniso.cn/bsimg/ec/public/images/21/51/21519a04122b0987ede430997fdb5da7.png" mode="widthFix"></image>
		</view>
		
		<view class="buy-num">
			<view class="attr_title">数量</view>
			<view class="limit_and_mun">
				<view class="add_num_wrap">
					<text :class="['iconfont', 'icon-jian']" @click="changeNum(1)"></text>
					<input class="add_input" type="number" @blur="changeNum(3)"  v-model.number="goodsNum"/>
					<text :class="['iconfont', 'icon-jia']" @click="changeNum(2)"></text>
				</view>
			</view>
		</view>
		
		<view class="btn-wrap" v-if="data.stock>0">
			<view class="btn-list add" @click="addCart" >
				加入购物车
			</view>
			<view class="btn-list buy">
				立即购买
			</view>
		</view>
		<view class="btn-wrap no-stock" v-else>
			暂无库存
		</view>
	</view>
</template>

<script>
	import http from '@/config/request.js'
	export default{
		props:{
			data:Object
		},
		data(){
			return{
				goodsNum:1,
				userInfo:uni.getStorageSync('userInfo')
			}
		},
		components:{
		},
		created() {
			
		},
		methods:{
			closePop(){
				this.$emit('close')
			},
			addCart(){
				http.request({
					url:'/cart/addCart',
					data:{
						mid:this.userInfo.mid,
						pid:this.data.pid,
						product_num:this.goodsNum
					},
					success:(res)=>{
						if(res.code==200){
							uni.showToast({
								title:'加入购物车成功',
								icon:'none',
								duration:1500
							})
							this.goodsNum=1
							this.$emit('close')
						}
					}
				})
			},
			changeNum(val){
				if(val==1){
					if(this.goodsNum<=1){
						this.goodsNum=1
						return
					}
					this.goodsNum-=1
				}else if(val==2){
					if(this.goodsNum>=Number(this.data.stock)){
						this.goodsNum=Number(this.data.stock)
						return
					}
					this.goodsNum+=1
				}else{
					if(this.goodsNum<=0){
						this.goodsNum=1
					}
					if(this.goodsNum>=Number(this.data.stock)){
						this.goodsNum=Number(this.data.stock)
					}
				}
				
			}
		}
	}
</script>

<style scoped lang="scss">
.spec-wrap{
	background: #fff;
	padding-bottom: env(safe-area-inset-bottom);
	.good-info{
		padding:30upx;
		display: flex;
		position: relative;
		.img{
			height: 180upx;
			width: 180upx;
		}
		.good-detail{
			margin-left: 20upx;
			position: relative;
			.name{
				font-size: 30upx;
				width: 350upx;
				margin-bottom: 10upx;
			}
			.price{
				font-size: 32upx;
				color: #f20e28;
			}
			.stock{
				font-size: 28upx;
				position: absolute;
				bottom: 0;
				width: 200upx;
			}
		}
		.close{
			position: absolute;
			top: 30upx ;
			right: 30upx;
			width: 44upx;
			height: 44upx;
		}
	}
	.buy-num{
		padding: 30upx;
		display: flex;
		align-items: center;
		.limit_and_mun{
			margin-left: 30upx;
			.add_num_wrap{
				display: flex;
				border-radius: 54upx;
				border: 2upx solid #B2B2B2;
				height: 54upx;
				.iconfont{
					width: 70upx;
					font-size: 24upx;
					text-align: center;
					line-height: 54upx;
				}
				.add_input{
					height: 100%;
					width: 80upx;
					text-align: center;
					font-size: 28upx;
					border-left: 2upx solid #B2B2B2;
					border-right: 2upx solid #B2B2B2;
				}
			}
		}
	}
	.btn-wrap{
		margin-top: 50upx;
		height: 100upx;
		display: flex;
		.btn-list{
			width: 50%;
			text-align: center;
			line-height: 100upx;
			font-weight: 700;
		}
		.add{
			background: #FFC707;
			color: #fff;
		}
		.buy{
			background: #F91F28;
			color: #fff;
		}
	}
	.no-stock{
		line-height: 100upx;
		text-align: center;
		display: block;
		background-color: #999;
		color: #fff;
	}
}
</style>
