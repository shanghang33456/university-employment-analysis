/**
 * 真实就业数据集
 * ==================================================================
 * 本文件中的全部数值均来自以下公开官方发布，未经任何加工或推测。
 * 与早期版本的模拟明细数据不同，这里是「汇总指标」，不含个体记录。
 *
 * 数据源：
 *   S1  2025届广西壮族自治区普通高校毕业生就业质量年度报告（广西教育厅）
 *       http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/qtndbg/jyjlbg/P020260423367261173970.pdf
 *   S2  2025年城镇单位就业人员年平均工资情况（国家统计局，2026-05-15）
 *       https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html
 *   S3  广西2025届毕业生就业单位行业分布（广西教育厅 图解教育数据）
 *       http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/xjfb/tjgxjysj/t27353174.shtml
 *   S4  广西2025届毕业生国家战略地区就业服务情况（广西教育厅 图解教育数据）
 *       http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/xjfb/tjgxjysj/t27353187.shtml
 *   S5  广西2025届毕业生留桂就业设区市分布（广西教育厅 图解教育数据）
 *       http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/xjfb/tjgxjysj/t27353197.shtml
 *   S6  2025届大学毕业生月收入（麦可思《2026年中国本科生就业报告》媒体披露）
 *       经未来网报道：本科 6435 元、高职 4882 元
 */

// ------------------------------------------------------------------
// 数据源清单
// ------------------------------------------------------------------
export const SOURCES = [
  {
    id: 'S1',
    title: '2025届广西壮族自治区普通高校毕业生就业质量年度报告',
    org: '广西壮族自治区教育厅',
    publishedAt: '2026-03',
    url: 'http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/qtndbg/jyjlbg/P020260423367261173970.pdf',
    scope: '广西全区普通高校 2025 届毕业生 463,566 人',
    provides: ['毕业生规模与学历结构', '毕业去向落实率', '毕业去向分布', '就业单位性质', '就业单位行业', '就业区域流向'],
  },
  {
    id: 'S2',
    title: '2025年城镇单位就业人员年平均工资情况',
    org: '国家统计局',
    publishedAt: '2026-05-15',
    url: 'https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html',
    scope: '全国城镇非私营单位、私营单位、规模以上企业（不含个体工商户与自由职业者）',
    provides: ['分行业年平均工资', '分区域年平均工资', '分登记注册类型年平均工资', '2024→2025 工资增速'],
  },
  {
    id: 'S3',
    title: '广西壮族自治区2025届普通高校毕业生就业单位行业分布',
    org: '广西壮族自治区教育厅',
    publishedAt: '2026-03-16',
    url: 'http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/xjfb/tjgxjysj/t27353174.shtml',
    scope: '已就业毕业生按学历 × 行业交叉分布',
    provides: ['行业 × 学历 交叉占比'],
  },
  {
    id: 'S4',
    title: '广西壮族自治区2025届普通高校毕业生国家战略地区就业服务情况',
    org: '广西壮族自治区教育厅',
    publishedAt: '2026-03-16',
    url: 'http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/xjfb/tjgxjysj/t27353187.shtml',
    scope: '已就业毕业生按学历 × 国家战略地区交叉分布',
    provides: ['区域 × 学历 交叉占比'],
  },
  {
    id: 'S5',
    title: '广西壮族自治区2025届普通高校毕业生留桂就业设区市分布',
    org: '广西壮族自治区教育厅',
    publishedAt: '2026-03-16',
    url: 'http://jyt.gxzf.gov.cn/zfxxgk/fdzdgknr/xjfb/tjgxjysj/t27353197.shtml',
    scope: '留在广西就业毕业生的设区市分布',
    provides: ['区内 14 市就业占比'],
  },
  {
    id: 'S6',
    title: '2025届本科/高职毕业生平均月收入',
    org: '麦可思研究（经未来网报道）',
    publishedAt: '2026',
    url: 'http://m.toutiao.com/group/7650053995188224546/',
    scope: '全国样本，毕业半年后月收入（税前）',
    provides: ['毕业生起薪参照值'],
  },
]

// ------------------------------------------------------------------
// 总体规模与落实率（S1）
// ------------------------------------------------------------------
export const OVERVIEW = {
  year: 2025,
  graduates: 463566,
  fulfilled: 399440,
  fulfillRate: 86.17,
}

