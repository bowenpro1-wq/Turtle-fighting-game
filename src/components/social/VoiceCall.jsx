import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceCall({ friend, myProfile, onClose }) {
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // In production, send to signaling server
          console.log('New ICE candidate:', event.candidate);
        }
      };

      // Simulate connection (in production, use signaling server)
      setTimeout(() => {
        setCallStatus('connected');
      }, 2000);

    } catch (error) {
      console.error('Failed to initialize call:', error);
      alert('无法访问麦克风，请检查权限设置');
      onClose();
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    onClose();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-cyan-500"
      >
        {/* Friend Info */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐢</div>
          <h2 className="text-2xl font-bold text-white mb-2">{friend.turtle_id}</h2>
          <p className="text-cyan-400">{friend.display_name}</p>
        </div>

        {/* Call Status */}
        <div className="text-center mb-8">
          {callStatus === 'connecting' && (
            <div className="text-yellow-400 text-lg animate-pulse">
              正在连接...
            </div>
          )}
          {callStatus === 'connected' && (
            <div className="text-green-400 text-lg">
              通话中 {formatDuration(callDuration)}
            </div>
          )}
        </div>

        {/* Audio Element for Remote Stream */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleMute}
            size="lg"
            className={`rounded-full w-16 h-16 ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            onClick={endCall}
            size="lg"
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        {/* Tip */}
        <p className="text-white/60 text-sm text-center mt-6">
          💡 提示: 确保已授予麦克风权限
        </p>
      </motion.div>
    </motion.div>
  );
}