<template>
	<view class="app-wrap comstom-tabbar">
		<scroll-view scroll-y="true" class="item-wrap">
			<view v-for="(item,index) in list" :key="index">
				<banner v-if="item.type=='banner'" :items="item.items"></banner>
				<recommend v-if="item.type=='recommend'" :items="item.items"></recommend>
				<picnav v-if="item.type=='recommend'" :items="item.items"></picnav>
				<guess v-if="item.type=='recommend'" :items="item.items"></guess>
			</view>
		</scroll-view>
		
		<tabbar :curpage="curpage"></tabbar>
	</view>
</template>

<script>
	import http from '@/config/request.js'
	import banner from '@/components/homePage/banner.vue'
	import recommend from '@/components/homePage/recommend.vue'
	import picnav from '@/components/homePage/picnav.vue'
	import guess from '@/components/homePage/guess.vue'
	import tabbar from '@/components/tabbar/tabbar.vue'
	import {imgUrl} from '@/config/conf.js'
	export default {
		data() {
			return {
				list:[],
				curpage:''
			}
		},
		components:{
			banner,
			recommend,
			picnav,
			guess,
			tabbar
		},
		onLoad() {
			this.initData()
		},
		onShow() {
			let pages = getCurrentPages()
			this.curpage = pages[pages.length - 1].route
		},
		methods: {
			initData(){
				http.request({
					url:'/home/homeList',
					success:(res)=>{
						res.data.forEach(item=>{
							item.img=imgUrl+'/uploads/'+item.img
						})
						this.changeData(res.data)
					}
				})
			},
			changeData(data){
				let list=this.list
				let types=[]
				data.forEach(item=>{
				   if(types.indexOf(item.type)==-1){
				     types.push(item.type)
				   }
				})
				types.forEach(tt=>{
				    var ss=[]
				    data.forEach(dd=>{
						if(tt==dd.type){
						   ss.push(dd)
						}
				    })
					list.push({
						type:tt,
						items:ss
				    })
				})
				
			}
		}
	}
</script>

<style scoped lang="scss">
	.app-wrap{
		padding-bottom: env(safe-area-inset-bottom);
		.item-wrap{
			padding-bottom:120upx;
		}
	}
	
</style>