/** 学历维度：毕业人数 / 落实人数 / 落实率 */
export const DEGREES = [
  { name: '博士', graduates: 724, fulfilled: 673, rate: 92.96, share: 0.16 },
  { name: '硕士', graduates: 21034, fulfilled: 18852, rate: 89.63, share: 4.54 },
  { name: '本科', graduates: 180051, fulfilled: 153847, rate: 85.45, share: 38.84 },
  { name: '专科', graduates: 261757, fulfilled: 226068, rate: 86.37, share: 56.47 },
]

// ------------------------------------------------------------------
// 毕业去向分布（S1 表 1-11）
// 占比为占「该学历毕业生总数」的百分比；博士生占比合计 100.00
// ------------------------------------------------------------------
export const DESTINATIONS = [
  { name: '签就业协议形式就业', group: '单位就业', doctor: 55.8, master: 52.4, bachelor: 41.67, college: 48.26, count: 212762, share: 45.9 },
  { name: '其他录用形式就业', group: '单位就业', doctor: 7.87, master: 11.43, bachelor: 19.3, college: 7.07, count: 55721, share: 12.02 },
  { name: '签劳动合同形式就业', group: '单位就业', doctor: 16.3, master: 12.41, bachelor: 11.83, college: 9.65, count: 49283, share: 10.63 },
  { name: '应征义务兵', group: '单位就业', doctor: 0, master: 0.01, bachelor: 0.62, college: 1.72, count: 5618, share: 1.21 },
  { name: '地方基层项目', group: '单位就业', doctor: 0, master: 1.03, bachelor: 0.51, college: 0.59, count: 2692, share: 0.58 },
  { name: '科研助理、管理助理', group: '单位就业', doctor: 12.15, master: 2.38, bachelor: 0.81, college: 0, count: 2050, share: 0.44 },
  { name: '国家基层项目', group: '单位就业', doctor: 0, master: 0.14, bachelor: 0.71, college: 0, count: 1317, share: 0.28 },
  { name: '境内升学', group: '升学', doctor: 0, master: 6.14, bachelor: 6.03, college: 17.74, count: 58579, share: 12.64 },
  { name: '境外留学', group: '升学', doctor: 0, master: 0.2, bachelor: 0.47, college: 0.03, count: 975, share: 0.21 },
  { name: '自由职业', group: '自由职业', doctor: 0.83, master: 3.11, bachelor: 3.12, college: 0.87, count: 8556, share: 1.85 },
  { name: '自主创业', group: '自主创业', doctor: 0, master: 0.38, bachelor: 0.37, college: 0.44, count: 1887, share: 0.41 },
  { name: '待就业', group: '待就业', doctor: 7.04, master: 10.32, bachelor: 14.37, college: 13.58, count: 63651, share: 13.73 },
  { name: '其他暂不就业', group: '暂不就业', doctor: 0, master: 0.03, bachelor: 0.07, college: 0.05, count: 272, share: 0.06 },
  { name: '不就业拟升学', group: '暂不就业', doctor: 0, master: 0.03, bachelor: 0.11, college: 0, count: 203, share: 0.04 },
]

/** 去向大类（小计），用于总览环形图 */
export const DESTINATION_GROUPS = [
  { name: '单位就业', count: 329443, share: 71.07, doctor: 92.13, master: 79.8, bachelor: 75.45, college: 67.29 },
  { name: '升学', count: 59554, share: 12.85, doctor: 0, master: 6.34, bachelor: 6.5, college: 17.77 },
  { name: '待就业', count: 63651, share: 13.73, doctor: 7.04, master: 10.32, bachelor: 14.37, college: 13.58 },
  { name: '自由职业', count: 8556, share: 1.85, doctor: 0.83, master: 3.11, bachelor: 3.12, college: 0.87 },
  { name: '自主创业', count: 1887, share: 0.41, doctor: 0, master: 0.38, bachelor: 0.37, college: 0.44 },
  { name: '暂不就业', count: 475, share: 0.1, doctor: 0, master: 0.06, bachelor: 0.18, college: 0.05 },
]

