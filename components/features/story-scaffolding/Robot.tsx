// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RobotState } from '../../../types';
import { PaintBrushIcon } from '../../icons.tsx';

// --- New types for enhanced robot functionality ---
// These are local to Robot.tsx and do not alter the imported RobotState type,
// but provide richer context for internal component behavior.
export type RobotMood = 'happy' | 'sad' | 'neutral' | 'curious' | 'focused' | 'alert' | 'surprised';
export type MessageType = 'speech' | 'thought' | 'alert' | 'system';

// --- Robot Props Interface Extension ---
interface RobotProps {
    robotState: RobotState;
    mousePosition: { x: number; y: number };
    // New props for enhanced functionality
    message?: string; // Message to display in a speech/thought bubble
    messageType?: MessageType; // Type of message bubble
    mood?: RobotMood; // Subtle emotional state
    accentColor?: string; // Custom accent color for robot elements (e.g., eyes, antenna light)
    showProgress?: boolean; // Whether to show a progress indicator for relevant states
    progressValue?: number; // Current progress (0-100)
    onRobotClick?: () => void; // Callback for when the robot is clicked
    debugMode?: boolean; // Toggles visual debugging aids
}

// --- Helper Components & Hooks ---

/**
 * A sophisticated speech/thought bubble component for the robot.
 * It intelligently adapts its appearance based on message type and robot state.
 * @exports RobotSpeechBubble
 */
