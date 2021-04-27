<template>
	<view class="btn-wrap">
		<view class="btn-item">
			<view class="btn-list add">
				加入购物车
			</view>
			<view class="btn-list buy">
				立即购买
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		props:{
			data:Object
		},
		data(){
			return{
				
			}
		},
		created() {
			console.log('按钮组件数据',this.data)
		},
	}
</script>

<style scoped lang="scss">
.btn-wrap{
	.btn-item{
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
}
</style>
