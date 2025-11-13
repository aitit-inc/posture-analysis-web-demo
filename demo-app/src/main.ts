import {
  initializeFaceLandmarker,
  detectFace,
  drawFaceLandmarks
} from './faceLandmarker';
import {
  initializePoseLandmarker,
  detectPose,
  drawPoseLandmarks
} from './poseLandmarker';

type DetectionMode = 'none' | 'face' | 'pose';

class PostureAnalysisApp {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private statusElement: HTMLElement;
  private startBtn: HTMLButtonElement;
  private faceBtn: HTMLButtonElement;
  private poseBtn: HTMLButtonElement;

  private stream: MediaStream | null = null;
  private mode: DetectionMode = 'none';
  private animationId: number | null = null;
  private lastVideoTime = -1;

  private isFaceInitialized = false;
  private isPoseInitialized = false;

  constructor() {
    this.video = document.getElementById('webcam') as HTMLVideoElement;
    this.canvas = document.getElementById('output-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.statusElement = document.getElementById('status')!;
    this.startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    this.faceBtn = document.getElementById('face-btn') as HTMLButtonElement;
    this.poseBtn = document.getElementById('pose-btn') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.startBtn.addEventListener('click', () => this.startCamera());
    this.faceBtn.addEventListener('click', () => this.setMode('face'));
    this.poseBtn.addEventListener('click', () => this.setMode('pose'));
  }

  private async startCamera() {
    try {
      this.updateStatus('カメラを起動中...', 'loading');
      this.startBtn.disabled = true;

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      // ビデオのメタデータが読み込まれるのを待つ
      await new Promise<void>((resolve) => {
        if (this.video.readyState >= 2) {
          resolve();
        } else {
          this.video.addEventListener('loadedmetadata', () => resolve(), { once: true });
        }
      });

      // キャンバスのサイズを設定
      this.resizeCanvas();

      // リサイズイベントに対応
      window.addEventListener('resize', () => this.resizeCanvas());

      this.faceBtn.disabled = false;
      this.poseBtn.disabled = false;

      this.updateStatus('カメラ起動完了。検出モードを選択してください。');
    } catch (error) {
      console.error('Camera error:', error);
      this.updateStatus('カメラの起動に失敗しました。', 'error');
      this.startBtn.disabled = false;
    }
  }

  private resizeCanvas() {
    // キャンバスの内部解像度をビデオストリームの実解像度に設定
    // これによりMediaPipeの座標系（0-1）とキャンバスの座標系が一致する
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // コンテナの高さをビデオのアスペクト比に合わせて設定
    const container = this.video.parentElement as HTMLElement;
    const containerWidth = container.clientWidth;
    const aspectRatio = this.video.videoHeight / this.video.videoWidth;
    container.style.height = `${containerWidth * aspectRatio}px`;
  }

  private async setMode(newMode: DetectionMode) {
    // 既に同じモードの場合は停止
    if (this.mode === newMode) {
      this.stopDetection();
      return;
    }

    try {
      this.updateStatus(`${newMode === 'face' ? '顔' : '姿勢'}検出を初期化中...`, 'loading');

      // 必要に応じてモデルを初期化
      if (newMode === 'face' && !this.isFaceInitialized) {
        await initializeFaceLandmarker();
        this.isFaceInitialized = true;
      } else if (newMode === 'pose' && !this.isPoseInitialized) {
        await initializePoseLandmarker();
        this.isPoseInitialized = true;
      }

      this.mode = newMode;
      this.updateButtonStates();
      this.startDetection();

      this.updateStatus(`${newMode === 'face' ? '顔' : '姿勢'}検出を実行中...`);
    } catch (error) {
      console.error('Initialization error:', error);
      this.updateStatus('初期化に失敗しました。', 'error');
      this.mode = 'none';
      this.updateButtonStates();
    }
  }

  private startDetection() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    const detect = () => {
      if (this.mode === 'none') return;

      // ビデオの新しいフレームがあるかチェック
      if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;

        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        try {
          const timestamp = performance.now();

          if (this.mode === 'face') {
            const result = detectFace(this.video, timestamp);
            if (result) {
              drawFaceLandmarks(this.ctx, result);
            }
          } else if (this.mode === 'pose') {
            const result = detectPose(this.video, timestamp);
            if (result) {
              drawPoseLandmarks(this.ctx, result);
            }
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }

      this.animationId = requestAnimationFrame(detect);
    };

    detect();
  }

  private stopDetection() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.mode = 'none';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateButtonStates();
    this.updateStatus('検出を停止しました。');
  }

  private updateButtonStates() {
    this.faceBtn.classList.toggle('active', this.mode === 'face');
    this.poseBtn.classList.toggle('active', this.mode === 'pose');
  }

  private updateStatus(message: string, type: 'normal' | 'loading' | 'error' = 'normal') {
    this.statusElement.textContent = message;
    this.statusElement.className = 'status';

    if (type === 'loading') {
      this.statusElement.classList.add('loading');
    } else if (type === 'error') {
      this.statusElement.classList.add('error');
    }
  }
}

// アプリケーションの起動
new PostureAnalysisApp();
