import {
  FaceLandmarker,
  FilesetResolver,
  FaceLandmarkerResult
} from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;

/**
 * Face Landmarkerの初期化
 */
export async function initializeFaceLandmarker(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false
  });
}

/**
 * 顔検出の実行
 */
export function detectFace(
  video: HTMLVideoElement,
  timestamp: number
): FaceLandmarkerResult | null {
  if (!faceLandmarker) {
    throw new Error('Face Landmarker is not initialized');
  }

  return faceLandmarker.detectForVideo(video, timestamp);
}

/**
 * キャンバスに顔のランドマークを描画
 */
export function drawFaceLandmarks(
  ctx: CanvasRenderingContext2D,
  result: FaceLandmarkerResult
) {
  if (result.faceLandmarks.length === 0) return;

  const landmarks = result.faceLandmarks[0];

  // 顔の輪郭を描画
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 1;

  // すべてのランドマークを接続して顔のメッシュを描画
  for (let i = 0; i < landmarks.length - 1; i++) {
    const current = landmarks[i];
    const next = landmarks[i + 1];

    ctx.beginPath();
    ctx.moveTo(current.x * ctx.canvas.width, current.y * ctx.canvas.height);
    ctx.lineTo(next.x * ctx.canvas.width, next.y * ctx.canvas.height);
    ctx.stroke();
  }

  // ランドマークポイントを描画
  ctx.fillStyle = '#FF0000';
  landmarks.forEach((landmark) => {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  });
}
