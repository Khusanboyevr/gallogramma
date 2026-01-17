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

    // Thumb is special (horizontal check usually better)
    const thumbTip = getPos(landmarks[4]);
    const thumbBase = getPos(landmarks[2]);
    const thumbExtended = Math.abs(thumbTip.x - thumbBase.x) > 40;

    const indexExtended = isFingerExtended(8, 5);
    const middleExtended = isFingerExtended(12, 9);
    const ringExtended = isFingerExtended(16, 13);
    const pinkyExtended = isFingerExtended(20, 17);

    // Count fingers
    let fingerCount = 0;
    if (thumbExtended) fingerCount++;
    if (indexExtended) fingerCount++;
    if (middleExtended) fingerCount++;
    if (ringExtended) fingerCount++;
    if (pinkyExtended) fingerCount++;

    // Pinch detection (Index tip vs Thumb tip)
    const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    const thumbIndexDist = dist(thumbTip, getPos(landmarks[8]));
    if (thumbIndexDist < 30) return 'PINCH';

    // Heart (Legacy or specific check if needed, but we follow the 0-5 rule mostly now)
    // For now, let's return finger counts as strings for the component
    if (fingerCount === 0) return '0';
    if (fingerCount === 1) return '1';
    if (fingerCount === 2) return '2';
    if (fingerCount === 3) return '3';
    if (fingerCount === 4) return '4';
    if (fingerCount === 5) return '5';

    return 'NONE';
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
