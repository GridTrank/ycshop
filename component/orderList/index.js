
Component({
  properties: {
    orderList: {
      type: Array,
      value: []
    },
    page:{
      type:String,
      value:'income'
    }
  },
 
  data:{
    
  },
  methods: {
     // 更新数据
     updataData(e) {
      this.triggerEvent("updataData", e.detail)
    },
    deleteOrder(e){
      this.selectComponent('#orderBtn').orderBtn(e)
    }
  },
  ready(){

   
  },
})