// ------------------------------------------------------------------
// 就业单位性质分布（S1 表 1-12，单位：%）
// ------------------------------------------------------------------
export const COMPANY_TYPES = [
  { name: '其他企业（含民营企业等）', doctor: 3.8, master: 27.91, bachelor: 72.31, college: 81.03, overall: 74.61 },
  { name: '个体工商户', doctor: 0, master: 0.52, bachelor: 3.28, college: 6.42, overall: 4.82 },
  { name: '中初教育单位', doctor: 0, master: 9.78, bachelor: 7.27, college: 1.6, overall: 4.35 },
  { name: '国有企业', doctor: 2.94, master: 15.68, bachelor: 4.52, college: 2.39, overall: 3.94 },
  { name: '医疗卫生单位', doctor: 38.86, master: 17, bachelor: 4.57, college: 1.74, overall: 3.74 },
  { name: '其他（含社会组织等）', doctor: 0, master: 1.32, bachelor: 1.89, college: 3.4, overall: 2.67 },
  { name: '其他事业单位', doctor: 2.59, master: 5.11, bachelor: 2.18, college: 1.35, overall: 1.88 },
  { name: '机关', doctor: 0.52, master: 5.82, bachelor: 2.16, college: 0.84, overall: 1.63 },
  { name: '高等教育单位', doctor: 48.53, master: 14.09, bachelor: 0.52, college: 0.03, overall: 1.03 },
  { name: '外商投资企业', doctor: 0.17, master: 1.4, bachelor: 0.96, college: 0.95, overall: 0.97 },
  { name: '农村建制村', doctor: 0, master: 0, bachelor: 0.1, college: 0.12, overall: 0.11 },
  { name: '城镇社区', doctor: 0, master: 0.07, bachelor: 0.1, college: 0.11, overall: 0.11 },
  { name: '科研设计单位', doctor: 2.59, master: 0.8, bachelor: 0.09, college: 0.01, overall: 0.09 },
  { name: '部队', doctor: 0, master: 0.51, bachelor: 0.04, college: 0.01, overall: 0.05 },
]

// ------------------------------------------------------------------
// 就业单位行业分布（S3，单位：%）
// ------------------------------------------------------------------
export const INDUSTRIES = [
  { name: '制造业', doctor: 1.21, master: 12.16, bachelor: 14.12, college: 15.91, overall: 14.95 },
  { name: '批发和零售业', doctor: 0.17, master: 2.41, bachelor: 10.61, college: 13.03, overall: 11.47 },
  { name: '教育', doctor: 49.05, master: 27.6, bachelor: 13.36, college: 7.31, overall: 10.9 },
  { name: '信息传输、软件和信息技术服务业', doctor: 0.52, master: 7.54, bachelor: 12.27, college: 9.02, overall: 10.27 },
  { name: '租赁和商务服务业', doctor: 0.52, master: 2.0, bachelor: 8.12, college: 9.45, overall: 8.51 },
  { name: '建筑业', doctor: 0.35, master: 1.86, bachelor: 6.39, college: 7.54, overall: 6.77 },
  { name: '卫生和社会工作', doctor: 39.55, master: 19.04, bachelor: 6.14, college: 4.26, overall: 5.84 },
  { name: '居民服务、修理和其他服务业', doctor: 0, master: 1.02, bachelor: 3.47, college: 7.86, overall: 5.69 },
  { name: '文化、体育和娱乐业', doctor: 0.52, master: 2.21, bachelor: 5.38, college: 4.25, overall: 4.6 },
  { name: '住宿和餐饮业', doctor: 0, master: 0.24, bachelor: 2.5, college: 6.41, overall: 4.47 },
  { name: '科学研究和技术服务业', doctor: 2.94, master: 4.46, bachelor: 4.87, college: 3.41, overall: 4.06 },
  { name: '交通运输、仓储和邮政业', doctor: 0.35, master: 1.55, bachelor: 2.38, college: 3.95, overall: 3.18 },
  { name: '农、林、牧、渔业', doctor: 1.9, master: 2.28, bachelor: 2.12, college: 2.2, overall: 2.17 },
  { name: '公共管理、社会保障和社会组织', doctor: 0.52, master: 5.32, bachelor: 2.68, college: 1.42, overall: 2.14 },
  { name: '电力、热力、燃气及水生产和供应业', doctor: 0.86, master: 3.19, bachelor: 1.52, college: 1.55, overall: 1.62 },
  { name: '金融业', doctor: 0, master: 4.62, bachelor: 2.15, college: 0.71, overall: 1.5 },
  { name: '房地产业', doctor: 0, master: 0.3, bachelor: 0.91, college: 0.95, overall: 0.9 },
  { name: '水利、环境和公共设施管理业', doctor: 1.04, master: 1.25, bachelor: 0.71, college: 0.61, overall: 0.68 },
  { name: '采矿业', doctor: 0.35, master: 0.74, bachelor: 0.28, college: 0.15, overall: 0.24 },
  { name: '军队', doctor: 0.17, master: 0.21, bachelor: 0.03, college: 0.01, overall: 0.03 },
]

