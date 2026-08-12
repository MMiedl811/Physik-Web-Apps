type Vec2 = Readonly<{ x: number; y: number }>;
type FieldVector = Readonly<{ x: number; y: number; mag: number }>;
type FieldSource = Readonly<{
  x: number;
  y: number;
  soft: number;
  mx?: number;
  my?: number;
  q?: number;
  cell?: string;
}>;
type OrientedObject = Readonly<{ x: number; y: number; angle: number }>;

interface MagnetFieldCore {
  rotate(vx: number, vy: number, angle: number): Vec2;
  localToWorld(object: OrientedObject, x: number, y: number): Vec2;
  worldToLocal(object: OrientedObject, x: number, y: number): Vec2;
  fieldFromSources(x: number, y: number, sources: readonly FieldSource[], skipCell?: string | null): FieldVector;
  directionDegrees(field: Pick<FieldVector, 'x' | 'y' | 'mag'>, epsilon?: number): number | null;
}

(() => {
  'use strict';

  const rotate = (vx: number, vy: number, angle: number): Vec2 => {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return { x: vx * cosine - vy * sine, y: vx * sine + vy * cosine };
  };

  const localToWorld = (object: OrientedObject, x: number, y: number): Vec2 => {
    const point = rotate(x, y, object.angle);
    return { x: object.x + point.x, y: object.y + point.y };
  };

  const worldToLocal = (object: OrientedObject, x: number, y: number): Vec2 => {
    return rotate(x - object.x, y - object.y, -object.angle);
  };

  const fieldFromSources = (
    x: number,
    y: number,
    sources: readonly FieldSource[],
    skipCell: string | null = null,
  ): FieldVector => {
    let bx = 0;
    let by = 0;
    for (const source of sources) {
      if (skipCell && source.cell === skipCell) continue;
      const dx = x - source.x;
      const dy = y - source.y;
      const radiusSquared = dx * dx + dy * dy + source.soft * source.soft;
      const inverseRadiusCubed = 1 / (radiusSquared * Math.sqrt(radiusSquared));
      if (Number.isFinite(source.q)) {
        const charge = source.q ?? 0;
        bx += charge * dx * inverseRadiusCubed;
        by += charge * dy * inverseRadiusCubed;
        continue;
      }
      const mx = source.mx ?? 0;
      const my = source.my ?? 0;
      const projection = mx * dx + my * dy;
      const factor = 3 * projection / radiusSquared;
      bx += (factor * dx - mx) * inverseRadiusCubed;
      by += (factor * dy - my) * inverseRadiusCubed;
    }
    return { x: bx, y: by, mag: Math.hypot(bx, by) };
  };

  const directionDegrees = (field: Pick<FieldVector, 'x' | 'y' | 'mag'>, epsilon = 1e-6): number | null => {
    if (!Number.isFinite(field.mag) || field.mag < epsilon) return null;
    return (Math.atan2(field.y, field.x) * 180 / Math.PI + 360) % 360;
  };

  const core: MagnetFieldCore = { rotate, localToWorld, worldToLocal, fieldFromSources, directionDegrees };
  (globalThis as typeof globalThis & { MagnetFieldCore: MagnetFieldCore }).MagnetFieldCore = Object.freeze(core);
})();
