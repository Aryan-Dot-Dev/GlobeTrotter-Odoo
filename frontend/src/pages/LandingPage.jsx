import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  ArrowRight,
  Globe,
  Camera,
  Mountain,
  Compass,
  Heart,
  Sparkles,
  Bot,
  Shield,
  Zap
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Typewriter effect state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Mouse tracking for 3D effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [0, window.innerHeight], [5, -5]));
  const rotateY = useSpring(useTransform(mouseX, [0, window.innerWidth], [-5, 5]));
  const rotateYInverse = useSpring(useTransform(rotateY, (latest) => -latest));

  // Typewriter effect
  useEffect(() => {
    const typewriterWords = ['Limits', 'Boundaries', 'Expectations', 'Dreams', 'Horizons', 'Adventures'];
    const currentWord = typewriterWords[currentWordIndex];
    const typingSpeed = isDeleting ? 100 : 150;
    const pauseTime = isDeleting ? 500 : 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && currentText === currentWord) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length);
      } else {
        const nextText = isDeleting
          ? currentWord.substring(0, currentText.length - 1)
          : currentWord.substring(0, currentText.length + 1);
        setCurrentText(nextText);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI-Powered Planning",
      description: "Smart algorithms create personalized itineraries tailored to your preferences, budget, and travel style.",
      color: "from-blue-500 via-blue-600 to-purple-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Curated Destinations",
      description: "Discover hidden gems and must-visit locations with insider tips from local experts and fellow travelers.",
      color: "from-emerald-500 via-green-600 to-teal-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Travel Community",
      description: "Connect with like-minded explorers, share experiences, and get real-time advice from our global community.",
      color: "from-purple-500 via-pink-600 to-rose-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Booking",
      description: "Book with confidence using our secure platform with 24/7 support and flexible cancellation policies.",
      color: "from-orange-500 via-amber-600 to-yellow-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Travelers", icon: <Heart className="w-5 h-5" /> },
    { number: "200+", label: "Destinations", icon: <Globe className="w-5 h-5" /> },
    { number: "15K+", label: "Curated Trips", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* 3D Background Elements */}
      <motion.div 
        className="absolute inset-0"
        style={{ perspective: "1000px" }}
      >
        {/* Floating 3D Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-3xl"
          style={{ rotateX, rotateY }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-3xl"
          style={{ 
            rotateX: useTransform(rotateX, (latest) => -latest),
            rotateY: useTransform(rotateY, (latest) => -latest)
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/30 to-rose-500/30 blur-3xl"
          style={{ rotateX, rotateY }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Enhanced Floating Icons with 3D Transform */}
        {[Globe, Camera, Mountain, Compass, Sparkles, Zap, Plane, MapPin, Calendar, Users, Heart, Star].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-white/30"
            style={{
              left: `${10 + (index * 8)}%`,
              top: `${10 + (index * 6)}%`,
              rotateX,
              rotateY: index % 2 === 0 ? rotateY : rotateYInverse
            }}
            animate={{
              y: [-25, 25, -25],
              rotate: [0, 360],
              scale: [0.8, 1.3, 0.8],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + index * 0.8,
              delay: index * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        ))}

        {/* Additional floating elements in corners and edges */}
        {[
          { Icon: Globe, pos: { left: '5%', top: '20%' }, size: 'w-4 h-4' },
          { Icon: Sparkles, pos: { right: '8%', top: '15%' }, size: 'w-6 h-6' },
          { Icon: Mountain, pos: { left: '12%', bottom: '25%' }, size: 'w-5 h-5' },
          { Icon: Camera, pos: { right: '15%', bottom: '30%' }, size: 'w-4 h-4' },
          { Icon: Compass, pos: { left: '85%', top: '40%' }, size: 'w-5 h-5' },
          { Icon: Heart, pos: { left: '3%', top: '60%' }, size: 'w-4 h-4' },
          { Icon: Plane, pos: { right: '5%', top: '70%' }, size: 'w-6 h-6' },
          { Icon: Star, pos: { left: '90%', bottom: '20%' }, size: 'w-4 h-4' },
          { Icon: Zap, pos: { right: '25%', top: '25%' }, size: 'w-5 h-5' },
          { Icon: MapPin, pos: { left: '70%', bottom: '40%' }, size: 'w-4 h-4' },
        ].map((item, index) => (
          <motion.div
            key={`edge-${index}`}
            className="absolute text-white/25"
            style={item.pos}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              rotate: [0, 180, 360],
              scale: [0.7, 1.2, 0.7],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 12 + index * 1.2,
              delay: index * 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <item.Icon className={item.size} />
          </motion.div>
        ))}

        {/* Floating geometric shapes */}
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={`geo-${index}`}
            className="absolute"
            style={{
              left: `${15 + index * 10}%`,
              top: `${20 + index * 8}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              scale: [0.5, 1, 0.5],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 15 + index,
              delay: index * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`w-3 h-3 ${index % 3 === 0 ? 'bg-blue-400/40 rounded-full' : index % 3 === 1 ? 'bg-purple-400/40 rotate-45' : 'bg-pink-400/40 rounded-sm'}`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Header */}
      <motion.header 
        className="relative z-50 flex justify-between items-center p-2 md:p-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="text-2xl font-bold text-white flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ✈️
          </motion.div>
          GlobeTrotter
        </motion.div>
        <div className="space-x-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 transition-all duration-300"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Hero Section - Takes remaining viewport height */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-8">
          <div className="w-full text-center">
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight w-full"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span>Travel </span>
              <motion.span
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                <span>Beyond  </span>
              </motion.span>
              <span className="text-gray-300">
                {currentText}
                <motion.span
                  className="inline-block w-1 h-[0.8em] bg-blue-400 ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Experience the future of travel with AI-powered planning, curated destinations, 
              and a community of passionate explorers ready to guide your next adventure.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg group transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/signup')}
              >
                Start Your Journey
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
              
            </motion.div>

            {/* Stats - Compact version for hero */}
            <motion.div 
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              {stats.map((stat, index) => {
                // Define glow colors based on stat type
                const getGlowClass = (label) => {
                  if (label === "Happy Travelers") return "group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]";
                  if (label === "Destinations") return "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]";
                  if (label === "Curated Trips") return "group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]";
                  return "";
                };

                return (
                  <motion.div 
                    key={index}
                    className="text-center group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className={`text-white/20 mb-1 flex justify-center transition-all duration-300 ${getGlowClass(stat.label)}`}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "linear" }}
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      

      {/* Content sections below the fold */}
      <div className="relative z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 md:px-8 overflow-hidden">
        {/* Enhanced gradient background layers */}
        <div className="absolute inset-0">
          {/* Main gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-blue-900/20 to-purple-900/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 via-transparent to-cyan-900/15" />
          
          {/* Gentle gradient orbs */}
          <motion.div
            className="absolute top-20 right-20 w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-40 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.25, 0.1, 0.25],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/12 to-pink-500/12 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Additional gradient elements */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-cyan-500/8 to-blue-500/8 blur-2xl"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl"
            animate={{
              scale: [1.2, 0.9, 1.2],
              opacity: [0.2, 0.05, 0.2],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Floating elements container */}
        <div className="absolute inset-0">
          {/* Enhanced subtle floating elements */}
          {[Bot, Shield, Users, MapPin, Heart, Globe, Star, Camera, Mountain, Compass].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute text-white/20"
              style={{
                left: `${8 + (index * 9)}%`,
                top: `${15 + (index * 12)}%`,
              }}
              animate={{
                y: [-18, 18, -18],
                x: [-8, 8, -8],
                rotate: [0, 180, 360],
                scale: [0.7, 1.2, 0.7],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 14 + index * 2,
                delay: index * 1.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon className="w-7 h-7" />
            </motion.div>
          ))}

          {/* Additional corner floating elements */}
          {[
            { Icon: Sparkles, pos: { right: '10%', top: '10%' }, size: 'w-5 h-5' },
            { Icon: Zap, pos: { left: '5%', top: '30%' }, size: 'w-4 h-4' },
            { Icon: Plane, pos: { right: '15%', bottom: '20%' }, size: 'w-6 h-6' },
            { Icon: Calendar, pos: { left: '12%', bottom: '15%' }, size: 'w-4 h-4' },
            { Icon: Users, pos: { right: '25%', top: '40%' }, size: 'w-5 h-5' },
            { Icon: Heart, pos: { left: '80%', top: '25%' }, size: 'w-4 h-4' },
          ].map((item, index) => (
            <motion.div
              key={`features-corner-${index}`}
              className="absolute text-white/25"
              style={item.pos}
              animate={{
                y: [-12, 12, -12],
                rotate: [0, 360],
                scale: [0.6, 1.1, 0.6],
                opacity: [0.1, 0.35, 0.1],
              }}
              transition={{
                duration: 16 + index * 1.5,
                delay: index * 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <item.Icon className={item.size} />
            </motion.div>
          ))}

          {/* Floating dots and small shapes */}
          {Array.from({ length: 12 }).map((_, index) => (
            <motion.div
              key={`features-dots-${index}`}
              className="absolute"
              style={{
                left: `${5 + index * 8}%`,
                top: `${10 + index * 7}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                scale: [0.3, 0.8, 0.3],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 18 + index * 0.8,
                delay: index * 0.7,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className={`w-2 h-2 ${index % 4 === 0 ? 'bg-blue-400/30 rounded-full' : index % 4 === 1 ? 'bg-emerald-400/30 rounded-full' : index % 4 === 2 ? 'bg-purple-400/30 rounded-sm' : 'bg-pink-400/30 rotate-45'}`} />
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* 3D Feature Cards */}
          <motion.div 
            className="py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white text-center mb-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              Why Choose GlobeTrotter?
            </motion.h2>
            <motion.p 
              className="text-gray-400 text-center mb-16 text-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
            >
              Discover what makes us the perfect travel companion
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group perspective-1000"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.8 + index * 0.15 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div
                    className={`relative h-full ${feature.bgColor} backdrop-blur-xl border ${feature.borderColor} rounded-2xl p-8 transform-gpu transition-all duration-700 hover:shadow-xl hover:shadow-blue-500/10`}
                    style={{ transformStyle: "preserve-3d" }}
                    whileHover={{ 
                      rotateX: 2,
                      rotateY: 2,
                      z: 30
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  >
                    {/* Subtle background gradient effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 rounded-2xl transition-opacity duration-700 group-hover:opacity-5`}
                    />
                    
                    {/* Icon with gentle hover effect */}
                    <motion.div 
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg`}
                      whileHover={{ 
                        scale: 1.05,
                        rotateY: 15
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    {/* Content with subtle 3D effect */}
                    <motion.h3 
                      className="text-2xl font-bold text-white mb-4"
                      style={{ transform: "translateZ(15px)" }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-300 leading-relaxed"
                      style={{ transform: "translateZ(8px)" }}
                    >
                      {feature.description}
                    </motion.p>
                    
                    {/* Gentle hover overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{ transform: "translateZ(3px)" }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA with floating elements */}
          <motion.div 
            className="relative text-center py-16 overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            {/* CTA Section floating elements */}
            <div className="absolute inset-0">
              {[Star, Heart, Sparkles, Globe, Plane].map((Icon, index) => (
                <motion.div
                  key={`cta-${index}`}
                  className="absolute text-white/6"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${25 + index * 10}%`,
                  }}
                  animate={{
                    y: [-12, 12, -12],
                    rotate: [0, 360],
                    scale: [0.8, 1.3, 0.8],
                    opacity: [0.03, 0.12, 0.03],
                  }}
                  transition={{
                    duration: 13 + index * 1.5,
                    delay: index * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
              ))}

              {/* Floating particles around CTA */}
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`cta-particle-${index}`}
                  className="absolute"
                  style={{
                    left: `${10 + index * 12}%`,
                    top: `${15 + index * 12}%`,
                  }}
                  animate={{
                    y: [-8, 8, -8],
                    scale: [0.4, 0.9, 0.4],
                    opacity: [0.15, 0.4, 0.15],
                  }}
                  transition={{
                    duration: 11 + index,
                    delay: index * 0.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className={`w-3 h-3 ${index % 3 === 0 ? 'bg-blue-400/40 rounded-full' : index % 3 === 1 ? 'bg-purple-400/40 rounded-full' : 'bg-pink-400/40 rounded-full'}`} />
                </motion.div>
              ))}
            </div>

            <motion.div
              className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-4xl mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Travel Experience?
              </h3>
              <p className="text-gray-300 mb-8 text-lg">
                Join thousands of travelers who trust GlobeTrotter for unforgettable adventures.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-4 text-lg transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/signup')}
              >
                Get Started Today
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
