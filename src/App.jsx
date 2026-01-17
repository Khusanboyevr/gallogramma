import React, { useState } from "react";
import HologramScene from "./components/HologramScene";
import HUD from "./components/HUD";
import { useHandTracking } from "./hooks/useHandTracking";
import CameraCapture from "./components/CameraCapture";
import { detectGender as senseGender } from "./utils/genderSensing";
import NeuralBackground from "./components/NeuralBackground";

function App() {
    const [session, setSession] = useState({ started: false, name: "", gender: "male" });
    const { videoRef, handsData, gesture, error } = useHandTracking(session.started);

    const startSession = (e) => {
        e.preventDefault();
        if (!session.name.trim()) return;
        const detectedGender = senseGender(session.name);
        setSession((prev) => ({ ...prev, started: true, gender: detectedGender }));
    };

    return (
        <div
            className="App"
            style={{
                width: "100vw",
                height: "100vh",
                position: "relative",
                overflow: "hidden",
                background: "#000",
            }}
        >
            {!session.started ? (
                <div
                    className="start-overlay"
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1000,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent", // Changed from gradient to transparent
                        gap: "2rem",
                        padding: "20px",
                        textAlign: "center",
                        fontFamily: "'Courier New', Courier, monospace",
                    }}
                >
                    <NeuralBackground />
                    <div
                        className="glow-text"
                        style={{ position: "relative", zIndex: 1, fontSize: "3rem", fontWeight: "bold", letterSpacing: "4px" }}
                    >
                        HOLOGRAPHIC INTERFACE
                    </div>

                    <form
                        onSubmit={startSession}
                        style={{
                            position: "relative",
                            zIndex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5rem",
                            width: "300px",
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="NEURAL_SIGNATURE (NAME)"
                                autoFocus
                                value={session.name}
                                onChange={(e) =>
                                    setSession((prev) => ({ ...prev, name: e.target.value }))
                                }
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: "rgba(0, 242, 255, 0.05)",
                                    border: "1px solid #00f2ff",
                                    color: "#00f2ff",
                                    textAlign: "center",
                                    fontSize: "1rem",
                                    letterSpacing: "1px",
                                    outline: "none",
                                    boxShadow: "0 0 10px rgba(0, 242, 255, 0.2)",
                                }}
                            />
                            <div
                                style={{
                                    fontSize: "0.5rem",
                                    marginTop: "5px",
                                    color: "#00f2ff",
                                    opacity: 0.5,
                                }}
                            >
                                INPUT NAME TO SYNC NEURAL LINK
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="glass-panel"
                            style={{
                                padding: "15px 40px",
                                fontSize: "1.2rem",
                                color: "#00f2ff",
                                border: "2px solid #00f2ff",
                                cursor: "pointer",
                                background: "transparent",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                pointerEvents: "auto",
                                transition: "all 0.3s ease",
                                boxShadow: "0 0 20px rgba(0, 242, 255, 0.3)",
                            }}
                        >
                            Initialize Link
                        </button>
                    </form>

                    <div
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            fontSize: "0.7rem",
                            color: "#333",
                            zIndex: 1,
                        }}
                    >
                        COMPATIBLE WITH iOS • ANDROID • MAC • PC
                    </div>
                </div>
            ) : (
                <>
                    <CameraCapture />
                    {error && (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                background: "rgba(255, 0, 0, 0.4)",
                                padding: "20px",
                                borderRadius: "10px",
                                color: "white",
                                zIndex: 100,
                                textAlign: "center",
                                backdropFilter: "blur(10px)",
                                border: "1px solid red",
                                fontFamily: "Courier New",
                            }}
                        >
                            <h3 style={{ margin: 0 }}>XATOLIK</h3>
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    background: "red",
                                    border: "none",
                                    color: "white",
                                    padding: "10px 20px",
                                    cursor: "pointer",
                                }}
                            >
                                Qayta yuklash
                            </button>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        style={{
                            position: "absolute",
                            bottom: "30px",
                            right: "30px",
                            width: "200px",
                            height: "150px",
                            zIndex: 5,
                            borderRadius: "12px",
                            border: "2px solid rgba(0, 242, 255, 0.5)",
                            display: "block",
                            objectFit: "cover",
                            opacity: 1, // Full opacity as requested
                            boxShadow: "0 0 15px rgba(0, 242, 255, 0.3)"
                        }}
                    />

                    <HologramScene
                        handsData={handsData}
                        gesture={gesture}
                        userName={session.name}
                        gender={session.gender}
                    />
                    <HUD landmarks={handsData[0]} activeGesture={gesture} />
                </>
            )}
        </div>
    );
}

export default App;
