# 姿勢分析
TBD

## 開発
TBD

## その他

### デモ環境と本番環境の検討


MediaPipeには2つのバージョンがあります：
- ブラウザ版：WebGL必須、サーバーサイドでは動作不可
- Python版：サーバーサイドで動作可能、公式サポート

つまり、「画像・動画をアップロードしてサーバーで処理」+「TypeScript必須」の組み合わせは、標準的な方法では実現が困難です。

推奨構成（実用的）

デモ環境（開発用）

Vite + Vanilla TypeScript + MediaPipe
├── Webカメラでリアルタイム処理
├── @mediapipe/pose（全身姿勢）（このパッケージ多分古い）
└── @mediapipe/face_mesh（顔）（このパッケージ多分古い）

本番環境（2つの選択肢）

選択肢A：実用的だが言語が分かれる（推奨）
Cloud Run
├── Python + FastAPI
├── MediaPipe Pythonライブラリ
├── 画像/動画アップロード → 処理 → JSON返却
└── メリット：安定、高速、低コスト

選択肢B：TypeScript統一（コスト・複雑さ増）
Cloud Run
├── TypeScript + Puppeteer + Headless Chrome
├── @mediapipe/pose, @mediapipe/face_mesh（ブラウザ版）（これらのパッケージ多分古い）
└── デメリット：メモリ消費大（2GB〜）、起動遅い、コスト高

