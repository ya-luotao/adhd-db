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

> ADHD藥物資料庫 - 包含多地區監管資料

ADHD-DB是一個綜合性的開源ADHD藥物資料庫，涵蓋多個地區（${regions.join('、')}）的監管資訊。資料庫包括藥物資訊、旅行規則、交互作用和臨床資料。

## 快速連結

- [藥物列表](/zh-TW/data/drugs): 瀏覽所有藥物
- [藥物分類](/zh-TW/data/categories): 藥物分類和類別
- [資料結構](/zh-TW/schema): 藥物資料的YAML結構
- [API文件](/api-docs): REST API參考
- [完整資料庫匯出](/llms-full.txt): 純文字格式的完整資料庫

## 資料庫統計

- 藥物總數: ${drugs.length}
- 興奮劑類: ${stimulants.length}
- 非興奮劑類: ${nonStimulants.length}
- 覆蓋地區: ${regions.length} (${regions.join('、')})
- 分類數: ${categories.length}

## 藥物類別

### 興奮劑類
${stimulants.map(d => `- ${getLocalizedValue(d.genericName, 'zh-TW')} (${d.id})`).join('\n')}

### 非興奮劑類
${nonStimulants.map(d => `- ${getLocalizedValue(d.genericName, 'zh-TW')} (${d.id})`).join('\n')}

## 每種藥物的可用資料

每個藥物條目包含:
- 通用名和商品名（按地區）
- 藥物類別和分類
- 管制藥品狀態和等級
- 作用機制
- 可用劑型和劑量
- 副作用（常見、不常見、嚴重）
- 藥物交互作用
- 禁忌症和警告
- 各地區審批狀態
- 旅行規則和跨境規定
- FDA資料和不良事件報告
- 臨床試驗資訊

## API存取

REST API可透過 \`/api/v1/\` 存取:
- \`GET /api/v1/drugs\` - 取得所有藥物
- \`GET /api/v1/drugs/{id}\` - 按ID取得藥物
- \`GET /api/v1/categories\` - 取得分類列表
- \`GET /api/v1/interactions/check\` - 檢查藥物交互作用

查詢參數:
- \`?lang=en|zh|zh-TW|ja\` - 語言（預設: en）
- \`?class=stimulant|non-stimulant\` - 按類別篩選
- \`?category={category}\` - 按分類篩選
- \`?region={region}\` - 按地區可用性篩選

## 國際化

支援4種語言:
- English (預設): /
- 简体中文: /zh/
- 繁體中文: /zh-TW/
- 日本語: /ja/

## 工具

- [地區檢查器](/zh-TW/tools/region-checker): 檢查藥物在不同地區的合法性
- [交互作用檢查器](/zh-TW/tools/interactions): 檢查藥物交互作用
- [濃度模擬器](/zh-TW/tools/concentration): 藥物濃度時間線

## 資料來源

- FDA（美國食品藥品監督管理局）
- OpenFDA不良事件報告
- RxNorm（NLM藥物命名標準）
- ClinicalTrials.gov
- 各地區監管機構

## 授權

開源資料庫。資料僅供參考，不應用於醫療建議。

## 聯絡方式

- 網站: https://adhd-db.com
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
