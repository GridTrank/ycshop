
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    page:{
      type:String,
    },
    noData:{
      type:Object
    }
  },
 
  data:{
    
  },
  methods: {
    addAddress(){
      this.triggerEvent('addAddress')
    }
  },
  ready(){

    
  }
})