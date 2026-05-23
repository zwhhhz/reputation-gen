/**
 * 模拟数据 — 用于 GitHub Pages 静态部署（无后端时自动降级）
 */

export const MOCK_CATEGORIES = [
  { id: 1, name: '数码产品', description: '手机、平板、耳机等数码产品', created_at: '2026-05-22' },
  { id: 2, name: '美妆护肤', description: '护肤、彩妆、美发等美妆产品', created_at: '2026-05-22' },
  { id: 3, name: '家居生活', description: '家电、家具、日用品等', created_at: '2026-05-22' },
];

export const MOCK_PRODUCTS = [
  { id: 1, category_id: 1, name: 'AirPods Pro 2', description: 'Apple 第二代主动降噪耳机', created_at: '2026-05-22' },
  { id: 2, category_id: 1, name: 'Sony WH-1000XM5', description: '索尼旗舰头戴式降噪耳机', created_at: '2026-05-22' },
  { id: 3, category_id: 1, name: 'iPad Pro M4', description: '苹果搭载 M4 芯片的专业平板', created_at: '2026-05-22' },
  { id: 4, category_id: 2, name: '兰蔻小黑瓶', description: '兰蔻经典精华液', created_at: '2026-05-22' },
  { id: 5, category_id: 2, name: 'SK-II 神仙水', description: 'SK-II 经典护肤精华', created_at: '2026-05-22' },
  { id: 6, category_id: 3, name: '戴森 V15', description: '戴森旗舰无线吸尘器', created_at: '2026-05-22' },
];

export const MOCK_COPIES = {
  xiaohongshu: [
    { id: 1, platform: 'xiaohongshu', content: '姐妹们！！这个真的绝了😭 降噪效果直接拉满，戴上的瞬间世界都安静了，通勤地铁再也不是噩梦✨ 音质也很能打，低音下潜很深～唯一缺点就是价格有点肉疼，但真的值！💰' },
    { id: 2, platform: 'xiaohongshu', content: '终于下手了！等了超久的好价🎉 戴着超舒服，长时间也不会耳朵疼～通透模式也超自然，走路听歌也不怕错过地铁广播📢 推荐给在纠结的姐妹！' },
    { id: 3, platform: 'xiaohongshu', content: '从一代换过来的，提升真的超大！🤯 降噪能力翻倍的感觉，音质也更通透了。空间音频看电影简直沉浸式体验🎬 日常通勤+运动都在用，幸福感upup⬆️' },
    { id: 4, platform: 'xiaohongshu', content: '说真的 这个降噪 在飞机上用简直无敌✈️ 之前坐飞机嗡嗡嗡根本睡不着，现在戴上它瞬间安静！而且续航也比上代长了好多，长途飞行完全够用💯' },
    { id: 5, platform: 'xiaohongshu', content: '先说结论：值！💯 作为降噪耳机老用户，这款是综合体验最好的。佩戴感、音质、降噪、续航全都在线，没什么明显短板。如果预算够，直接冲不后悔🛒' },
  ],
  bilibili: [
    { id: 1, platform: 'bilibili', content: '作为一个从AirPods Pro 1代升级过来的用户，说下真实感受：降噪提升确实大，尤其是低频部分，地铁空调声几乎完全消除。音质方面低频量感更足，中频人声也更贴耳了。不过价格确实不便宜，看个人需求吧。' },
    { id: 2, platform: 'bilibili', content: '佩戴舒适度好评！一代戴久了耳道会疼，二代明显改善了。降噪效果在办公室场景表现优秀，键盘声基本过滤掉。续航大概6小时左右，配合充电盒够一天用。建议等双十一入手比较划算。' },
    { id: 3, platform: 'bilibili', content: '实测对比了XM5，降噪半斤八两，但佩戴舒适度苹果完胜。空间音频看番是真的爽，配合iPad用沉浸感拉满。如果苹果全家桶用户，闭眼入就对了。安卓用户建议对比一下再决定。' },
    { id: 4, platform: 'bilibili', content: '降噪、音质、佩戴感我给8.5/10，主要扣分在价格和不太耐脏。使用两个月下来，降噪模式在图书馆和咖啡厅场景效果最明显。通话质量也比一代好很多， windy条件下对方也能听清。' },
    { id: 5, platform: 'bilibili', content: '之前用的FreeBuds Pro，换过来之后差距还是很明显的。降噪深度和宽度都更好，尤其是中频人声的过滤。音质偏暖，听流行和电音很对味。iOS生态绑定太深了，安卓用户体验会打折。' },
  ],
  douyin: [
    { id: 1, platform: 'douyin', content: '这降噪绝了兄弟们🔥 一戴上整个世界都安静了 地铁上直接沉浸在自己的世界里 太爽了！' },
    { id: 2, platform: 'douyin', content: '家人们谁懂啊 之前一直纠结买不买 结果一戴上就真香了😂 通透模式也太自然了 走路完全不耽误听环境声' },
    { id: 3, platform: 'douyin', content: '从1代换2代 提升真的不是一点点🤏 降噪直接翻倍 音质也更通透了 唯一的缺点就是贵！但是真的值！' },
    { id: 4, platform: 'douyin', content: '入手一周真实体验：佩戴感比1代好太多 长时间戴也不疼了 降噪效果在办公室简直神器 键盘声全部消失💯' },
    { id: 5, platform: 'douyin', content: '坐飞机必带！🛫 之前飞机噪音根本睡不着 戴上它瞬间安静 睡眠质量直接起飞 续航也很顶 长途完全够用' },
  ],
};

export const MOCK_METHODOLOGIES = [
  { id: 1, title: '小红书种草方法论', content: '1. 开头用感叹句或问句吸引注意\n2. 加入个人使用场景\n3. 突出1-2个核心卖点\n4. 适当使用emoji增加亲和力\n5. 结尾要有购买引导', version: 1, created_at: '2026-05-22' },
  { id: 2, title: 'B站评测方法论', content: '1. 开头亮明身份和使用经历\n2. 对比竞品要有理有据\n3. 具体场景实测数据\n4. 优缺点都要提\n5. 给出明确购买建议', version: 1, created_at: '2026-05-22' },
];

export const MOCK_FEEDBACKS = [
  { id: 1, copy_content: '之前的文案测试', platform: 'xiaohongshu', product_name: 'AirPods Pro 2', feedback_text: '语气太官方，需要更口语化', applied: true, created_at: '2026-05-22' },
];

/** 获取模拟品类列表 */
export function getMockCategories() {
  return { code: 0, message: 'success', data: MOCK_CATEGORIES };
}

/** 获取模拟产品列表 */
export function getMockProducts(categoryId) {
  const filtered = categoryId
    ? MOCK_PRODUCTS.filter(p => p.category_id === categoryId)
    : MOCK_PRODUCTS;
  return { code: 0, message: 'success', data: filtered };
}

/** 获取模拟文案 */
export function getMockCopies(platform) {
  return {
    code: 0,
    message: 'success',
    data: MOCK_COPIES[platform] || MOCK_COPIES.xiaohongshu,
  };
}

/** 获取模拟方法论 */
export function getMockMethodologies() {
  return { code: 0, message: 'success', data: MOCK_METHODOLOGIES };
}

/** 获取模拟反馈 */
export function getMockFeedbacks() {
  return { code: 0, message: 'success', data: MOCK_FEEDBACKS };
}
