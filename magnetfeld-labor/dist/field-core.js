"use strict";
(() => {
    'use strict';
    const rotate = (vx, vy, angle) => {
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        return { x: vx * cosine - vy * sine, y: vx * sine + vy * cosine };
    };
    const localToWorld = (object, x, y) => {
        const point = rotate(x, y, object.angle);
        return { x: object.x + point.x, y: object.y + point.y };
    };
    const worldToLocal = (object, x, y) => {
        return rotate(x - object.x, y - object.y, -object.angle);
    };
    const fieldFromSources = (x, y, sources, skipCell = null) => {
        let bx = 0;
        let by = 0;
        for (const source of sources) {
            if (skipCell && source.cell === skipCell)
                continue;
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
    const directionDegrees = (field, epsilon = 1e-6) => {
        if (!Number.isFinite(field.mag) || field.mag < epsilon)
            return null;
        return (Math.atan2(field.y, field.x) * 180 / Math.PI + 360) % 360;
    };
    const core = { rotate, localToWorld, worldToLocal, fieldFromSources, directionDegrees };
    globalThis.MagnetFieldCore = Object.freeze(core);
})();
