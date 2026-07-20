# pxt-msp2807

MakeCode extension for controlling an MSP2807 / ILI9341 SPI display with micro:bit.

## 拡張の追加

MakeCode では **Git タグ付きのバージョン** が使われます。`main` ブランチの最新コミットだけでは更新されません。

### 手順

1. [micro:bit MakeCode](https://makecode.microbit.org/) で **新しいプロジェクト** を作成
2. 歯車 → **Extensions**
3. 検索欄に次を入力して追加:

```
https://github.com/Yusk1450/pxt-msp2807#v0.0.3
```

4. **JavaScript** 表示に切り替え、`pxt.json` を開く
5. `dependencies` に次の行があるか確認:

```json
"msp2807": "github:Yusk1450/pxt-msp2807#v0.0.3"
```

`#v0.0.1` のままなら古いバージョンです。上記に書き換えて保存し、ページを再読み込みしてください。

### 追加されたブロック（v0.0.3）

- `RGB 赤 _ 緑 _ 青 _` … 色を作るブロック（`clear screen` の色スロットに接続可）
- `画面を RGB 赤 _ 緑 _ 青 _ で塗りつぶす` … 背景色を RGB で指定
- `メッセージ _ を ... で表示` … 3つのフレーズを切り替え表示

`clear screen color` の **すぐ下** に RGB 背景ブロックが表示されます。メッセージブロックはカテゴリの **一番下** です。

## バージョン更新

拡張を更新したあとは、Extensions から削除して `#v0.0.3` 付き URL で再追加するか、`pxt.json` の `#` 以降を書き換えてください。詳しくは [Extension Versioning](https://makecode.com/extensions/versioning) を参照。
