
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    title:{
      type:String,
    },
    fixed:{
      type:Boolean,
      value:false,
    },
    isHeader:{
      type:Boolean,
      value:true,
    },
    page:{
      type:String,
      value:'index',
    },
    type:{
      type:String,
      value:'common',//custom
    }
  },
  observers: {
    'isHeader': function (isHeader) {
        console.log(isHeader)
    }
},
  data:{
    globalSystemInfo: getApp().globalData.globalSystemInfo,
    isHome:false,
  },
  methods: {
    
  },
  ready(){
    var pages = getCurrentPages();
    var length = pages.length;
    this.setData({
      globalSystemInfo: getApp().globalData.globalSystemInfo,
      isHome:length == 1 ? true :false,
    })
    
  }
})