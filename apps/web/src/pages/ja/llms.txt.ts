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

> ADHDデータベース - 多地域の規制データを含む

ADHD-DBは、複数の地域（${regions.join('、')}）の規制情報を含む包括的なオープンソースADHD薬データベースです。薬物情報、旅行規則、相互作用、臨床データを含みます。

## クイックリンク

- [薬物一覧](/ja/data/drugs): すべての薬物を閲覧
- [カテゴリ](/ja/data/categories): 薬物カテゴリと分類
- [スキーマ](/ja/schema): 薬物データのYAMLスキーマ
- [APIドキュメント](/api-docs): REST APIリファレンス
- [完全データベースエクスポート](/llms-full.txt): プレーンテキスト形式の完全データベース

## データベース統計

- 薬物総数: ${drugs.length}
- 中枢刺激薬: ${stimulants.length}
- 非中枢刺激薬: ${nonStimulants.length}
- 対象地域: ${regions.length} (${regions.join('、')})
- カテゴリ数: ${categories.length}

## 薬物クラス

### 中枢刺激薬
${stimulants.map(d => `- ${getLocalizedValue(d.genericName, 'ja')} (${d.id})`).join('\n')}

### 非中枢刺激薬
${nonStimulants.map(d => `- ${getLocalizedValue(d.genericName, 'ja')} (${d.id})`).join('\n')}

## 各薬物の利用可能データ

各薬物エントリには以下が含まれます:
- 一般名と商品名（地域別）
- 薬物クラスとカテゴリ
- 規制物質の状態とスケジュール
- 作用機序
- 利用可能な剤形と用量
- 副作用（一般的、まれ、重篤）
- 薬物相互作用
- 禁忌と警告
- 地域別承認状況
- 旅行規則と国境規制
- FDAデータと有害事象報告
- 臨床試験情報

## APIアクセス

REST APIは \`/api/v1/\` で利用可能:
- \`GET /api/v1/drugs\` - すべての薬物を取得
- \`GET /api/v1/drugs/{id}\` - IDで薬物を取得
- \`GET /api/v1/categories\` - カテゴリ一覧
- \`GET /api/v1/interactions/check\` - 薬物相互作用をチェック

クエリパラメータ:
- \`?lang=en|zh|zh-TW|ja\` - 言語（デフォルト: en）
- \`?class=stimulant|non-stimulant\` - クラスでフィルタ
- \`?category={category}\` - カテゴリでフィルタ
- \`?region={region}\` - 地域での入手可能性でフィルタ

## 国際化

4言語で利用可能:
- English (デフォルト): /
- 简体中文: /zh/
- 繁體中文: /zh-TW/
- 日本語: /ja/

## ツール

- [地域チェッカー](/ja/tools/region-checker): 地域間での薬物の合法性を確認
- [相互作用チェッカー](/ja/tools/interactions): 薬物相互作用を確認
- [濃度シミュレーター](/ja/tools/concentration): 薬物濃度タイムライン

## データソース

- FDA（米国食品医薬品局）
- OpenFDA有害事象報告
- RxNorm（NLM薬物命名標準）
- ClinicalTrials.gov
- 各地域の規制機関

## ライセンス

オープンソースデータベース。データは情報提供のみを目的としており、医療アドバイスには使用できません。

## 連絡先

- ウェブサイト: https://adhd-db.com
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