export const RobotSpeechBubble: React.FC<{
    message: string;
    type?: MessageType;
    isVisible: boolean;
    className?: string;
    robotState: RobotState;
}> = ({ message, type = 'speech', isVisible, className, robotState }) => {
    if (!isVisible || !message) return null;

    const isThinking = robotState === 'thinking';
    const isAlert = type === 'alert';
    const bubbleColor = isAlert ? '#EF4444' : (isThinking ? '#4B5563' : '#E5E7EB');
    const textColor = isAlert ? '#FFFFFF' : (isThinking ? '#E5E7EB' : '#1F2937');
    const tailPositionClass = type === 'thought' ? 'left-[20%]' : 'left-1/2'; // Tail position
    const tailRotationClass = type === 'thought' ? '-rotate-45' : 'rotate-45'; // Tail rotation

    const thoughtDotVariants = {
        initial: { opacity: 0, scale: 0.5 },
        animate: (i: number) => ({
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            transition: {
                delay: i * 0.3,
                duration: 1.2,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
            },
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`absolute bottom-full mb-4 px-4 py-2 rounded-lg shadow-lg max-w-xs text-sm text-center ${className}`}
            style={{ backgroundColor: bubbleColor, color: textColor }}
        >
            {isThinking && type === 'thought' ? (
                <div className="flex items-center justify-center space-x-1 py-1">
                    <motion.div variants={thoughtDotVariants} initial="initial" animate="animate" custom={0} className="w-2 h-2 rounded-full bg-current" />
                    <motion.div variants={thoughtDotVariants} initial="initial" animate="animate" custom={1} className="w-2 h-2 rounded-full bg-current" />
                    <motion.div variants={thoughtDotVariants} initial="initial" animate="animate" custom={2} className="w-2 h-2 rounded-full bg-current" />
                </div>
            ) : (
                <p>{message}</p>
            )}

            {/* Speech Bubble Tail */}
            <svg
                className={`absolute w-4 h-4 ${tailPositionClass} -translate-x-1/2 -bottom-[7px] ${tailRotationClass}`}
                viewBox="0 0 10 10"
            >
                <polygon points="0,0 10,0 5,10" fill={bubbleColor} />
            </svg>
        </motion.div>
    );
};

/**
 * Custom hook for a more robust robot head tracking based on mouse position.
 * It ensures the head always looks towards the mouse within a clamped angle.
 * @param mousePosition - Current mouse coordinates.
 * @param targetRef - Ref to the SVG group representing the robot's head.
 * @returns The clamped rotation angle for the robot's head.
 * @exports useRobotHeadTracking
 */
export const useRobotHeadTracking = (
    mousePosition: { x: number; y: number },
    targetRef: React.RefObject<SVGGElement>
) => {
    const [clampedAngle, setClampedAngle] = useState(0);

    useEffect(() => {
        if (!targetRef.current) return;

        const updateHeadAngle = () => {
            if (!targetRef.current || !window) return;

            const robotRect = targetRef.current.getBoundingClientRect();
            // Estimate robot's head "focus" point (center of the faceplate)
            const robotHeadCenterX = robotRect.left + robotRect.width / 2;
            const robotHeadCenterY = robotRect.top + robotRect.height / 2;

            const angleRad = Math.atan2(mousePosition.y - robotHeadCenterY, mousePosition.x - robotHeadCenterX);
            let angleDeg = angleRad * (180 / Math.PI);

            // Adjust angle to be relative to the robot's default 'forward' (which is up for a head)
            angleDeg += 90; // The original SVG is drawn facing up, so 0 degrees for rotation means facing up.

            // Clamp angle to a reasonable range (e.g., -45 to 45 degrees from the center)
            const newClampedAngle = Math.max(-45, Math.min(45, angleDeg));
            setClampedAngle(newClampedAngle);
        };

        const animationFrameId = requestAnimationFrame(updateHeadAngle);

        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePosition, targetRef]);

    return clampedAngle;
};

/**
 * A modular component for rendering and animating the robot's eyes.
 * It changes expressions based on mood and robot state.
 * @exports RobotEyes
 */
export const RobotEyes: React.FC<{ mood?: RobotMood; robotState: RobotState; accentColor: string }> = ({ mood, robotState, accentColor }) => {
    const eyeBaseColor = '#1F2937';
    const pupilColor = accentColor || '#A78BFA';

    const pupilVariants = {
        default: { scaleY: 1, scaleX: 1, fill: pupilColor },
        blink: { scaleY: [1, 0.1, 1], transition: { duration: 0.1, repeat: 1, delay: Math.random() * 5 + 2 } }, // Random blink
        thinking: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' } },
        focused: { scale: 1.1, y: 0 },
        curious: { y: [0, -1, 0], x: [0, 1, 0], transition: { repeat: Infinity, duration: 2, ease: 'linear' } },
        alert: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 0.5, ease: 'easeOut' } },
        error: { fill: '#EF4444', transition: { duration: 0.1, type: 'spring', stiffness: 500 } }, // Red eyes for error
        happy: { scaleY: [1, 0.9, 1], y: [0, 0.5, 0] }, // Squint slightly
        sad: { scaleY: [1, 1.1, 1], y: [0, -0.5, 0] }, // Slightly wider
        surprised: { scale: [1, 1.2, 1], transition: { duration: 0.2, type: 'spring' } }
    };

    const currentEyeAnimation =
        robotState === 'thinking' ? 'thinking' :
        robotState === 'error' ? 'error' :
        mood === 'focused' ? 'focused' :
        mood === 'curious' ? 'curious' :
        mood === 'alert' ? 'alert' :
        mood === 'happy' ? 'happy' :
        mood === 'sad' ? 'sad' :
        mood === 'surprised' ? 'surprised' :
        'default'; // Default for most states

    // Use a local state for blinking to not interfere with primary animation states
    const [isBlinking, setIsBlinking] = useState(false);
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200); // Blink duration
        }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds
        return () => clearInterval(blinkInterval);
    }, []);


    return (
        <g>
            {/* Base eyes */}
            <circle cx="40" cy="55" r="8" fill={eyeBaseColor} />
            <circle cx="60" cy="55" r="8" fill={eyeBaseColor} />
            {/* Pupils */}
            <motion.circle
                cx="40" cy="55" r="5"
                fill={pupilColor}
                variants={pupilVariants}
                animate={isBlinking ? 'blink' : currentEyeAnimation}
            />
            <motion.circle
                cx="60" cy="55" r="5"
                fill={pupilColor}
                variants={pupilVariants}
                animate={isBlinking ? 'blink' : currentEyeAnimation}
            />
            {/* Glares */}
            <circle cx="42" cy="53" r="1.5" fill="white" />
            <circle cx="62" cy="53" r="1.5" fill="white" />
        </g>
    );
};

