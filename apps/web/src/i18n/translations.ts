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
  },
} as const;
