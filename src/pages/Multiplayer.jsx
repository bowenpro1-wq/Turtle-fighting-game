import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Users, Swords, Heart, Zap, Copy, Check, Crown, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/BottomNav';

export default function Multiplayer() {
  const [mode, setMode] = useState(null);
  const [matches, setMatches] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Subscribe to match updates when in a room
  useEffect(() => {
    if (!mode?.match?.id) return;

    const unsubscribe = base44.entities.MultiplayerMatch.subscribe((event) => {
      if (event.id === mode.match.id && event.type === 'update') {
        setMode(prev => ({
          ...prev,
          match: event.data
        }));
      }
    });

    return () => unsubscribe();
  }, [mode?.match?.id]);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user.email);
      
      const activeMatches = await base44.entities.MultiplayerMatch.filter({ status: 'waiting' });
      setMatches(activeMatches);
      
      const myChallenges = await base44.entities.Challenge.filter({ 
        challenged_email: user.email,
        status: 'pending'
      });
      setChallenges(myChallenges);
    } catch (error) {
      console.error('Failed to load:', error);
    }
    setLoading(false);
  };

  const createMatch = async (matchMode) => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const match = await base44.entities.MultiplayerMatch.create({
        mode: matchMode,
        status: 'waiting',
        match_code: code,
        players: [{
          email: currentUser,
          score: 0,
          kills: 0,
          deaths: 0,
          ready: false
        }],
        max_players: matchMode === 'coop' ? 4 : 2
      });
      
      setMode({ type: 'host', match });
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  const joinMatch = async () => {
    try {
      const matchList = await base44.entities.MultiplayerMatch.filter({ 
        match_code: joinCode.toUpperCase(),
        status: 'waiting'
      });
      
      if (matchList.length === 0) {
        alert('未找到匹配码');
        return;
      }
      
      const match = matchList[0];
      if (match.players.length >= match.max_players) {
        alert('房间已满');
        return;
      }
      
      const updatedPlayers = [...match.players, {
        email: currentUser,
        score: 0,
        kills: 0,
        deaths: 0,
        ready: false
      }];
      
      await base44.entities.MultiplayerMatch.update(match.id, {
        players: updatedPlayers
      });
      
      setMode({ type: 'join', match: { ...match, players: updatedPlayers } });
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const acceptChallenge = async (challenge) => {
    try {
      await base44.entities.Challenge.update(challenge.id, { status: 'accepted' });
      
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const match = await base44.entities.MultiplayerMatch.create({
        mode: challenge.mode,
        status: 'waiting',
        match_code: code,
        players: [
          { email: challenge.challenger_email, score: 0, kills: 0, deaths: 0, ready: false },
          { email: currentUser, score: 0, kills: 0, deaths: 0, ready: false }
        ],
        max_players: 2
      });
      
      await base44.entities.Challenge.update(challenge.id, { match_id: match.id });
      loadData();
    } catch (error) {
      console.error('Failed to accept:', error);
    }
  };

  if (mode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border-2 border-purple-500"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">等待玩家加入</h2>
          
          <div className="bg-slate-900 rounded-xl p-6 mb-6 text-center">
            <p className="text-gray-400 mb-2">房间代码</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-4xl font-bold text-yellow-400 tracking-widest">
                {mode.match.match_code}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyCode(mode.match.match_code)}
                className="text-gray-400 hover:text-white"
              >
                {copiedCode ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {mode.match.players.map((player, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className={`w-5 h-5 ${i === 0 ? 'text-yellow-400' : 'text-gray-500'}`} />
                  <span className="text-white">{player.email.split('@')[0]}</span>
                </div>
                <span className="text-green-400 text-sm">已加入</span>
              </div>
            ))}
            {[...Array(mode.match.max_players - mode.match.players.length)].map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-700/30 rounded-lg p-3 flex items-center">
                <Users className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-500">等待玩家...</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setMode(null)}
              variant="outline"
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={() => alert('游戏即将开始！')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={mode.match.players.length < 2}
            >
              开始游戏
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            多人模式
          </h1>
          <Link to={createPageUrl('Leaderboard')}>
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              排行榜
            </Button>
          </Link>
        </div>

        {challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-400" />
              挑战邀请
            </h3>
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-slate-800 rounded-lg p-4 flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-bold">{challenge.challenger_email.split('@')[0]} 向你发起挑战！</p>
                  <p className="text-sm text-gray-400">模式: {challenge.mode === 'pvp' ? 'PvP对战' : challenge.mode === 'race' ? '竞速模式' : 'Boss连战'}</p>
                  {challenge.wager > 0 && <p className="text-yellow-400 text-sm">赌注: {challenge.wager} 金币</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => acceptChallenge(challenge)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    接受
                  </Button>
                  <Button
                    onClick={async () => {
                      await base44.entities.Challenge.update(challenge.id, { status: 'declined' });
                      loadData();
                    }}
                    variant="outline"
                  >
                    拒绝
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => createMatch('pvp')}
            className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 cursor-pointer"
          >
            <Swords className="w-12 h-12 text-white mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">PvP 对战</h3>
            <p className="text-white/80">1v1 战斗，击败对手</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => createMatch('coop')}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 cursor-pointer"
          >
            <Heart className="w-12 h-12 text-white mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">合作模式</h3>
            <p className="text-white/80">最多4人合作挑战</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => createMatch('race')}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 cursor-pointer"
          >
            <Zap className="w-12 h-12 text-white mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">竞速模式</h3>
            <p className="text-white/80">比拼谁更快完成</p>
          </motion.div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">加入游戏</h3>
          <div className="flex gap-3">
            <Input
              placeholder="输入房间代码"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 text-lg tracking-widest"
              maxLength={6}
            />
            <Button onClick={joinMatch} className="bg-purple-600 hover:bg-purple-700">
              加入
            </Button>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">活跃房间</h3>
            <div className="space-y-2">
              {matches.map((match) => (
                <div key={match.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{match.mode === 'pvp' ? 'PvP对战' : match.mode === 'coop' ? '合作模式' : '竞速模式'}</p>
                    <p className="text-sm text-gray-400">{match.players.length}/{match.max_players} 玩家</p>
                  </div>
                  <Button
                    onClick={() => {
                      setJoinCode(match.match_code);
                      joinMatch();
                    }}
                    size="sm"
                  >
                    快速加入
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav 
        onLanguageClick={() => {}}
        onShopClick={() => {}}
        onMiniGamesClick={() => window.location.href = createPageUrl('MiniGames')}
        showShop={false}
      />
    </div>
  );
}