/**
 * A modular component for rendering and animating the robot's mouth/expression.
 * @exports RobotMouth
 */
export const RobotMouth: React.FC<{ mood?: RobotMood; robotState: RobotState }> = ({ mood, robotState }) => {
    const mouthColor = '#1F2937';
    const mouthPathVariants = {
        speaking: { d: "M 45 65 Q 50 68 55 65", transition: { duration: 0.3, repeat: Infinity, repeatType: 'reverse' } },
        happy: { d: "M 45 65 Q 50 70 55 65", transition: { duration: 0.2, type: 'spring' } },
        sad: { d: "M 45 68 Q 50 63 55 68", transition: { duration: 0.2, type: 'spring' } },
        curious: { d: "M 48 65 L 52 65", transition: { duration: 0.2, type: 'spring' } },
        surprised: { d: "M 48 66 A 2 2 0 1 1 52 66 A 2 2 0 1 1 48 66", transition: { duration: 0.2, type: 'spring' } }, // Open mouth circle
        neutral: { d: "M 45 65 L 55 65" },
    };

    let mouthAnimationState = 'neutral';
    if (robotState === 'speaking') {
        mouthAnimationState = 'speaking';
    } else if (mood === 'happy') {
        mouthAnimationState = 'happy';
    } else if (mood === 'sad') {
        mouthAnimationState = 'sad';
    } else if (mood === 'curious') {
        mouthAnimationState = 'curious';
    } else if (mood === 'surprised') {
        mouthAnimationState = 'surprised';
    }

    return (
        <motion.path
            d={mouthPathVariants[mouthAnimationState]?.d || mouthPathVariants.neutral.d}
            stroke={mouthColor}
            strokeWidth="2"
            fill="none"
            variants={mouthPathVariants}
            animate={mouthAnimationState}
        />
    );
};

/**
 * A progress bar component for the robot, useful during generative tasks.
 * @exports RobotProgressBar
 */
export const RobotProgressBar: React.FC<{ isVisible: boolean; progress: number; accentColor: string }> = ({ isVisible, progress, accentColor }) => {
    if (!isVisible) return null;

    const barColor = accentColor || '#A78BFA';
    const progressWidth = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100

    return (
        <motion.g
            key="progress-bar-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <rect x="20" y="80" width="60" height="8" rx="4" fill="#374151" /> {/* Background of the progress bar */}
            <motion.rect
                x="20" y="80" height="8" rx="4"
                fill={barColor}
                width={60 * (progressWidth / 100)} // Scale width based on progress
                transition={{ duration: 0.3, ease: 'easeOut' }}
            />
        </motion.g>
    );
};

/**
 * The main Robot component, representing an interactive AI assistant.
 * It features dynamic head tracking, expressive eyes and mouth, speech bubbles,
 * and state-based animations.
 * @exports Robot
 */
