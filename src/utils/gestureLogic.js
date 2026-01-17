/**
 * Helper to get X, Y, Z from a keypoint regardless of format (object or array)
 */
const getPos = (kp) => {
    if (!kp) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(kp)) return { x: kp[0], y: kp[1], z: kp[2] || 0 };
    return { x: kp.x, y: kp.y, z: kp.z || 0 };
};

export const detectGesture = (landmarks) => {
    if (!landmarks) return 'NONE';

    const isFingerExtended = (tipIdx, baseIdx) => {
        const tip = getPos(landmarks[tipIdx]);
        const base = getPos(landmarks[baseIdx]);
        return tip.y < base.y;
    };

    const indexExtended = isFingerExtended(8, 5);
    const middleExtended = isFingerExtended(12, 9);
    const ringExtended = isFingerExtended(16, 13);
    const pinkyExtended = isFingerExtended(20, 17);

    // FIST -> CUBE
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'FIST';
    }
    // PEACE -> PYRAMID
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return 'PEACE';
    }
    // ROCK
    if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
        return 'ROCK';
    }
    // POINTING (One Finger) -> BEAM
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'POINTING';
    }
    // OPEN (Open Palm) -> SPHERE
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return 'OPEN';
    }

    return 'OPEN';
};

export const detectMultiHandGesture = (hands) => {
    if (!hands || hands.length < 2) return 'NONE';

    const h1 = hands[0].keypoints;
    const h2 = hands[1].keypoints;

    const dist = (p1, p2) => {
        const a = getPos(p1);
        const b = getPos(p2);
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    };

    const thumbDist = dist(h1[4], h2[4]);
    const indexDist = dist(h1[8], h2[8]);

    if (thumbDist < 100 && indexDist < 100) {
        return 'HEART';
    }

    return 'NONE';
};