// ------------------------------------------------------------------
// 国家战略地区流向（S4，单位：%）
// ------------------------------------------------------------------
export const REGIONS = [
  { name: '西部地区', doctor: 76.72, master: 53.3, bachelor: 62.51, college: 59.4, overall: 60.41 },
  { name: '粤港澳大湾区', doctor: 2.93, master: 15.69, bachelor: 21.8, college: 30.61, overall: 26.17 },
  { name: '长江经济带', doctor: 17.07, master: 22.21, bachelor: 10.48, college: 7.67, overall: 9.58 },
  { name: '京津冀地区', doctor: 2.07, master: 3.48, bachelor: 2.5, college: 0.64, overall: 1.55 },
]

/** 留桂就业设区市分布（S5，占「留桂就业」人数的 %） */
export const CITIES = [
  { name: '南宁市', share: 39.65 },
  { name: '桂林市', share: 9.3 },
  { name: '柳州市', share: 8.36 },
  { name: '玉林市', share: 7.38 },
  { name: '百色市', share: 5.21 },
  { name: '贵港市', share: 4.89 },
  { name: '钦州市', share: 4.75 },
  { name: '梧州市', share: 3.71 },
  { name: '河池市', share: 3.61 },
  { name: '北海市', share: 3.52 },
  { name: '崇左市', share: 2.89 },
  { name: '防城港市', share: 2.39 },
  { name: '来宾市', share: 2.27 },
  { name: '贺州市', share: 2.08 },
]

// ------------------------------------------------------------------
// 城镇单位分行业年平均工资（S2，单位：元/年）
// nonPrivate = 城镇非私营单位；private = 城镇私营单位；largeScale = 规模以上企业
// year2024 仅非私营单位有完整对照值
// ------------------------------------------------------------------
export const INDUSTRY_WAGES = [
  { name: '信息传输、软件和信息技术服务业', nonPrivate: 248752, private: 128166, largeScale: 242019, nonPrivate2024: 238966, growth: 4.1 },
  { name: '金融业', nonPrivate: 211164, private: 140451, largeScale: null, nonPrivate2024: 201883, growth: 4.6 },
  { name: '科学研究和技术服务业', nonPrivate: 182064, private: 83560, largeScale: 173855, nonPrivate2024: 175425, growth: 3.8 },
  { name: '电力、热力、燃气及水生产和供应业', nonPrivate: 160897, private: 66451, largeScale: 164371, nonPrivate2024: 150285, growth: 7.1 },
  { name: '卫生和社会工作', nonPrivate: 146266, private: 75631, largeScale: 108309, nonPrivate2024: 143173, growth: 2.2 },
  { name: '采矿业', nonPrivate: 143361, private: 79169, largeScale: 134170, nonPrivate2024: 140706, growth: 1.9 },
  { name: '批发和零售业', nonPrivate: 135749, private: 69622, largeScale: 112030, nonPrivate2024: 129658, growth: 4.7 },
  { name: '交通运输、仓储和邮政业', nonPrivate: 133981, private: 73133, largeScale: 127560, nonPrivate2024: 127889, growth: 4.8 },
  { name: '教育', nonPrivate: 133539, private: 63908, largeScale: 114167, nonPrivate2024: 126185, growth: 5.8 },
  { name: '文化、体育和娱乐业', nonPrivate: 129447, private: 64015, largeScale: 127925, nonPrivate2024: 126040, growth: 2.7 },
  { name: '公共管理、社会保障和社会组织', nonPrivate: 119465, private: null, largeScale: null, nonPrivate2024: 114840, growth: 4.0 },
  { name: '制造业', nonPrivate: 113594, private: 76055, largeScale: 100572, nonPrivate2024: 107987, growth: 5.2 },
  { name: '租赁和商务服务业', nonPrivate: 110162, private: 68919, largeScale: 92849, nonPrivate2024: 110353, growth: -0.2 },
  { name: '建筑业', nonPrivate: 92036, private: 66275, largeScale: 79161, nonPrivate2024: 89519, growth: 2.8 },
  { name: '房地产业', nonPrivate: 89679, private: 53338, largeScale: 84100, nonPrivate2024: 91912, growth: -2.4 },
  { name: '农、林、牧、渔业', nonPrivate: 74424, private: 46552, largeScale: null, nonPrivate2024: 67475, growth: 10.3 },
  { name: '居民服务、修理和其他服务业', nonPrivate: 70226, private: 52059, largeScale: 58838, nonPrivate2024: 68159, growth: 3.0 },
  { name: '水利、环境和公共设施管理业', nonPrivate: 70172, private: 49527, largeScale: 57188, nonPrivate2024: 68315, growth: 2.7 },
  { name: '住宿和餐饮业', nonPrivate: 62461, private: 55123, largeScale: 59785, nonPrivate2024: 60240, growth: 3.7 },
]

