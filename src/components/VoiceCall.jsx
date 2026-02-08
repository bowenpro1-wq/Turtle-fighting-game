import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceCall({ participants, onEnd }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    initializeVoiceCall();
    return () => cleanup();
  }, []);

  const initializeVoiceCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Simple peer-to-peer WebRTC setup
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      participants.forEach(participant => {
        const pc = new RTCPeerConnection(configuration);
        
        // Add local stream
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Handle incoming stream
        pc.ontrack = (event) => {
          const audio = new Audio();
          audio.srcObject = event.streams[0];
          audio.play();
        };

        peerConnectionsRef.current[participant] = pc;
      });

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize voice call:', error);
      alert('无法启动语音通话，请检查麦克风权限');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
  };

  const handleEnd = () => {
    cleanup();
    onEnd();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border-2 border-cyan-500">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-2">语音通话</div>
          <div className={`text-sm ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
            {isConnected ? '已连接' : '连接中...'}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {participants.map(p => (
            <div key={p} className="bg-slate-700 rounded-lg p-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white">{p}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={toggleMute}
            variant="outline"
            size="lg"
            className="border-slate-600"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          <Button
            onClick={handleEnd}
            size="lg"
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}