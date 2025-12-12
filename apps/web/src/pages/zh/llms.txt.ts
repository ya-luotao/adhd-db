import type { APIRoute } from 'astro';
import { getDrugs, getRegions, getCategoryList, getLocalizedValue } from '../../lib/data';

export const prerender = true;

export const GET: APIRoute = async () => {
  const drugs = getDrugs();
  const regionsData = getRegions();
  const categories = getCategoryList();

  const regions = Object.keys(regionsData.regions);
  const stimulants = drugs.filter(d => d.drugClass === 'stimulant');
  const nonStimulants = drugs.filter(d => d.drugClass === 'non-stimulant');

  const content = `# ADHD-DB

> ADHD药物数据库 - 包含多地区监管数据

ADHD-DB是一个综合性的开源ADHD药物数据库，涵盖多个地区（${regions.join('、')}）的监管信息。数据库包括药物信息、旅行规则、相互作用和临床数据。

## 快速链接

- [药物列表](/zh/data/drugs): 浏览所有药物
- [药物分类](/zh/data/categories): 药物分类和类别
- [数据模式](/zh/schema): 药物数据的YAML模式
- [API文档](/api-docs): REST API参考
- [完整数据库导出](/llms-full.txt): 纯文本格式的完整数据库

## 数据库统计

- 药物总数: ${drugs.length}
- 兴奋剂类: ${stimulants.length}
- 非兴奋剂类: ${nonStimulants.length}
- 覆盖地区: ${regions.length} (${regions.join('、')})
- 分类数: ${categories.length}

## 药物类别

### 兴奋剂类
${stimulants.map(d => `- ${getLocalizedValue(d.genericName, 'zh')} (${d.id})`).join('\n')}

### 非兴奋剂类
${nonStimulants.map(d => `- ${getLocalizedValue(d.genericName, 'zh')} (${d.id})`).join('\n')}

## 每种药物的可用数据

每个药物条目包含:
- 通用名和商品名（按地区）
- 药物类别和分类
- 管制药品状态和等级
- 作用机制
- 可用剂型和剂量
- 副作用（常见、不常见、严重）
- 药物相互作用
- 禁忌症和警告
- 各地区审批状态
- 旅行规则和跨境规定
- FDA数据和不良事件报告
- 临床试验信息

## API访问

REST API可通过 \`/api/v1/\` 访问:
- \`GET /api/v1/drugs\` - 获取所有药物
- \`GET /api/v1/drugs/{id}\` - 按ID获取药物
- \`GET /api/v1/categories\` - 获取分类列表
- \`GET /api/v1/interactions/check\` - 检查药物相互作用

查询参数:
- \`?lang=en|zh|zh-TW|ja\` - 语言（默认: en）
- \`?class=stimulant|non-stimulant\` - 按类别筛选
- \`?category={category}\` - 按分类筛选
- \`?region={region}\` - 按地区可用性筛选

## 国际化

支持4种语言:
- English (默认): /
- 简体中文: /zh/
- 繁體中文: /zh-TW/
- 日本語: /ja/

## 工具

- [地区检查器](/zh/tools/region-checker): 检查药物在不同地区的合法性
- [相互作用检查器](/zh/tools/interactions): 检查药物相互作用
- [浓度模拟器](/zh/tools/concentration): 药物浓度时间线

## 数据来源

- FDA（美国食品药品监督管理局）
- OpenFDA不良事件报告
- RxNorm（NLM药物命名标准）
- ClinicalTrials.gov
- 各地区监管机构

## 许可

开源数据库。数据仅供参考，不应用于医疗建议。

## 联系方式

- 网站: https://adhd-db.com
- GitHub: https://github.com/ya-luotao/adhd-db
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
