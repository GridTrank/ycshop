Component({
  properties: {
    swiper: {
      type: Object
    },
    main_slide: {
      type: Array
    },
    page: {
      type: String,
      value: 'common'
    }
  },
  
  data: {
    imgheight: null,
    swiperUpdata: false,
    dataList: [],
    current: 0,
    previewImage: []
  },
  methods: {
    previewImage(e) {
      if (this.data.swiper.previewImage) {
        if (!this.data.previewImage.length) {
          this.data.dataList.map((item, index) => {
            this.data.previewImage.push(item.imgUrl);
          })
        }
        wx.previewImage({
          current: this.data.previewImage[e.currentTarget.dataset.index],
          urls: this.data.previewImage
        })
      }
    },
    loadImg(e) {
      var imgwidth = e.detail.width,
        imgheight = e.detail.height,
        ratio = imgwidth / imgheight,
        _ = this;
      var systemInfo = wx.getSystemInfoSync();
      if (_.data.imgheight != null) return;
      var height = 0;
      if (_.data.page == 'index') {
        height = (systemInfo.windowWidth - (40 / 750 * systemInfo.windowWidth)) / ratio + (24 / 750 * systemInfo.windowWidth);
      } else {
        height = systemInfo.windowWidth / ratio;
      }
      _.setData({
        'imgheight': height + 'px'
      })
    },
    changeCurrent(e) {
      this.setData({
        current: e.detail.current
      })
    },
    // banner图有效期监听
    bannerTimeDown(index, i) {
      var nowTime = Date.parse(new Date()) / 1000;
      var _ = this;
      _.data.bannerTime = setTimeout(() => {
        var obj = _.data.dataList[index];
        if (!obj) return;
        if (obj.to_time > nowTime) {
          _.bannerTimeDown(index)
        } else {
          _.data.dataList.splice(index, 1);
          _.setData({
            'swiperUpdata': true,
            'dataList': _.data.dataList,
          }, () => {
            _.setData({
              'swiperUpdata': false,
            })
          })
        }
      }, 1000)

    }
  },
  ready() {},

})