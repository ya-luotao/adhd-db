export const languages = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
} as const;

export const defaultLang = 'en' as const;

export type Lang = keyof typeof languages;

export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.schema': 'Schema',
    'nav.meta': 'Meta',
    'nav.data': 'Data',

    // Home page
    'home.title': 'ADHD Database',
    'home.description': 'A comprehensive database of ADHD-related information with multi-region data.',
    'home.schema.title': 'Schema',
    'home.schema.desc': 'YAML schema template for drug entries',
    'home.schema.link': 'View Schema',
    'home.meta.title': 'Meta',
    'home.meta.desc': 'Region definitions and drug categories',
    'home.meta.link': 'View Meta',
    'home.data.title': 'Data',
    'home.data.link': 'Browse Data',
    'home.stats': 'Quick Stats',
    'home.totalDrugs': 'Total Drugs',
    'home.stimulants': 'Stimulants',
    'home.nonStimulants': 'Non-Stimulants',
    'home.allDrugs': 'All Drugs',
    'home.entries': 'entries across',
    'home.types': 'types',
    'home.toolsPromo': 'Check medication travel rules between countries with our',
    'home.toolsPromoLink': 'Region Checker Tool',

    // Table headers
    'table.drug': 'Drug',
    'table.class': 'Class',
    'table.region': 'Region',
    'table.agency': 'Agency',
    'table.year': 'Year',
    'table.ages': 'Ages',
    'table.available': 'Available',
    'table.notes': 'Notes',

    // Schema page
    'schema.title': 'Drug Schema',
    'schema.description': 'YAML template for adding new drug entries to the database. Copy this template and fill in the fields.',

    // Meta page
    'meta.title': 'Metadata',
    'meta.description': 'Region definitions and drug categories used throughout the database.',
    'meta.regions': 'Regions',
    'meta.drugCategories': 'Drug Categories',

    // Data page
    'data.title': 'Data',
    'data.description': 'Browse all data in the ADHD database.',
    'data.entries': 'entries',
    'data.noData': 'No data available yet.',

    // Drugs page
    'drugs.title': 'Drugs',
    'drugs.description': 'ADHD medications in the database.',
    'drugs.stimulants': 'Stimulants',
    'drugs.nonStimulants': 'Non-Stimulants',
    'drugs.backToList': 'Back to Drugs',
    'drugs.brandNames': 'Brand Names',
    'drugs.mechanism': 'Mechanism',
    'drugs.affects': 'Affects',
    'drugs.approvals': 'Approvals by Region',
    'drugs.forms': 'Dosage Forms',
    'drugs.sideEffects': 'Side Effects',
    'drugs.common': 'Common (>10%)',
    'drugs.serious': 'Serious',
    'drugs.rawYaml': 'Raw YAML',
    'drugs.showRaw': 'Show raw YAML data',

    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.type': 'Type',
    'common.strengths': 'Strengths',
    'common.duration': 'Duration',
    'common.hours': 'hours',
    'common.controlled': 'controlled',

    // Disclaimer
    'disclaimer': 'For informational purposes only. Not medical advice. Consult a healthcare professional.',

    // Footer
    'footer.maintainedBy': 'Maintained by',
    'footer.contributions': 'Contributions welcome on',

    // Filters
    'filter.all': 'All',
    'filter.class': 'Class',
    'filter.region': 'Region',
    'filter.search': 'Search drugs...',

    // Travel info
    'travel.title': 'Travel Information',
    'travel.generalAdvice': 'General Travel Advice',
    'travel.requiredDocs': 'Required Documentation',
    'travel.specificRules': 'Region-Specific Rules',
    'travel.maxSupply': 'Maximum Supply',
    'travel.useChecker': 'Use Region Checker Tool',
    'travel.status.allowed': 'Allowed',
    'travel.status.restricted': 'Restricted',
    'travel.status.prohibited': 'Prohibited',
    'travel.status.requires_permit': 'Requires Import Permit',
    'travel.from': 'From',
    'travel.to': 'To',
    'travel.requirements': 'Requirements',
    'travel.sources': 'Sources',
    'travel.inferred': 'This status is inferred from general rules. Verify with official sources.',

    // Region checker tool
    'nav.tools': 'Tools',
    'tools.regionChecker.title': 'Region-to-Region Legality Checker',
    'tools.regionChecker.description': 'Check medication travel rules and availability between different countries/regions.',
    'tools.regionChecker.selectDrug': 'Select Medication',
    'tools.regionChecker.chooseDrug': 'Choose a medication...',
    'tools.regionChecker.fromRegion': 'Traveling From',
    'tools.regionChecker.toRegion': 'Traveling To',
    'tools.regionChecker.chooseRegion': 'Choose a region...',
    'tools.regionChecker.check': 'Check Legality',
    'tools.regionChecker.results.title': 'Results',
    'tools.regionChecker.results.travelStatus': 'Travel Status',
    'tools.regionChecker.results.availability': 'Availability',
    'tools.regionChecker.results.availableInDest': 'Available in destination',
    'tools.regionChecker.results.notAvailableInDest': 'Not available in destination',
    'tools.regionChecker.results.brandNames': 'Brand Names in Destination',
    'tools.regionChecker.results.schedule': 'Schedule in Destination',
    'tools.regionChecker.disclaimer.title': 'Disclaimer',
    'tools.regionChecker.disclaimer.text': 'This information is for reference only and may not be current. Always verify travel requirements with official government sources and consult with your healthcare provider before international travel with medications.',
  },

  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.schema': '模式',
    'nav.meta': '元数据',
    'nav.data': '数据',

    // Home page
    'home.title': 'ADHD 数据库',
    'home.description': '一个全面的 ADHD 相关信息数据库，包含多地区数据。',
    'home.schema.title': '模式',
    'home.schema.desc': '药物条目的 YAML 模式模板',
    'home.schema.link': '查看模式',
    'home.meta.title': '元数据',
    'home.meta.desc': '地区定义和药物分类',
    'home.meta.link': '查看元数据',
    'home.data.title': '数据',
    'home.data.link': '浏览数据',
    'home.stats': '统计概览',
    'home.totalDrugs': '药物总数',
    'home.stimulants': '兴奋剂类',
    'home.nonStimulants': '非兴奋剂类',
    'home.allDrugs': '所有药物',
    'home.entries': '条目，跨越',
    'home.types': '个类型',
    'home.toolsPromo': '使用我们的工具查询不同国家间的药物携带规定',
    'home.toolsPromoLink': '地区检查工具',

    // Table headers
    'table.drug': '药物',
    'table.class': '分类',
    'table.region': '地区',
    'table.agency': '机构',
    'table.year': '年份',
    'table.ages': '年龄',
    'table.available': '可用',
    'table.notes': '备注',

    // Schema page
    'schema.title': '药物模式',
    'schema.description': '用于添加新药物条目的 YAML 模板。复制此模板并填写字段。',

    // Meta page
    'meta.title': '元数据',
    'meta.description': '数据库中使用的地区定义和药物分类。',
    'meta.regions': '地区',
    'meta.drugCategories': '药物分类',

    // Data page
    'data.title': '数据',
    'data.description': '浏览 ADHD 数据库中的所有数据。',
    'data.entries': '条目',
    'data.noData': '暂无数据。',

    // Drugs page
    'drugs.title': '药物',
    'drugs.description': '数据库中的 ADHD 药物。',
    'drugs.stimulants': '兴奋剂类',
    'drugs.nonStimulants': '非兴奋剂类',
    'drugs.backToList': '返回药物列表',
    'drugs.brandNames': '品牌名称',
    'drugs.mechanism': '作用机制',
    'drugs.affects': '影响',
    'drugs.approvals': '各地区批准情况',
    'drugs.forms': '剂型',
    'drugs.sideEffects': '副作用',
    'drugs.common': '常见 (>10%)',
    'drugs.serious': '严重',
    'drugs.rawYaml': '原始 YAML',
    'drugs.showRaw': '显示原始 YAML 数据',

    // Common
    'common.yes': '是',
    'common.no': '否',
    'common.type': '类型',
    'common.strengths': '规格',
    'common.duration': '持续时间',
    'common.hours': '小时',
    'common.controlled': '管制药品',

    // Disclaimer
    'disclaimer': '仅供参考，非医疗建议。请咨询医疗专业人员。',

    // Footer
    'footer.maintainedBy': '维护者',
    'footer.contributions': '欢迎贡献',

    // Filters
    'filter.all': '全部',
    'filter.class': '分类',
    'filter.region': '地区',
    'filter.search': '搜索药物...',

    // Travel info
    'travel.title': '旅行信息',
    'travel.generalAdvice': '旅行建议',
    'travel.requiredDocs': '所需文件',
    'travel.specificRules': '特定地区规则',
    'travel.maxSupply': '最大携带量',
    'travel.useChecker': '使用地区检查工具',
    'travel.status.allowed': '允许',
    'travel.status.restricted': '受限',
    'travel.status.prohibited': '禁止',
    'travel.status.requires_permit': '需要进口许可',
    'travel.from': '从',
    'travel.to': '到',
    'travel.requirements': '要求',
    'travel.sources': '来源',
    'travel.inferred': '此状态根据一般规则推断。请与官方来源核实。',

    // Region checker tool
    'nav.tools': '工具',
    'tools.regionChecker.title': '地区间合法性检查',
    'tools.regionChecker.description': '检查不同国家/地区之间的药物旅行规则和可用性。',
    'tools.regionChecker.selectDrug': '选择药物',
    'tools.regionChecker.chooseDrug': '选择药物...',
    'tools.regionChecker.fromRegion': '出发地',
    'tools.regionChecker.toRegion': '目的地',
    'tools.regionChecker.chooseRegion': '选择地区...',
    'tools.regionChecker.check': '检查合法性',
    'tools.regionChecker.results.title': '结果',
    'tools.regionChecker.results.travelStatus': '旅行状态',
    'tools.regionChecker.results.availability': '可用性',
    'tools.regionChecker.results.availableInDest': '目的地可用',
    'tools.regionChecker.results.notAvailableInDest': '目的地不可用',
    'tools.regionChecker.results.brandNames': '目的地品牌名',
    'tools.regionChecker.results.schedule': '目的地管制级别',
    'tools.regionChecker.disclaimer.title': '免责声明',
    'tools.regionChecker.disclaimer.text': '此信息仅供参考，可能不是最新的。携带药物出国旅行前，请务必向官方政府来源核实旅行要求，并咨询您的医疗保健提供者。',
  },

  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.schema': 'スキーマ',
    'nav.meta': 'メタ',
    'nav.data': 'データ',

    // Home page
    'home.title': 'ADHD データベース',
    'home.description': '多地域データを含む ADHD 関連情報の包括的なデータベース。',
    'home.schema.title': 'スキーマ',
    'home.schema.desc': '薬物エントリの YAML スキーマテンプレート',
    'home.schema.link': 'スキーマを見る',
    'home.meta.title': 'メタ',
    'home.meta.desc': '地域定義と薬物カテゴリ',
    'home.meta.link': 'メタを見る',
    'home.data.title': 'データ',
    'home.data.link': 'データを見る',
    'home.stats': '統計',
    'home.totalDrugs': '薬物総数',
    'home.stimulants': '中枢刺激薬',
    'home.nonStimulants': '非中枢刺激薬',
    'home.allDrugs': 'すべての薬物',
    'home.entries': 'エントリ、',
    'home.types': 'タイプ',
    'home.toolsPromo': '各国間の薬物携帯ルールを確認できます',
    'home.toolsPromoLink': '地域チェッカーツール',

    // Table headers
    'table.drug': '薬物',
    'table.class': '分類',
    'table.region': '地域',
    'table.agency': '機関',
    'table.year': '年',
    'table.ages': '年齢',
    'table.available': '利用可能',
    'table.notes': '備考',

    // Schema page
    'schema.title': '薬物スキーマ',
    'schema.description': '新しい薬物エントリを追加するための YAML テンプレート。このテンプレートをコピーしてフィールドを入力してください。',

    // Meta page
    'meta.title': 'メタデータ',
    'meta.description': 'データベース全体で使用される地域定義と薬物カテゴリ。',
    'meta.regions': '地域',
    'meta.drugCategories': '薬物カテゴリ',

    // Data page
    'data.title': 'データ',
    'data.description': 'ADHD データベースのすべてのデータを閲覧。',
    'data.entries': 'エントリ',
    'data.noData': 'データはまだありません。',

    // Drugs page
    'drugs.title': '薬物',
    'drugs.description': 'データベース内の ADHD 薬物。',
    'drugs.stimulants': '中枢刺激薬',
    'drugs.nonStimulants': '非中枢刺激薬',
    'drugs.backToList': '薬物一覧に戻る',
    'drugs.brandNames': '商品名',
    'drugs.mechanism': '作用機序',
    'drugs.affects': '影響',
    'drugs.approvals': '地域別承認状況',
    'drugs.forms': '剤形',
    'drugs.sideEffects': '副作用',
    'drugs.common': '一般的 (>10%)',
    'drugs.serious': '重篤',
    'drugs.rawYaml': '生の YAML',
    'drugs.showRaw': '生の YAML データを表示',

    // Common
    'common.yes': 'はい',
    'common.no': 'いいえ',
    'common.type': 'タイプ',
    'common.strengths': '規格',
    'common.duration': '持続時間',
    'common.hours': '時間',
    'common.controlled': '規制薬物',

    // Disclaimer
    'disclaimer': '情報提供のみを目的としています。医療アドバイスではありません。医療専門家にご相談ください。',

    // Footer
    'footer.maintainedBy': '管理者',
    'footer.contributions': '貢献歓迎',

    // Filters
    'filter.all': 'すべて',
    'filter.class': '分類',
    'filter.region': '地域',
    'filter.search': '薬物を検索...',

    // Travel info
    'travel.title': '旅行情報',
    'travel.generalAdvice': '旅行アドバイス',
    'travel.requiredDocs': '必要書類',
    'travel.specificRules': '地域別ルール',
    'travel.maxSupply': '最大携帯量',
    'travel.useChecker': '地域チェッカーを使用',
    'travel.status.allowed': '許可',
    'travel.status.restricted': '制限あり',
    'travel.status.prohibited': '禁止',
    'travel.status.requires_permit': '輸入許可が必要',
    'travel.from': '出発地',
    'travel.to': '目的地',
    'travel.requirements': '要件',
    'travel.sources': '出典',
    'travel.inferred': 'このステータスは一般的なルールから推定されています。公式情報源でご確認ください。',

    // Region checker tool
    'nav.tools': 'ツール',
    'tools.regionChecker.title': '地域間合法性チェッカー',
    'tools.regionChecker.description': '異なる国/地域間の薬物旅行ルールと入手可能性を確認します。',
    'tools.regionChecker.selectDrug': '薬物を選択',
    'tools.regionChecker.chooseDrug': '薬物を選択...',
    'tools.regionChecker.fromRegion': '出発地',
    'tools.regionChecker.toRegion': '目的地',
    'tools.regionChecker.chooseRegion': '地域を選択...',
    'tools.regionChecker.check': '合法性を確認',
    'tools.regionChecker.results.title': '結果',
    'tools.regionChecker.results.travelStatus': '旅行ステータス',
    'tools.regionChecker.results.availability': '入手可能性',
    'tools.regionChecker.results.availableInDest': '目的地で入手可能',
    'tools.regionChecker.results.notAvailableInDest': '目的地で入手不可',
    'tools.regionChecker.results.brandNames': '目的地での商品名',
    'tools.regionChecker.results.schedule': '目的地での規制区分',
    'tools.regionChecker.disclaimer.title': '免責事項',
    'tools.regionChecker.disclaimer.text': 'この情報は参考用であり、最新でない場合があります。薬物を携帯しての海外旅行の前に、必ず公式の政府情報源で旅行要件を確認し、医療提供者にご相談ください。',
  },
} as const;
