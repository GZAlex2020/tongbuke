/* ============================================================
 * config.js —— 全局配置 / 教材目录 / 学段扩展骨架
 * ------------------------------------------------------------
 * 本文件是「扩展新年级、新学科、新教材版本」的唯一入口。
 * 新增年级或学段时，只需修改 stages / catalog / subjects，
 * 不需要改动 app.js、speech.js 中的任何业务逻辑。
 * ============================================================ */
(function () {
  'use strict';

  var CN = ['零', '一', '二', '三', '四', '五', '六'];

  /* ---------- 教材目录 ----------
   * key 格式: '年级|学科|册次'（册次为 上 / 下）
   * value 用 '|' 分隔单元标题；顺序即课本顺序。
   * 目录依据公开教材目录整理，具体单元名称与顺序请以学校实际用书核对。
   */
  var catalog = {
    /* ===== 语文 · 统编版（人教部编版） ===== */
    '1|chinese|上': '我上学了|识字1 天地人|识字2 金木水火土|识字3 口耳目|识字4 日月水火|识字5 对韵歌|汉语拼音1 a o e|汉语拼音2 i u ü y w|汉语拼音3 b p m f|汉语拼音4 d t n l|课文1 秋天|课文2 小小的船|课文3 江南|课文4 四季|识字6 画|识字7 大小多少|识字8 小书包|识字9 日月明|识字10 升国旗|课文5 影子|课文6 比尾巴|课文7 青蛙写诗|课文8 雨点儿|课文9 明天要远足|课文10 大还是小|课文11 项链|课文12 雪地里的小画家|课文13 乌鸦喝水|课文14 小蜗牛',
    '1|chinese|下': '识字1 春夏秋冬|识字2 姓氏歌|识字3 小青蛙|识字4 猜字谜|课文1 吃水不忘挖井人|课文2 我多想去看看|课文3 四个太阳|课文4 静夜思|课文5 夜色|课文6 端午粽|课文7 彩虹|识字5 动物儿歌|识字6 古对今|识字7 操场上|识字8 人之初|课文11 古诗二首（池上·小池）|课文12 荷叶圆圆|课文13 要下雨了|课文14 文具的家|课文15 一分钟|课文16 动物王国开大会|课文17 小猴子下山|课文18 棉花姑娘|课文19 咕咚|课文20 小壁虎借尾巴',
    '2|chinese|上': '课文1 小蝌蚪找妈妈|课文2 我是什么|课文3 植物妈妈有办法|识字1 场景歌|识字2 树之歌|识字3 拍手歌|识字4 田家四季歌|课文4 曹冲称象|课文5 玲玲的画|课文6 一封信|课文7 妈妈睡了|课文8 古诗二首（登鹳雀楼·望庐山瀑布）|课文9 黄山奇石|课文10 日月潭|课文11 葡萄沟|课文12 坐井观天|课文13 寒号鸟|课文14 我要的是葫芦|课文18 古诗二首（夜宿山寺·敕勒歌）|课文19 雾在哪里|课文20 雪孩子|课文21 狐假虎威|课文22 纸船和风筝|课文23 风娃娃',
    '2|chinese|下': '课文1 古诗二首（村居·咏柳）|课文2 找春天|课文3 开满鲜花的小路|课文4 邓小平爷爷植树|课文5 雷锋叔叔，你在哪里|课文6 千人糕|识字1 神州谣|识字2 传统节日|识字3 “贝”的故事|识字4 中国美食|课文8 彩色的梦|课文9 枫树上的喜鹊|课文10 沙滩上的童话|课文11 我是一只小虫子|课文12 寓言二则|课文13 画杨桃|课文14 小马过河|课文15 古诗二首（晓出净慈寺送林子方·绝句）|课文16 雷雨|课文17 要是你在野外迷了路|课文18 太空生活趣事多|课文19 大象的耳朵|课文20 蜘蛛开店|课文21 青蛙卖泥塘|课文22 小毛虫|课文23 当世界年纪还小的时候|课文24 羿射九日',
    '3|chinese|上': '第一单元 1 大青树下的小学|2 花的学校|3* 不懂就要问|第二单元 4 古诗三首（山行·赠刘景文·夜书所见）|5 铺满金色巴掌的水泥道|6 秋天的雨|7* 听听，秋的声音|第三单元 8 卖火柴的小女孩|9* 那一定会很好|10 在牛肚子里旅行|11* 一块奶酪|第四单元 12 总也倒不了的老屋|13* 胡萝卜先生的长胡子|14* 小狗学叫|第五单元 15 搭船的鸟|16 金色的草地|第六单元 17 古诗三首（望天门山·饮湖上初晴后雨·望洞庭）|18 富饶的西沙群岛|19 海滨小城|20 美丽的小兴安岭|第七单元 21 大自然的声音|22 父亲、树林和鸟|23 带刺的朋友|第八单元 24 司马光|25 掌声|26 灰雀|27* 手术台就是阵地',
    '3|chinese|下': '第一单元 1 古诗三首（绝句·惠崇春江晚景·三衢道中）|2 燕子|3 荷花|4* 昆虫备忘录|第二单元 5 守株待兔|6 陶罐和铁罐|7 鹿角和鹿腿|8* 池子与河流|第三单元 9 古诗三首（元日·清明·九月九日忆山东兄弟）|10 纸的发明|11 赵州桥|12* 一幅名扬中外的画|第四单元 13 花钟|14 蜜蜂|15* 小虾|第五单元 16 童年的水墨画|17 剃头大师|18 肥皂泡|19* 我不能失信|第六单元 20 我们奇妙的世界|21 海底世界|22 火烧云|第七单元 23 慢性子裁缝和急性子顾客|24* 方帽子店|25* 漏|26* 枣核',
    '4|chinese|上': '第一单元 1 观潮|2 走月亮|3* 现代诗二首|4* 繁星|第二单元 5 一个豆荚里的五粒豆|6 夜间飞行的秘密|7 呼风唤雨的世纪|8* 蝴蝶的家|第三单元 9 古诗三首（暮江吟·题西林壁·雪梅）|10 爬山虎的脚|11 蟋蟀的住宅|第四单元 12 盘古开天地|13 精卫填海|14 普罗米修斯|15* 女娲补天|第五单元 16 麻雀|17 爬天都峰|第六单元 18 牛和鹅|19 一只窝囊的大老虎|20 陀螺|第七单元 21 古诗三首（出塞·凉州词·夏日绝句）|22 为中华之崛起而读书|23* 梅兰芳蓄须|24* 延安，我把你追寻|第八单元 25 王戎不取道旁李|26 西门豹治邺|27* 故事二则',
    '4|chinese|下': '第一单元 1 古诗词三首（宿新市徐公店·四时田园杂兴·清平乐·村居）|2 乡下人家|3* 天窗|4* 三月桃花水|第二单元 5 琥珀|6 飞向蓝天的恐龙|7 纳米技术就在我们身边|8* 千年梦圆在今朝|第三单元 9 短诗三首|10 绿|11 白桦|12* 在天晴了的时候|第四单元 13 猫|14 母鸡|15 白鹅|第五单元 16 海上日出|17 记金华的双龙洞|第六单元 18 文言文二则|19* 小英雄雨来|20* 我们家的男子汉|21* 芦花鞋|第七单元 22 古诗三首（芙蓉楼送辛渐·塞下曲·墨梅）|23 “诺曼底号”遇难记|24* 黄继光|第八单元 25 宝葫芦的秘密|26 巨人的花园|27* 海的女儿',
    '5|chinese|上': '第一单元 1 白鹭|2 落花生|3 桂花雨|4* 珍珠鸟|第二单元 5 搭石|6 将相和|7 什么比猎豹的速度更快|8* 冀中的地道战|第三单元 9 猎人海力布|10 牛郎织女（一）|11* 牛郎织女（二）|第四单元 12 古诗三首（示儿·题临安邸·己亥杂诗）|13 少年中国说（节选）|14 圆明园的毁灭|15* 小岛|第五单元 16 太阳|17 松鼠|第六单元 18 慈母情深|19 父爱之舟|20* “精彩极了”和“糟糕透了”|第七单元 21 古诗词三首（山居秋暝·枫桥夜泊·长相思）|22 四季之美|23 鸟的天堂|24* 月迹|第八单元 25 古人谈读书|26 忆读书|27* 我的“长生果”',
    '5|chinese|下': '第一单元 1 古诗三首（四时田园杂兴·稚子弄冰·村晚）|2 祖父的园子|3* 月是故乡明|4* 梅花魂|第二单元 5 草船借箭|6 景阳冈|7* 猴王出世|8* 红楼春趣|第三单元 综合性学习：遨游汉字王国（汉字真有趣·我爱你，汉字）|第四单元 9 古诗三首（从军行·秋夜将晓出篱门迎凉有感·闻官军收河南河北）|10 青山处处埋忠骨|11 军神|12* 清贫|第五单元 13 人物描写一组|14 刷子李|第六单元 15 自相矛盾|16 田忌赛马|17 跳水|第七单元 18 威尼斯的小艇|19 牧场之国|20* 金字塔|第八单元 21 杨氏之子|22 手指|23* 童年的发现',
    '6|chinese|上': '第一单元 1 草原|2 丁香结|3 古诗词三首（宿建德江·六月二十七日望湖楼醉书·西江月·夜行黄沙道中）|4* 花之歌|第二单元 5 七律·长征|6 狼牙山五壮士|7 开国大典|8* 灯光|第三单元 9 竹节人|10 宇宙生命之谜|11* 故宫博物院|第四单元 12 桥|13 穷人|14* 在柏林|第五单元 15 夏天里的成长|16 盼|第六单元 17 古诗三首（浪淘沙·江南春·书湖阴先生壁）|18 只有一个地球|19* 三黑和土地|20* 青山不老|第七单元 21 文言文二则（伯牙鼓琴·书戴嵩画牛）|22 月光曲|23* 京剧趣谈|第八单元 24 少年闰土|25 好的故事|26* 我的伯父鲁迅先生|27* 有的人',
    '6|chinese|下': '第一单元 1 北京的春节|2 腊八粥|3 古诗三首（寒食·迢迢牵牛星·十五夜望月）|4* 藏戏|第二单元 5 鲁滨逊漂流记（节选）|6* 骑鹅旅行记（节选）|7* 汤姆·索亚历险记（节选）|第三单元 8 匆匆|9 那个星期天|第四单元 10 古诗三首（马诗·石灰吟·竹石）|11 十六年前的回忆|12 为人民服务|13* 董存瑞舍身炸暗堡|第五单元 14 文言文二则（学弈·两小儿辩日）|15 真理诞生于一百个问号之后|16* 表里的生物|17* 他们那时候多有趣啊|第六单元 综合性学习：难忘小学生活（回忆往事·依依惜别）|古诗词诵读（采薇·送元二使安西·春夜喜雨·早春呈水部张十八员外·江上渔者·泊船瓜洲·游园不值·卜算子·送鲍浩然之浙东·浣溪沙·清平乐）',

    /* ===== 语文 · 统编版（初中 7—9 年级） ===== */
    '7|chinese|上': '第一单元 1 春|2 济南的冬天|3* 雨的四季|4 古代诗歌四首（观沧海·闻王昌龄左迁龙标遥有此寄·次北固山下·天净沙·秋思）|第二单元 5 秋天的怀念|6 散步|7* 散文诗二首（金色花·荷叶·母亲）|8 《世说新语》二则（咏雪·陈太丘与友期行）|第三单元 9 从百草园到三味书屋|10* 再塑生命的人|11 《论语》十二章|第四单元 12 纪念白求恩|13 植树的牧羊人|14* 走一步，再走一步|15 诫子书|第五单元 16 猫|17* 动物笑谈|18 狼|第六单元 19 皇帝的新装|20 天上的街市|21* 女娲造人|22 寓言四则（赫尔墨斯和雕像者·蚊子和狮子·穿井得一人·杞人忧天）',
    '7|chinese|下': '第一单元 1 邓稼先|2 说和做——记闻一多先生言行片段|3* 回忆鲁迅先生（节选）|4 孙权劝学|第二单元 5 黄河颂|6 最后一课|7* 土地的誓言|8 木兰诗|第三单元 9 阿长与《山海经》|10 老王|11* 台阶|12 卖油翁|第四单元 13 叶圣陶先生二三事|14 驿路梨花|15* 最苦与最乐|16 短文两篇（陋室铭·爱莲说）|第五单元 17 紫藤萝瀑布|18* 一颗小桃树|19* 外国诗二首（假如生活欺骗了你·未选择的路）|20 古代诗歌五首（登幽州台歌·望岳·登飞来峰·游山西村·己亥杂诗）|第六单元 21 伟大的悲剧|22 太空一日|23* 带上她的眼睛|24 河中石兽',
    '8|chinese|上': '第一单元 1 消息二则|2 首届诺贝尔奖颁发|3 “飞天”凌空|4 一着惊海天|第二单元 5 藤野先生|6 回忆我的母亲|7* 列夫·托尔斯泰|8* 美丽的颜色|第三单元 9 三峡|10 短文两篇（答谢中书书·记承天寺夜游）|11* 与朱元思书|12 唐诗五首（野望·黄鹤楼·使至塞上·渡荆门送别·钱塘湖春行）|第四单元 13 背影|14 白杨礼赞|15* 散文二篇（永久的生命·我为什么而活着）|16* 昆明的雨|第五单元 17 中国石拱桥|18 苏州园林|19* 蝉|20* 梦回繁华|第六单元 21 《孟子》二章（富贵不能淫·生于忧患，死于安乐）|22 愚公移山|23* 周亚夫军细柳|24 诗词五首（饮酒·春望·雁门太守行·赤壁·渔家傲）',
    '8|chinese|下': '第一单元 1 社戏|2 回延安|3* 安塞腰鼓|4* 灯笼|第二单元 5 大自然的语言|6 阿西莫夫短文两篇|7* 大雁归来|8* 时间的脚印|第三单元 9 桃花源记|10 小石潭记|11* 核舟记|12 《诗经》二首（关雎·蒹葭）|第四单元 13 最后一次讲演|14 应有格物致知精神|15 我一生中的重要抉择|16 庆祝奥林匹克运动复兴25周年|第五单元 17 壶口瀑布|18 在长江源头各拉丹冬|19* 登勃朗峰|20* 一滴水经过丽江|第六单元 21 《庄子》二则（北冥有鱼·庄子与惠子游于濠梁之上）|22 《礼记》二则（虽有嘉肴·大道之行也）|23* 马说|24 唐诗三首（茅屋为秋风所破歌·卖炭翁·石壕吏）',
    '9|chinese|上': '第一单元 1 沁园春·雪|2 我爱这土地|3 乡愁|4 你是人间的四月天|5 我看|第二单元 6 敬业与乐业|7 就英法联军远征中国致巴特勒上尉的信|8* 论教养|9* 精神的三间小屋|第三单元 10 岳阳楼记|11 醉翁亭记|12* 湖心亭看雪|13 诗词三首（行路难·酬乐天扬州初逢席上见赠·水调歌头）|第四单元 14 故乡|15 我的叔叔于勒|16* 孤独之旅|第五单元 17 中国人失掉自信力了吗|18 怀疑与学问|19* 谈创造性思维|20* 创造宣言|第六单元 21 智取生辰纲|22 范进中举|23* 三顾茅庐|24* 刘姥姥进大观园',
    '9|chinese|下': '第一单元 1 祖国啊，我亲爱的祖国|2* 梅岭三章|3* 短诗五首（月夜·萧红墓畔口占·断章·风雨吟·统一）|4 海燕|第二单元 5 孔乙己|6 变色龙|7* 溜索|8* 蒲柳人家（节选）|第三单元 9 鱼我所欲也|10* 唐雎不辱使命|11 送东阳马生序|12 词四首（渔家傲·秋思·江城子·密州出猎·破阵子·为陈同甫赋壮词以寄之·满江红）|第四单元 13 短文两篇（谈读书·不求甚解）|14 山水画的意境|15* 无言之美|16* 驱遣我们的想象|第五单元 17 屈原（节选）|18 天下第一楼（节选）|19 枣儿|第六单元 20 曹刿论战|21* 邹忌讽齐王纳谏|22 出师表|23 诗词曲五首（十五从军征·白雪歌送武判官归京·南乡子·登京口北固亭有怀·过零丁洋·山坡羊·潼关怀古）',

    /* ===== 数学 · 人教版 ===== */
    '1|math|上': '准备课|位置|1~5的认识和加减法|认识图形（一）|6~10的认识和加减法|11~20各数的认识|认识钟表|20以内的进位加法|总复习',
    '1|math|下': '认识图形（二）|20以内的退位减法|分类与整理|100以内数的认识|认识人民币|100以内的加法和减法（一）|找规律|总复习',
    '2|math|上': '长度单位|100以内的加法和减法（二）|角的初步认识|表内乘法（一）|观察物体（一）|表内乘法（二）|认识时间|数学广角—搭配（一）|总复习',
    '2|math|下': '数据收集整理|表内除法（一）|图形的运动（一）|表内除法（二）|混合运算|有余数的除法|万以内数的认识|克和千克|数学广角—推理|总复习',
    '3|math|上': '时、分、秒|万以内的加法和减法（一）|测量|万以内的加法和减法（二）|倍的认识|多位数乘一位数|长方形和正方形|分数的初步认识|数学广角—集合|总复习',
    '3|math|下': '位置与方向（一）|除数是一位数的除法|复式统计表|两位数乘两位数|面积|年、月、日|小数的初步认识|数学广角—搭配（二）|总复习',
    '4|math|上': '大数的认识|公顷和平方千米|角的度量|三位数乘两位数|平行四边形和梯形|除数是两位数的除法|条形统计图|数学广角—优化|总复习',
    '4|math|下': '四则运算|观察物体（二）|运算定律|小数的意义和性质|三角形|小数的加法和减法|图形的运动（二）|平均数与条形统计图|数学广角—鸡兔同笼|总复习',
    '5|math|上': '小数乘法|位置|小数除法|可能性|简易方程|多边形的面积|数学广角—植树问题|总复习',
    '5|math|下': '观察物体（三）|因数与倍数|长方体和正方体|分数的意义和性质|图形的运动（三）|分数的加法和减法|折线统计图|数学广角—找次品|总复习',
    '6|math|上': '分数乘法|位置与方向（二）|分数除法|比|圆|百分数（一）|扇形统计图|数学广角—数与形|总复习',
    '6|math|下': '负数|百分数（二）|圆柱与圆锥|比例|数学广角—鸽巢问题|整理与复习',

    /* ===== 数学 · 人教版（初中 7—9 年级） ===== */
    '7|math|上': '第一章 有理数|第二章 整式的加减|第三章 一元一次方程|第四章 几何图形初步',
    '7|math|下': '第五章 相交线与平行线|第六章 实数|第七章 平面直角坐标系|第八章 二元一次方程组|第九章 不等式与不等式组|第十章 数据的收集、整理与描述',
    '8|math|上': '第十一章 三角形|第十二章 全等三角形|第十三章 轴对称|第十四章 整式的乘法与因式分解|第十五章 分式',
    '8|math|下': '第十六章 二次根式|第十七章 勾股定理|第十八章 平行四边形|第十九章 一次函数|第二十章 数据的分析',
    '9|math|上': '第二十一章 一元二次方程|第二十二章 二次函数|第二十三章 旋转|第二十四章 圆|第二十五章 概率初步',
    '9|math|下': '第二十六章 反比例函数|第二十七章 相似|第二十八章 锐角三角函数|第二十九章 投影与视图',

    /* ===== 英语 · 教科版（广州版，三年级起点） =====
     * 三上/三下/四上 采用 2024—2025 起启用之新修订目录（Unit 制）；
     * 四下列出旧版 Module 目录，新版启用后请按学校用书更新 catalog 即可。
     */
    '1|english|上': '启蒙1 Hello! 打招呼|启蒙2 Colours 颜色|启蒙3 Numbers 1-5 数字',
    '1|english|下': '启蒙4 My Family 家人|启蒙5 Animals 动物|启蒙6 Food 食物',
    '2|english|上': '启蒙7 My Body 身体|启蒙8 School Things 文具|启蒙9 Fruits 水果',
    '2|english|下': '启蒙10 My Day 一天|启蒙11 Toys 玩具|启蒙12 Weather 天气',
    '3|english|上': 'Module 1 Greetings · Unit 1 Hello!|Unit 2 How are you?|Unit 3 What\u2019s your name?|Unit 4 This is my dad|Unit 5 Wash your face|Unit 6 Touch your head|Unit 7 A picture of my family|Unit 8 Who\u2019s that lady?|Unit 9 Is it a cat?|Unit 10 I have a ship|Unit 11 Do you have a pencil?|Unit 12 Put it on the desk',
    '3|english|下': 'Unit 1 Get Up|Unit 2 What a Day!|Unit 3 Plan My Day|Unit 4 Come and Join Us!|Unit 5 Our Classroom, Our Call|Unit 6 I\u2019m on Duty|Unit 7 School Rules|Unit 8 A Polite Way|Review Road Helper Day',
    '4|english|上': 'Unit 1 Come on In!|Unit 2 Help Yourself|Unit 3 I\u2019m the Chef Today!|Unit 4 Help Out in the Kitchen|Unit 5 She Helps Me a Lot|Unit 6 I Love My Family|Unit 7 Family Time|Unit 8 Joy in the Air|Review Happy New Year!',
    '4|english|下': 'Module 1 People · Unit 1 He looks like a cook.|Unit 2 She is very kind.|Module 2 Daily routine · Unit 3 It\u2019s time to get up.|Unit 4 When do you have class?|Module 3 Days of the week|Module 4 Activities|Module 5 Sports|Module 6 Celebrations|Module 7 Let\u2019s look back',
    '5|english|上': 'Module 1 Hobbies · Unit 1 What\u2019s your hobby?|Unit 2 His hobby is drawing|Module 2 Abilities · Unit 3 I can swim very fast|Unit 4 Can you do homework?|Module 3 Daily life · Unit 5 Where is Ben?|Unit 6 At the weekend|Module 4 Foods and drinks · Unit 7 Do you want coffee or tea?|Unit 8 Let\u2019s have both|Module 5 Foods we need · Unit 9 It smells delicious|Unit 10 Different tastes|Module 6 Weather · Unit 11 What\u2019s the weather like today?|Unit 12 Four seasons in one day|Module 7 Let\u2019s look back',
    '5|english|下': 'Module 1 Seasons · Unit 1 What\u2019s your favourite season?|Unit 2 It\u2019s the middle of winter|Module 2 Plans · Unit 3 We are going to have an English test|Unit 4 Have a good time in Hainan|Module 3 Invitations · Unit 5 Would you like to go with us?|Unit 6 See you at the party|Module 4 Travel · Unit 7 We will go by train|Unit 8 Ben\u2019s first trip to Beijing|Module 5 Safety · Unit 9 Be careful!|Unit 10 How to stay safe|Module 6 Directions · Unit 11 Can you tell me the way?|Unit 12 I know a short cut|Module 7 Let\u2019s look back',
    '6|english|上': 'Module 1 Country life · Unit 1 What are those farmers doing?|Unit 2 A country life is a healthy life|Module 2 City life · Unit 3 Where are you from?|Unit 4 I like the city very much|Module 3 Health · Unit 5 What\u2019s the matter with you?|Unit 6 The secret of good health|Module 4 Past experiences · Unit 7 What did you do yesterday?|Unit 8 A trip to Hong Kong|Module 5 Changes · Unit 9 Was I a good girl back then?|Unit 10 Then and now|Module 6 Festivals · Unit 11 I like the Spring Festival best|Unit 12 Christmas|Module 7 Let\u2019s look back',
    '6|english|下': 'Module 1 Stories · Unit 1 Slow and steady wins the race|Unit 2 Waiting for another hare|Module 2 Animals · Unit 3 What animal is it?|Unit 4 We can save the animals|Module 3 Famous people · Unit 5 Dr Sun Yatsen|Unit 6 Steve Jobs|Module 4 Good manners · Unit 7 It\u2019s the polite thing to do|Unit 8 The magic words|Module 5 Travel abroad · Unit 9 Where will you go?|Unit 10 I can\u2019t wait to see you|Module 6 Let\u2019s look back',

    /* ===== 英语 · 沪教版（牛津上海版 · 广州，初中 7—9 年级） =====
     * 广州初中英语采用上海教育出版社《牛津英语》（广州版）；
     * 七、八年级为 2024 年起新修订 Unit 制目录，九年级沿用 Module 制。
     * 单元名称按公开目录整理，具体请以学校实际用书核对。
     */
    '7|english|上': 'Unit 1 Friendship|Unit 2 School life|Unit 3 The seasons|Unit 4 The Earth|Unit 5 Off to space|Unit 6 Travelling around Asia|Unit 7 Fun after school|Unit 8 Collecting as a hobby',
    '7|english|下': 'Unit 1 People around us|Unit 2 Travelling around the world|Unit 3 Trees and us|Unit 4 Our animal friends|Unit 5 Water is life|Unit 6 Electricity everywhere|Unit 7 Role models of our time|Unit 8 Follow your interests',
    '8|english|上': 'Unit 1 Encyclopaedias|Unit 2 Numbers|Unit 3 Computers|Unit 4 Inventions|Unit 5 Educational exchanges|Unit 6 Ancient stories|Unit 7 Memory|Unit 8 English Week',
    '8|english|下': 'Module 1 Social communication · Unit 1 Helping those in need|Unit 2 Body language|Module 2 Arts and crafts · Unit 3 Traditional skills|Unit 4 Cartoons and comic strips|Module 3 Animals · Unit 5 Save the endangered animals|Unit 6 Pets|Module 4 Discovery · Unit 7 The unknown world|Unit 8 Life in the future',
    '9|english|上': 'Unit 1 Wise men in history|Unit 2 Great minds|Unit 3 Family life|Unit 4 Problems and advice|Unit 5 Action!|Unit 6 Healthy diet|Unit 7 The Adventures of Tom Sawyer|Unit 8 Surprise endings',
    '9|english|下': 'Module 1 Explorations and exchanges · Unit 1 Great explorations|Unit 2 Culture shock|Module 2 Environmental problems · Unit 3 The environment|Unit 4 Natural disasters|Module 3 Sport and health · Unit 5 Sport|Unit 6 Caring for your health',

    /* ===== 物理 · 人教版（初中 8—9 年级，广州初中通用） ===== */
    '8|physics|上': '第一章 机械运动|第二章 声现象|第三章 物态变化|第四章 光现象|第五章 透镜及其应用|第六章 质量与密度',
    '8|physics|下': '第七章 力|第八章 运动和力|第九章 压强|第十章 浮力|第十一章 功和机械能|第十二章 简单机械',
    '9|physics|上': '第十三章 内能|第十四章 内能的利用|第十五章 电流和电路|第十六章 电压 电阻|第十七章 欧姆定律|第十八章 电功率',
    '9|physics|下': '第十九章 生活用电|第二十章 电与磁|第二十一章 信息的传递|第二十二章 能源与可持续发展|中考专题：力学综合|中考专题：电学综合',

    /* ===== 化学 · 人教版（初中 9 年级） ===== */
    '9|chemistry|上': '第一单元 走进化学世界|第二单元 我们周围的空气|第三单元 物质构成的奥秘|第四单元 自然界的水|第五单元 化学方程式|第六单元 碳和碳的氧化物|第七单元 燃料及其利用',
    '9|chemistry|下': '第八单元 金属和金属材料|第九单元 溶液|第十单元 酸和碱|第十一单元 盐 化肥|第十二单元 化学与生活|中考专题：物质构成|中考专题：酸碱盐',

    /* ===== 生物 · 人教版（初中 7—8 年级） ===== */
    '7|biology|上': '第一单元 生物和生物圈·第一章 认识生物|第二章 了解生物圈|第二单元 生物体的结构层次·第一章 细胞是生命活动的基本单位|第二章 细胞怎样构成生物体|第三单元 生物圈中的绿色植物·第一章 藻类与苔藓植物|第二章 被子植物的一生|第三章 绿色植物与生物圈的水循环|第四章 绿色植物是有机物的制造者|第五章 绿色植物与碳氧平衡|第六章 爱护植被 绿化祖国',
    '7|biology|下': '第四单元 生物圈中的人·第一章 人的由来|第二章 人体的营养|第三章 人体的呼吸|第四章 人体内物质的运输|第五章 人体内废物的排出|第六章 人体生命活动的调节|第七章 人类活动对生物圈的影响',
    '8|biology|上': '第五单元 生物圈中的其他生物·第一章 动物的主要类群|第二章 动物的运动和行为|第三章 动物在生物圈中的作用|第四章 细菌和真菌|第五章 病毒|第六单元 生物的多样性及其保护·第一章 根据生物的特征进行分类|第二章 认识生物的多样性|第三章 保护生物的多样性',
    '8|biology|下': '第七单元 生物圈中生命的延续和发展·第一章 生物的生殖和发育|第二章 生物的遗传和变异|第三章 生物的进化|第八单元 健康的生活·第一章 传染病和免疫|第二章 用药与急救|第三章 了解自己 增进健康',

    /* ===== 道德与法治 · 统编版（初中 7—9 年级） ===== */
    '7|politics|上': '第一单元 少年有梦|第二单元 友谊的天空|第三单元 师长情谊|第四单元 生命的思考',
    '7|politics|下': '第一单元 青春时光|第二单元 做情绪情感的主人|第三单元 在集体中成长|第四单元 走进法治天地',
    '8|politics|上': '第一单元 走进社会生活|第二单元 遵守社会规则|第三单元 勇担社会责任|第四单元 维护国家利益',
    '8|politics|下': '第一单元 坚持宪法至上|第二单元 理解权利义务|第三单元 人民当家作主|第四单元 崇尚法治精神',
    '9|politics|上': '第一单元 富强与创新|第二单元 民主与法治|第三单元 文明与家园|第四单元 和谐与梦想',
    '9|politics|下': '第一单元 我们共同的世界|第二单元 世界舞台上的中国|第三单元 走向未来的少年',

    /* ===== 历史 · 统编版（初中 7—9 年级） ===== */
    '7|history|上': '第一单元 史前时期：原始社会与中华文明的起源|第二单元 夏商周时期：奴隶制王朝的更替和向封建社会的过渡|第三单元 秦汉时期：统一多民族封建国家的建立和巩固|第四单元 三国两晋南北朝时期：政权分立与民族交融',
    '7|history|下': '第一单元 隋唐时期：繁荣与开放的时代|第二单元 辽宋夏金元时期：民族关系发展和社会变化|第三单元 明清时期：统一多民族国家的巩固与发展',
    '8|history|上': '第一单元 中国开始沦为半殖民地半封建社会|第二单元 近代化的早期探索与民族危机的加剧|第三单元 资产阶级民主革命与中华民国的建立|第四单元 新民主主义革命的开始|第五单元 从国共合作到国共对立|第六单元 中华民族的抗日战争|第七单元 人民解放战争|第八单元 近代经济、社会生活与教育文化事业的发展',
    '8|history|下': '第一单元 中华人民共和国的成立和巩固|第二单元 社会主义制度的建立与社会主义建设的探索|第三单元 中国特色社会主义道路|第四单元 民族团结与祖国统一|第五单元 国防建设与外交成就|第六单元 科技文化与社会生活',
    '9|history|上': '第一单元 古代亚非文明|第二单元 古代欧洲文明|第三单元 封建时代的欧洲|第四单元 封建时代的亚洲国家|第五单元 走向近代|第六单元 资本主义制度的初步确立|第七单元 工业革命和国际共产主义运动的兴起',
    '9|history|下': '第一单元 殖民地人民的反抗与资本主义制度的扩展|第二单元 第二次工业革命和近代科学文化|第三单元 第一次世界大战和战后初期的世界|第四单元 经济大危机和第二次世界大战|第五单元 二战后的世界变化|第六单元 走向和平发展的世界',

    /* ===== 地理 · 人教版（初中 7—8 年级） ===== */
    '7|geography|上': '第一章 地球和地图·第一节 地球和地球仪|第一章 第二节 地球的运动|第一章 第三节 地图的阅读|第一章 第四节 地形图的判读|第二章 陆地和海洋·第一节 大洲和大洋|第二章 第二节 海陆的变迁|第三章 天气与气候·第一节 多变的天气|第三章 第二节 气温的变化与分布|第三章 第三节 降水的变化与分布|第三章 第四节 世界的气候|第四章 居民与聚落|第五章 发展与合作',
    '7|geography|下': '第六章 我们生活的大洲——亚洲|第七章 我们邻近的地区和国家·日本|第七章 东南亚|第七章 印度|第七章 俄罗斯|第八章 东半球其他的地区和国家·中东|第八章 欧洲西部|第八章 撒哈拉以南非洲|第八章 澳大利亚|第九章 西半球的国家·美国|第九章 巴西|第十章 极地地区',
    '8|geography|上': '第一章 从世界看中国·第一节 疆域|第一章 第二节 人口|第一章 第三节 民族|第二章 中国的自然环境·第一节 地形和地势|第二章 第二节 气候|第二章 第三节 河流|第二章 第四节 自然灾害|第三章 中国的自然资源·第一节 自然资源的基本特征|第三章 第二节 土地资源|第三章 第三节 水资源|第四章 中国的经济发展·第一节 交通运输|第四章 第二节 农业|第四章 第三节 工业',
    '8|geography|下': '第五章 中国的地理差异|第六章 北方地区·第一节 自然特征与农业|第六章 第二节 东北三省|第六章 第三节 世界最大的黄土堆积区——黄土高原|第六章 第四节 祖国的首都——北京|第七章 南方地区·第一节 自然特征与农业|第七章 第二节 长江三角洲地区|第七章 第三节 香港和澳门|第七章 第四节 祖国的神圣领土——台湾省|第八章 西北地区·第一节 自然特征与农业|第八章 第二节 干旱的宝地——塔里木盆地|第九章 青藏地区·第一节 自然特征与农业|第九章 第二节 高原湿地——三江源地区|第十章 中国在世界中'
  };

  /* ---------- 学段骨架 ----------
   * ready = 已建设内容的年级；planned = 已预留槽位、待填充内容的年级。
   * 预留扩展时把年级号从 planned 移入 ready，并补齐 catalog + 单元数据即可。
   */
  var stages = [
    { id: 'primary', label: '小学', short: '小', grades: [1, 2, 3, 4, 5, 6], ready: [1, 2, 3, 4, 5, 6], planned: [] },
    { id: 'junior', label: '初中', short: '初', grades: [7, 8, 9], ready: [7, 8, 9], planned: [],
      textbooks: { chinese: '统编版', math: '人教版', english: '沪教版·牛津英语（广州）',
        physics: '人教版', chemistry: '人教版', biology: '人教版',
        politics: '统编版', history: '统编版', geography: '人教版' },
      extraSubjects: ['物理', '化学', '生物', '道德与法治', '历史', '地理'] },
    { id: 'senior', label: '高中', short: '高', grades: [10, 11, 12], ready: [], planned: [10, 11, 12],
      textbooks: { chinese: '统编版', math: '人教版', english: '人教版' },
      extraSubjects: ['物理', '化学', '生物', '政治', '历史', '地理'] }
  ];

  var subjects = [
    { id: 'chinese', label: '语文', icon: 'book', color: '#d9534f', soft: '#fdf0ee',
      textbook: '统编版（人教部编版）', from: 1,
      wordLabel: '生字词', readLabel: '课文跟读' },
    { id: 'math', label: '数学', icon: 'calc', color: '#2f6fed', soft: '#edf3ff',
      textbook: '人教版', from: 1,
      wordLabel: '核心概念', readLabel: '例题讲解' },
    { id: 'english', label: '英语', icon: 'globe', color: '#0f9d8c', soft: '#e9f8f5',
      textbook: '教科版（广州版）· 三年级起点', from: 3,
      wordLabel: '单元词汇', readLabel: '对话跟读' },

    /* ===== 初中新增学科：from / to 控制哪些年级可见 ===== */
    { id: 'physics', label: '物理', icon: 'atom', color: '#6f4bd8', soft: '#f2edff',
      textbook: '人教版', from: 8, to: 9,
      wordLabel: '核心概念', readLabel: '概念跟读' },
    { id: 'chemistry', label: '化学', icon: 'flask', color: '#1a8f70', soft: '#e8f7f1',
      textbook: '人教版', from: 9, to: 9,
      wordLabel: '核心概念', readLabel: '概念跟读' },
    { id: 'biology', label: '生物', icon: 'leaf', color: '#4a9c33', soft: '#edf7e8',
      textbook: '人教版', from: 7, to: 8,
      wordLabel: '核心概念', readLabel: '概念跟读' },
    { id: 'politics', label: '道德与法治', icon: 'scale', color: '#c2601f', soft: '#fdf1e5',
      textbook: '统编版', from: 7, to: 9,
      wordLabel: '关键词', readLabel: '观点跟读' },
    { id: 'history', label: '历史', icon: 'landmark', color: '#8a5a3b', soft: '#f7efe8',
      textbook: '统编版', from: 7, to: 9,
      wordLabel: '历史名词', readLabel: '史实跟读' },
    { id: 'geography', label: '地理', icon: 'mountain', color: '#2a7f9e', soft: '#e7f4f8',
      textbook: '人教版', from: 7, to: 8,
      wordLabel: '地理术语', readLabel: '地图跟读' }
  ];

  /* ---------- 学习模块 ----------
   * modules 为模块全集；moduleSets 决定各学科显示哪些模块、按什么顺序。
   * 新增学科扩展模块时，只要在 modules 加一项、在 moduleSets 里排好顺序，
   * app.js 会自动渲染对应标签页，不需要改业务代码。
   */
  var modules = [
    { id: 'preview', label: '课前预习', icon: 'sun', hint: '目标 · 新知 · 发音 · 预习任务' },
    { id: 'strokes', label: '生字笔顺', icon: 'pencil', hint: '笔顺动画 · 描红 · 拼音组词', only: ['chinese'] },
    { id: 'review', label: '课后复习', icon: 'notebook', hint: '要点 · 练习 · 分层作业' },
    { id: 'read', label: '课本跟读', icon: 'speaker', hint: '逐句播放 · 连读 · 调速' },
    { id: 'text', label: '课文原文', icon: 'book', hint: '全文跟读 · 逐句 · 背诵', only: ['chinese', 'english'] },
    { id: 'drill', label: '口算闯关', icon: 'calc', hint: '自动出题 · 计时 · 错题', only: ['math'] },
    { id: 'challenge', label: '通关挑战', icon: 'trophy', hint: '听音辨词 · 综合测评 · 星级' }
  ];

  var moduleSets = {
    chinese: ['preview', 'strokes', 'review', 'read', 'text', 'challenge'],
    math: ['preview', 'review', 'read', 'drill', 'challenge'],
    english: ['preview', 'review', 'read', 'text', 'challenge'],
    physics: ['preview', 'review', 'read', 'challenge'],
    chemistry: ['preview', 'review', 'read', 'challenge'],
    biology: ['preview', 'review', 'read', 'challenge'],
    politics: ['preview', 'review', 'read', 'challenge'],
    history: ['preview', 'review', 'read', 'challenge'],
    geography: ['preview', 'review', 'read', 'challenge']
  };

  var extensionGuide = [
    { step: '1', title: '新增一个年级（如初中七年级）', body: '打开 js/config.js，把年级号从对应学段的 planned 移入 ready；在 catalog 中按 \u201c7|chinese|上\u201d 等键补上该册目录，一行一个单元，用竖线分隔。小学 1—6 年级目录已全部补齐并启用。' },
    { step: '2', title: '把某一课升级为精编内容', body: '课本目录里的每一课都能直接打开学习：46 个精编单元在 js/data-core.js（语文、数学）与 js/data-english.js（英语）；其余课次由 js/data-basic.js 按目录标题自动生成「通用教学示范内容」（预习目标、字词、练习题、跟读短文、分层作业），点开六大模块都有内容。若要为某一课换成精编内容，只需按同样的键新增一条单元数据，精编内容会自动优先，无需改动任何业务代码。' },
    { step: '3', title: '补充新模块的内容', body: '语文「生字笔顺」读取该单元 words 中的单字；165 个精编生字的笔顺在 js/stroke-data.js，602 个课本目录标题汉字的笔顺、拼音、组词在 js/hanzi-extra.js，字形信息在 js/hanzi-meta.js。「课文原文」与英语示范对话放在 js/data-text.js、js/data-text-init.js；数学「口算闯关」题型在 js/math-drill.js。模块标签由 moduleSets 自动编排。' },
    { step: '4', title: '扩展到高中', body: '小学 1—6 年级、初中 7—9 年级已全部启用：语文统编版 / 数学人教版 / 英语小学教科版广州·初中沪教牛津版广州，并新增物理（人教版，八、九年级）、化学（人教版，九年级）、生物（人教版，七、八年级）、道德与法治（统编版）、历史（统编版）、地理（人教版，七、八年级）。高中（10—12 年级）的年级槽位与教材版本已在 stages 中预留，按第 1、2 步操作即可扩展。' },
    { step: '5', title: '更换教材版本或修订目录', body: '只需修改 catalog 中对应的目录字符串与 subjects / stages.textbooks 中的教材字段。2024 年起义务教育教材逐年修订，请以孩子学校实际发放的课本为准核对；新增学科的内容词库在 js/data-subjects.js 中按章节关键字匹配，修改词库即可更新概念与跟读内容。' },
    { step: '6', title: '语音、原文与数据说明', body: '发音使用浏览器内置语音合成（Web Speech API），无需联网、无需 API Key、零费用；中文 zh-CN，英文 en-US，可在顶部设置中调速与切换音色。笔顺动画库与汉字数据全部本地内置。教材现代课文与英语课本对话未收录，可用「录入课本原文」按实际课本自行录入，内容只存本机。学习进度同样保存在本机浏览器，不上传任何数据。' }
  ];

  window.APP_CONFIG = {
    appName: '穗学伴',
    appSubTitle: '广州中小学同步学习资料',
    region: '广州市',
    version: '1.6.0',
    storageKey: 'suixueban_progress_v1',
    textStorageKey: 'suixueban_texts_v1',
    volumes: ['上', '下'],
    catalog: catalog,
    stages: stages,
    subjects: subjects,
    modules: modules,
    moduleSets: moduleSets,
    extensionGuide: extensionGuide,
    speech: { rate: 0.85, pitch: 1.0, gap: 480, zh: 'zh-CN', en: 'en-US' },
    passLine: 80,
    notice: '教材目录依据公开版本整理。46 个精编单元为教学设计示范内容；其余课次由 js/data-basic.js 按目录标题自动生成「通用教学示范内容」（字词、跟读短文、练习题），初中六个新学科的概念词与跟读句取自 js/data-subjects.js 分科词库，均非教材原文。语文仅收录公有领域古诗文，英语对话为原创示范；教材现代课文与课本对话请用「录入课本原文」按实际课本自行录入。笔顺、拼音、组词、部首供识字参考，请以学校课本校对后使用。',
    gradeLabel: function (g) {
      if (g <= 6) return CN[g] + '年级';
      if (g <= 9) return ['七', '八', '九'][g - 7] + '年级（初' + CN[g - 6] + '）';
      return ['十', '十一', '十二'][g - 10] + '年级（高' + CN[g - 9] + '）';
    },
    gradeShort: function (g) {
      if (g <= 6) return CN[g] + '年级';
      if (g <= 9) return '初' + CN[g - 6];
      return '高' + CN[g - 9];
    },
    subjectById: function (id) {
      for (var i = 0; i < subjects.length; i++) if (subjects[i].id === id) return subjects[i];
      return null;
    },
    /** 某年级实际开设的学科（物理八年级起、化学九年级、生物地理七八年级） */
    subjectsForGrade: function (g) {
      return subjects.filter(function (s) {
        return (!s.from || g >= s.from) && (!s.to || g <= s.to);
      });
    },
    /** 年级切换后当前学科若不开设，返回该年级默认学科 */
    fallbackSubject: function (g, id) {
      var list = this.subjectsForGrade(g), i;
      for (i = 0; i < list.length; i++) if (list[i].id === id) return id;
      return list.length ? list[0].id : 'chinese';
    },
    /* 按学段取教材名：小学用 subjects.textbook，初/高中用 stages.textbooks */
    textbookFor: function (g, subjectId) {
      var st = this.stageByGrade(g);
      if (g > 6 && st.textbooks && st.textbooks[subjectId]) return st.textbooks[subjectId];
      var subj = this.subjectById(subjectId);
      return subj ? subj.textbook : '';
    },
    stageByGrade: function (g) {
      for (var i = 0; i < stages.length; i++) if (stages[i].grades.indexOf(g) >= 0) return stages[i];
      return stages[0];
    },
    getCatalog: function (g, s, v) { return (catalog[g + '|' + s + '|' + v] || '').split('|').filter(Boolean); },
    moduleById: function (id) {
      for (var i = 0; i < modules.length; i++) if (modules[i].id === id) return modules[i];
      return null;
    },
    /**
     * 取某学科可见的模块。
     * 注意：业务层请一律用 modulesFor(subjectId)，不要用 modules 全集——
     * modules 是「模块字典」，直接渲染会把数学专属模块串到语文页面上。
     * 这里再按 only 做一次兜底过滤，即使配置写错也不会跨科显示。
     */
    modulesFor: function (subjectId) {
      var ids = moduleSets[subjectId] || ['preview', 'review', 'read', 'challenge'];
      var out = [], i, j;
      for (i = 0; i < ids.length; i++) {
        for (j = 0; j < modules.length; j++) {
          var m = modules[j];
          if (m.id !== ids[i]) continue;
          if (!m.only || m.only.indexOf(subjectId) >= 0) out.push(m);
        }
      }
      return out;
    },
    isReady: function (g) {
      var st = this.stageByGrade(g);
      return st.ready.indexOf(g) >= 0;
    }
  };
})();
