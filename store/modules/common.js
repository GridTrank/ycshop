
const state={
	isLogin:'',
	userRole:'',
	userInfo:{}
}



const actions={
	GetUserInfo({commit}, o){
		commit('GetUserInfo',o)
	},
	
}
const mutations={
	
	GetUserInfo(state,data){
		state.userInfo=data
	},
	
}


export default {
    state,
    mutations,
    actions,
  };