import { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * キャンバスに接続線を描画する
 */
export function drawConnectors(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  connections: Array<[number, number]>,
  style: { color: string; lineWidth: number }
) {
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;

  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];

    if (startPoint && endPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
      ctx.stroke();
    }
  });
}

/**
 * キャンバスにランドマークを描画する
 */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  style: { color: string; radius: number }
) {
  ctx.fillStyle = style.color;

  landmarks.forEach((landmark) => {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      style.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  });
}

/**
 * Pose用の接続定義
 */
export const POSE_CONNECTIONS: Array<[number, number]> = [
  // 顔
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  // 胴体
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [11, 23], [12, 24], [23, 24],
  // 脚
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
];
