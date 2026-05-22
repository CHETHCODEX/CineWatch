"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Loader2, 
  Film,
  Sparkles,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// =============================================================================
// Helper Subcomponents: Pupils and EyeBalls for Animations
// =============================================================================

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

// =============================================================================
// Main Component: AuthModal with Cute Interactive Characters
// =============================================================================

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // Mode Selection States
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Inputs States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Submit Feedback & Loading States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Eyeball Tracking and Interactive States
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  // Character Container Refs
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  // Global Mouse Movement Tracking (Active when dialog is opened)
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen]);

  // Purple character blinking routine
  useEffect(() => {
    if (!isOpen) return;

    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Black character blinking routine
  useEffect(() => {
    if (!isOpen) return;

    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Looking at each other event sequence when typing
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 850);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Purple sneaky peeking event sequence when toggled password visibility
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPassword]);

  // Calculations for individual character rotation skews and face translation
  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(false);
    setIsTyping(false);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email and password are required.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (isSignUp && !username.trim()) {
      setErrorMsg("Please choose a username.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up Mode with Supabase auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          const isConfirmed = data.session !== null;
          if (isConfirmed) {
            setSuccessMsg("Welcome! Your CineWatch AI account is created.");
            setTimeout(() => {
              onClose();
              resetForm();
            }, 1500);
          } else {
            setSuccessMsg("Awesome! Please check your email to verify your CineWatch AI account.");
          }
        }
      } else {
        // Sign In Mode with Supabase auth
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg("Welcome back to CineWatch AI!");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Auth action failed:", err);
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="lg:max-w-4xl bg-zinc-950/90 border border-white/[0.08] backdrop-blur-3xl p-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 w-full">
        {/* Glow overlay */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cine-blue/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 min-h-[500px] lg:min-h-[550px]">
          
          {/* ===================================================================
              Left Pane: Cute Interactive Animated Characters (Desktop Only)
              =================================================================== */}
          <div className="col-span-6 relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-cine-blue/15 via-zinc-950 to-zinc-900/60 p-8 border-r border-white/[0.06] overflow-hidden">
            <div className="relative z-20">
              <div className="flex items-center gap-2 text-md font-semibold text-zinc-300">
                <div className="size-7 rounded-lg bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/[0.08]">
                  <Sparkles className="size-4 text-cine-blue" />
                </div>
                <span>CineWatch AI Interactive</span>
              </div>
            </div>

            {/* Cartoon Characters centered at bottom */}
            <div className="relative z-20 flex items-end justify-center h-[340px] mt-4">
              <div className="relative" style={{ width: '420px', height: '300px' }}>
                
                {/* 1. Purple character (Back left layer) */}
                <div 
                  ref={purpleRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '50px',
                    width: '130px',
                    height: (isTyping || (password.length > 0 && !showPassword)) ? '330px' : '300px',
                    backgroundColor: '#6C3FF5',
                    borderRadius: '10px 10px 0 0',
                    zIndex: 1,
                    transform: (password.length > 0 && showPassword)
                      ? `skewX(0deg)`
                      : (isTyping || (password.length > 0 && !showPassword))
                        ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(30px)` 
                        : `skewX(${purplePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div 
                    className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                    style={{
                      left: (password.length > 0 && showPassword) 
                        ? '15px' 
                        : isLookingAtEachOther 
                          ? '40px' 
                          : `${35 + purplePos.faceX}px`,
                      top: (password.length > 0 && showPassword) 
                        ? '25px' 
                        : isLookingAtEachOther 
                          ? '50px' 
                          : `${30 + purplePos.faceY}px`,
                    }}
                  >
                    <EyeBall 
                      size={15} 
                      pupilSize={6} 
                      maxDistance={4} 
                      eyeColor="white" 
                      pupilColor="#2D2D2D" 
                      isBlinking={isPurpleBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                    />
                    <EyeBall 
                      size={15} 
                      pupilSize={6} 
                      maxDistance={4} 
                      eyeColor="white" 
                      pupilColor="#2D2D2D" 
                      isBlinking={isPurpleBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                    />
                  </div>
                </div>

                {/* 2. Black tall character (Middle layer) */}
                <div 
                  ref={blackRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '180px',
                    width: '90px',
                    height: '230px',
                    backgroundColor: '#2D2D2D',
                    borderRadius: '8px 8px 0 0',
                    zIndex: 2,
                    transform: (password.length > 0 && showPassword)
                      ? `skewX(0deg)`
                      : isLookingAtEachOther
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(15px)`
                        : (isTyping || (password.length > 0 && !showPassword))
                          ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                          : `skewX(${blackPos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div 
                    className="absolute flex gap-4 transition-all duration-700 ease-in-out"
                    style={{
                      left: (password.length > 0 && showPassword) 
                        ? '8px' 
                        : isLookingAtEachOther 
                          ? '24px' 
                          : `${20 + blackPos.faceX}px`,
                      top: (password.length > 0 && showPassword) 
                        ? '22px' 
                        : isLookingAtEachOther 
                          ? '10px' 
                          : `${24 + blackPos.faceY}px`,
                    }}
                  >
                    <EyeBall 
                      size={14} 
                      pupilSize={5} 
                      maxDistance={3} 
                      eyeColor="white" 
                      pupilColor="#2D2D2D" 
                      isBlinking={isBlackBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                    />
                    <EyeBall 
                      size={14} 
                      pupilSize={5} 
                      maxDistance={3} 
                      eyeColor="white" 
                      pupilColor="#2D2D2D" 
                      isBlinking={isBlackBlinking}
                      forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                      forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                    />
                  </div>
                </div>

                {/* 3. Orange semi-circle character (Front left layer) */}
                <div 
                  ref={orangeRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '0px',
                    width: '180px',
                    height: '150px',
                    zIndex: 3,
                    backgroundColor: '#FF9B6B',
                    borderRadius: '90px 90px 0 0',
                    transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div 
                    className="absolute flex gap-6 transition-all duration-200 ease-out"
                    style={{
                      left: (password.length > 0 && showPassword) 
                        ? '35px' 
                        : `${60 + (orangePos.faceX || 0)}px`,
                      top: (password.length > 0 && showPassword) 
                        ? '65px' 
                        : `${70 + (orangePos.faceY || 0)}px`,
                    }}
                  >
                    <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -4 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                    <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -4 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                  </div>
                </div>

                {/* 4. Yellow character (Front right layer) */}
                <div 
                  ref={yellowRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '230px',
                    width: '100px',
                    height: '170px',
                    backgroundColor: '#E8D754',
                    borderRadius: '50px 50px 0 0',
                    zIndex: 4,
                    transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div 
                    className="absolute flex gap-5 transition-all duration-200 ease-out"
                    style={{
                      left: (password.length > 0 && showPassword) 
                        ? '15px' 
                        : `${38 + (yellowPos.faceX || 0)}px`,
                      top: (password.length > 0 && showPassword) 
                        ? '28px' 
                        : `${30 + (yellowPos.faceY || 0)}px`,
                    }}
                  >
                    <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -4 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                    <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -4 : undefined} forceLookY={(password.length > 0 && showPassword) ? -3 : undefined} />
                  </div>
                  {/* Yellow's Mouth */}
                  <div 
                    className="absolute w-12 h-[3px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                    style={{
                      left: (password.length > 0 && showPassword) 
                        ? '8px' 
                        : `${30 + (yellowPos.faceX || 0)}px`,
                      top: (password.length > 0 && showPassword) 
                        ? '66px' 
                        : `${66 + (yellowPos.faceY || 0)}px`,
                    }}
                  />
                </div>

              </div>
            </div>

            <div className="relative z-20 flex items-center gap-6 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              <span>Personalized Recommendations</span>
              <span>•</span>
              <span>Sync Watchlists</span>
            </div>
          </div>

          {/* ===================================================================
              Right Pane: Input Form Fields (Fully Responsive)
              =================================================================== */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center p-6 sm:p-8 bg-zinc-950/40 relative">
            
            {/* Header Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cine-blue to-purple-600 shadow-xl shadow-cine-blue/20 mb-3 animate-pulse lg:hidden">
                <Film className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-1.5 justify-center lg:justify-start">
                {isSignUp ? "Create CineWatch AI Account" : "Welcome Back"}
                <Sparkles className="w-4 h-4 text-cine-blue animate-pulse" />
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 mt-1.5 max-w-[320px]">
                {isSignUp 
                  ? "Sign up to synchronize your movie library, create playlists, and get tailored recommendations."
                  : "Sign in to access your saved watchlist, sync marathon data, and resume conversations."}
              </DialogDescription>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMsg && (
              <div className="flex gap-2.5 items-start p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 leading-normal mb-4 animate-shake">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="flex gap-2.5 items-start p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 leading-normal mb-4">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <p className="flex-1">{successMsg}</p>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username (Displayed on Signup mode only) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold text-zinc-400">Username</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      placeholder="movielover99"
                      disabled={loading}
                      required
                      className="pl-10 h-11 bg-zinc-900/40 border-zinc-800/80 focus:border-cine-blue/50 text-zinc-200 text-sm rounded-xl placeholder-zinc-600 focus-visible:ring-cine-blue/30 focus-visible:ring-offset-0 focus-visible:ring-1"
                    />
                  </div>
                </div>
              )}

              {/* Email Input Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-zinc-400">Email Address</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                    className="pl-10 h-11 bg-zinc-900/40 border-zinc-800/80 focus:border-cine-blue/50 text-zinc-200 text-sm rounded-xl placeholder-zinc-600 focus-visible:ring-cine-blue/30 focus-visible:ring-offset-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold text-zinc-400">Password</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => alert("Password reset link will be sent if configured.")}
                      className="text-[10px] text-zinc-500 hover:text-cine-blue transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="pl-10 pr-10 h-11 bg-zinc-900/40 border-zinc-800/80 focus:border-cine-blue/50 text-zinc-200 text-sm rounded-xl placeholder-zinc-600 focus-visible:ring-cine-blue/30 focus-visible:ring-offset-0 focus-visible:ring-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Extras Option: Remember state */}
              {!isSignUp && (
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="remember" />
                  <Label
                    htmlFor="remember"
                    className="text-xs font-normal text-zinc-400 cursor-pointer select-none"
                  >
                    Remember this device for 30 days
                  </Label>
                </div>
              )}

              {/* Submit Trigger Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-cine-blue to-purple-600 hover:from-cine-blue/90 hover:to-purple-600/90 text-white font-bold py-2.5 rounded-xl mt-3 select-none shadow-lg shadow-cine-blue/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Form Toggles Mode Switching */}
              <div className="text-center text-xs text-zinc-500 pt-3.5 border-t border-zinc-900">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  disabled={loading}
                  className="text-cine-blue font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  {isSignUp ? "Sign In" : "Sign Up free"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
