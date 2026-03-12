// ==================== 数据配置 ====================
const CATEGORIES = {
  expense: [
    { id: 'living', name: '生活开支', icon: '🏠' },
    { id: 'gift', name: '人情往来/礼金', icon: '🎁' },
    { id: 'maternity', name: '生产开支', icon: '🍼' },
    { id: 'education', name: '教育育儿', icon: '📚' },
    { id: 'insurance', name: '保险', icon: '🛡️' },
    { id: 'bvi', name: 'BVI公司维护', icon: '🏢' },
    { id: 'bank_fee', name: '银行手续费', icon: '🏦' },
    { id: 'invest_expense', name: '投资理财', icon: '📈' },
    { id: 'loan_out', name: '还款', icon: '💸' },
    { id: 'car', name: '买车', icon: '🚗' },
    { id: 'other_expense', name: '其他支出', icon: '📝' },
  ],
  income: [
    { id: 'salary', name: '薪酬', icon: '💵' },
    { id: 'investment', name: '投资理财', icon: '📈' },
    { id: 'gift_income', name: '人情往来/礼金', icon: '🎁' },
    { id: 'other_income', name: '其他收入', icon: '📝' },
  ]
};

const CURRENCIES = [
  { id: 'CNY', name: '人民币', symbol: '¥' },
  { id: 'USD', name: '美元', symbol: '$' },
  { id: 'HKD', name: '港币', symbol: 'HK$' },
];

const ACCOUNTS = [
  { id: 'bocom', name: '交通银行', icon: '🏦', currency: 'CNY' },
  { id: 'cash_cny', name: '现金(CNY)', icon: '💴', currency: 'CNY' },
  { id: 'howbuy', name: '好买基金', icon: '📊', currency: 'CNY' },
  { id: 'stock_cn', name: '股票(境内)', icon: '📈', currency: 'CNY' },
  { id: 'cbi', name: 'CBI银行', icon: '🌏', currency: 'USD' },
  { id: 'cbi_debit', name: 'CBI Debit Card', icon: '💳', currency: 'USD' },
  { id: 'sc_bank', name: '渣打银行(SC)', icon: '🌏', currency: 'HKD' },
  { id: 'howbuy_usd', name: '好买基金(USD)', icon: '📊', currency: 'USD' },
  { id: 'other', name: '其他', icon: '📋', currency: 'CNY' },
];

const REGIONS = [
  { id: 'domestic', name: '境内', icon: '🇨🇳' },
  { id: 'overseas', name: '境外', icon: '🌏' },
];


// ==================== App 主类 ====================
class FamilyLedger {
  constructor() {
    this.records = [];
    this.investmentData = [];
    this.debtItems = []; // 负债明细 [{id, name, amount, currency}]
    this.customCategories = { expense: [], income: [] };
    this.currentType = 'expense';
    this.selectedCategory = '';
    this.selectedCurrency = 'CNY';
    this.selectedRegion = 'domestic';
    this.selectedAccount = 'bocom';
    this.currentDate = new Date();
    this.charts = {};
    this.editingId = null;
    this.exchangeRates = { USD: 7.2526, HKD: 0.9295 }; // USD/CNY, HKD/CNY
    this.listCurrentPage = 1;
    this.listPageSize = 50;

    this.loadData();
    this.init();
  }

  // ---- 初始化 ----
  init() {
    this.initSampleData();
    this.renderCategoryGrid();
    this.renderCurrencySelect();
    this.renderAccountSelect();
    this.renderRegionSelect();
    this.setDefaultDate();
    this.bindNavigation();
    this.updateDashboard();
    this.switchPage('dashboard');
  }


