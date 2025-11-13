import {
  PoseLandmarker,
  FilesetResolver,
  PoseLandmarkerResult
} from '@mediapipe/tasks-vision';
import { drawConnectors, drawLandmarks, POSE_CONNECTIONS } from './drawingUtils';

let poseLandmarker: PoseLandmarker | null = null;

/**
 * Pose Landmarkerの初期化
 */
export async function initializePoseLandmarker(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
}

/**
 * 姿勢検出の実行
 */
export function detectPose(
  video: HTMLVideoElement,
  timestamp: number
): PoseLandmarkerResult | null {
  if (!poseLandmarker) {
    throw new Error('Pose Landmarker is not initialized');
  }

  return poseLandmarker.detectForVideo(video, timestamp);
}

/**
 * キャンバスに姿勢のランドマークを描画
 */
export function drawPoseLandmarks(
  ctx: CanvasRenderingContext2D,
  result: PoseLandmarkerResult
) {
  if (result.landmarks.length === 0) return;

  const landmarks = result.landmarks[0];

  // 接続線を描画
  drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
    color: '#00FF00',
    lineWidth: 2
  });

  // ランドマークポイントを描画
  drawLandmarks(ctx, landmarks, {
    color: '#FF0000',
    radius: 4
  });
}
