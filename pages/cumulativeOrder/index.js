
const http = require('../../utils/http.js')
import { formatTime } from '../../utils/util.js';
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
  updataGoodStandard(e){
    this.setData(e.detail)
  },
  onUnload() {
    if (this._observer) this._observer.disconnect();
  },
  /**
   * 初始化数据
   */
  onLoad(options) {
    this.setData({
      pageType:options.type || 'order',
      rule_id: options.id,
      globalSystemInfo: getApp().globalData.globalSystemInfo
    }) 
    this.getData({
      sort_by: 1,
      sort_type: 1,
      category_id: "",
    });
  },
  goTop(){
    this.setData({
      scrollTop: 0
    });
  },
  scrolltoupper(e){
    let t =  e.detail.scrollTop;
    if (t > 300 && !this.data.isTop) {
    	// 避免重复setData
    	this.setData({
        isTop: true
	    });
    } 
    
   	if(t <= 300 && this.data.isTop){
  	  this.setData({
        isTop: false
      });
   	}

  },

  refresh() {
    this.getData({
      sort_by: 1,
      sort_type: 1,
      category_id: "",
    });
  },
  standardData(e){
    this.setData({
      detail:e.detail.item
    })
  },
  getData(args,type) {

    let _ = this;
    wx.showLoading({
      title: '加载中...'
    })
    wx.showNavigationBarLoading();
    http.request({
      url: '/cart/pool_goods',
       
      data: {
        "sort_by": args.sort_by,
        "sort_type": args.sort_type,
        "category_id": args.category_id,
        "rule_id": _.data.rule_id,
        "search_goods":_.data.searchVal
      },
      isCode:true,
      success: function (res) {
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          if(type == 'search'){
            _.setData({
              searchList:res.data.result.goods_list,
              cart_total: res.data.result.cart_total,
              category_list: res.data.result.category_list,
              rule_name: res.data.result.rule_info.rule_name,
            })
            return;
          }
          _.setData({
            viewIndexNewGoods: res.data.result.goods_list,
            cart_total: res.data.result.cart_total,
            category_list: res.data.result.category_list,
            rule_name: res.data.result.rule_info.rule_name,
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
       
        _.selectComponent('#requestPage').updata(false);
      },
      complete:function(){
        wx.hideNavigationBarLoading();
        wx.hideLoading()
      }
    })
  },
  back(){
    wx.navigateBack();
  },
  clearSearch(){
    this.setData({
      searchVal:'',
      searchList:[],
      isSearch : false,
    })
  },
  inputChange(e){
    if(e.detail.value == ''){
      this.setData({
        isSearch : false,
      })
    }
    this.setData({
      searchVal:e.detail.value,
      
    })
  },
  searchProduct(){
    if(this.data.searchVal == '') return;
    this.setData({
      isSearch:true
    })
    this.getData({
        "sort_by": this.data.typeId,
        "sort_type": this.data.priceSort,
        "category_id": this.data.category_id,
        "rule_id": this.data.rule_id,
    },'search')
  },
  taggleProductType(){
    this.setData({
      productType:this.data.productType == 'list' ? 'leftRow' :'list',
    })
  },
  data: {
    isTop:false,
    scrollTop:0,
    isSearch:false,
    productType:'list',
    searchList:[],
    searchVal:'',
    pageType:"coupon",
    globalSystemInfo:getApp().globalData.globalSystemInfo,
    userInfo: wx.getStorageSync('userInfo'),
    addToCartHide: false,     // 控制添加购物车显隐
    isHide: false,            // 控制分类显隐
    category_list: [],        // 凑单分类列表
    viewIndexNewGoods: [],    // 凑单分类列表
    cart_total: "00.0",       // 购物车金额
    category_id: 0,                 // 分类内容id
    rule_name: "",            // 优惠规则
    rule_id: 0,               // 优惠规则id

    defaultPic: "",
    open: false,
    priceSort: false,
    typeId: 1,                // type列表id
    isLoad: false,
    isOver: false,
    page: 2,                  // 滚动分页
    detail: {
      cart_num: 0,
      is_marketable: 1,
      is_in_stock: 1,
      sku_category:{}
    }
  },

  /**
   * type列表的active
   */
  activeType(e) {
    let _typeId = e.currentTarget.dataset.type;


    this.setData({
      typeId: _typeId,
      priceSort: !this.data.priceSort
    })

    this.getData({
      sort_by: _typeId,
      sort_type: _typeId == 2 ? this.data.priceSort : true,
      category_id: "",
      rule_id: this.data.rule_id,
    });

  },

  /**
   * 滞空selected
   */
  toggleCallback() {
    this.setData({
      selected: {},
      selectedLength: 0
    })
  },

  /**
   * 分类显隐
   */
  isHide(e) {
    this.setData({
      isHide: !this.data.isHide,
      typeId: e.currentTarget.dataset.type
    })
  },


  /**
   * 分类内容选择
   */
  selecItem(e) {
    let typeId = e.currentTarget.dataset.type;

    this.setData({
      category_id: e.currentTarget.dataset.id
    })

    this.getData({
      sort_by: 1,
      sort_type: 1,
      category_id: typeId,
    });
    this.isHide(e);
  },

  /**
 * 滚动加载
 */
  scroll() {
    //第一步： 是否在请求中 true: return; false: next;
    if (this.data.isLoad) return;
    if (this.data.isOver) return;

    //第二步： 进入加载前锁住滚动请求
    this.setData({ isLoad: true });

    wx.showNavigationBarLoading()

    let _ = this;
    http.request({
      url: '/cart/pool_goods_list',
       
      data: {
        "sort_by": _.data.typeId,
        "sort_type": _.data.priceSort,
        "category_id": _.data.category_id,
        "page": this.data.page++,
        "rule_id": _.data.rule_id,
        "search_goods":_.data.searchVal
      },
      isCode:true,
      success: function (res) {
        if (res.data.code == 200) {
          _.selectComponent('#requestPage').updata(true);
          _.setData({
            viewIndexNewGoods: _.data.viewIndexNewGoods.concat(res.data.result.goods_list),
            isLoad: false,
            isOver: _.data.viewIndexNewGoods.length >= res.data.result.count
          });
        } else {
          _.selectComponent('#requestPage').updata(false);
        }

        wx.hideNavigationBarLoading()
      },
      fail: function () {
        wx.hideNavigationBarLoading();
        _.selectComponent('#requestPage').updata(false);
      }
    })

  },


})
