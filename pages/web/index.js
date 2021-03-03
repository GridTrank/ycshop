import config from '../../utils/config.js';
Page({
  data: {
    url:'https://web.jiaxincloud.com/wechat.html?id=zzgxbtd3m2j0bg&appName=mcyp678&appChannel=20009&wechat=true&autoOpen=true',
    //电商客服

  },

  onLoad(option) {
    if(option.type == 1){
      this.setData({
        url:this.data.url,
      })
    }else if(option.type == 2){
      this.setData({
        url:config.Domain+'/write/detail'+'?node_id='+option.id+"&page_mark="+option.page_mark || '',
      })
    }else{
      this.setData({
        url:option.url || this.data.url,
      })
    }
    wx.setNavigationBarTitle({
      title: option.title || '名创优选',
    })
    console.log(this.data.url)

  },


  /** 
   * 转发分享
   */
  onShareAppMessage() {
    return {
      title: '名创优选-让人惊喜的好物平台',
      path: '/pages/index/index',
      imageUrl: 'https://s1.miniso.cn/bsimg/ec/public/images/4f/a5/4fa50b410a8462864c429fcc98d68e74.png'
    }
  }
})
