const http = require("../../utils/http.js");
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    popupSet: {         //弹窗类型
      type: Object,
      value: {
        type: 'invite',
        cancleShow:true,
        enterShow:true,
      }     //invite 助力活动   userDefined   自定义
    },

    
  },
 
  data:{
    requestState : true
  },
  methods: {
    cancleCallback(){
      this.triggerEvent('cancleCallback');
    },
    enterCallback(e) {
      console.log(e)
      this.triggerEvent('enterCallback',e);
    },
    toggleShow(){
      this.triggerEvent('toggleShow');
    },
  }
})