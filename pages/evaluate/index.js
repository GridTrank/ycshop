import {
  formatTime
} from '../../utils/util.js';
const http = require('../../utils/http');
const config = require('../../utils/config.js');
Page({


  /** 
   * 转发分享
   */
  onShareAppMessage() {

    return {
      title: '名创优选-让人惊喜的好物平台',
      path: '/pages/index/index',
      imageUrl: 'https://s1.miniso.cn/bsimg/ec/public/images/4f/a5/4fa50b410a8462864c429fcc98d68e74.png'
    }
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: "评价"
    });

  },

  onLoad(options) {
    this.setData({
      order_id: options.id
    })
    this.getData();
  },
  // 评分
  selectStar(e) {
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    this.data.point[id] = index;
    this.setData({
      point: this.data.point
    })
  },
  getData() {
    var _ = this;
    wx.showNavigationBarLoading({
      title: "评价"
    });
    http.request({
      url: "/order/discuss",
       
      data: {
        order_id: this.data.order_id,
      },
      isCode:true,
      success: (res) => {
        wx.hideNavigationBarLoading();
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          var result = res.data.result;
          result.map(function (elem, index) {
            _.data.info[elem.product_id] = '';
            _.data.pic[elem.product_id] = [];
            _.data.ids[elem.product_id] = [];
            _.data.point[elem.product_id] = 5;
          })
          _.setData({
            evaluate: result,
          })
        } else {
          _.selectComponent('#requestPage').updata(false);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      },
      fail: function () {
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })
  },
  // 评价输入框
  evaluateInput(e) {
    var id = this.data.evaluate[e.target.dataset.index].product_id;
    this.data.info[id] = e.detail.value;
    console.log(e.detail.value)
    this.setData({
      info: this.data.info,
    })
  },
  // 提交评价
  subEvaluate(e) {
    var pid = e.target.dataset.pid;
    var gid = e.target.dataset.gid;
    var index = e.target.dataset.index;
    if (this.data.info[pid].length < 10) {
      wx.showToast({
        title: '评价信息不能少于10个字',
        icon: "none"
      })
      return;
    }
    http.request({
      url: "/comment/toComment",
       
      data: {
        order_id: this.data.order_id,
        goods_id: gid,
        product_id: pid,
        comment: this.data.info[pid],
        comment_images: this.data.ids[pid].toString(),
        goods_point: this.data.point[pid] || 5,
      },
      success: (res) => {

          var obj = this.data.evaluate[index];
          obj.type = 1;
          obj.comment_images = this.data.pic[pid];
          obj.comment = this.data.info[pid];
          obj.goods_point = this.data.point[pid] || 5;
          this.data.evaluate.splice(index, 1);
          this.data.evaluate.push(obj)
          this.setData({
            pic: this.data.pic,
            ids:this.data.ids,
            info: this.data.info,
            point: this.data.point,
            evaluate: this.data.evaluate,
          })
          wx.showToast({
            title: '提交评论成功',
            icon: "none"
          })


        
      }
    })
  },
  // 删除图片
  removePic: function (e) {
    let pid = e.currentTarget.dataset.pid;
    let src = e.currentTarget.dataset.src;
    let index = e.currentTarget.dataset.index;
    //启动上传等待中...  
    wx.showLoading({
      title: '正在删除...',
      icon: 'loading',
    })
    http.request({
      url: "/comment/imageDelete",
       
      data: {
        image_id: this.data.ids[pid][index],
      },
      success: (res) => {
        wx.hideLoading();
        this.data.pic[pid].splice(index, 1);
        this.data.ids[pid].splice(index, 1);
        this.setData({
          "pic": this.data.pic,
          "ids": this.data.ids,
        })
      }

    })
  },
  //添加图片  
  bindChooiceProduct: function (e) {
    let that = this;
    let pid = e.currentTarget.dataset.pid;
    wx.chooseImage({
      count: 4, //最多可以选择的图片总数  
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = that.data.pic[pid].concat(res.tempFilePaths);
        if (tempFilePaths.length > 4) {
          wx.showToast({
            title: '最多只能上传4张图片',
            icon: "none"
          })
          return
        }
        that.data.pic[pid] = tempFilePaths;
        that.setData({
          "pic": that.data.pic,
        })
        //启动上传等待中...  
        wx.showLoading({
          title: '正在上传...',
          icon: 'loading',
        })
        //图片上传
        that.uploadimg('/comment/imageUpload', res, pid);
      }
    });
  },
  //图片上传
  uploadimg(url, obj, pid) {
    var that = this,
      i = obj.i ? obj.i : 0, //当前上传的哪张图片
      success = obj.success ? obj.success : 0, //上传成功的个数
      fail = obj.fail ? obj.fail : 0; //上传失败的个数
    wx.uploadFile({
      url: config.Domain + url,
      filePath: obj.tempFilePaths[i],
      name: 'file', //这里根据自己的实际情况改
      formData: { //这里是上传图片时一起上传的数据
        'token': wx.getStorageSync('token'),
        'filePath': obj.tempFilePaths[i],
      },
      header: {
        'content-type': 'multipart/form-data'
      },
      success: (result) => {
        var DATA = JSON.parse(result.data);
        if (DATA.code == 200) {

          success++; //图片上传成功，图片上传成功的变量+1
          that.data.ids[pid].push(DATA.result.image_id);
          that.setData({
            "ids": that.data.ids
          })
        } else {
          wx.showToast({
            title: DATA.msg,
            icon: "none"
          })
          var index = that.data.pic[pid].indexOf(DATA.result.file_path);
          that.data.pic[pid].splice(index, 1);
          that.setData({
            "pic": that.data.pic,
          })
        }
      },
      fail: (result) => {
        wx.hideLoading();
        var index = that.data.pic[pid].indexOf(obj.tempFilePaths[i]);
        that.data.pic[pid].splice(index, 1);
        that.setData({
          "pic": that.data.pic,
        })
        wx.showModal({
          title: '错误提示',
          content: result.errMsg,
          showCancel: false
        })
        fail++; //图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        i++; //这个图片执行完上传后，开始上传下一张
        if (i == obj.tempFilePaths.length) { //当图片传完时，停止调用     
          wx.hideLoading();
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
        } else { //若图片还没有传完，则继续调用函数
          obj.i = i;
          obj.success = success;
          obj.fail = fail;
          that.uploadimg('/comment/imageUpload', obj, pid);
        }
      }
    });
  },
  data: {
    userInfo: wx.getStorageSync('userInfo'),
    order_id: "",
    evaluate: [],
    info: {},
    pic: {},
    ids: {},
    point: {},
    productInfo: {},
    image_ids: []
  }
})