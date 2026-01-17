const getPos = (kp) => {
    if (!kp) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(kp)) return { x: kp[0], y: kp[1], z: kp[2] || 0 };
    return { x: kp.x, y: kp.y, z: kp.z || 0 };
};

const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

export const detectGesture = (landmarks) => {
    if (!landmarks || landmarks.length < 21) return 'NONE';

    const wrist = getPos(landmarks[0]);
    const indexBase = getPos(landmarks[5]);
    const middleBase = getPos(landmarks[9]);

    // Hand size reference (distance between wrist and middle finger base)
    const handScale = dist(wrist, middleBase);

    // Standard Finger Extensions
    const isExtended = (tipIdx, midIdx) => {
        const tip = getPos(landmarks[tipIdx]);
        const mid = getPos(landmarks[midIdx]);
        // Distance from wrist or relative to hand scale
        return dist(tip, wrist) > dist(mid, wrist) * 1.1;
    };

    const indexExtended = isExtended(8, 6);
    const middleExtended = isExtended(12, 10);
    const ringExtended = isExtended(16, 14);
    const pinkyExtended = isExtended(20, 18);

    // Thumb: More robust check relative to hand scale
    const thumbTip = getPos(landmarks[4]);
    // Thumb is extended if it's far from the index base relative to hand scale
    const thumbExtended = dist(thumbTip, indexBase) > handScale * 0.45;

    let fingerCount = 0;
    if (thumbExtended) fingerCount++;
    if (indexExtended) fingerCount++;
    if (middleExtended) fingerCount++;
    if (ringExtended) fingerCount++;
    if (pinkyExtended) fingerCount++;

    // Pinch: Special gesture
    const thumbIndexDist = dist(thumbTip, getPos(landmarks[8]));
    if (thumbIndexDist < handScale * 0.2) return 'PINCH';

    // Map counts to strings
    return String(fingerCount);
};

export const detectMultiHandGesture = (hands) => {
    if (!hands || hands.length < 2) return 'NONE';
    const h1 = hands[0].keypoints;
    const h2 = hands[1].keypoints;
    const thumbDist = dist(getPos(h1[4]), getPos(h2[4]));
    const indexDist = dist(getPos(h1[8]), getPos(h2[8]));
    if (thumbDist < 100 && indexDist < 100) return 'HEART';
    return 'NONE';
};
