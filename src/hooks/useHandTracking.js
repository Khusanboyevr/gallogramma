import { useEffect, useRef, useState } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { detectGesture, detectMultiHandGesture } from '../utils/gestureLogic';

export const useHandTracking = (shouldStart) => {
    const [detector, setDetector] = useState(null);
    const [handsData, setHandsData] = useState([]);
    const [gesture, setGesture] = useState('NONE');
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const requestRef = useRef();

    useEffect(() => {
        if (!shouldStart) return;

        let active = true;
        const initDetector = async () => {
            try {
                const model = handPoseDetection.SupportedModels.MediaPipeHands;
                const detectorConfig = {
                    runtime: 'tfjs',
                    modelType: 'full',
                    maxHands: 2,
                };
                const newDetector = await handPoseDetection.createDetector(model, detectorConfig);
                if (active) setDetector(newDetector);
            } catch (err) {
                console.error('Detector Error:', err);
                if (active) setError('Kamerani aniqlashda xatolik yuz berdi');
            }
        };

        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                });
                if (videoRef.current && active) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => videoRef.current.play();
                }
            } catch (err) {
                if (active) setError('Kameraga ruxsat berilmadi');
            }
        };

        initDetector();
        setupCamera();
        return () => { active = false; if (detector) detector.dispose(); };
    }, [shouldStart]);

    const detect = async () => {
        if (detector && videoRef.current && videoRef.current.readyState === 4) {
            try {
                const hands = await detector.estimateHands(videoRef.current, { flipHorizontal: true });
                if (hands.length > 0) {
                    setHandsData(hands.map(h => h.keypoints));
                    if (hands.length === 2) {
                        const multi = detectMultiHandGesture(hands);
                        if (multi !== 'NONE') setGesture(multi);
                        else setGesture(detectGesture(hands[0].keypoints));
                    } else {
                        setGesture(detectGesture(hands[0].keypoints));
                    }
                } else {
                    setHandsData([]);
                    setGesture('NONE');
                }
            } catch (err) { console.error(err); }
        }
        requestRef.current = requestAnimationFrame(detect);
    };

    useEffect(() => {
        if (detector) requestRef.current = requestAnimationFrame(detect);
        return () => cancelAnimationFrame(requestRef.current);
    }, [detector]);

    return { videoRef, handsData, gesture, error };
};