  initSampleData() {
    // 优先从 localStorage 读取，有数据则跳过初始化
    try {
      const savedRecords = JSON.parse(localStorage.getItem('fl_records'));
      const savedInvestments = JSON.parse(localStorage.getItem('fl_investments'));
      if (savedRecords && savedRecords.length > 0) {
        this.records = savedRecords;
        this.investmentData = savedInvestments || [];
        return; // 已有保存数据，不用初始化
      }
    } catch {}

    // 首次使用，加载初始数据
    this.records = [
      {"id": "data_0001", "type": "income", "amount": 2560000.0, "category": "salary", "date": "2023-06-15", "remark": "2022年终奖", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0002", "type": "expense", "amount": 150000.0, "category": "living", "date": "2023-06-15", "remark": "23年旅游（欧洲）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0003", "type": "expense", "amount": 220000.0, "category": "living", "date": "2023-06-15", "remark": "23年小猫礼物（buccellati）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0004", "type": "income", "amount": 740000.0, "category": "gift_income", "date": "2023-06-15", "remark": "婚礼红包（存入银行）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0005", "type": "income", "amount": 81796.0, "category": "gift_income", "date": "2023-06-15", "remark": "婚礼红包（未存现金或微信）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0006", "type": "income", "amount": 1000000.0, "category": "gift_income", "date": "2023-06-15", "remark": "小猫嫁妆", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0007", "type": "expense", "amount": 3300.0, "category": "living", "date": "2023-06-15", "remark": "日式搬家", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2023-06-15T08:00:00Z"},
      {"id": "data_0008", "type": "expense", "amount": 195715.0, "category": "living", "date": "2024-01-15", "remark": "24年旅游（波拉波拉+二世谷）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-01-15T08:00:00Z"},
      {"id": "data_0009", "type": "expense", "amount": 12000.0, "category": "gift", "date": "2024-01-15", "remark": "现金红包（TJ 5000, Evan 5000, 小毛驴 1000, yoyo 1000）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2024-01-15T08:00:00Z"},
      {"id": "data_0010", "type": "expense", "amount": 10000.0, "category": "gift", "date": "2024-01-15", "remark": "Helen (拜年酒水2w, 小朋友红包500*16，长辈回给红包1.8w)", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2024-01-15T08:00:00Z"},
      {"id": "data_0011", "type": "expense", "amount": 300.0, "category": "gift", "date": "2024-01-15", "remark": "阿姨年节红包(元旦+春节）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2024-01-15T08:00:00Z"},
      {"id": "data_0012", "type": "income", "amount": 1325.0, "category": "salary", "date": "2024-02-01", "remark": "年终奖第一笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-02-01T08:00:00Z"},
      {"id": "data_0013", "type": "income", "amount": 129980.0, "category": "salary", "date": "2024-02-01", "remark": "年终奖第二笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-02-01T08:00:00Z"},
      {"id": "data_0014", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2024-02-01", "remark": "Charge-Inward Remittance Fee - （BA 1325USD）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-02-01T08:00:00Z"},
      {"id": "data_0015", "type": "expense", "amount": 18.8, "category": "bank_fee", "date": "2024-02-17", "remark": "Charge-Business Card Charge", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-02-17T08:00:00Z"},
      {"id": "data_0016", "type": "income", "amount": 146980.0, "category": "salary", "date": "2024-02-19", "remark": "年终奖第三笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-02-19T08:00:00Z"},
      {"id": "data_0017", "type": "expense", "amount": 200.0, "category": "bank_fee", "date": "2024-02-20", "remark": "Charge（10200USD transfer to SC）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-02-20T08:00:00Z"},
      {"id": "data_0018", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2024-04-01", "remark": "Charge-Inward Remittance Fee（BA 146980USD）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-04-01T08:00:00Z"},
      {"id": "data_0019", "type": "expense", "amount": 10500.0, "category": "bvi", "date": "2024-06-15", "remark": "公司设立费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-06-15T08:00:00Z"},
      {"id": "data_0020", "type": "expense", "amount": 26803.13, "category": "bvi", "date": "2024-06-15", "remark": "CBI开户费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-06-15T08:00:00Z"},
      {"id": "data_0021", "type": "expense", "amount": 12975.0, "category": "insurance", "date": "2024-06-15", "remark": "Alex重疾险25Y - 20240706", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-06-15T08:00:00Z"},
      {"id": "data_0022", "type": "expense", "amount": 13485.0, "category": "insurance", "date": "2024-06-15", "remark": "Helen重疾险25Y - 20240709", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-06-15T08:00:00Z"},
      {"id": "data_0023", "type": "expense", "amount": 44013.0, "category": "insurance", "date": "2024-06-15", "remark": "年金险 - 20240716", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-06-15T08:00:00Z"},
      {"id": "data_0024", "type": "expense", "amount": 26.0, "category": "bank_fee", "date": "2024-06-20", "remark": "Charge（150017USD to Howbuy）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-06-20T08:00:00Z"},
      {"id": "data_0025", "type": "expense", "amount": 92.0, "category": "bank_fee", "date": "2024-06-20", "remark": "Howbuy Exec Charge (150017 USD to Howbuy)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-06-20T08:00:00Z"},
      {"id": "data_0026", "type": "income", "amount": 73480.0, "category": "salary", "date": "2024-06-28", "remark": "以美金结算的24年工资增量-06月", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-06-28T08:00:00Z"},
      {"id": "data_0027", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2024-06-28", "remark": "Charge-Inward Remittance Fee （BA 73480USD）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-06-28T08:00:00Z"},
      {"id": "data_0028", "type": "expense", "amount": 31.56, "category": "bank_fee", "date": "2024-07-15", "remark": "Transaction fee", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-07-15T08:00:00Z"},
      {"id": "data_0029", "type": "expense", "amount": 31.56, "category": "bank_fee", "date": "2024-07-15", "remark": "Transaction fee", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-07-15T08:00:00Z"},
      {"id": "data_0030", "type": "expense", "amount": 31.57, "category": "bank_fee", "date": "2024-07-15", "remark": "Transaction fee", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-07-15T08:00:00Z"},
      {"id": "data_0031", "type": "income", "amount": 215.83, "category": "investment", "date": "2024-09-09", "remark": "Interest Earned - Time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-09-09T08:00:00Z"},
      {"id": "data_0032", "type": "expense", "amount": 90000.0, "category": "living", "date": "2024-09-15", "remark": "24年小猫礼物（Birkin）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-09-15T08:00:00Z"},
      {"id": "data_0033", "type": "expense", "amount": 3608.0, "category": "maternity", "date": "2024-09-19", "remark": "香港办理租房费用(2.8w HKD)", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-09-19T08:00:00Z"},
      {"id": "data_0034", "type": "income", "amount": 53600.0, "category": "other_income", "date": "2024-10-18", "remark": "保险师返还（420848 HKD，FX 7.8516）", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2024-10-18T08:00:00Z"},
      {"id": "data_0035", "type": "expense", "amount": 13394.06, "category": "bvi", "date": "2024-10-28", "remark": "年审+经济实质申报费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-10-28T08:00:00Z"},
      {"id": "data_0036", "type": "expense", "amount": 39957.57, "category": "maternity", "date": "2024-11-15", "remark": "海韵轩租房（全款付清）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-15T08:00:00Z"},
      {"id": "data_0037", "type": "expense", "amount": 18615.65, "category": "maternity", "date": "2024-11-15", "remark": "养和床位定金", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-15T08:00:00Z"},
      {"id": "data_0038", "type": "expense", "amount": 155222.5, "category": "maternity", "date": "2024-11-15", "remark": "圣贝拉港陆套餐（50%款项）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-15T08:00:00Z"},
      {"id": "data_0039", "type": "expense", "amount": 45408.0, "category": "maternity", "date": "2024-11-15", "remark": "圣贝拉30天随行", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-15T08:00:00Z"},
      {"id": "data_0040", "type": "income", "amount": 300000.0, "category": "salary", "date": "2024-11-26", "remark": "Alex转入家庭账户", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-26T08:00:00Z"},
      {"id": "data_0041", "type": "income", "amount": 290000.0, "category": "salary", "date": "2024-11-28", "remark": "Alex转入家庭账户（张程霞）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-28T08:00:00Z"},
      {"id": "data_0042", "type": "income", "amount": 10000.0, "category": "salary", "date": "2024-11-28", "remark": "Alex转入家庭账户", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-11-28T08:00:00Z"},
      {"id": "data_0043", "type": "expense", "amount": 7000.0, "category": "other_expense", "date": "2024-11-28", "remark": "投资理财 - 好买宽德中证A500基金认购费（1w打7折）", "currency": "CNY", "region": "domestic", "account": "howbuy", "createdAt": "2024-11-28T08:00:00Z"},
      {"id": "data_0044", "type": "income", "amount": 300000.0, "category": "salary", "date": "2024-12-15", "remark": "Alex转入家庭账户", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2024-12-15T08:00:00Z"},
      {"id": "data_0045", "type": "income", "amount": 73480.0, "category": "salary", "date": "2024-12-15", "remark": "以美金结算的24年工资增量-12月", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2024-12-15T08:00:00Z"},
      {"id": "data_0046", "type": "expense", "amount": 1000.0, "category": "gift", "date": "2025-01-15", "remark": "小毛驴", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-01-15T08:00:00Z"},
      {"id": "data_0047", "type": "expense", "amount": 1000.0, "category": "gift", "date": "2025-01-15", "remark": "小夏阿姨", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-01-15T08:00:00Z"},
      {"id": "data_0048", "type": "expense", "amount": 300.0, "category": "gift", "date": "2025-01-15", "remark": "保安大伯（200+100）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-01-15T08:00:00Z"},
      {"id": "data_0049", "type": "income", "amount": 204.44, "category": "investment", "date": "2025-01-15", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-01-15T08:00:00Z"},
      {"id": "data_0050", "type": "expense", "amount": 500.0, "category": "bank_fee", "date": "2025-01-15", "remark": "Charge (transfer to SC 120240 USD)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-01-15T08:00:00Z"},
      {"id": "data_0051", "type": "expense", "amount": 70.0, "category": "bank_fee", "date": "2025-01-17", "remark": "Transaction fee (transfer from CBI 120240 USD, received 120170 USD)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-01-17T08:00:00Z"},
      {"id": "data_0052", "type": "expense", "amount": 29600.0, "category": "living", "date": "2025-01-20", "remark": "蛇年茅台", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-01-20T08:00:00Z"},
      {"id": "data_0053", "type": "expense", "amount": 2204.22, "category": "bvi", "date": "2025-01-24", "remark": "银行要求提供的更新COI办证费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-01-24T08:00:00Z"},
      {"id": "data_0054", "type": "income", "amount": 100000.0, "category": "salary", "date": "2025-02-03", "remark": "Alex转入家庭账户", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-02-03T08:00:00Z"},
      {"id": "data_0055", "type": "expense", "amount": 54.07, "category": "bank_fee", "date": "2025-02-13", "remark": "Charges on transfer", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-02-13T08:00:00Z"},
      {"id": "data_0056", "type": "expense", "amount": 710.63, "category": "maternity", "date": "2025-02-15", "remark": "养和产检", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-02-15T08:00:00Z"},
      {"id": "data_0057", "type": "expense", "amount": 177.76, "category": "bank_fee", "date": "2025-02-18", "remark": "Transaction fee (transfer 10400.69, refunded 10222.93 USD)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-02-18T08:00:00Z"},
      {"id": "data_0058", "type": "expense", "amount": 271.24, "category": "maternity", "date": "2025-03-01", "remark": "养和产检", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-03-01T08:00:00Z"},
      {"id": "data_0059", "type": "income", "amount": 59990.0, "category": "salary", "date": "2025-03-05", "remark": "年终奖第一笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-05T08:00:00Z"},
      {"id": "data_0060", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2025-03-05", "remark": "Charge（transfer from CMC 59990）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-05T08:00:00Z"},
      {"id": "data_0061", "type": "expense", "amount": 100.0, "category": "bvi", "date": "2025-03-05", "remark": "账户管理费", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-05T08:00:00Z"},
      {"id": "data_0062", "type": "expense", "amount": 285.89, "category": "maternity", "date": "2025-03-10", "remark": "养和产检", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-03-10T08:00:00Z"},
      {"id": "data_0063", "type": "expense", "amount": 11934.15, "category": "maternity", "date": "2025-03-10", "remark": "Healthbaby脐带血+脐带膜储存", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-03-10T08:00:00Z"},
      {"id": "data_0064", "type": "expense", "amount": 100208.88, "category": "maternity", "date": "2025-03-15", "remark": "养和尾款RMB支付", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0065", "type": "expense", "amount": 109814.0, "category": "maternity", "date": "2025-03-15", "remark": "圣贝拉港陆套餐（50%尾款，百日随行退款折尾款）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0066", "type": "expense", "amount": 4950.0, "category": "maternity", "date": "2025-03-15", "remark": "酒店3.27-3.30", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0067", "type": "expense", "amount": 3300.0, "category": "maternity", "date": "2025-03-15", "remark": "酒店4.4-4.6", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0068", "type": "expense", "amount": 8492.07, "category": "maternity", "date": "2025-03-15", "remark": "奶粉（alex香港采购）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0069", "type": "expense", "amount": 735.75, "category": "maternity", "date": "2025-03-15", "remark": "CBI Debit HK期间Alex支出", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0070", "type": "expense", "amount": 4180.41, "category": "maternity", "date": "2025-03-15", "remark": "CBI Debit HK期间Helen支出", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-15T08:00:00Z"},
      {"id": "data_0071", "type": "income", "amount": 2000000.0, "category": "gift_income", "date": "2025-03-18", "remark": "Alex爸妈生娃礼金", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-18T08:00:00Z"},
      {"id": "data_0072", "type": "expense", "amount": 6557.49, "category": "maternity", "date": "2025-03-20", "remark": "养和尾款USD第一笔", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-03-20T08:00:00Z"},
      {"id": "data_0073", "type": "expense", "amount": 6557.49, "category": "maternity", "date": "2025-03-20", "remark": "养和尾款USD第二笔", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-03-20T08:00:00Z"},
      {"id": "data_0074", "type": "income", "amount": 191.05, "category": "investment", "date": "2025-03-20", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-03-20T08:00:00Z"},
      {"id": "data_0075", "type": "income", "amount": 5336.0, "category": "other_income", "date": "2025-03-28", "remark": "Alex CBI debit card USD消费转RMB", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-28T08:00:00Z"},
      {"id": "data_0076", "type": "income", "amount": 30319.0, "category": "other_income", "date": "2025-03-28", "remark": "Helen CBI debit card USD消费转RMB", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-28T08:00:00Z"},
      {"id": "data_0077", "type": "expense", "amount": 19800.0, "category": "maternity", "date": "2025-03-28", "remark": "圣贝拉产康消费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-03-28T08:00:00Z"},
      {"id": "data_0078", "type": "income", "amount": 71490.0, "category": "salary", "date": "2025-03-28", "remark": "年终奖第二笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-28T08:00:00Z"},
      {"id": "data_0079", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2025-03-28", "remark": "Charge（transfer from CMC 71490）", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-03-28T08:00:00Z"},
      {"id": "data_0080", "type": "expense", "amount": 1650.0, "category": "maternity", "date": "2025-04-01", "remark": "酒店4.3-4.4", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-01T08:00:00Z"},
      {"id": "data_0081", "type": "expense", "amount": 13200.0, "category": "maternity", "date": "2025-04-08", "remark": "酒店4.16-24", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-08T08:00:00Z"},
      {"id": "data_0082", "type": "expense", "amount": 3300.0, "category": "maternity", "date": "2025-04-08", "remark": "酒店4.18-20", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-08T08:00:00Z"},
      {"id": "data_0083", "type": "income", "amount": 200000.0, "category": "gift_income", "date": "2025-04-15", "remark": "爸妈转款生活费25年5-12月", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-15T08:00:00Z"},
      {"id": "data_0084", "type": "expense", "amount": 80000.0, "category": "living", "date": "2025-04-15", "remark": "1-4月生活费（2w/月）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-15T08:00:00Z"},
      {"id": "data_0085", "type": "expense", "amount": 120000.0, "category": "living", "date": "2025-04-15", "remark": "5-6月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-15T08:00:00Z"},
      {"id": "data_0086", "type": "expense", "amount": 62016.0, "category": "living", "date": "2025-04-15", "remark": "欧洲旅行前期费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-04-15T08:00:00Z"},
      {"id": "data_0087", "type": "income", "amount": 573.49, "category": "investment", "date": "2025-04-15", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-04-15T08:00:00Z"},
      {"id": "data_0088", "type": "income", "amount": 81990.0, "category": "salary", "date": "2025-04-16", "remark": "年终奖第三笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-04-16T08:00:00Z"},
      {"id": "data_0089", "type": "expense", "amount": 500.0, "category": "bank_fee", "date": "2025-04-16", "remark": "Charge（transfer to SC 106750)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-04-16T08:00:00Z"},
      {"id": "data_0090", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2025-04-16", "remark": "Charge (transfer from CMC 81990)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-04-16T08:00:00Z"},
      {"id": "data_0091", "type": "expense", "amount": 19800.0, "category": "maternity", "date": "2025-05-15", "remark": "产康普拉提", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0092", "type": "expense", "amount": 160400.0, "category": "maternity", "date": "2025-05-15", "remark": "其他产康（产康合计20w）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0093", "type": "income", "amount": 3000.0, "category": "gift_income", "date": "2025-05-15", "remark": "周叔叔屈阿姨", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0094", "type": "income", "amount": 4000.0, "category": "gift_income", "date": "2025-05-15", "remark": "金容姑姑", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0095", "type": "income", "amount": 1000.0, "category": "gift_income", "date": "2025-05-15", "remark": "吴凡姐姐", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0096", "type": "income", "amount": 6000.0, "category": "gift_income", "date": "2025-05-15", "remark": "韩阿姨", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0097", "type": "income", "amount": 1000.0, "category": "gift_income", "date": "2025-05-15", "remark": "Diya父母", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0098", "type": "income", "amount": 10000.0, "category": "gift_income", "date": "2025-05-15", "remark": "顾家大伯大伯母", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0099", "type": "income", "amount": 10000.0, "category": "gift_income", "date": "2025-05-15", "remark": "顾尔成", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0100", "type": "income", "amount": 5000.0, "category": "gift_income", "date": "2025-05-15", "remark": "谢家小阿姨", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0101", "type": "income", "amount": 3000.0, "category": "gift_income", "date": "2025-05-15", "remark": "谢家大姨", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0102", "type": "income", "amount": 5000.0, "category": "gift_income", "date": "2025-05-15", "remark": "谢家外公", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0103", "type": "income", "amount": 5000.0, "category": "gift_income", "date": "2025-05-15", "remark": "顾妈朋友", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0104", "type": "expense", "amount": 3000.0, "category": "gift", "date": "2025-05-15", "remark": "Diya", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0105", "type": "expense", "amount": 1802.13, "category": "bvi", "date": "2025-05-15", "remark": "ROM备案费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0106", "type": "income", "amount": 191196.41, "category": "salary", "date": "2025-05-15", "remark": "Helen腾讯股票转家中", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-05-15T08:00:00Z"},
      {"id": "data_0107", "type": "income", "amount": 260.66, "category": "investment", "date": "2025-06-15", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0108", "type": "income", "amount": 13.33, "category": "investment", "date": "2025-06-15", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0109", "type": "income", "amount": 546.0, "category": "investment", "date": "2025-06-15", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0110", "type": "income", "amount": 86.88, "category": "investment", "date": "2025-06-15", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0111", "type": "expense", "amount": 23118.58, "category": "living", "date": "2025-06-15", "remark": "欧洲旅行购物 (Alex+Helen)", "currency": "USD", "region": "overseas", "account": "cbi_debit", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0112", "type": "expense", "amount": 13000.0, "category": "insurance", "date": "2025-06-15", "remark": "Alex重疾险 - 20250700", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0113", "type": "expense", "amount": 13500.0, "category": "insurance", "date": "2025-06-15", "remark": "Helen重疾险 - 20250700", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0114", "type": "expense", "amount": 50050.0, "category": "insurance", "date": "2025-06-15", "remark": "年金险 - 20250700", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-06-15T08:00:00Z"},
      {"id": "data_0115", "type": "expense", "amount": 6898.0, "category": "living", "date": "2025-06-16", "remark": "urcove顶顶灿灿酒店", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-06-16T08:00:00Z"},
      {"id": "data_0116", "type": "income", "amount": 1651.85, "category": "other_income", "date": "2025-06-25", "remark": "旅行开支 CBI卡USD消费转RMB", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-06-25T08:00:00Z"},
      {"id": "data_0117", "type": "income", "amount": 59419.26, "category": "other_income", "date": "2025-07-01", "remark": "Alex CBI卡USD消费转RMB", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-01T08:00:00Z"},
      {"id": "data_0118", "type": "income", "amount": 56865.32, "category": "other_income", "date": "2025-07-01", "remark": "Helen CBI卡USD消费转RMB", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-01T08:00:00Z"},
      {"id": "data_0119", "type": "income", "amount": 3939.86, "category": "other_income", "date": "2025-07-01", "remark": "旅行开支 CBI卡USD消费转RMB", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-01T08:00:00Z"},
      {"id": "data_0120", "type": "expense", "amount": 100000.0, "category": "other_expense", "date": "2025-07-01", "remark": "2025年小猫购物", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-01T08:00:00Z"},
      {"id": "data_0121", "type": "expense", "amount": 47.44, "category": "bank_fee", "date": "2025-07-02", "remark": "AIA payment Alex - charges", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-07-02T08:00:00Z"},
      {"id": "data_0122", "type": "expense", "amount": 47.44, "category": "bank_fee", "date": "2025-07-02", "remark": "AIA payment Helen - charges", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-07-02T08:00:00Z"},
      {"id": "data_0123", "type": "expense", "amount": 47.44, "category": "bank_fee", "date": "2025-07-02", "remark": "FWD payment - charges", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-07-02T08:00:00Z"},
      {"id": "data_0124", "type": "income", "amount": 3000.0, "category": "gift_income", "date": "2025-07-05", "remark": "Alex大姑妈", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-07-05T08:00:00Z"},
      {"id": "data_0125", "type": "income", "amount": 3000.0, "category": "gift_income", "date": "2025-07-05", "remark": "Alex小姑妈", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-07-05T08:00:00Z"},
      {"id": "data_0126", "type": "income", "amount": 3000.0, "category": "gift_income", "date": "2025-07-05", "remark": "芳芳姐姐", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-07-05T08:00:00Z"},
      {"id": "data_0127", "type": "income", "amount": 3000.0, "category": "gift_income", "date": "2025-07-05", "remark": "萍儿阿姨", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-07-05T08:00:00Z"},
      {"id": "data_0128", "type": "income", "amount": 500.0, "category": "gift_income", "date": "2025-07-05", "remark": "灿灿", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-07-05T08:00:00Z"},
      {"id": "data_0129", "type": "income", "amount": 1000.0, "category": "gift_income", "date": "2025-07-05", "remark": "顶顶", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-07-05T08:00:00Z"},
      {"id": "data_0130", "type": "expense", "amount": 70.0, "category": "bank_fee", "date": "2025-07-14", "remark": "Transaction fee (transfer from CBI 120000 USD, received 119930 USD)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-14T08:00:00Z"},
      {"id": "data_0131", "type": "expense", "amount": 29807.0, "category": "living", "date": "2025-07-15", "remark": "欧洲旅行尾款费用", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0132", "type": "income", "amount": 50000.0, "category": "gift_income", "date": "2025-07-15", "remark": "外公外婆童童百日宴礼金", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0133", "type": "income", "amount": 350000.0, "category": "other_income", "date": "2025-07-15", "remark": "Alex PP表 - 1/3", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0134", "type": "income", "amount": 600000.0, "category": "gift_income", "date": "2025-07-15", "remark": "爸妈赞助车款", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0135", "type": "expense", "amount": 60000.0, "category": "living", "date": "2025-07-15", "remark": "7月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0136", "type": "income", "amount": 89990.0, "category": "salary", "date": "2025-07-15", "remark": "25H1工资增额第一笔", "currency": "USD", "region": "overseas", "account": "cbi_debit", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0137", "type": "income", "amount": 43810.0, "category": "salary", "date": "2025-07-15", "remark": "25H1工资增额第二笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0138", "type": "expense", "amount": 47.44, "category": "bank_fee", "date": "2025-07-15", "remark": "Charges on transfer - pp watch", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0139", "type": "expense", "amount": 55000.0, "category": "other_expense", "date": "2025-07-15", "remark": "Alex买手表", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0140", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2025-07-15", "remark": "Charge (transfer from CMC USD89990)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0141", "type": "expense", "amount": 25.0, "category": "bank_fee", "date": "2025-07-15", "remark": "Charge (transfer from CMC USD43810)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0142", "type": "expense", "amount": 500.0, "category": "bank_fee", "date": "2025-07-15", "remark": "Charge (transfer to SC for pp watch)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0143", "type": "expense", "amount": 693.06, "category": "invest_expense", "date": "2025-07-15", "remark": "Charge（Howbuy Baring transaction fee）", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-07-15T08:00:00Z"},
      {"id": "data_0144", "type": "expense", "amount": 600000.0, "category": "car", "date": "2025-07-20", "remark": "奔驰v300L", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-20T08:00:00Z"},
      {"id": "data_0145", "type": "expense", "amount": 70.0, "category": "bank_fee", "date": "2025-07-21", "remark": "Transaction fee (transfer from CBI 108000 USD, received 107930.03 USD)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-21T08:00:00Z"},
      {"id": "data_0146", "type": "expense", "amount": 500.0, "category": "bank_fee", "date": "2025-07-21", "remark": "Charge (transfer to SC USD108000)", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2025-07-21T08:00:00Z"},
      {"id": "data_0147", "type": "income", "amount": 10635.0, "category": "other_income", "date": "2025-07-22", "remark": "Alex转家中（退税）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-22T08:00:00Z"},
      {"id": "data_0148", "type": "income", "amount": 2000000.0, "category": "other_income", "date": "2025-07-31", "remark": "Helen个人借家里周转（100w好买，100w股市）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-07-31T08:00:00Z"},
      {"id": "data_0149", "type": "expense", "amount": 60000.0, "category": "living", "date": "2025-08-15", "remark": "8月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-08-15T08:00:00Z"},
      {"id": "data_0150", "type": "expense", "amount": 3000.0, "category": "invest_expense", "date": "2025-08-15", "remark": "好买新方程基金认购费", "currency": "CNY", "region": "domestic", "account": "howbuy", "createdAt": "2025-08-15T08:00:00Z"},
      {"id": "data_0151", "type": "income", "amount": 20000.0, "category": "gift_income", "date": "2025-08-28", "remark": "曹旷礼金", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2025-08-28T08:00:00Z"},
      {"id": "data_0152", "type": "income", "amount": 30000.0, "category": "other_income", "date": "2025-08-28", "remark": "Alex PP表 - 2/3", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-08-28T08:00:00Z"},
      {"id": "data_0153", "type": "income", "amount": 1860.0, "category": "investment", "date": "2025-09-08", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-09-08T08:00:00Z"},
      {"id": "data_0154", "type": "expense", "amount": 60000.0, "category": "living", "date": "2025-09-15", "remark": "9月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-09-15T08:00:00Z"},
      {"id": "data_0155", "type": "expense", "amount": 7108.18, "category": "bvi", "date": "2025-09-27", "remark": "CBI账户管理费预缴", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-09-27T08:00:00Z"},
      {"id": "data_0156", "type": "income", "amount": 13736.0, "category": "other_income", "date": "2025-09-28", "remark": "Alex PP表 - 3/3（人民币换5.5w美金，已还清）", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-09-28T08:00:00Z"},
      {"id": "data_0157", "type": "expense", "amount": 60000.0, "category": "living", "date": "2025-10-15", "remark": "10月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-10-15T08:00:00Z"},
      {"id": "data_0158", "type": "income", "amount": 1880.83, "category": "investment", "date": "2025-10-17", "remark": "Interest Earned - time deposit", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-10-17T08:00:00Z"},
      {"id": "data_0159", "type": "income", "amount": 321.45, "category": "investment", "date": "2025-11-10", "remark": "UT Dividend", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-11-10T08:00:00Z"},
      {"id": "data_0160", "type": "expense", "amount": 1906.0, "category": "bvi", "date": "2025-11-10", "remark": "BVI年审+经济实质申报费 + 银行手续费", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-11-10T08:00:00Z"},
      {"id": "data_0161", "type": "income", "amount": 233.04, "category": "investment", "date": "2025-11-13", "remark": "UT Dividend", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-11-13T08:00:00Z"},
      {"id": "data_0162", "type": "income", "amount": 321.45, "category": "investment", "date": "2025-12-09", "remark": "Credit Interest TRF", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-12-09T08:00:00Z"},
      {"id": "data_0163", "type": "income", "amount": 233.04, "category": "investment", "date": "2025-12-09", "remark": "Credit Interest TRF", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-12-09T08:00:00Z"},
      {"id": "data_0164", "type": "expense", "amount": 47.67, "category": "invest_expense", "date": "2025-12-12", "remark": "Howbuy transfer charges （43000 USD）", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-12-12T08:00:00Z"},
      {"id": "data_0165", "type": "expense", "amount": 60000.0, "category": "living", "date": "2025-12-15", "remark": "11月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-12-15T08:00:00Z"},
      {"id": "data_0166", "type": "expense", "amount": 60000.0, "category": "living", "date": "2025-12-15", "remark": "12月生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2025-12-15T08:00:00Z"},
      {"id": "data_0167", "type": "expense", "amount": 47.69, "category": "invest_expense", "date": "2025-12-28", "remark": "Howbuy transfer charges （47000 USD）", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2025-12-28T08:00:00Z"},
      {"id": "data_0168", "type": "income", "amount": 300000.0, "category": "gift_income", "date": "2026-01-01", "remark": "爷爷奶奶给童宝生活费", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-01-01T08:00:00Z"},
      {"id": "data_0169", "type": "income", "amount": 184.0, "category": "investment", "date": "2026-01-02", "remark": "Credit Interest TRF", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-02T08:00:00Z"},
      {"id": "data_0170", "type": "income", "amount": 321.45, "category": "investment", "date": "2026-01-09", "remark": "UT Dividend", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-09T08:00:00Z"},
      {"id": "data_0171", "type": "income", "amount": 233.04, "category": "investment", "date": "2026-01-09", "remark": "UT Dividend", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-09T08:00:00Z"},
      {"id": "data_0172", "type": "expense", "amount": 290.0, "category": "bvi", "date": "2026-01-12", "remark": "Encor - COI证明费用", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-12T08:00:00Z"},
      {"id": "data_0173", "type": "income", "amount": 79990.0, "category": "salary", "date": "2026-01-15", "remark": "25H2工资增额第一笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2026-01-15T08:00:00Z"},
      {"id": "data_0174", "type": "income", "amount": 53810.0, "category": "salary", "date": "2026-01-15", "remark": "25H2工资增额第二笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2026-01-15T08:00:00Z"},
      {"id": "data_0175", "type": "expense", "amount": 5700.0, "category": "insurance", "date": "2026-01-15", "remark": "TT重疾险10Y - Prudential", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-15T08:00:00Z"},
      {"id": "data_0176", "type": "expense", "amount": 6300.0, "category": "insurance", "date": "2026-01-15", "remark": "TT重疾险10Y - AIA", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-15T08:00:00Z"},
      {"id": "data_0177", "type": "income", "amount": 243.02, "category": "investment", "date": "2026-01-16", "remark": "Credit Interest TRF", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-16T08:00:00Z"},
      {"id": "data_0178", "type": "expense", "amount": 3000.0, "category": "gift", "date": "2026-01-20", "remark": "婚礼礼金to Richard（AG朋友）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-01-20T08:00:00Z"},
      {"id": "data_0179", "type": "income", "amount": 680.8, "category": "investment", "date": "2026-01-22", "remark": "Credit Interest TRF", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-22T08:00:00Z"},
      {"id": "data_0180", "type": "income", "amount": 680.8, "category": "investment", "date": "2026-01-22", "remark": "Credit Interest TRF", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-01-22T08:00:00Z"},
      {"id": "data_0181", "type": "expense", "amount": 180000.0, "category": "living", "date": "2026-01-24", "remark": "生活开支 - Q1", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-01-24T08:00:00Z"},
      {"id": "data_0182", "type": "income", "amount": 323.93, "category": "investment", "date": "2026-02-09", "remark": "UT Dividend", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-02-09T08:00:00Z"},
      {"id": "data_0183", "type": "income", "amount": 233.04, "category": "investment", "date": "2026-02-09", "remark": "UT Dividend", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-02-09T08:00:00Z"},
      {"id": "data_0184", "type": "expense", "amount": 200000.0, "category": "loan_out", "date": "2026-02-10", "remark": "还款", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-10T08:00:00Z"},
      {"id": "data_0185", "type": "expense", "amount": 200000.0, "category": "loan_out", "date": "2026-02-12", "remark": "还款", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-12T08:00:00Z"},
      {"id": "data_0186", "type": "expense", "amount": 200000.0, "category": "loan_out", "date": "2026-02-12", "remark": "还款", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-12T08:00:00Z"},
      {"id": "data_0187", "type": "income", "amount": 99990.0, "category": "salary", "date": "2026-02-13", "remark": "25Y 年终奖第一笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2026-02-13T08:00:00Z"},
      {"id": "data_0188", "type": "expense", "amount": 25000.0, "category": "gift", "date": "2026-02-15", "remark": "拜年酒水营养品", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0189", "type": "expense", "amount": 25000.0, "category": "gift", "date": "2026-02-15", "remark": "湖北拜年红包（顶顶5000，爷爷5000，小朋友各1000）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0190", "type": "income", "amount": 20000.0, "category": "gift_income", "date": "2026-02-15", "remark": "外公外婆新年红包", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0191", "type": "income", "amount": 10000.0, "category": "gift_income", "date": "2026-02-15", "remark": "爷爷奶奶新年红包", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0192", "type": "expense", "amount": 21492.0, "category": "education", "date": "2026-02-15", "remark": "童宝游泳课", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0193", "type": "income", "amount": 4000.0, "category": "gift_income", "date": "2026-02-15", "remark": "上海收红包（大姨小姨）", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0194", "type": "income", "amount": 98601.0, "category": "salary", "date": "2026-02-15", "remark": "25Y 年终奖第二笔", "currency": "USD", "region": "overseas", "account": "cbi", "createdAt": "2026-02-15T08:00:00Z"},
      {"id": "data_0195", "type": "income", "amount": 20000.0, "category": "gift_income", "date": "2026-02-20", "remark": "黎总给红包", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-20T08:00:00Z"},
      {"id": "data_0196", "type": "expense", "amount": 5000.0, "category": "gift", "date": "2026-02-21", "remark": "TJ压岁钱", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-21T08:00:00Z"},
      {"id": "data_0197", "type": "income", "amount": 2900.0, "category": "gift_income", "date": "2026-02-21", "remark": "Autumn给童宝压岁钱", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-21T08:00:00Z"},
      {"id": "data_0198", "type": "income", "amount": 44000.0, "category": "gift_income", "date": "2026-02-25", "remark": "湖北拜年收红包", "currency": "CNY", "region": "domestic", "account": "cash_cny", "createdAt": "2026-02-25T08:00:00Z"},
      {"id": "data_0199", "type": "expense", "amount": 200000.0, "category": "loan_out", "date": "2026-02-25", "remark": "还款给Helen个人", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-25T08:00:00Z"},
      {"id": "data_0200", "type": "expense", "amount": 100000.0, "category": "loan_out", "date": "2026-02-25", "remark": "还款给Helen个人", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-02-25T08:00:00Z"},
      {"id": "data_0201", "type": "expense", "amount": 47.59, "category": "bank_fee", "date": "2026-03-05", "remark": "Charges（好买transfer）", "currency": "USD", "region": "overseas", "account": "sc_bank", "createdAt": "2026-03-05T08:00:00Z"},
      {"id": "data_0202", "type": "income", "amount": 100000.0, "category": "gift_income", "date": "2026-03-10", "remark": "童宝生日 爷爷奶奶生日礼物", "currency": "CNY", "region": "domestic", "account": "bocom", "createdAt": "2026-03-10T08:00:00Z"}
    ];

    // 初始化投资理财损益数据（含2023-2026全部历史数据）
    this.investmentData = [
      // 2023年 - 境内
      { id: 'inv_001', year: 2023, month: 0, type: 'CNY', name: '季季宝', amount: 4027.50, platform: '招商银行', remark: '理财利息' },
      { id: 'inv_002', year: 2023, month: 0, type: 'CNY', name: '半年宝', amount: 4143.52, platform: '招商银行', remark: '理财利息' },
      { id: 'inv_003', year: 2023, month: 0, type: 'CNY', name: '华夏固收', amount: 3409.20, platform: '招商银行', remark: '理财利息' },
      { id: 'inv_004', year: 2023, month: 0, type: 'CNY', name: '朝朝盈2号', amount: 38156.19, platform: '招商银行', remark: '理财利息' },
      { id: 'inv_005', year: 2023, month: 0, type: 'CNY', name: '基金综合持仓', amount: -43520.91, platform: '好买基金', remark: '基金亏损' },
      // 2024年 - 境内
      { id: 'inv_006', year: 2024, month: 0, type: 'CNY', name: 'Anxin', amount: 27634.44, platform: '好买基金', remark: '盈利' },
      { id: 'inv_007', year: 2024, month: 0, type: 'CNY', name: '2024年全部招行理财收益', amount: 26968.00, platform: '招商银行', remark: '理财收益' },
      { id: 'inv_008', year: 2024, month: 0, type: 'CNY', name: '交通银行理财收益', amount: 46821.04, platform: '交通银行', remark: '2024全年' },
      // 2025年 - 境内
      { id: 'inv_009', year: 2025, month: 12, type: 'CNY', name: '交通银行理财收益', amount: 67267.75, platform: '交通银行', remark: '' },
      { id: 'inv_010', year: 2025, month: 12, type: 'CNY', name: '交通银行信托收益', amount: 15725.00, platform: '交通银行', remark: '' },
      { id: 'inv_011', year: 2025, month: 12, type: 'CNY', name: '宽德收益赎回', amount: 273785.60, platform: '好买基金', remark: '' },
      // 2025年 - 境外
      { id: 'inv_012', year: 2025, month: 0, type: 'USD', name: '渣打基金', amount: -3243.16, platform: '渣打银行', remark: '' },
      // 2026年 - 境内
      { id: 'inv_013', year: 2026, month: 0, type: 'CNY', name: '好买RMB', amount: 678522.00, platform: '好买基金', remark: '' },
      { id: 'inv_014', year: 2026, month: 0, type: 'CNY', name: '股票收益', amount: 30000.00, platform: '股票', remark: '' },
      { id: 'inv_015', year: 2026, month: 0, type: 'CNY', name: '银行理财收益', amount: 6294.00, platform: '交通银行', remark: '' },
      { id: 'inv_016', year: 2026, month: 0, type: 'CNY', name: '银行信托收益', amount: 12920.00, platform: '交通银行', remark: '' },
      // 2026年 - 境外
      { id: 'inv_017', year: 2026, month: 0, type: 'USD', name: '好买USD', amount: 19181.52, platform: '好买基金(USD)', remark: '' },
    ];

    this.saveData();
  }

  // ---- 导航 ----
  bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        this.switchPage(page);
      });
    });
  }

  switchPage(page) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    if (page === 'dashboard') this.updateDashboard();
    if (page === 'list') this.renderRecordsList();
    if (page === 'stats') this.updateStats();
    if (page === 'investment') this.renderInvestmentPage();
    if (page === 'add') {
      this.renderCategoryGrid();
      this.renderAccountSelect();
    }
    if (page === 'accounts') this.renderAccountsPage();
  }

  // ---- 数据存储 ----
  loadData() {
    try {
      this.debtItems = JSON.parse(localStorage.getItem('fl_debts')) || [];
      this.accountBalances = JSON.parse(localStorage.getItem('fl_account_balances')) || {};
    } catch {
      this.debtItems = [];
      this.accountBalances = {};
    }
  }

  saveData() {
    localStorage.setItem('fl_records', JSON.stringify(this.records));
    localStorage.setItem('fl_investments', JSON.stringify(this.investmentData));
    localStorage.setItem('fl_debts', JSON.stringify(this.debtItems));
    localStorage.setItem('fl_account_balances', JSON.stringify(this.accountBalances));
  }

  // ---- 工具函数 ----
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  formatMoney(n, currency = 'CNY') {
    const cur = CURRENCIES.find(c => c.id === currency) || CURRENCIES[0];
    return cur.symbol + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatMoneyCNY(n) {
    return '¥' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  toCNY(amount, currency) {
    if (currency === 'CNY') return amount;
    if (currency === 'USD') return amount * this.exchangeRates.USD;
    if (currency === 'HKD') return amount * this.exchangeRates.HKD;
    return amount;
  }

  // 计算理财损益折合CNY总额
  getInvestmentTotalCNY() {
    const totalCNY = this.investmentData.filter(i => i.type === 'CNY').reduce((s, i) => s + i.amount, 0);
    const totalUSD = this.investmentData.filter(i => i.type === 'USD').reduce((s, i) => s + i.amount, 0);
    return totalCNY + totalUSD * this.exchangeRates.USD;
  }

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  getCategoryInfo(type, catId) {
    const list = [...(CATEGORIES[type] || []), ...(this.customCategories[type] || [])];
    return list.find(c => c.id === catId) || { name: catId, icon: '📝' };
  }

  getAllCategories(type) {
    return [...(CATEGORIES[type] || []), ...(this.customCategories[type] || [])];
  }

  getAccountInfo(accountId) {
    return ACCOUNTS.find(a => a.id === accountId) || { name: accountId, icon: '📋', currency: 'CNY' };
  }

  getRegionInfo(regionId) {
    return REGIONS.find(r => r.id === regionId) || REGIONS[0];
  }

  // ==================== 总览页 ====================
  updateDashboard() {
    // === 境内外总资产（已含投资收益）===
    const assets = this.calcRegionAssets();
    document.getElementById('domesticAssets').textContent = this.formatMoneyCNY(assets.domestic);
    document.getElementById('overseasAssets').textContent = this.formatMoneyCNY(assets.overseasCNY);
    document.getElementById('overseasAssetsUSD').textContent = assets.overseasForeign ? `($${assets.overseasForeign.toFixed(2)})` : '';
    document.getElementById('totalAssetsAll').textContent = this.formatMoneyCNY(assets.domestic + assets.overseasCNY);

    // === 总负债 & 净资产 ===
    const totalDebt = this.calcTotalDebt();
    const totalAssetsVal = assets.domestic + assets.overseasCNY;
    const netWorth = totalAssetsVal - totalDebt;
    document.getElementById('totalDebt').textContent = this.formatMoneyCNY(totalDebt);
    const netWorthEl = document.getElementById('netWorth');
    netWorthEl.textContent = this.formatMoneyCNY(netWorth);
    netWorthEl.className = `region-amount ${netWorth >= 0 ? 'net-positive' : 'net-negative'}`;

    this.renderRecentRecords();
    this.renderYearlyAssetsChart();
  }

  // 计算境内/境外总资产（基于实际收支记录 + 理财损益）
  calcRegionAssets() {
    const allRecords = this.records;

    // 境内收支（region=domestic 或未标注）
    const domRecords = allRecords.filter(r => (r.region || 'domestic') === 'domestic');
    const domIncome = domRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const domExpense = domRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

    // 境外收支
    const ovsRecords = allRecords.filter(r => r.region === 'overseas');
    const ovsIncome = ovsRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const ovsExpense = ovsRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

    // 理财损益
    const invCNY = this.investmentData.filter(i => i.type === 'CNY').reduce((s, i) => s + i.amount, 0);
    const invUSD = this.investmentData.filter(i => i.type === 'USD').reduce((s, i) => s + i.amount, 0);

    const domestic = domIncome - domExpense + invCNY;
    const overseasForeign = ovsIncome - ovsExpense + invUSD;
    const overseasCNY = overseasForeign * this.exchangeRates.USD;

    return { domestic, overseasForeign, overseasCNY };
  }

  // ==================== 负债管理 ====================
  calcTotalDebt() {
    return this.debtItems.reduce((sum, item) => {
      const amt = Number(item.amount) || 0;
      return sum + this.toCNY(amt, item.currency || 'CNY');
    }, 0);
  }

  showDebtModal() {
    document.getElementById('debtModal').style.display = 'flex';
    this._tempDebtItems = JSON.parse(JSON.stringify(this.debtItems));
    if (this._tempDebtItems.length === 0) {
      this._tempDebtItems.push({ id: this.uid(), name: '', amount: 0, currency: 'CNY' });
    }
    this.renderDebtItems();
  }

  closeDebtModal() {
    document.getElementById('debtModal').style.display = 'none';
    this._tempDebtItems = null;
  }

  renderDebtItems() {
    const container = document.getElementById('debtItemsList');
    container.innerHTML = this._tempDebtItems.map((item, idx) => `
      <div class="debt-form-item" data-idx="${idx}">
        <div class="form-row">
          <div class="form-group half">
            <label>负债名称</label>
            <input type="text" value="${item.name}" placeholder="如：房贷、车贷、信用卡..."
              onchange="app.updateDebtItem(${idx}, 'name', this.value)">
          </div>
          <div class="form-group half">
            <label>币种</label>
            <select onchange="app.updateDebtItem(${idx}, 'currency', this.value)">
              ${CURRENCIES.map(c => `<option value="${c.id}" ${c.id === item.currency ? 'selected' : ''}>${c.symbol} ${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group half">
            <label>负债金额</label>
            <input type="number" value="${item.amount || ''}" step="0.01" min="0" placeholder="0.00"
              onchange="app.updateDebtItem(${idx}, 'amount', this.value)">
          </div>
          <div class="form-group half debt-del-group">
            <button class="btn btn-danger btn-sm" onclick="app.removeDebtItem(${idx})">🗑️ 删除</button>
          </div>
        </div>
      </div>
    `).join('');
    this.updateDebtModalTotal();
  }

  updateDebtItem(idx, field, value) {
    if (field === 'amount') {
      this._tempDebtItems[idx][field] = parseFloat(value) || 0;
    } else {
      this._tempDebtItems[idx][field] = value;
    }
    this.updateDebtModalTotal();
  }

  addDebtItem() {
    this._tempDebtItems.push({ id: this.uid(), name: '', amount: 0, currency: 'CNY' });
    this.renderDebtItems();
  }

  removeDebtItem(idx) {
    this._tempDebtItems.splice(idx, 1);
    this.renderDebtItems();
  }

  updateDebtModalTotal() {
    const total = this._tempDebtItems.reduce((sum, item) => {
      return sum + this.toCNY(Number(item.amount) || 0, item.currency || 'CNY');
    }, 0);
    document.getElementById('debtModalTotal').textContent = this.formatMoneyCNY(total);
  }

  saveDebt() {
    // 过滤掉名称和金额都为空的项
    this.debtItems = this._tempDebtItems.filter(item => item.name.trim() || item.amount > 0);
    this.saveData();
    this.closeDebtModal();
    this.updateDashboard();
    this.toast('负债信息已保存');
  }

  // 按年度计算境内/境外资产（截至某年末的累计）
  calcYearlyRegionAssets() {
    // 获取所有记录涉及的年份
    const allYears = new Set();
    this.records.forEach(r => allYears.add(new Date(r.date).getFullYear()));
    this.investmentData.forEach(i => allYears.add(i.year));
    const years = [...allYears].sort((a, b) => a - b);
    if (years.length === 0) return { years: [], domestic: [], overseas: [] };

    const result = { years: [], domestic: [], overseas: [] };

    years.forEach(yr => {
      const yearRecords = this.records.filter(r => new Date(r.date).getFullYear() <= yr);

      // 境内
      const domRecords = yearRecords.filter(r => (r.region || 'domestic') === 'domestic');
      const domNet = domRecords.reduce((s, r) => s + (r.type === 'income' ? r.amount : -r.amount), 0);
      const invCNY = this.investmentData.filter(i => i.type === 'CNY' && i.year <= yr).reduce((s, i) => s + i.amount, 0);

      // 境外
      const ovsRecords = yearRecords.filter(r => r.region === 'overseas');
      const ovsNet = ovsRecords.reduce((s, r) => s + (r.type === 'income' ? r.amount : -r.amount), 0);
      const invUSD = this.investmentData.filter(i => i.type === 'USD' && i.year <= yr).reduce((s, i) => s + i.amount, 0);
      const overseasCNY = (ovsNet + invUSD) * this.exchangeRates.USD;

      result.years.push(`${yr}年`);
      result.domestic.push(Math.round(domNet + invCNY));
      result.overseas.push(Math.round(overseasCNY));
    });

    return result;
  }

  // 年度资产增幅柱状图
  renderYearlyAssetsChart() {
    const data = this.calcYearlyRegionAssets();
    if (data.years.length === 0) return;

    if (this.charts.yearlyAssets) this.charts.yearlyAssets.destroy();
    this.charts.yearlyAssets = new Chart(document.getElementById('yearlyAssetsChart'), {
      type: 'bar',
      data: {
        labels: data.years,
        datasets: [
          {
            label: '🇨🇳 境内资产',
            data: data.domestic,
            backgroundColor: 'rgba(0, 32, 91, 0.75)',
            borderColor: '#00205b',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: '🌏 境外资产(折合¥)',
            data: data.overseas,
            backgroundColor: 'rgba(10, 143, 92, 0.75)',
            borderColor: '#0a8f5c',
            borderWidth: 1,
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { color: '#4a5568', font: { family: 'Inter, sans-serif', size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString()}`,
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const total = data.domestic[idx] + data.overseas[idx];
                return `合计: ¥${total.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stacked: true,
            ticks: { callback: v => v >= 10000 ? `¥${(v / 10000).toFixed(0)}万` : `¥${v}`, color: '#8492a6', font: { size: 10 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            stacked: true,
            ticks: { color: '#8492a6', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
  }





  renderRecentRecords() {
    const recent = [...this.records].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    const el = document.getElementById('recentList');
    if (recent.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>暂无记录，快去记一笔吧！</p></div>`;
      return;
    }
    el.innerHTML = recent.map(r => this.renderRecordItem(r, false)).join('');
  }

  renderRecordItem(r, showActions = true) {
    const info = this.getCategoryInfo(r.type, r.category);
    const sign = r.type === 'income' ? '+' : '-';
    const currency = r.currency || 'CNY';
    const regionInfo = this.getRegionInfo(r.region || 'domestic');
    const accountInfo = this.getAccountInfo(r.account || 'other');
    const actions = showActions ? `
      <div class="record-actions">
        <button title="编辑" onclick="app.editRecord('${r.id}')">✏️</button>
        <button title="删除" onclick="app.confirmDelete('${r.id}')">🗑️</button>
      </div>` : '';

    return `
      <div class="record-item" id="record-${r.id}">
        <div class="record-icon">${info.icon}</div>
        <div class="record-info">
          <div class="record-category">${info.name}${r.remark ? ' · ' + r.remark : ''}</div>
          <div class="record-meta">
            <span>${r.date}</span>
            <span class="record-tag region">${regionInfo.icon}${regionInfo.name}</span>
            <span class="record-tag account">${accountInfo.icon}${accountInfo.name}</span>
          </div>
        </div>
        <div class="record-amount ${r.type}">${sign}${this.formatMoney(r.amount, currency)}</div>
        ${actions}
      </div>`;
  }

  // ==================== 记一笔 ====================
  setType(type) {
    this.currentType = type;
    this.selectedCategory = '';
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.type-btn[data-type="${type}"]`).classList.add('active');
    this.renderCategoryGrid();
  }

  renderCategoryGrid() {
    const cats = this.getAllCategories(this.currentType);
    const el = document.getElementById('categorySelect');
    el.innerHTML = cats.map(c => `
      <div class="category-item ${this.selectedCategory === c.id ? 'active' : ''}" onclick="app.selectCategory('${c.id}')">
        <span class="cat-icon">${c.icon}</span>
        <span class="cat-name">${c.name}</span>
      </div>`).join('') + `
      <div class="category-item add-category-btn" onclick="app.showAddCategory()">
        <span class="cat-icon">➕</span>
        <span class="cat-name">添加分类</span>
      </div>`;
  }

  showAddCategory() {
    document.getElementById('addCategoryModal').style.display = 'flex';
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryIcon').value = '📌';
    document.getElementById('addCategoryType').textContent = this.currentType === 'income' ? '收入' : '支出';
  }

  closeAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'none';
  }

  saveNewCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const icon = document.getElementById('newCategoryIcon').value.trim() || '📌';
    if (!name) { this.toast('请输入分类名称'); return; }

    const type = this.currentType;
    const allCats = this.getAllCategories(type);
    if (allCats.some(c => c.name === name)) {
      this.toast('该分类名称已存在');
      return;
    }

    const id = 'custom_' + this.uid();
    this.customCategories[type].push({ id, name, icon });
    this.saveData();
    this.closeAddCategoryModal();
    this.selectedCategory = id;
    this.renderCategoryGrid();
    this.toast('分类添加成功');
  }

  selectCategory(id) {
    this.selectedCategory = id;
    this.renderCategoryGrid();
  }

  setDefaultDate() {
    document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
  }

  renderCurrencySelect() {
    const sel = document.getElementById('currencySelect');
    if (!sel) return;
    sel.innerHTML = CURRENCIES.map(c => `<option value="${c.id}" ${c.id === this.selectedCurrency ? 'selected' : ''}>${c.symbol} ${c.name}</option>`).join('');
    sel.addEventListener('change', () => {
      this.selectedCurrency = sel.value;
      this.updateCurrencySymbol();
      this.renderAccountSelect();
    });
    this.updateCurrencySymbol();
  }

  updateCurrencySymbol() {
    const cur = CURRENCIES.find(c => c.id === this.selectedCurrency);
    const symbolEl = document.getElementById('currencySymbol');
    if (symbolEl && cur) symbolEl.textContent = cur.symbol;
  }

  renderRegionSelect() {
    const sel = document.getElementById('regionSelect');
    if (!sel) return;
    sel.innerHTML = REGIONS.map(r => `<option value="${r.id}" ${r.id === this.selectedRegion ? 'selected' : ''}>${r.icon} ${r.name}</option>`).join('');
    sel.addEventListener('change', () => {
      this.selectedRegion = sel.value;
      // 自动切换币种
      if (this.selectedRegion === 'overseas') {
        this.selectedCurrency = 'USD';
      } else {
        this.selectedCurrency = 'CNY';
      }
      const curSel = document.getElementById('currencySelect');
      if (curSel) curSel.value = this.selectedCurrency;
      this.updateCurrencySymbol();
      this.renderAccountSelect();
    });
  }

  renderAccountSelect() {
    const sel = document.getElementById('accountSelect');
    if (!sel) return;
    // 根据当前选择的币种筛选账户
    const filtered = ACCOUNTS.filter(a => a.currency === this.selectedCurrency || a.id === 'other');
    sel.innerHTML = filtered.map(a => `<option value="${a.id}" ${a.id === this.selectedAccount ? 'selected' : ''}>${a.icon} ${a.name}</option>`).join('');
  }

  saveRecord() {
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('recordDate').value;
    const remark = document.getElementById('remark').value.trim();
    const editId = document.getElementById('editId').value;
    const currency = document.getElementById('currencySelect').value;
    const region = document.getElementById('regionSelect').value;
    const account = document.getElementById('accountSelect').value;

    if (!amount || amount <= 0) { this.toast('请输入有效金额'); return; }
    if (!this.selectedCategory) { this.toast('请选择分类'); return; }
    if (!date) { this.toast('请选择日期'); return; }

    if (editId) {
      const idx = this.records.findIndex(r => r.id === editId);
      if (idx !== -1) {
        this.records[idx] = {
          ...this.records[idx],
          type: this.currentType,
          amount,
          category: this.selectedCategory,
          date,
          remark,
          currency,
          region,
          account,
        };
        this.toast('修改成功！');
      }
    } else {
      this.records.push({
        id: this.uid(),
        type: this.currentType,
        amount,
        category: this.selectedCategory,
        date,
        remark,
        currency,
        region,
        account,
        createdAt: new Date().toISOString()
      });
      this.toast('记录成功！');
    }

    this.saveData();
    this.resetForm();

    // 编辑模式下保存后，跳转到账单明细并定位到修改的记录
    if (editId) {
      this.switchPage('list');
      this.scrollToRecord(editId);
    }
  }

  resetForm() {
    document.getElementById('amount').value = '';
    document.getElementById('remark').value = '';
    document.getElementById('editId').value = '';
    document.getElementById('addPageTitle').textContent = '记一笔';
    this.selectedCategory = '';
    this.setDefaultDate();
    this.renderCategoryGrid();
  }

  // 跳转到指定记录并高亮（保留当前筛选条件）
  scrollToRecord(recordId) {
    // 按当前筛选条件获取筛选结果
    const type = document.getElementById('filterType').value;
    const category = document.getElementById('filterCategory').value;
    const region = document.getElementById('filterRegion').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const keyword = document.getElementById('filterKeyword').value.toLowerCase();

    let filtered = [...this.records];
    if (type !== 'all') filtered = filtered.filter(r => r.type === type);
    if (category !== 'all') filtered = filtered.filter(r => r.category === category);
    if (region !== 'all') filtered = filtered.filter(r => (r.region || 'domestic') === region);
    if (dateFrom) filtered = filtered.filter(r => r.date >= dateFrom);
    if (dateTo) filtered = filtered.filter(r => r.date <= dateTo);
    if (keyword) {
      filtered = filtered.filter(r => {
        const info = this.getCategoryInfo(r.type, r.category);
        return (r.remark || '').toLowerCase().includes(keyword) || info.name.toLowerCase().includes(keyword);
      });
    }
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 在当前筛选结果中找记录
    let idx = filtered.findIndex(r => r.id === recordId);

    if (idx === -1) {
      // 筛选后找不到，说明修改后的记录不符合当前筛选条件，重置筛选
      document.getElementById('filterType').value = 'all';
      document.getElementById('filterCategory').value = 'all';
      document.getElementById('filterRegion').value = 'all';
      document.getElementById('filterDateFrom').value = '';
      document.getElementById('filterDateTo').value = '';
      document.getElementById('filterKeyword').value = '';
      // 清除快捷按钮高亮
      document.querySelectorAll('.filter-shortcuts .shortcut-btn').forEach(btn => btn.classList.remove('active'));
      const allSorted = [...this.records].sort((a, b) => new Date(b.date) - new Date(a.date));
      idx = allSorted.findIndex(r => r.id === recordId);
      if (idx === -1) return;
      this.toast('已重置筛选条件以显示修改的记录');
    }

    // 计算所在页码并跳转
    const targetPage = Math.floor(idx / this.listPageSize) + 1;
    this.listCurrentPage = targetPage;
    this.filterRecords(false);

    // 等渲染完成后滚动并高亮
    requestAnimationFrame(() => {
      const el = document.getElementById(`record-${recordId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('record-highlight');
        setTimeout(() => el.classList.remove('record-highlight'), 2500);
      }
    });
  }

  editRecord(id) {
    const r = this.records.find(rec => rec.id === id);
    if (!r) return;

    this.switchPage('add');
    this.setType(r.type);
    this.selectCategory(r.category);
    document.getElementById('amount').value = r.amount;
    document.getElementById('recordDate').value = r.date;
    document.getElementById('remark').value = r.remark || '';
    document.getElementById('editId').value = r.id;
    document.getElementById('addPageTitle').textContent = '编辑记录';

    // 恢复币种、地区、账户
    if (r.currency) {
      this.selectedCurrency = r.currency;
      const curSel = document.getElementById('currencySelect');
      if (curSel) curSel.value = r.currency;
      this.updateCurrencySymbol();
    }
    if (r.region) {
      this.selectedRegion = r.region;
      const regSel = document.getElementById('regionSelect');
      if (regSel) regSel.value = r.region;
    }
    this.renderAccountSelect();
    if (r.account) {
      this.selectedAccount = r.account;
      const accSel = document.getElementById('accountSelect');
      if (accSel) accSel.value = r.account;
    }
  }

  confirmDelete(id) {
    document.getElementById('confirmModal').style.display = 'flex';
    document.getElementById('confirmMsg').textContent = '确定要删除这条记录吗？此操作不可恢复。';
    document.getElementById('confirmBtn').onclick = () => {
      this.records = this.records.filter(r => r.id !== id);
      this.saveData();
      this.closeConfirm();
      // 刷新当前可见页
      const activePage = document.querySelector('.page.active');
      if (activePage) {
        if (activePage.id === 'page-list') this.renderRecordsList();
        if (activePage.id === 'page-dashboard') this.updateDashboard();
      }
      this.toast('删除成功');
    };
  }

  closeConfirm() {
    document.getElementById('confirmModal').style.display = 'none';
  }

  // ==================== 账单明细 ====================
  renderRecordsList() {
    this.updateFilterOptions();
    this.filterRecords();
  }

  updateFilterOptions() {
    const catSelect = document.getElementById('filterCategory');
    const allCats = [...this.getAllCategories('expense'), ...this.getAllCategories('income')];
    const usedCats = new Set(this.records.map(r => r.category));
    catSelect.innerHTML = '<option value="all">全部分类</option>' +
      allCats.filter(c => usedCats.has(c.id)).map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');

    // 默认不设置月份筛选，展示所有记录
  }

  filterRecords(resetPage = true) {
    if (resetPage) this.listCurrentPage = 1;

    const type = document.getElementById('filterType').value;
    const category = document.getElementById('filterCategory').value;
    const region = document.getElementById('filterRegion').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const keyword = document.getElementById('filterKeyword').value.toLowerCase();

    let filtered = [...this.records];

    if (type !== 'all') filtered = filtered.filter(r => r.type === type);
    if (category !== 'all') filtered = filtered.filter(r => r.category === category);
    if (region !== 'all') filtered = filtered.filter(r => (r.region || 'domestic') === region);
    if (dateFrom) {
      filtered = filtered.filter(r => r.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(r => r.date <= dateTo);
    }
    if (keyword) {
      filtered = filtered.filter(r => {
        const info = this.getCategoryInfo(r.type, r.category);
        return (r.remark || '').toLowerCase().includes(keyword) || info.name.toLowerCase().includes(keyword);
      });
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 分页
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / this.listPageSize));
    if (this.listCurrentPage > totalPages) this.listCurrentPage = totalPages;
    const startIdx = (this.listCurrentPage - 1) * this.listPageSize;
    const pageRecords = filtered.slice(startIdx, startIdx + this.listPageSize);

    const el = document.getElementById('recordsList');
    if (filtered.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>没有找到匹配的记录</p></div>`;
    } else {
      el.innerHTML = pageRecords.map(r => this.renderRecordItem(r, true)).join('');
    }

    // 分页控件
    this.renderPagination(totalCount, totalPages);

    // 汇总（折算CNY）
    const totalIncome = filtered.filter(r => r.type === 'income').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'CNY'), 0);
    const totalExpense = filtered.filter(r => r.type === 'expense').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'CNY'), 0);
    document.getElementById('listSummary').innerHTML = `
      <span>共 ${totalCount} 条记录</span>
      <span>收入: <span class="income">${this.formatMoneyCNY(totalIncome)}</span></span>
      <span>支出: <span class="expense">${this.formatMoneyCNY(totalExpense)}</span></span>
      <span>结余: ${this.formatMoneyCNY(totalIncome - totalExpense)}</span>
      <span class="summary-note">（已折算人民币）</span>`;
  }

  setListDateRange(range) {
    const fromEl = document.getElementById('filterDateFrom');
    const toEl = document.getElementById('filterDateTo');
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    switch (range) {
      case 'all':
        fromEl.value = '';
        toEl.value = '';
        break;
      case 'thisMonth':
        fromEl.value = `${y}-${String(m + 1).padStart(2, '0')}-01`;
        toEl.value = now.toISOString().split('T')[0];
        break;
      case 'lastMonth': {
        const lm = m === 0 ? 11 : m - 1;
        const ly = m === 0 ? y - 1 : y;
        const lastDay = new Date(ly, lm + 1, 0).getDate();
        fromEl.value = `${ly}-${String(lm + 1).padStart(2, '0')}-01`;
        toEl.value = `${ly}-${String(lm + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        break;
      }
      case 'thisYear':
        fromEl.value = `${y}-01-01`;
        toEl.value = now.toISOString().split('T')[0];
        break;
      case 'lastYear':
        fromEl.value = `${y - 1}-01-01`;
        toEl.value = `${y - 1}-12-31`;
        break;
      default:
        if (/^\d{4}$/.test(range)) {
          fromEl.value = `${range}-01-01`;
          toEl.value = `${range}-12-31`;
        }
        break;
    }

    // 高亮当前选中的快捷按钮
    document.querySelectorAll('.filter-shortcuts .shortcut-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    this.filterRecords();
  }

  renderPagination(totalCount, totalPages) {
    const paginationEl = document.getElementById('listPagination');
    if (!paginationEl) return;

    if (totalCount <= this.listPageSize) {
      paginationEl.innerHTML = '';
      return;
    }

    const currentPage = this.listCurrentPage;
    let pages = [];

    // 生成页码按钮
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    const startIdx = (currentPage - 1) * this.listPageSize + 1;
    const endIdx = Math.min(currentPage * this.listPageSize, totalCount);

    paginationEl.innerHTML = `
      <span class="page-info">显示 ${startIdx}-${endIdx} / 共 ${totalCount} 条</span>
      <div class="page-buttons">
        <button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="app.goToPage(${currentPage - 1})">‹</button>
        ${pages.map(p => p === '...'
          ? '<span class="page-ellipsis">…</span>'
          : `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="app.goToPage(${p})">${p}</button>`
        ).join('')}
        <button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="app.goToPage(${currentPage + 1})">›</button>
      </div>`;
  }

  goToPage(page) {
    this.listCurrentPage = page;
    this.filterRecords(false);
    // 滚动到列表顶部
    const listEl = document.getElementById('recordsList');
    if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ==================== 统计分析 ====================
  updateStats() {
    const period = document.getElementById('statsPeriod').value;
    const now = new Date();
    let filtered = [];

    switch (period) {
      case 'month':
        filtered = this.records.filter(r => {
          const d = new Date(r.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        break;
      case 'quarter': {
        const q = Math.floor(now.getMonth() / 3);
        filtered = this.records.filter(r => {
          const d = new Date(r.date);
          return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q;
        });
        break;
      }
      case 'year':
        filtered = this.records.filter(r => new Date(r.date).getFullYear() === now.getFullYear());
        break;
      case 'all':
        filtered = [...this.records];
        break;
    }

    const income = filtered.filter(r => r.type === 'income').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'CNY'), 0);
    const expense = filtered.filter(r => r.type === 'expense').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'CNY'), 0);

    let days = 1;
    if (filtered.length > 0) {
      const dates = filtered.map(r => new Date(r.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      days = Math.max(1, Math.ceil((maxDate - minDate) / 86400000) + 1);
    }

    document.getElementById('statIncome').textContent = this.formatMoneyCNY(income);
    document.getElementById('statExpense').textContent = this.formatMoneyCNY(expense);
    document.getElementById('statBalance').textContent = this.formatMoneyCNY(income - expense);
    document.getElementById('statDailyAvg').textContent = this.formatMoneyCNY(expense / days);

    // 境内外对比
    const domesticExp = filtered.filter(r => r.type === 'expense' && (r.region || 'domestic') === 'domestic').reduce((s, r) => s + r.amount, 0);
    const overseasExp = filtered.filter(r => r.type === 'expense' && r.region === 'overseas').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'USD'), 0);
    document.getElementById('statDomestic').textContent = this.formatMoneyCNY(domesticExp);
    document.getElementById('statOverseas').textContent = this.formatMoneyCNY(overseasExp);

    this.renderAnnualCompareChart();
    this.populatePiePeriod();
    this.updatePieCharts();
    this.renderRegionChart(filtered);
  }

  populatePiePeriod() {
    const sel = document.getElementById('piePeriod');
    if (!sel) return;
    const prevVal = sel.value || 'all';
    const years = [...new Set(this.records.map(r => new Date(r.date).getFullYear()))].sort();
    let html = '<option value="all">全部</option>';
    years.forEach(y => { html += `<option value="${y}">${y}年</option>`; });
    sel.innerHTML = html;
    // 恢复之前的选中状态
    if ([...sel.options].some(o => o.value === prevVal)) {
      sel.value = prevVal;
    } else {
      sel.value = 'all';
    }
  }

  updatePieCharts() {
    const sel = document.getElementById('piePeriod');
    const pieYear = sel ? sel.value : 'all';
    let filtered;
    if (pieYear === 'all') {
      filtered = [...this.records];
    } else {
      const yr = Number(pieYear);
      filtered = this.records.filter(r => new Date(r.date).getFullYear() === yr);
    }
    this.renderExpensePieChart(filtered);
    this.renderIncomePieChart(filtered);
  }

  renderAnnualCompareChart() {
    // 按年份汇总
    const yearMap = {};
    this.records.forEach(r => {
      const y = new Date(r.date).getFullYear();
      if (!yearMap[y]) yearMap[y] = { income: 0, expense: 0, incomeCats: {}, expenseCats: {} };
      const cny = this.toCNY(r.amount, r.currency || 'CNY');
      const info = this.getCategoryInfo(r.type, r.category);
      if (r.type === 'income') {
        yearMap[y].income += cny;
        yearMap[y].incomeCats[info.name] = (yearMap[y].incomeCats[info.name] || 0) + cny;
      } else {
        yearMap[y].expense += cny;
        yearMap[y].expenseCats[info.name] = (yearMap[y].expenseCats[info.name] || 0) + cny;
      }
    });
    const years = Object.keys(yearMap).sort();
    const incomeData = years.map(y => yearMap[y].income);
    const expenseData = years.map(y => yearMap[y].expense);
    const labels = years.map(y => y + '年');

    // 渲染柱状图
    if (this.charts.annualCompare) this.charts.annualCompare.destroy();
    this.charts.annualCompare = new Chart(document.getElementById('annualCompareChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: '收入', data: incomeData, backgroundColor: 'rgba(10,143,92,0.7)', borderRadius: 3 },
          { label: '支出', data: expenseData, backgroundColor: 'rgba(197,48,48,0.7)', borderRadius: 3 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { color: '#4a5568', font: { family: 'Inter, sans-serif', size: 11 } } } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => '¥' + (v >= 10000 ? (v / 10000).toFixed(1) + '万' : v), color: '#8492a6', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { color: '#8492a6', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });

    // 渲染分类明细表
    const detailEl = document.getElementById('annualCategoryDetail');
    if (!detailEl) return;
    let html = '<div class="annual-detail-wrap">';
    years.forEach(y => {
      const d = yearMap[y];
      const net = d.income - d.expense;
      html += `<div class="annual-year-block">
        <div class="annual-year-title" onclick="this.parentElement.classList.toggle('collapsed')">
          <span>${y}年</span>
          <span class="annual-year-summary">
            <span class="positive">收入 ¥${this.formatNum(d.income)}</span>
            <span class="negative">支出 ¥${this.formatNum(d.expense)}</span>
            <span class="${net >= 0 ? 'positive' : 'negative'}">结余 ¥${this.formatNum(net)}</span>
          </span>
          <span class="annual-toggle">▼</span>
        </div>
        <div class="annual-year-body">
          <div class="annual-cat-columns">
            <div class="annual-cat-col">
              <h4 class="positive">收入分类</h4>
              ${Object.entries(d.incomeCats).sort((a,b) => b[1]-a[1]).map(([name, amt]) =>
                `<div class="annual-cat-row"><span class="annual-cat-name">${name}</span><span class="annual-cat-amt positive">¥${this.formatNum(amt)}</span></div>`
              ).join('') || '<div class="annual-cat-row empty">暂无</div>'}
            </div>
            <div class="annual-cat-col">
              <h4 class="negative">支出分类</h4>
              ${Object.entries(d.expenseCats).sort((a,b) => b[1]-a[1]).map(([name, amt]) =>
                `<div class="annual-cat-row"><span class="annual-cat-name">${name}</span><span class="annual-cat-amt negative">¥${this.formatNum(amt)}</span></div>`
              ).join('') || '<div class="annual-cat-row empty">暂无</div>'}
            </div>
          </div>
        </div>
      </div>`;
    });
    html += '</div>';
    detailEl.innerHTML = html;
  }

  renderExpensePieChart(records) {
    const expenses = records.filter(r => r.type === 'expense');
    const catMap = {};
    expenses.forEach(r => {
      const info = this.getCategoryInfo('expense', r.category);
      const cny = this.toCNY(r.amount, r.currency || 'CNY');
      catMap[info.name] = (catMap[info.name] || 0) + cny;
    });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colors = ['#00205b', '#0a3a8a', '#1a4fa0', '#2b6cb0', '#3182ce', '#0a8f5c', '#c53030', '#6b46c1', '#d69e2e', '#8492a6', '#805ad5', '#0987a0', '#38a169', '#c05621', '#b7791f', '#2b6cb0', '#9f7aea', '#e53e3e', '#38b2ac', '#68d391'];

    if (this.charts.expensePie) this.charts.expensePie.destroy();
    this.charts.expensePie = new Chart(document.getElementById('expensePieChart'), {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['暂无数据'],
        datasets: [{ data: data.length ? data : [1], backgroundColor: data.length ? colors.slice(0, labels.length) : ['#edf0f4'], borderWidth: 2, borderColor: '#ffffff' }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#4a5568', padding: 10 } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = data.reduce((a, b) => a + b, 0);
                return `${ctx.label}: ¥${ctx.parsed.toFixed(0)} (${((ctx.parsed / total) * 100).toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderIncomePieChart(records) {
    const incomes = records.filter(r => r.type === 'income');
    const catMap = {};
    incomes.forEach(r => {
      const info = this.getCategoryInfo('income', r.category);
      const cny = this.toCNY(r.amount, r.currency || 'CNY');
      catMap[info.name] = (catMap[info.name] || 0) + cny;
    });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colors = ['#0a8f5c', '#2b6cb0', '#d69e2e', '#6b46c1', '#0987a0', '#38a169', '#00205b', '#805ad5', '#c05621', '#9f7aea', '#0a3a8a', '#c53030'];

    if (this.charts.incomePie) this.charts.incomePie.destroy();
    this.charts.incomePie = new Chart(document.getElementById('incomePieChart'), {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['暂无数据'],
        datasets: [{ data: data.length ? data : [1], backgroundColor: data.length ? colors.slice(0, labels.length) : ['#edf0f4'], borderWidth: 2, borderColor: '#ffffff' }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11, family: 'Inter, sans-serif' }, color: '#4a5568', padding: 10 } } }
      }
    });
  }


  renderRegionChart(records) {
    const domesticIncome = records.filter(r => r.type === 'income' && (r.region || 'domestic') === 'domestic').reduce((s, r) => s + r.amount, 0);
    const domesticExpense = records.filter(r => r.type === 'expense' && (r.region || 'domestic') === 'domestic').reduce((s, r) => s + r.amount, 0);
    const overseasIncome = records.filter(r => r.type === 'income' && r.region === 'overseas').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'USD'), 0);
    const overseasExpense = records.filter(r => r.type === 'expense' && r.region === 'overseas').reduce((s, r) => s + this.toCNY(r.amount, r.currency || 'USD'), 0);

    if (this.charts.region) this.charts.region.destroy();
    this.charts.region = new Chart(document.getElementById('regionChart'), {
      type: 'bar',
      data: {
        labels: ['🇨🇳 境内', '🌏 境外'],
        datasets: [
          { label: '收入(¥)', data: [domesticIncome, overseasIncome], backgroundColor: 'rgba(10,143,92,0.7)', borderRadius: 3 },
          { label: '支出(¥)', data: [domesticExpense, overseasExpense], backgroundColor: 'rgba(197,48,48,0.7)', borderRadius: 3 },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { color: '#4a5568', font: { family: 'Inter, sans-serif', size: 11 } } } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => '¥' + (v >= 10000 ? (v / 10000).toFixed(1) + '万' : v), color: '#8492a6', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { color: '#4a5568', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  }


  // ==================== 账户总览 ====================
  renderAccountsPage() {
    const el = document.getElementById('accountsList');

    el.innerHTML = ACCOUNTS.map(a => {
      const cur = CURRENCIES.find(c => c.id === a.currency) || CURRENCIES[0];
      const bal = this.accountBalances[a.id] !== undefined ? Number(this.accountBalances[a.id]) : 0;
      return `
        <div class="account-card" onclick="app.showAccountBalanceModal('${a.id}')" style="cursor:pointer" title="点击编辑余额">
          <div class="account-header">
            <span class="account-icon">${a.icon}</span>
            <span class="account-name">${a.name}</span>
            <span class="account-currency">${cur.name}</span>
          </div>
          <div class="account-balance">${cur.symbol}${bal.toFixed(2)}</div>
          <div class="account-edit-hint">✏️ 点击编辑余额</div>
        </div>`;
    }).join('');
  }

  showAccountBalanceModal(accountId) {
    const acc = ACCOUNTS.find(a => a.id === accountId);
    if (!acc) return;
    const cur = CURRENCIES.find(c => c.id === acc.currency) || CURRENCIES[0];
    document.getElementById('accBalModalTitle').textContent = `编辑 ${acc.icon} ${acc.name} 余额`;
    document.getElementById('accBalCurrencySymbol').textContent = cur.symbol;
    document.getElementById('accBalAccountId').value = accountId;
    const currentBal = this.accountBalances[accountId] !== undefined ? Number(this.accountBalances[accountId]) : 0;
    document.getElementById('accBalAmount').value = currentBal || '';
    document.getElementById('accountBalanceModal').style.display = 'flex';
    setTimeout(() => document.getElementById('accBalAmount').focus(), 100);
  }

  closeAccountBalanceModal() {
    document.getElementById('accountBalanceModal').style.display = 'none';
  }

  saveAccountBalance() {
    const accountId = document.getElementById('accBalAccountId').value;
    const amount = parseFloat(document.getElementById('accBalAmount').value) || 0;
    this.accountBalances[accountId] = amount;
    this.saveData();
    this.closeAccountBalanceModal();
    this.renderAccountsPage();
    this.toast('账户余额已更新');
  }

  // ==================== 理财损益管理 ====================
  renderInvestmentPage() {
    const el = document.getElementById('investmentContent');
    if (!el) return;

    // 按年份分组
    const yearMap = {};
    this.investmentData.forEach(inv => {
      if (!yearMap[inv.year]) yearMap[inv.year] = [];
      yearMap[inv.year].push(inv);
    });

    const years = Object.keys(yearMap).sort((a, b) => b - a);

    // 计算总计
    const totalCNY = this.investmentData.filter(i => i.type === 'CNY').reduce((s, i) => s + i.amount, 0);
    const totalUSD = this.investmentData.filter(i => i.type === 'USD').reduce((s, i) => s + i.amount, 0);

    let html = `
      <div class="inv-summary">
        <div class="inv-summary-item">
          <span class="inv-summary-label">境内理财累计损益</span>
          <span class="inv-summary-value ${totalCNY >= 0 ? 'positive' : 'negative'}">¥${this.formatNum(totalCNY)}</span>
        </div>
        <div class="inv-summary-item">
          <span class="inv-summary-label">境外理财累计损益</span>
          <span class="inv-summary-value ${totalUSD >= 0 ? 'positive' : 'negative'}">$${this.formatNum(totalUSD)}</span>
        </div>
        <div class="inv-summary-item">
          <span class="inv-summary-label">折合人民币总计</span>
          <span class="inv-summary-value ${(totalCNY + totalUSD * this.exchangeRates.USD) >= 0 ? 'positive' : 'negative'}">¥${this.formatNum(totalCNY + totalUSD * this.exchangeRates.USD)}</span>
        </div>
      </div>`;

    if (years.length === 0) {
      html += '<div class="empty-state"><div class="empty-icon">📊</div><p>暂无理财损益数据，点击上方按钮添加</p></div>';
    } else {
      years.forEach(year => {
        const items = yearMap[year];
        const yearCNY = items.filter(i => i.type === 'CNY').reduce((s, i) => s + i.amount, 0);
        const yearUSD = items.filter(i => i.type === 'USD').reduce((s, i) => s + i.amount, 0);

        html += `
          <div class="inv-year-section">
            <div class="inv-year-header">
              <h3>${year}年</h3>
              <div class="inv-year-totals">
                ${yearCNY !== 0 ? `<span class="${yearCNY >= 0 ? 'positive' : 'negative'}">CNY: ¥${this.formatNum(yearCNY)}</span>` : ''}
                ${yearUSD !== 0 ? `<span class="${yearUSD >= 0 ? 'positive' : 'negative'}">USD: $${this.formatNum(yearUSD)}</span>` : ''}
                <button class="btn btn-sm btn-outline" onclick="app.showAddInvestmentForYear(${year})" title="在${year}年添加记录">+ 添加</button>
              </div>
            </div>
            <div class="inv-table-wrap">
              <table class="inv-table">
                <thead>
                  <tr>
                    <th>月份</th>
                    <th>产品名称</th>
                    <th>币种</th>
                    <th>损益金额</th>
                    <th>平台</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.sort((a, b) => (a.month || 0) - (b.month || 0)).map(inv => `
                    <tr>
                      <td>${inv.month === 0 ? '全年' : inv.month + '月'}</td>
                      <td class="inv-name">${inv.name}</td>
                      <td>${inv.type}</td>
                      <td class="${inv.amount >= 0 ? 'positive' : 'negative'}">${inv.type === 'CNY' ? '¥' : '$'}${this.formatNum(inv.amount)}</td>
                      <td>${inv.platform || '-'}</td>
                      <td>${inv.remark || '-'}</td>
                      <td class="inv-actions">
                        <button onclick="app.editInvestment('${inv.id}')" title="编辑">✏️</button>
                        <button onclick="app.deleteInvestment('${inv.id}')" title="删除">🗑️</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
      });
    }

    // 添加图表容器
    html += `
      <div class="inv-chart-section">
        <div class="chart-container large">
          <h3>各年度理财损益对比</h3>
          <canvas id="investmentChart"></canvas>
        </div>
      </div>`;

    el.innerHTML = html;
    this.renderInvestmentChart(yearMap, years);
  }

  formatNum(n) {
    const abs = Math.abs(n);
    const formatted = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return n < 0 ? '-' + formatted : formatted;
  }

  renderInvestmentChart(yearMap, years) {
    const canvas = document.getElementById('investmentChart');
    if (!canvas || years.length === 0) return;

    const sortedYears = [...years].sort();
    const cnyData = sortedYears.map(y => (yearMap[y] || []).filter(i => i.type === 'CNY').reduce((s, i) => s + i.amount, 0));
    const usdData = sortedYears.map(y => {
      const usd = (yearMap[y] || []).filter(i => i.type === 'USD').reduce((s, i) => s + i.amount, 0);
      return usd * this.exchangeRates.USD;
    });

    if (this.charts.investment) this.charts.investment.destroy();
    this.charts.investment = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: sortedYears.map(y => y + '年'),
        datasets: [
          { label: '境内(CNY)', data: cnyData, backgroundColor: 'rgba(0,32,91,0.7)', borderRadius: 3 },
          { label: '境外(USD→CNY)', data: usdData, backgroundColor: 'rgba(49,130,206,0.7)', borderRadius: 3 },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { color: '#4a5568', font: { family: 'Inter, sans-serif', size: 11 } } } },
        scales: {
          y: { ticks: { callback: v => '¥' + (Math.abs(v) >= 10000 ? (v / 10000).toFixed(1) + '万' : v), color: '#8492a6', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { ticks: { color: '#4a5568', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  }

  showAddInvestment() {
    this.showAddInvestmentForYear(new Date().getFullYear());
  }

  showAddInvestmentForYear(year) {
    document.getElementById('investmentModal').style.display = 'flex';
    document.getElementById('invModalTitle').textContent = `添加${year}年理财损益`;
    document.getElementById('invYear').value = year;
    document.getElementById('invMonth').value = '0';
    document.getElementById('invType').value = 'CNY';
    document.getElementById('invName').value = '';
    document.getElementById('invAmount').value = '';
    document.getElementById('invPlatform').value = '';
    document.getElementById('invRemark').value = '';
    document.getElementById('editInvId').value = '';
  }

  editInvestment(id) {
    const inv = this.investmentData.find(i => i.id === id);
    if (!inv) return;
    document.getElementById('investmentModal').style.display = 'flex';
    document.getElementById('invModalTitle').textContent = '编辑理财损益';
    document.getElementById('invYear').value = inv.year;
    document.getElementById('invMonth').value = inv.month;
    document.getElementById('invType').value = inv.type;
    document.getElementById('invName').value = inv.name;
    document.getElementById('invAmount').value = inv.amount;
    document.getElementById('invPlatform').value = inv.platform || '';
    document.getElementById('invRemark').value = inv.remark || '';
    document.getElementById('editInvId').value = inv.id;
  }

  saveInvestment() {
    const year = parseInt(document.getElementById('invYear').value);
    const month = parseInt(document.getElementById('invMonth').value);
    const type = document.getElementById('invType').value;
    const name = document.getElementById('invName').value.trim();
    const amount = parseFloat(document.getElementById('invAmount').value);
    const platform = document.getElementById('invPlatform').value.trim();
    const remark = document.getElementById('invRemark').value.trim();
    const editId = document.getElementById('editInvId').value;

    if (!name) { this.toast('请输入产品名称'); return; }
    if (isNaN(amount)) { this.toast('请输入损益金额'); return; }
    if (!year || year < 2020 || year > 2030) { this.toast('请输入有效年份'); return; }

    if (editId) {
      const idx = this.investmentData.findIndex(i => i.id === editId);
      if (idx !== -1) {
        this.investmentData[idx] = { ...this.investmentData[idx], year, month, type, name, amount, platform, remark };
        this.toast('修改成功');
      }
    } else {
      this.investmentData.push({
        id: 'inv_' + this.uid(), year, month, type, name, amount, platform, remark
      });
      this.toast('添加成功');
    }

    this.saveData();
    this.closeInvestmentModal();
    this.renderInvestmentPage();
  }

  deleteInvestment(id) {
    document.getElementById('confirmModal').style.display = 'flex';
    document.getElementById('confirmMsg').textContent = '确定要删除这条理财损益记录吗？';
    document.getElementById('confirmBtn').onclick = () => {
      this.investmentData = this.investmentData.filter(i => i.id !== id);
      this.saveData();
      this.closeConfirm();
      this.renderInvestmentPage();
      this.toast('已删除');
    };
  }

  closeInvestmentModal() {
    document.getElementById('investmentModal').style.display = 'none';
  }

  // ==================== 汇率设置 ====================
  showRateModal() {
    document.getElementById('rateModal').style.display = 'flex';
    document.getElementById('rateUSD').value = this.exchangeRates.USD;
    document.getElementById('rateHKD').value = this.exchangeRates.HKD;
    document.getElementById('rateStatus').textContent = '';
  }

  closeRateModal() {
    document.getElementById('rateModal').style.display = 'none';
  }

  async fetchLiveRates() {
    const btn = document.getElementById('fetchRateBtn');
    const statusEl = document.getElementById('rateStatus');
    btn.disabled = true;
    btn.textContent = '⏳ 查询中...';
    statusEl.textContent = '';
    statusEl.className = 'rate-status';

    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('网络请求失败');
      const data = await response.json();

      if (data.result === 'success' && data.rates) {
        const usdCny = data.rates.CNY;
        const hkdCny = usdCny / data.rates.HKD; // HKD/CNY = USD/CNY ÷ USD/HKD

        document.getElementById('rateUSD').value = usdCny.toFixed(4);
        document.getElementById('rateHKD').value = hkdCny.toFixed(4);

        statusEl.textContent = `✅ 已获取最新汇率（${data.time_last_update_utc ? data.time_last_update_utc.split(' ').slice(0, 4).join(' ') : '今日'}）`;
        statusEl.className = 'rate-status success';
      } else {
        throw new Error('API返回数据格式错误');
      }
    } catch (err) {
      statusEl.textContent = `❌ 获取失败: ${err.message}，请手动输入`;
      statusEl.className = 'rate-status error';
    } finally {
      btn.disabled = false;
      btn.textContent = '🔄 自动获取当日汇率';
    }
  }

  saveRates() {
    const usd = parseFloat(document.getElementById('rateUSD').value);
    const hkd = parseFloat(document.getElementById('rateHKD').value);
    if (usd > 0) this.exchangeRates.USD = usd;
    if (hkd > 0) this.exchangeRates.HKD = hkd;
    localStorage.setItem('fl_rates', JSON.stringify(this.exchangeRates));
    this.closeRateModal();
    this.toast('汇率已更新');
    // 刷新当前页
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      if (activePage.id === 'page-dashboard') this.updateDashboard();
      if (activePage.id === 'page-stats') this.updateStats();
    }
  }

  // ==================== 数据导出/导入 ====================
  exportData() {
    const data = {
      records: this.records,
      investmentData: this.investmentData,
      debtItems: this.debtItems,
      accountBalances: this.accountBalances,
      exchangeRates: this.exchangeRates,
      customCategories: this.customCategories,
      exportDate: new Date().toISOString(),
      version: '3.5'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `家庭记账本_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('JSON数据已导出');
  }

  exportExcel() {
    if (typeof XLSX === 'undefined') {
      this.toast('Excel导出库加载失败，请检查网络');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: 收支明细
    const recordRows = this.records
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(r => {
        const catInfo = this.getCategoryInfo(r.type, r.category);
        const regionInfo = this.getRegionInfo(r.region || 'domestic');
        const accountInfo = this.getAccountInfo(r.account || 'other');
        const currencyInfo = CURRENCIES.find(c => c.id === (r.currency || 'CNY')) || CURRENCIES[0];
        return {
          '日期': r.date,
          '类型': r.type === 'income' ? '收入' : '支出',
          '分类': catInfo.name,
          '金额': r.amount,
          '币种': currencyInfo.name,
          '折合人民币': Number(this.toCNY(r.amount, r.currency || 'CNY').toFixed(2)),
          '地区': regionInfo.name,
          '账户': accountInfo.name,
          '备注': r.remark || '',
        };
      });
    const wsRecords = XLSX.utils.json_to_sheet(recordRows);

    // 设置列宽
    wsRecords['!cols'] = [
      { wch: 12 }, // 日期
      { wch: 6 },  // 类型
      { wch: 14 }, // 分类
      { wch: 14 }, // 金额
      { wch: 8 },  // 币种
      { wch: 14 }, // 折合人民币
      { wch: 6 },  // 地区
      { wch: 16 }, // 账户
      { wch: 40 }, // 备注
    ];
    XLSX.utils.book_append_sheet(wb, wsRecords, '收支明细');

    // Sheet 2: 理财损益
    const investRows = this.investmentData
      .sort((a, b) => b.year - a.year || (a.month || 0) - (b.month || 0))
      .map(inv => ({
        '年份': inv.year,
        '月份': inv.month === 0 ? '全年' : inv.month + '月',
        '产品名称': inv.name,
        '币种': inv.type,
        '损益金额': inv.amount,
        '平台': inv.platform || '',
        '备注': inv.remark || '',
      }));
    const wsInvest = XLSX.utils.json_to_sheet(investRows);
    wsInvest['!cols'] = [
      { wch: 8 },  // 年份
      { wch: 8 },  // 月份
      { wch: 24 }, // 产品名称
      { wch: 6 },  // 币种
      { wch: 14 }, // 损益金额
      { wch: 16 }, // 平台
      { wch: 30 }, // 备注
    ];
    XLSX.utils.book_append_sheet(wb, wsInvest, '理财损益');

    // Sheet 3: 账户汇总
    const accountRows = ACCOUNTS.map(a => {
      const cur = CURRENCIES.find(c => c.id === a.currency) || CURRENCIES[0];
      const bal = this.accountBalances[a.id] !== undefined ? Number(this.accountBalances[a.id]) : 0;
      return {
        '账户': a.name,
        '币种': cur.name,
        '余额': bal,
      };
    });
    const wsAccounts = XLSX.utils.json_to_sheet(accountRows);
    wsAccounts['!cols'] = [
      { wch: 20 }, // 账户
      { wch: 8 },  // 币种
      { wch: 14 }, // 余额
    ];
    XLSX.utils.book_append_sheet(wb, wsAccounts, '账户汇总');

    // 导出
    const fileName = `家庭记账本_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    this.toast('Excel已导出');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.records) {
          this.records = data.records;
          if (data.investmentData) this.investmentData = data.investmentData;
          if (data.debtItems) this.debtItems = data.debtItems;
          if (data.accountBalances) this.accountBalances = data.accountBalances;
          if (data.exchangeRates) this.exchangeRates = data.exchangeRates;
          if (data.customCategories) this.customCategories = data.customCategories;
          this.saveData();
          this.updateDashboard();
          this.toast('数据导入成功！');
        } else {
          this.toast('数据格式不正确');
        }
      } catch {
        this.toast('文件解析失败');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
}

// ==================== 启动 ====================
const app = new FamilyLedger();

// 加载汇率
try {
  const savedRates = JSON.parse(localStorage.getItem('fl_rates'));
  if (savedRates) app.exchangeRates = savedRates;
} catch {}
