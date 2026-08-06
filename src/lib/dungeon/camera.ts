import * as THREE from "three";
import type { Settings, Pt } from "./model";

/**
 * Projects a 3D point (world space) to 2D screen space (pixels)
 * using the camera settings and the current canvas size.
 */
export function getCamera(s: Settings, width: number, height: number): THREE.Camera {
  const camera = s.cameraProjection === "perspective" 
    ? new THREE.PerspectiveCamera(s.cameraFov, width / height, 1, s.maxDrawDistance)
    : new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, s.maxDrawDistance);

  const yaw = THREE.MathUtils.degToRad(s.cameraYaw);
  const pitch = THREE.MathUtils.degToRad(s.cameraPitch);
  
  const pos = new THREE.Vector3();
  pos.x = s.cameraTarget.x + s.cameraDistance * Math.cos(pitch) * Math.cos(yaw);
  pos.y = s.cameraTarget.y + s.cameraDistance * Math.cos(pitch) * Math.sin(yaw);
  pos.z = s.cameraDistance * Math.sin(pitch);

  camera.position.copy(pos);
  camera.lookAt(s.cameraTarget.x, s.cameraTarget.y, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  return camera;
}

export function project3D(
  p: { x: number; y: number; z: number },
  s: Settings,
  width: number,
  height: number
): { x: number; y: number; z: number } | null {
  const camera = getCamera(s, width, height);
  const vector = new THREE.Vector3(p.x, p.y, p.z);
  vector.project(camera);

  const x = (vector.x + 1) * width / 2;
  const y = (-vector.y + 1) * height / 2;

  if (vector.z < 0 || vector.z > 1) return null;
  return { x, y, z: vector.z };
}

/**
 * Unprojects a screen point back to the z=0 world plane.
 */
export function unprojectToPlane(
  screen: Pt,
  s: Settings,
  width: number,
  height: number
): Pt {
  const camera = getCamera(s, width, height);
  
  // Normalized device coordinates
  const ndc = new THREE.Vector3(
    (screen.x / width) * 2 - 1,
    -(screen.y / height) * 2 + 1,
    0.5
  );

  const raycaster = new THREE.Raycaster();
  (raycaster as any).setFromCamera(ndc, camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const target = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, target);

  return { x: target.x, y: target.y };
}

export function drawAxisGuides(
  ctx: CanvasRenderingContext2D,
  s: Settings,
  w: number,
  h: number
) {
  if (!s.cameraMode || !s.showWorldAxes) return;

  const origin = project3D({ x: 0, y: 0, z: 0 }, s, w, h);
  if (!origin) return;

  const len = 100; // axis length in world units
  const xAxis = project3D({ x: len, y: 0, z: 0 }, s, w, h);
  const yAxis = project3D({ x: 0, y: len, z: 0 }, s, w, h);
  const zAxis = project3D({ x: 0, y: 0, z: len }, s, w, h);

  ctx.save();
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  // X - Red
  if (xAxis) {
    ctx.strokeStyle = "#ff4d4d";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xAxis.x, xAxis.y);
    ctx.stroke();
  }

  // Y - Green
  if (yAxis) {
    ctx.strokeStyle = "#4dff4d";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yAxis.x, yAxis.y);
    ctx.stroke();
  }

  // Z - Blue
  if (zAxis) {
    ctx.strokeStyle = "#4d4dff";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zAxis.x, zAxis.y);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawCornerAxisWidget(
  ctx: CanvasRenderingContext2D,
  s: Settings,
  w: number,
  h: number
) {
  if (!s.cameraMode || !s.showAxes) return;

  const widgetSize = 80;
  const padding = 20;
  const centerX = w - widgetSize / 2 - padding;
  const centerY = widgetSize / 2 + padding;

  // Use a small local projection for the widget
  // We want to project relative to the camera rotation only
  const yaw = THREE.MathUtils.degToRad(s.cameraYaw);
  const pitch = THREE.MathUtils.degToRad(s.cameraPitch);

  const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(pitch - Math.PI/2, 0, -yaw, 'ZXY')
  );

  const project = (v: THREE.Vector3) => {
    v.applyMatrix4(rotationMatrix);
    return {
      x: centerX + v.x * (widgetSize / 2.5),
      y: centerY - v.y * (widgetSize / 2.5),
      z: v.z
    };
  };

  const origin = { x: centerX, y: centerY };
  const xEnd = project(new THREE.Vector3(1, 0, 0));
  const yEnd = project(new THREE.Vector3(0, 1, 0));
  const zEnd = project(new THREE.Vector3(0, 0, 1));

  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  // Background circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, widgetSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.stroke();

  // Draw axes (sort by z-depth for correct layering)
  const axes = [
    { label: "X", color: "#ff4d4d", end: xEnd },
    { label: "Y", color: "#4dff4d", end: yEnd },
    { label: "Z", color: "#4d4dff", end: zEnd }
  ].sort((a, b) => a.end.z - b.end.z);

  for (const axis of axes) {
    ctx.strokeStyle = axis.color;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(axis.end.x, axis.end.y);
    ctx.stroke();

    // Label
    ctx.fillStyle = axis.color;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(axis.label, axis.end.x, axis.end.y);
  }

  ctx.restore();
}
