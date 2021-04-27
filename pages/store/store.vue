<template>
	<view>
		
		
		<tabbar :curpage="curpage"></tabbar>
	</view>
</template>

<script>
	import tabbar from '@/components/tabbar/tabbar.vue'
	export default {
		data() {
			return {
				curpage:'',
			}
		},
		components:{
			tabbar
		},
		onShow() {
			let pages = getCurrentPages()
			this.curpage = pages[pages.length - 1].route
		},
		methods: {
			
		}
	}
</script>

<style scoped lang="scss">

</style>
