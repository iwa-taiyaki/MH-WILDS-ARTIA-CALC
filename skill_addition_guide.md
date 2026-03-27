# スキル追加ガイド (MHWilds Damage Simulator)

新しいスキルをシミュレーターに完全対応させるためには、以下の手順で関連ファイルを更新する必要があります。

## 1. スキル定義の追加
**ファイル:** `js/data/skills.js`

`SKILLS` 配列に新しいスキルオブジェクトを追加します。

### 基本構造
```javascript
{
  "id": "new_skill_id",         // 一意のID
  "name": "スキル名",            // UIに表示される名称
  "mainCategory": "armor",      // weapon, armor, series, group
  "subCategory": "attack",      // attack, affinity, element, ammo, utility
  "maxLevel": 3,
  "effects": [
    {
      "level": 1,
      "attackAdd": 5,           // 攻撃力加算
      "affinity": 5             // 会心率加算
    },
    // ... レベル分記述
  ]
}
```

### 自動適用される効果キー
以下のキーを使用すると、`js/calculator.js` で自動的に計算に反映されます。
- `attackAdd`: 攻撃力加算
- `attackMult`: 攻撃力乗算 (0.05 = 1.05倍)
- `affinity`: 会心率加算
- `critMultAdd`: 会心ダメージ補正加算 (0.03 = 1.25 -> 1.28倍)
- `elementAdd`: 属性値加算
- `elementMult`: 属性値乗算
- `elementCritMult`: 属性会心倍率加算

## 2. アイコンの紐付け
**ファイル:** `js/data/skill_icons.js`

`SKILL_ICON_MAP` に、スキルIDとアイコン画像名のマッピングを追加します。
```javascript
"new_skill_id": "attack", // 既存のアイコン名（attack, affinity, element 等）を指定
```

## 3. ダメージ計算スキルの登録
**ファイル:** `js/data/damage_skills.js`

ダメージに影響を与えるスキルの場合、`DAMAGE_RELATED_SKILLS` 配列にスキル名を追記します。
```javascript
"スキル名",
```

## 4. 特殊な計算ロジックの実装（必要な場合のみ）
**ファイル:** `js/calculator.js`

「特定のモーションのみ」「特定の条件（体力・肉質等）でのみ」発動するスキルの場合、`calculateStats` メソッド内に固有の判定ロジックを追記する必要があります。

```javascript
// 例：特定のIDの場合に特殊な判定を行う
if (skillId === 'my_special_skill') {
    if (this.currentMotionName.includes('特定の攻撃')) {
        physicalMultiplier *= (1 + effect.attackMult);
    }
}
```

## 5. 装備・装飾品データへの反映
スキルを実際に使用可能にするために、以下のファイルを更新します。

- **防具:** `js/data/armor.js` の 各部位の `sk: [{ "n": "スキル名", "l": 1 }]` に追加。
- **シリーズ・グループ:** 同ファイル内の `ss` (Series Skill) または `gs` (Group Skill) にスキル名を指定。
- **装飾品:** `js/data/decorations.js` に新しい装飾品データを追加。
- **護石:** `js/data/talisman.js` の適切なスキルグループに追加。

---
### 注意事項
- **名称の完全一致:** `armor.js` や `decorations.js` で指定するスキル名は、`skills.js` の `name` と完全に一致させる必要があります。
- **シリーズスキルのポイント:** 検索エンジン (`asst.js`) では、シリーズスキルは2点/4点で発動、グループスキルは3点固定で発動するロジックになっています。