const Robot: React.FC<RobotProps> = ({
    robotState,
    mousePosition,
    message,
    messageType,
    mood = 'neutral',
    accentColor = '#A78BFA',
    showProgress = false,
    progressValue = 0,
    onRobotClick,
    debugMode = false,
}) => {
    const robotHeadRef = useRef<SVGGElement>(null);
    const clampedAngle = useRobotHeadTracking(mousePosition, robotHeadRef);

    const handleRobotClick = useCallback(() => {
        onRobotClick?.();
    }, [onRobotClick]);

    // Enhanced variants for overall robot body movement
    const variants = {
        idle: { y: 0, scale: 1 },
        thinking: { y: -5, scale: 1.05 },
        writing: { y: 2, rotate: [0, 1, -1, 0] },
        illustrating: { y: 2, rotate: [0, 2, -2, 0] },
        speaking: { y: [0, -3, 0], scale: [1, 1.02, 1], transition: { y: { duration: 0.8, repeat: Infinity, repeatType: 'reverse' }, scale: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' } } },
        listening: { y: [0, -2, 0], scale: [1, 1.01, 1], transition: { y: { duration: 1.2, repeat: Infinity, repeatType: 'reverse' }, scale: { duration: 0.7, repeat: Infinity, repeatType: 'reverse' } } },
        error: { y: [0, -10, 0, -5, 0], rotate: [0, 5, -5, 5, 0], transition: { y: { duration: 0.6, ease: 'easeOut' }, rotate: { duration: 0.6, ease: 'easeOut' } } },
        // Assuming RobotState might also include 'generating'
        generating: { y: [-2, 2], scale: [1, 1.03, 1], transition: { y: { repeat: Infinity, repeatType: 'reverse', duration: 1, ease: 'easeInOut' }, scale: { repeat: Infinity, repeatType: 'reverse', duration: 0.6 } } },
    };

    // Ensure robotState maps to a defined variant, default to 'idle' if not found
    const currentRobotAnimationState = variants[robotState as keyof typeof variants] ? robotState : 'idle';

    return (
        <motion.div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            style={{ x: mousePosition.x - window.innerWidth / 2, y: mousePosition.y - window.innerHeight }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleRobotClick} // Allow clicking the robot container for global interaction
        >
            <motion.div
                animate={currentRobotAnimationState}
                variants={variants}
                transition={{
                    y: { repeat: Infinity, repeatType: 'reverse', duration: 1.5, ease: 'easeInOut' },
                    rotate: { repeat: Infinity, repeatType: 'reverse', duration: 0.5, ease: 'linear' }
                }}
                className="relative cursor-pointer pointer-events-auto" // Make robot clickable within its space
            >
                <AnimatePresence>
                    {(message && (robotState === 'thinking' || messageType === 'speech' || messageType === 'alert' || messageType === 'system')) && (
                        <RobotSpeechBubble
                            key="speech-bubble"
                            message={message}
                            type={messageType || (robotState === 'thinking' ? 'thought' : 'speech')}
                            isVisible={!!message}
                            robotState={robotState}
                            className="bottom-[120px] left-1/2 -translate-x-1/2 min-w-[100px]" // Position above the robot
                        />
                    )}
                </AnimatePresence>

                <svg width="120" height="120" viewBox="0 0 100 100">
                    {/* Shadow underneath the robot */}
                    <ellipse cx="50" cy="95" rx="30" ry="5" fill="black" opacity="0.2" />

                    {/* Main Robot Body and Head group */}
                    <motion.g animate={{ rotate: clampedAngle }} style={{ transformOrigin: '50px 70px' }} ref={robotHeadRef}>
                        <rect x="30" y="40" width="40" height="40" rx="10" fill="#4B5563" /> {/* Head base */}
                        <rect x="25" y="45" width="50" height="30" rx="10" fill="#6B7280" /> {/* Faceplate */}

                        {/* Robot Eyes (New Component) */}
                        <RobotEyes mood={mood} robotState={robotState} accentColor={accentColor} />

                        {/* Robot Mouth (New Component) */}
                        <RobotMouth mood={mood} robotState={robotState} />

                        {/* Antenna */}
                        <line x1="50" y1="40" x2="50" y2="25" stroke="#4B5563" strokeWidth="3" />
                        <motion.circle
                            cx="50" cy="25" r="5"
                            fill={accentColor}
                            animate={
                                robotState === 'thinking' ? { scale: [1, 1.5, 1], boxShadow: `0 0 15px ${accentColor}` } :
                                robotState === 'listening' ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } :
                                robotState === 'error' ? { fill: '#EF4444', scale: 1.2 } :
                                robotState === 'speaking' ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } :
                                { scale: 1, boxShadow: '0 0 0px #A78BFA' }
                            }
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                        />
                    </motion.g>

                    <AnimatePresence>
                        {robotState === 'writing' && (
                            <motion.g key="writing-accessory" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                <rect x="20" y="80" width="60" height="15" rx="3" fill="#374151" /> {/* Desk/clipboard */}
                                <motion.circle cx="35" cy="80" r="5" fill="#6B7280" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }} />
                                <motion.circle cx="65" cy="80" r="5" fill="#6B7280" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.3 }} />
                                {/* Animated Pen */}
                                <motion.g
                                    initial={{ rotate: -30, y: 10, x: 5 }}
                                    animate={{ rotate: 10, y: 0, x: 0 }}
                                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8, ease: 'easeInOut' }}
                                    style={{ transformOrigin: '50px 85px' }} // Origin for rotation
                                >
                                    <rect x="48" y="70" width="4" height="20" rx="1" fill="#6B7280" />
                                    <circle cx="50" cy="90" r="2" fill="#1F2937" /> {/* Pen tip */}
                                </motion.g>
                            </motion.g>
                        )}
                        {robotState === 'illustrating' && (
                            <motion.g key="illustrating-accessory" initial={{ y: 10, opacity: 0, rotate: -20, x: 10 }} animate={{ y: 0, opacity: 1, rotate: 10, x: 0 }} exit={{ y: 10, opacity: 0, rotate: -20 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                <circle cx="75" cy="75" r="6" fill="#6B7280" /> {/* Hand holding tools */}
                                <g transform="translate(65, 55) rotate(45)">
                                    <PaintBrushIcon className="w-8 h-8 text-purple-400" />
                                </g>
                                {/* Small animated color palette */}
                                <motion.g
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3, ease: 'easeInOut' }}
                                    style={{ transformOrigin: '80px 85px' }}
                                >
                                    <circle cx="80" cy="85" r="10" fill="#374151" />
                                    <circle cx="77" cy="83" r="3" fill="#EF4444" />
                                    <circle cx="83" cy="83" r="3" fill="#4299E1" />
                                    <circle cx="80" cy="87" r="3" fill="#48BB78" />
                                </motion.g>
                            </motion.g>
                        )}
                        {/* A generic 'generating' animation for visual feedback */}
                        {robotState === 'generating' && (
                            <motion.g key="generating-accessory" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                                <motion.rect
                                    x="35" y="75" width="30" height="10" rx="3"
                                    fill="#374151"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                />
                                <motion.circle
                                    cx="50" cy="70" r="8" fill={accentColor}
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    {/* Simple gear teeth */}
                                    <path d="M 50 62 L 52 65 L 48 65 Z" fill="#1F2937" transform="rotate(0, 50, 70)" />
                                    <path d="M 50 62 L 52 65 L 48 65 Z" fill="#1F2937" transform="rotate(90, 50, 70)" />
                                    <path d="M 50 62 L 52 65 L 48 65 Z" fill="#1F2937" transform="rotate(180, 50, 70)" />
                                    <path d="M 50 62 L 52 65 L 48 65 Z" fill="#1F2937" transform="rotate(270, 50, 70)" />
                                </motion.circle>
                            </motion.g>
                        )}
                         {/* Show Progress Bar if enabled for relevant states */}
                        {showProgress && (robotState === 'writing' || robotState === 'illustrating' || robotState === 'generating') && (
                            <RobotProgressBar key="progress-bar-component" isVisible={showProgress} progress={progressValue} accentColor={accentColor} />
                        )}
                    </AnimatePresence>

                    {/* Debug overlay for bounding boxes/origins */}
                    {debugMode && (
                        <g className="pointer-events-none">
                            <rect x="0" y="0" width="100" height="100" stroke="red" strokeWidth="1" fill="none" opacity="0.5" />
                            <circle cx="50" cy="70" r="2" fill="red" opacity="0.8" /> {/* Head transform origin */}
                        </g>
                    )}
                </svg>
            </motion.div>
        </motion.div>
    );
};

export default Robot;