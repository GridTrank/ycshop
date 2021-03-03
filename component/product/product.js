const http = require("../../utils/http.js");
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    userInfo: {
      type: Object,
    },
    product: {
      type: Object,
    },
    type: {
      type: String,
      value: 'list'
    },
    settings: {
      type: Object,
    },
    show_type: {
      type: Number,
    },
    group: {
      type: Number,
    },
    num: {
      type: Number,
      value:2
    },
    page:{
      type:String,
      value:'active'
    }
  },
  data: {},
  methods: {
    watckAll(){
      this.triggerEvent('watckAll');
    },
    toggleGoods(e){
      const item = e.currentTarget.dataset.item
      this.triggerEvent("standardData",{
        item:item,
        event:e
      })
    },
    addCart(e) {
      var _ = this;
      var type = e.currentTarget.dataset.type;
      var gid = e.currentTarget.dataset.gid;
      var pid = e.currentTarget.dataset.pid;
      var img = e.currentTarget.dataset.img;
      var name = e.currentTarget.dataset.name;
      var item = e.currentTarget.dataset.item
     
      if (name == 'buy') {
        // 立即购买
        wx.navigateTo({
          url: `/pages/detail/index?id=${pid}`,
        })

      } else {
        this.triggerEvent("standardData",{item:item})
      }

    },
    
  },
  detached() {
    if (this._observer) this._observer.disconnect();
  },
  ready() {

    
  }
})