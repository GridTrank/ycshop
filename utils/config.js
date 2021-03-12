const env = "test";
var version = '3.0.0.20200523'
const config = {
  "dev": {
    "env": env,
    // 域名配置
    "Domain": 'http://192.168.6.25/openapi',
    //系统配置
    "sign": {
      "identity": '28Vebp',
      "secret": 'ZisO6GiEMnTpDZHQAQXCHzQykLk8w6Ux',
      "source": 'xiaochengxu-v1.0'
    },
    "phoneService": '4009965022',                  // 客服电话
    "wxConfig": {
      "appid": "wx8aaa7733adaf6b38",               // appID
    }
  },

  "test": {
    "env": env,
    // 域名配置
    // "Domain": 'http://t-youxuan.miniso.cn/openapi',
    "Domain": 'http://127.0.0.1:3002',
    // "Domain": 'http://47.112.113.38:3002',
    //系统配置
    "sign": {
      "identity": '28Vebp',
      "secret": 'ZisO6GiEMnTpDZHQAQXCHzQykLk8w6Ux',
      "source": 'xiaochengxu-v1.0'
    },
    "phoneService": '4009965022',                  // 客服电话
    "wxConfig": {
      "appid": "wx8aaa7733adaf6b38",               // appID
    }
  },

  "prod": {
    "env": env,
    // 域名配置
    "Domain": 'https://youxuan.miniso.cn/openapi',
    //系统配置
    "sign": {
      "identity": '28Vebp',
      "secret": 'ZisO6GiEMnTpDZHQAQXCHzQykLk8w6Ux',
      "source": 'xiaochengxu-v1.0'
    },
    "phoneService": '4009965022',                  // 客服电话
    "wxConfig": {
      "appid": "wx8aaa7733adaf6b38",               // appID
    }
  }
}
config[env].version = version;
module.exports = config[env];