
Component({
  properties: {
    comment:{
      type:Object,
    },
    num:{
      type:Number,
      value:100000,
    }
  },
 
  data:{
    
  },
  methods: {
    previewImage(e) {
      var i = e.currentTarget.dataset.i;
      var index = e.currentTarget.dataset.index;
      wx.previewImage({
        current: this.data.comment[index].image_big[i],
        urls: this.data.comment[index].image_big
      })
    }
  },
  ready(){

  }
})