/** 分区域年平均工资（S2，单位：元/年） */
export const REGION_WAGES = [
  { name: '东部地区', nonPrivate: 149902, private: 80149 },
  { name: '中部地区', nonPrivate: 102645, private: 58627 },
  { name: '西部地区', nonPrivate: 114989, private: 60923 },
  { name: '东北地区', nonPrivate: 103803, private: 54430 },
]

/** 分登记注册类型年平均工资（S2，单位：元/年） */
export const REGISTRATION_WAGES = [
  { name: '内资单位', nonPrivate: 125819, largeScale: 99973 },
  { name: '港澳台投资单位', nonPrivate: 146701, largeScale: 144445 },
  { name: '外商投资单位', nonPrivate: 164956, largeScale: 160671 },
]

/** 全国总体年平均工资（S2，单位：元/年） */
export const NATIONAL_WAGES = {
  nonPrivate: { value: 129441, prev: 124110, growth: 4.3 },
  private: { value: 71590, prev: 69476, growth: 3.0 },
  largeScale: { value: 106080, prev: 102452, growth: 3.5 },
}

/** 2025 届毕业生起薪参照（S6，单位：元/月） */
export const GRADUATE_START_SALARY = [
  { name: '本科', value: 6435, note: '全国样本，毕业半年后税前月收入' },
  { name: '高职（专科）', value: 4882, note: '全国样本，毕业半年后税前月收入' },
]

// ------------------------------------------------------------------
// 口径与局限说明
// ------------------------------------------------------------------
export const METRIC_NOTES = [
  {
    metric: '毕业去向落实率',
    definition:
      '毕业去向落实人数 ÷ 毕业生总数。落实去向包括：签就业协议形式就业、签劳动合同形式就业、其他录用形式就业、应征义务兵、国家/地方基层项目、科研助理管理助理、境内升学、境外留学、自由职业、自主创业。待就业与暂不就业不计入。',
    source: 'S1',
    caveat: '为截至 2025 年 8 月底的「初次」落实率，非年终最终值。',
  },
  {
    metric: '单位就业',
    definition:
      '包含签就业协议形式就业、签劳动合同形式就业、其他录用形式就业、应征义务兵、国家基层项目、地方基层项目、科研助理/管理助理七类。',
    source: 'S1',
    caveat: '与「签约就业」口径不同：后者通常仅指签订三方协议或劳动合同。',
  },
  {
    metric: '就业单位性质 / 行业占比',
    definition: '分母为「已就业毕业生」，不含升学、待就业、暂不就业。各学历列内部合计为 100%。',
    source: 'S1 / S3',
    caveat: '行业与单位性质为毕业生填报口径，非用人单位工商登记口径。',
  },
  {
    metric: '年平均工资',
    definition: '就业人员工资总额 ÷ 就业人员平均人数，为税前工资，含个人缴纳的社保、公积金与个税。',
    source: 'S2',
    caveat: '统计范围为城镇法人单位，不含个体工商户与自由职业者；不是「毕业生起薪」，二者不可直接比较。',
  },
  {
    metric: '国家战略地区流向',
    definition: '按就业所在地划入西部地区、粤港澳大湾区、长江经济带、京津冀地区，四类存在交叉，合计不等于 100%。',
    source: 'S4',
    caveat: '一个就业地可能同时属于多个战略区域，因此占比相加会超过 100%。',
  },
  {
    metric: '毕业生起薪',
    definition: '麦可思对全国应届毕业生毕业半年后月收入（税前）的抽样调查均值。',
    source: 'S6',
    caveat: '为第三方商业机构抽样调查，与 S1 广西本地数据、S2 城镇单位工资口径均不同，仅作参照。',
  },
]

export const LIMITATIONS = [
  '数据范围为广西壮族自治区 2025 届普通高校毕业生，不能代表全国或其他省份。',
  '仅含 2025 一个届别，无法呈现跨年度趋势；行业工资部分可对比 2024→2025。',
  '公开数据仅到汇总层面，没有个体毕业生记录，因此本平台不提供个人级明细查询。',
  '「学科门类 / 专业」维度仅在原报告中有零散排名，未形成完整可比数据集，本平台未纳入。',
  '年平均工资来自城镇单位统计，与本平台毕业生群体不是同一口径，页面中已分开展示并标注。',
]
