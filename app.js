//app.js
const http = require('./utils/http');
const config = require('./utils/config.js');
const Domain = config.Domain;
App({
  onLaunch (options) {
    console.log('onLaunch:',options);
    /**
     * 有post_share_key：商家身份
     * 
     */
    let query=options.query
    wx.setStorageSync('options', query)
    
  },
  onShow(options){
    
  },
  getZkref(id){

  },
  //获取胶囊信息
  getSystemInfo() {
    let app = this.globalData;
    let navBarHeight = '';
    let systemInfo = wx.getSystemInfoSync();
    let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
    let rect = {};
    try {
      if (wx.getMenuButtonBoundingClientRect()) {
        rect = wx.getMenuButtonBoundingClientRect();
      }
    } catch (err) {
      console.info(err);
    }

    setTimeout(() => {
      if (!systemInfo.statusBarHeight) {
        systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
        navBarHeight = (function () {
          let gap = rect && rect.height ? rect.top - systemInfo.statusBarHeight : 0;
          if (rect && rect.height) {
            return 2 * gap + rect.height;
          } else {
            return 0;
          }
        })();
        systemInfo.statusBarHeight = 0;
        systemInfo.navBarExtendHeight = 0; //下方扩展4像素高度 防止下方边距太小
      } else {
        navBarHeight = (function () {
          let gap = rect && rect.height ? rect.top - systemInfo.statusBarHeight : 0;
          if (rect && rect.height) {
            return systemInfo.statusBarHeight + 2 * gap + rect.height;
          } else {
            return 0;
          }
        })();
        if (ios) {
          systemInfo.navBarExtendHeight = 4; //下方扩展4像素高度 防止下方边距太小
        } else {
          systemInfo.navBarExtendHeight = 1.7;
        }
      }
      systemInfo.navBarHeight = navBarHeight; //导航栏高度不包括statusBarHeight
      systemInfo.capsulePosition = rect; //右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
      systemInfo.ios = ios; //是否ios

      app.globalSystemInfo = systemInfo; //将信息保存到全局变量中,后边再用就不用重新异步获取了
      console.info('systemInfo', app.globalSystemInfo);
      return systemInfo;
    })
  },
  globalData: {
    writePhotosAlbum:true,
    globalSystemInfo:{},
    userInfo: null,
    isLoad:false,
    orderType:'',
    source:'',
    zk_ref:'',
  }
})