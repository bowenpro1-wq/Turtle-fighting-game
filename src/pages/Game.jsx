import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import GameCanvas from '@/components/game/GameCanvas';
import GameUI from '@/components/game/GameUI';
import GameOver from '@/components/game/GameOver';
import BossIntro from '@/components/game/BossIntro';
import StartScreen from '@/components/game/StartScreen';
import Shop from '@/components/game/Shop';
import VirtualKeyboard from '@/components/game/VirtualKeyboard';
import WeaponSelect from '@/components/game/WeaponSelect';
import Forge from '@/components/game/Forge';
import BusBreakSelect from '@/components/game/BusBreakSelect';
import XiaowangConfirm from '@/components/game/XiaowangConfirm';
import Tutorial from '@/components/game/Tutorial';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import BottomNav from '@/components/BottomNav';
import EmailSubscriptionModal from '@/components/EmailSubscriptionModal';

const BOSSES = [
  { id: 1, name: "海星守卫", health: 100, damage: 15, speed: 1.5, size: 60, color: "#ff6b6b", pattern: "circle" },
  { id: 2, name: "水母刺客", health: 150, damage: 20, speed: 2, size: 70, color: "#a855f7", pattern: "zigzag" },
  { id: 3, name: "螃蟹将军", health: 200, damage: 25, speed: 1, size: 80, color: "#ef4444", pattern: "chase" },
  { id: 4, name: "章鱼巫师", health: 250, damage: 30, speed: 1.8, size: 90, color: "#8b5cf6", pattern: "teleport" },
  { id: 5, name: "鲨鱼猎人", health: 300, damage: 35, speed: 2.5, size: 100, color: "#6366f1", pattern: "dash" },
  { id: 6, name: "海龙王子", health: 400, damage: 40, speed: 1.5, size: 110, color: "#22d3ee", pattern: "spiral" },
  { id: 7, name: "深海怪兽", health: 500, damage: 45, speed: 1.2, size: 120, color: "#14b8a6", pattern: "random" },
  { id: 8, name: "珊瑚守护者", health: 350, damage: 30, speed: 2, size: 85, color: "#f472b6", pattern: "bounce" },
  { id: 9, name: "海蛇女王", health: 600, damage: 50, speed: 2.2, size: 130, color: "#84cc16", pattern: "wave" },
  { id: 10, name: "冰霜海妖", health: 700, damage: 55, speed: 1.8, size: 140, color: "#06b6d4", pattern: "freeze" },
  { id: 11, name: "火焰海神", health: 800, damage: 60, speed: 2, size: 150, color: "#f97316", pattern: "burst" },
  { id: 12, name: "雷电鳐鱼", health: 550, damage: 45, speed: 3, size: 95, color: "#fbbf24", pattern: "lightning" },
  { id: 13, name: "暗影鲸鱼", health: 900, damage: 65, speed: 1.5, size: 160, color: "#374151", pattern: "shadow" },
  { id: 14, name: "毒液水母王", health: 450, damage: 40, speed: 2.5, size: 100, color: "#a3e635", pattern: "poison" },
  { id: 15, name: "巨型海马", health: 750, damage: 55, speed: 2.2, size: 135, color: "#fb923c", pattern: "charge" },
  { id: 16, name: "远古海龟王", health: 1000, damage: 50, speed: 1, size: 170, color: "#059669", pattern: "defend" },
  { id: 17, name: "幻影海豚", health: 650, damage: 60, speed: 3.5, size: 105, color: "#818cf8", pattern: "clone" },
  { id: 18, name: "末日海怪", health: 1200, damage: 70, speed: 1.8, size: 180, color: "#dc2626", pattern: "chaos" },
  { id: 19, name: "深渊领主", health: 1500, damage: 80, speed: 2, size: 190, color: "#1e1b4b", pattern: "void" },
  { id: 20, name: "广智", health: 5000, damage: 150, speed: 2.5, size: 250, color: "#ff4500", pattern: "flame" }
];

export default function Game() {
  const [gameState, setGameState] = useState('start');
  const [gameMode, setGameMode] = useState('normal');
  const [language, setLanguage] = useState('zh');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem('gameCoins');
    return savedCoins ? parseInt(savedCoins) : 1000;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [difficulty, setDifficulty] = useState('adaptive');
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [bossMaxHealth, setBossMaxHealth] = useState(0);
  const [defeatedBosses, setDefeatedBosses] = useState([]);
  const [bossBoostLevel, setBossBoostLevel] = useState(0);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showWeaponSelect, setShowWeaponSelect] = useState(false);
  const [showForge, setShowForge] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [isInShop, setIsInShop] = useState(false);
  const [waveNumber, setWaveNumber] = useState(1);
  const [survivalTime, setSurvivalTime] = useState(0);
  
  // Weapon system
  const [selectedWeapon, setSelectedWeapon] = useState('none');
  const [upgradeTemplates, setUpgradeTemplates] = useState(0);
  const [weapons, setWeapons] = useState(() => {
    const saved = localStorage.getItem('weapons');
    return saved ? JSON.parse(saved) : {
      chichao: { level: 0, unlocked: false },
      guigui: { level: 0, unlocked: false },
      dianchao: { level: 0, unlocked: false },
      totem: { level: 0, unlocked: false }
    };
  });
  const [maxLevelHelper, setMaxLevelHelper] = useState(null);
  const [helperTimer, setHelperTimer] = useState(0);
  const [dailyBossesDefeated, setDailyBossesDefeated] = useState({
    zhongdalin: false,
    guangzhi: false,
    xiaowang: false,
    longhaixing: false,
    qigong: false
  });
  const [selectedBusBreakBoss, setSelectedBusBreakBoss] = useState(null);
  const [showXiaowangConfirm, setShowXiaowangConfirm] = useState(false);
  const [xiaowangIsClone, setXiaowangIsClone] = useState(false);
  
  // Tower mode state
  const [currentFloor, setCurrentFloor] = useState(1);
  const [checkpoint, setCheckpoint] = useState(1);
  const [hasTheHand, setHasTheHand] = useState(false);
  const [towerSpecialFloor, setTowerSpecialFloor] = useState(null);
  const [gemDefeated, setGemDefeated] = useState(false);
  const [towerKillCount, setTowerKillCount] = useState(0);
  const [towerRequiredKills, setTowerRequiredKills] = useState(10);

  // Profile and difficulty
  const [playerProfile, setPlayerProfile] = useState(null);
  
  const [shootCooldown, setShootCooldown] = useState(0);
  const [healCooldown, setHealCooldown] = useState(0);
  const [flyCooldown, setFlyCooldown] = useState(0);
  const [largeAttackCooldown, setLargeAttackCooldown] = useState(0);
  const [allOutAttackCooldown, setAllOutAttackCooldown] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [isAllOutAttack, setIsAllOutAttack] = useState(false);
  const [isMeleeAttacking, setIsMeleeAttacking] = useState(false);

  // Load player profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        
        // Admin unlock all weapons at max level - do this first
        if (user.role === 'admin') {
          setIsAdmin(true);
          const adminWeapons = {
            chichao: { level: 5, unlocked: true },
            guigui: { level: 8, unlocked: true },
            dianchao: { level: 5, unlocked: true },
            totem: { level: 5, unlocked: true }
          };
          setWeapons(adminWeapons);
          localStorage.setItem('weapons', JSON.stringify(adminWeapons));
        }
        
        const profiles = await base44.entities.PlayerProfile.filter({ user_email: user.email });
        
        if (profiles.length > 0) {
          setPlayerProfile(profiles[0]);
          calculateDifficulty(profiles[0]);
        } else {
          const newProfile = await base44.entities.PlayerProfile.create({
            user_email: user.email
          });
          setPlayerProfile(newProfile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Bullet upgrades
  const [hasCannonUpgrade, setHasCannonUpgrade] = useState(false);
  const [hasHomingBullets, setHasHomingBullets] = useState(false);
  const [hasPiercingShots, setHasPiercingShots] = useState(false);
  const [hasExplosiveShots, setHasExplosiveShots] = useState(false);
  const [weaponType, setWeaponType] = useState('normal');
  const [playerColor, setPlayerColor] = useState('green');
  const [bulletColor, setBulletColor] = useState('yellow');

  // Upgrades
  const [upgrades, setUpgrades] = useState({
    damage: 1,
    fireRate: 1,
    speed: 1,
    maxHealth: 1,
    cooldownReduction: 1,
    abilityPower: 1,
    critChance: 0,
    lifeSteal: 0,
    armor: 0,
    dodgeChance: 0
  });

  const SHOOT_CD = 300 / upgrades.fireRate;
  const HEAL_CD = 5000 / upgrades.cooldownReduction;
  const FLY_CD = 10000 / upgrades.cooldownReduction;
  const FLY_DURATION = 3000 + (upgrades.abilityPower - 1) * 500;
  const LARGE_ATTACK_CD = 15000 / upgrades.cooldownReduction;
  const ALL_OUT_ATTACK_CD = 12000 / upgrades.cooldownReduction;
  const ALL_OUT_DURATION = 800 + (upgrades.abilityPower - 1) * 200;
  const MELEE_DURATION = 150;

  const calculateDifficulty = (profile) => {
    if (!profile) return;
    
    const pref = profile.difficulty_preference || 'auto';
    
    if (pref === 'easy') {
      setDifficultyMultiplier(0.7);
    } else if (pref === 'normal') {
      setDifficultyMultiplier(1.0);
    } else if (pref === 'hard') {
      setDifficultyMultiplier(1.4);
    } else if (pref === 'expert') {
      setDifficultyMultiplier(1.8);
    } else if (pref === 'auto') {
      const performance = profile.performance_score || 50;
      const multiplier = 0.5 + (performance / 100) * 1.5;
      setDifficultyMultiplier(multiplier);
    }
  };

  const updateProfileStats = async (stats) => {
    if (!playerProfile) return;
    
    try {
      await base44.entities.PlayerProfile.update(playerProfile.id, stats);
      setPlayerProfile({ ...playerProfile, ...stats });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const checkAchievements = async () => {
    if (!playerProfile) return;
    
    const newAchievements = [...playerProfile.achievements];
    
    if (playerProfile.wins >= 1 && !newAchievements.includes('first_win')) {
      newAchievements.push('first_win');
    }
    if (playerProfile.bosses_defeated >= 10 && !newAchievements.includes('boss_slayer')) {
      newAchievements.push('boss_slayer');
    }
    if (playerProfile.bosses_defeated >= 50 && !newAchievements.includes('boss_master')) {
      newAchievements.push('boss_master');
    }
    if (playerProfile.total_gold_earned >= 100000 && !newAchievements.includes('gold_collector')) {
      newAchievements.push('gold_collector');
    }
    if (playerProfile.games_played >= 20 && !newAchievements.includes('survivor')) {
      newAchievements.push('survivor');
    }
    if (playerProfile.games_played >= 100 && !newAchievements.includes('veteran')) {
      newAchievements.push('veteran');
    }
    if (playerProfile.current_win_streak >= 5 && !newAchievements.includes('perfectionist')) {
      newAchievements.push('perfectionist');
    }
    if (playerProfile.current_win_streak >= 10 && !newAchievements.includes('legend')) {
      newAchievements.push('legend');
    }
    
    if (newAchievements.length > playerProfile.achievements.length) {
      await updateProfileStats({ achievements: newAchievements });
    }
  };

  useEffect(() => {
    const loadDifficulty = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.PlayerProfile.filter({
          user_email: user.email
        });
        if (profiles.length > 0) {
          setDifficulty(profiles[0].difficulty_preference || 'adaptive');
        }
      } catch (error) {
        console.error('Error loading difficulty:', error);
      }
    };
    loadDifficulty();
  }, []);

  useEffect(() => {
    const multipliers = {
      easy: 0.7,
      normal: 1.0,
      hard: 1.5,
      adaptive: difficultyMultiplier
    };
    setDifficultyMultiplier(multipliers[difficulty] || 1.0);
  }, [difficulty]);

  const saveGameProgress = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;

      const progressData = {
        user_email: user.email,
        game_mode: gameMode,
        current_floor: currentFloor,
        checkpoint: checkpoint,
        score: score,
        coins: coins,
        player_health: playerHealth,
        defeated_bosses: defeatedBosses.map(b => b.id || b),
        upgrades: upgrades,
        selected_weapon: selectedWeapon,
        has_cannon_upgrade: hasCannonUpgrade,
        last_saved: new Date().toISOString()
      };

      // Check if progress exists
      const existing = await base44.entities.GameProgress.filter({ user_email: user.email });
      if (existing.length > 0) {
        await base44.entities.GameProgress.update(existing[0].id, progressData);
      } else {
        await base44.entities.GameProgress.create(progressData);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const loadGameProgress = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return false;

      const progress = await base44.entities.GameProgress.filter({ user_email: user.email });
      if (progress.length > 0) {
        const data = progress[0];
        setGameMode(data.game_mode);
        setCurrentFloor(data.current_floor || 1);
        setCheckpoint(data.checkpoint || 1);
        setScore(data.score || 0);
        setCoins(data.coins || 0);
        setPlayerHealth(data.player_health || 100);
        setDefeatedBosses(data.defeated_bosses || []);
        setUpgrades(data.upgrades || {});
        setSelectedWeapon(data.selected_weapon || 'none');
        setHasCannonUpgrade(data.has_cannon_upgrade || false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return false;
    }
  };

  const startGame = (mode = 'normal', fromCheckpoint = false) => {
    setGameStartTime(Date.now());
    // Reset all state first
    setGameState('start');
    setCurrentBoss(null);
    setBossHealth(0);
    setBossMaxHealth(0);
    setShowBossIntro(false);
    setSelectedBusBreakBoss(null);
    setGameStartTime(Date.now());
    
    if (mode === 'busbreak') {
      // Boss试炼模式直接开始,显示boss选择
      setGameMode(mode);
      setGameState('busbreak_select');
      return;
    }
    
    // Show weapon select for all other modes
    setGameMode(mode);
    setShowWeaponSelect(true);
  };

  const startTutorial = () => {
    setTutorialMode(true);
    setShowTutorial(true);
    setGameMode('normal');
    setPlayerHealth(100);
    setMaxHealth(100);
    setScore(0);
    setCoins(1000);
    window.tutorialEnemiesKilled = 0;
    setTimeout(() => {
      setGameState('playing');
    }, 100);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setTutorialMode(false);
    setGameState('start');
    window.tutorialEnemiesKilled = 0;
  };

  const continueGameAfterWeaponSelect = async (mode, fromCheckpoint = false) => {
    setGameMode(mode);
    setPlayerHealth(100 * upgrades.maxHealth);
    setMaxHealth(100 * upgrades.maxHealth);
    setScore(0);
    setDefeatedBosses([]);
    setCurrentBoss(null);
    setShootCooldown(0);
    setHealCooldown(0);
    setFlyCooldown(0);
    setLargeAttackCooldown(0);
    setAllOutAttackCooldown(0);
    setWaveNumber(1);
    setSurvivalTime(0);
    setShowBossIntro(false);
    setBossHealth(0);
    setBossMaxHealth(0);
    setTowerKillCount(0);
    
    // Track game start
    if (playerProfile) {
      await updateProfileStats({
        games_played: (playerProfile.games_played || 0) + 1
      });
    }
    
    if (mode === 'tower') {
      if (fromCheckpoint) {
        setCurrentFloor(checkpoint);
      } else {
        setCurrentFloor(1);
        setCheckpoint(1);
      }
      setGemDefeated(false);
      setTowerSpecialFloor(null);
      setTowerKillCount(0);
    } else if (mode === 'busbreak' && selectedBusBreakBoss) {
      // Trigger selected boss after 2 seconds
      setTimeout(() => {
        triggerBusBreakBoss(selectedBusBreakBoss);
      }, 2000);
    }
    
    setTimeout(() => {
      setGameState('playing');
    }, 0);
  };

  const triggerBusBreakBoss = useCallback((bossId) => {
    const BUSBREAK_BOSSES = {
      zhongdalin: {
        name: '中大林',
        health: 3000,
        damage: 40,
        speed: 2.0,
        size: 120,
        color: '#4ade80',
        pattern: 'chase'
      },
      xiaowang: {
        name: xiaowangIsClone ? '小黄龙分身' : '小黄龙',
        health: xiaowangIsClone ? 1500 : 3500,
        damage: xiaowangIsClone ? 25 : 50,
        speed: xiaowangIsClone ? 2.5 : 3.5,
        size: xiaowangIsClone ? 80 : 110,
        color: '#f59e0b',
        pattern: 'dash'
      },
      longhaixing: {
        name: '海星',
        health: 2800,
        damage: 38,
        speed: 2.5,
        size: 110,
        color: '#06b6d4',
        pattern: 'teleport'
      },
      qigong: {
        name: '气功大师',
        health: 3500,
        damage: 45,
        speed: 1.5,
        size: 130,
        color: '#8b5cf6',
        pattern: 'spiral'
      },
      guangzhi: {
        name: '广智',
        health: 3000,
        damage: 60,
        speed: 2.3,
        size: 160,
        color: '#ff4500',
        pattern: 'flame'
      }
    };

    const boss = BUSBREAK_BOSSES[bossId];
    if (boss) {
      setCurrentBoss({ ...boss, id: bossId });
      setBossHealth(boss.health);
      setBossMaxHealth(boss.health);
      setShowBossIntro(true);
      setGameState('boss');
      
      setTimeout(() => {
        setShowBossIntro(false);
      }, 2000);
    }
  }, []);

  const handleWeaponSelect = (weaponId) => {
    setSelectedWeapon(weaponId);
    setShowWeaponSelect(false);
    
    continueGameAfterWeaponSelect(gameMode);
  };

  const handleBossSelect = (bossId) => {
    if (bossId === 'xiaowang') {
      setShowXiaowangConfirm(true);
    } else {
      setSelectedBusBreakBoss(bossId);
      setXiaowangIsClone(false);
      setGameState('start');
      setShowWeaponSelect(true);
    }
  };

  const handleXiaowangTrue = () => {
    setSelectedBusBreakBoss('xiaowang');
    setXiaowangIsClone(false);
    setShowXiaowangConfirm(false);
    setGameState('start');
    setShowWeaponSelect(true);
  };

  const handleXiaowangClone = () => {
    setSelectedBusBreakBoss('xiaowang');
    setXiaowangIsClone(true);
    setShowXiaowangConfirm(false);
    setGameState('start');
    setShowWeaponSelect(true);
  };

  const handleWeaponUpgrade = (weaponId) => {
    if (upgradeTemplates > 0) {
      setUpgradeTemplates(prev => prev - 1);
      setWeapons(prev => {
        const newWeapons = {
          ...prev,
          [weaponId]: {
            ...prev[weaponId],
            level: prev[weaponId].level + 1,
            unlocked: weaponId === 'guigui' ? prev[weaponId].level + 1 >= 8 : true
          }
        };
        localStorage.setItem('weapons', JSON.stringify(newWeapons));
        return newWeapons;
      });
    }
  };

  const handleBusBreakBossDefeat = (bossName) => {
    // Mark daily boss as defeated
    setDailyBossesDefeated(prev => {
      const newDefeated = {
        ...prev,
        [bossName]: true
      };
      
      // Unlock specific weapon for each boss
      const bossWeaponMap = {
        zhongdalin: 'totem',
        xiaowang: xiaowangIsClone ? null : 'dianchao',
        longhaixing: null,
        qigong: null,
        guangzhi: 'chichao'
      };
      
      const weaponToUnlock = bossWeaponMap[bossName];
      if (weaponToUnlock && !xiaowangIsClone) {
        setWeapons(prev => {
          const newWeapons = {
            ...prev,
            [weaponToUnlock]: {
              ...prev[weaponToUnlock],
              unlocked: true,
              level: Math.max(prev[weaponToUnlock].level, 1)
            }
          };
          localStorage.setItem('weapons', JSON.stringify(newWeapons));
          return newWeapons;
        });
      }
      
      // Every 4 bosses defeated, give 1 upgrade template
      const defeatedCount = Object.values(newDefeated).filter(Boolean).length;
      if (defeatedCount % 4 === 0) {
        setUpgradeTemplates(prev => prev + 1);
      }
      
      return newDefeated;
    });
  };

  const triggerBoss = useCallback((bossIndex) => {
    const boss = BOSSES[bossIndex];
    if (boss && !defeatedBosses.includes(boss.id)) {
      setCurrentBoss(boss);
      setBossHealth(boss.health);
      setBossMaxHealth(boss.health);
      setShowBossIntro(true);
      setGameState('boss');
      
      setTimeout(() => {
        setShowBossIntro(false);
      }, 2000);
    }
  }, [defeatedBosses]);

  const defeatBoss = useCallback(() => {
    if (currentBoss) {
      const newDefeatedCount = defeatedBosses.length + 1;
      setDefeatedBosses(prev => [...prev, currentBoss.id]);
      setScore(prev => prev + currentBoss.health * 10);
      
      // Unlock boss in encyclopedia
      const bossId = `boss_${currentBoss.id}`;
      unlockEncyclopediaEntry(bossId, 'boss');
      
      const bonusCoins = difficultyMultiplier >= 1.4 ? 200 : difficultyMultiplier >= 1.0 ? 100 : 150;
      setCoins(prev => {
        const newCoins = prev + bonusCoins;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      setPlayerHealth(prev => Math.min(maxHealth, prev + 50));
      
      if (playerProfile) {
        updateProfileStats({
          total_bosses_defeated: (playerProfile.total_bosses_defeated || 0) + 1,
          total_gold_earned: (playerProfile.total_gold_earned || 0) + bonusCoins
        });
      }
      
      // Bus break mode - mark boss as defeated and give rewards
      if (gameMode === 'busbreak') {
        handleBusBreakBossDefeat(currentBoss.id);
        setCurrentBoss(null);
        setSelectedBusBreakBoss(null);
        setGameState('victory');
        return;
      }
      
      setCurrentBoss(null);
      
      // Tower mode floor progression
      if (gameMode === 'tower') {
        const nextFloor = currentFloor + 1;
        if (nextFloor > 100) {
          setHasTheHand(true);
          setGameState('victory');
        } else {
          setCurrentFloor(nextFloor);
          // Save checkpoint every 10 floors
          if (nextFloor % 10 === 1 && nextFloor > 1) {
            setCheckpoint(nextFloor);
          }
          // Reset kill counter for next floor
          setTowerKillCount(0);
          setTowerRequiredKills(10 + Math.floor(nextFloor / 10) * 2);
          setGameState('playing');
        }
      } else {
        setGameState('playing');
        
        // Unlock cannon after 5 bosses
        if (newDefeatedCount >= 5 && !hasCannonUpgrade) {
          setHasCannonUpgrade(true);
        }
        
        if (newDefeatedCount >= 20) {
          if (playerProfile) {
            const playtime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 60000) : 0;
            updateProfileStats({
              highest_score: Math.max(playerProfile.highest_score || 0, score),
              total_playtime_minutes: (playerProfile.total_playtime_minutes || 0) + playtime,
              performance_stats: {
                ...playerProfile.performance_stats,
                win_rate: ((playerProfile.performance_stats?.win_rate || 0) * 0.9) + 0.1
              }
            });
          }
          setGameState('victory');
        }
      }
    }
  }, [currentBoss, defeatedBosses.length, maxHealth, hasCannonUpgrade, gameMode, currentFloor, handleBusBreakBossDefeat, difficultyMultiplier, playerProfile, gameStartTime, score]);

  const handlePlayerDamage = useCallback((damage) => {
    if (isFlying) return;
    const adjustedDamage = damage * difficultyMultiplier;
    setPlayerHealth(prev => {
      const newHealth = prev - adjustedDamage;
      if (newHealth <= 0) {
        if (playerProfile) {
          const playtime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 60000) : 0;
          updateProfileStats({
            total_playtime_minutes: (playerProfile.total_playtime_minutes || 0) + playtime,
            performance_stats: {
              ...playerProfile.performance_stats,
              avg_damage_taken: adjustedDamage
            }
          });
        }
        setGameState('gameover');
        return 0;
      }
      return newHealth;
    });
  }, [isFlying, difficultyMultiplier, playerProfile, gameStartTime]);

  const unlockEncyclopediaEntry = async (entryId, entryType) => {
    try {
      const user = await base44.auth.me();
      const existing = await base44.entities.EncyclopediaEntry.filter({
        user_email: user.email,
        entry_id: entryId
      });

      if (existing.length === 0) {
        await base44.entities.EncyclopediaEntry.create({
          user_email: user.email,
          entry_id: entryId,
          entry_type: entryType,
          unlocked: true,
          times_encountered: 1,
          times_defeated: 1
        });
      } else {
        await base44.entities.EncyclopediaEntry.update(existing[0].id, {
          unlocked: true,
          times_defeated: (existing[0].times_defeated || 0) + 1
        });
      }
    } catch (error) {
      console.error('Failed to unlock encyclopedia entry:', error);
    }
  };

  const handleEnemyKill = useCallback((enemyType) => {
    // Tutorial tracking
    if (tutorialMode && window.tutorialUpdateState) {
      window.tutorialUpdateState({ 
        enemiesKilled: (window.tutorialEnemiesKilled || 0) + 1 
      });
      window.tutorialEnemiesKilled = (window.tutorialEnemiesKilled || 0) + 1;
    }

    // Track tower kills
    if (gameMode === 'tower' && enemyType === 'zhongdalin') {
      setTowerKillCount(prev => prev + 1);
    }

    // Floor complete trigger for tower mode
    if (enemyType === 'floor_complete' && gameMode === 'tower') {
      const nextFloor = currentFloor + 1;
      if (nextFloor > 100) {
        setHasTheHand(true);
        setGameState('victory');
      } else {
        setCurrentFloor(nextFloor);
        // Save checkpoint every 10 floors
        if (nextFloor % 10 === 1 && nextFloor > 1) {
          setCheckpoint(nextFloor);
        }
        // Reset kill counter and increase requirement
        setTowerKillCount(0);
        setTowerRequiredKills(10 + Math.floor(nextFloor / 10) * 2);
      }
      return;
    }

    setScore(prev => {
      const newScore = prev + 100;
      // Trigger boss every 800 score (not in tower mode)
      if (gameMode !== 'tower' && Math.floor(newScore / 800) > Math.floor(prev / 800)) {
        const bossIndex = defeatedBosses.length;
        if (bossIndex < BOSSES.length) {
          setTimeout(() => triggerBoss(bossIndex), 1000);
        }
      }
      return newScore;
    });
    setCoins(prev => {
      const newCoins = prev + 10;
      localStorage.setItem('gameCoins', newCoins.toString());
      return newCoins;
    });

    // Life steal passive
    if (upgrades.lifeSteal > 0) {
      const lifeStealAmount = 10 * (upgrades.lifeSteal * 0.05);
      setPlayerHealth(prev => Math.min(maxHealth, prev + lifeStealAmount));
    } else {
      setPlayerHealth(prev => Math.min(maxHealth, prev + 10));
    }
  }, [maxHealth, defeatedBosses.length, triggerBoss, gameMode, upgrades.lifeSteal, currentFloor]);

  const handleBossDamage = useCallback((damage) => {
    setBossHealth(prev => {
      const newHealth = prev - damage;
      if (newHealth <= 0) {
        defeatBoss();
        return 0;
      }
      return newHealth;
    });
  }, [defeatBoss]);

  const handleBoostBoss = useCallback(() => {
    if (coins >= 500 && currentBoss) {
      setCoins(prev => {
        const newCoins = prev - 500;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      setBossBoostLevel(prev => prev + 1);

      // 增加Boss血量和伤害
      const healthBoost = bossMaxHealth * 0.3;
      setBossHealth(prev => prev + healthBoost);
      setBossMaxHealth(prev => prev + healthBoost);

      // 视觉反馈
      setScore(prev => prev + 500);
    }
  }, [coins, currentBoss, bossMaxHealth]);

  const shoot = useCallback(() => {
    if (shootCooldown <= 0) {
      setShootCooldown(SHOOT_CD);
      return true;
    }
    return false;
  }, [shootCooldown, SHOOT_CD]);

  const heal = useCallback(() => {
    if (healCooldown <= 0 && playerHealth < maxHealth) {
      setHealCooldown(HEAL_CD);
      const healAmount = 30 + (upgrades.abilityPower - 1) * 10;
      setPlayerHealth(prev => Math.min(maxHealth, prev + healAmount));
      return true;
    }
    return false;
  }, [healCooldown, playerHealth, maxHealth, HEAL_CD, upgrades.abilityPower]);

  const fly = useCallback(() => {
    if (flyCooldown <= 0 && !isFlying) {
      setFlyCooldown(FLY_CD);
      setIsFlying(true);
      setTimeout(() => setIsFlying(false), FLY_DURATION);
      return true;
    }
    return false;
  }, [flyCooldown, isFlying]);

  const largeAttack = useCallback(() => {
    if (largeAttackCooldown <= 0) {
      setLargeAttackCooldown(LARGE_ATTACK_CD);
      return true;
    }
    return false;
  }, [largeAttackCooldown]);

  const allOutAttack = useCallback(() => {
    if (allOutAttackCooldown <= 0) {
      setAllOutAttackCooldown(ALL_OUT_ATTACK_CD);
      setIsAllOutAttack(true);
      setTimeout(() => setIsAllOutAttack(false), ALL_OUT_DURATION);
      return true;
    }
    return false;
  }, [allOutAttackCooldown]);

  const meleeAttack = useCallback(() => {
    setIsMeleeAttacking(true);
    setTimeout(() => setIsMeleeAttacking(false), MELEE_DURATION);
    return true;
  }, []);

  const handlePurchase = (upgrade, cost) => {
    if (coins >= cost) {
      setCoins(prev => {
        const newCoins = prev - cost;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      
      if (upgrade === 'homingBullets') {
        setHasHomingBullets(true);
      } else if (upgrade === 'piercingShots') {
        setHasPiercingShots(true);
      } else if (upgrade === 'explosiveShots') {
        setHasExplosiveShots(true);
      } else if (upgrade === 'weaponSpread') {
        setWeaponType('spread');
      } else if (upgrade === 'weaponLaser') {
        setWeaponType('laser');
      } else if (upgrade.startsWith('color_')) {
        const [, type, color] = upgrade.split('_');
        if (type === 'player') setPlayerColor(color);
        else if (type === 'bullet') setBulletColor(color);
      } else if (upgrade === 'reset') {
        setUpgrades({
          damage: 1,
          fireRate: 1,
          speed: 1,
          maxHealth: 1,
          cooldownReduction: 1,
          abilityPower: 1,
          critChance: 0,
          lifeSteal: 0,
          armor: 0,
          dodgeChance: 0
        });
        setHasHomingBullets(false);
        setHasPiercingShots(false);
        setHasExplosiveShots(false);
        setWeaponType('normal');
        setCoins(prev => {
          const newCoins = prev + Math.floor(cost * 0.5);
          localStorage.setItem('gameCoins', newCoins.toString());
          return newCoins;
        });
      } else {
        setUpgrades(prev => ({
          ...prev,
          [upgrade]: prev[upgrade] + 1
        }));
        if (upgrade === 'maxHealth') {
          const newMax = 100 * (upgrades.maxHealth + 1);
          setMaxHealth(newMax);
          setPlayerHealth(prev => Math.min(newMax, prev + 50));
        }
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'boss') return;
    
    const interval = setInterval(() => {
      setShootCooldown(prev => Math.max(0, prev - 50));
      setHealCooldown(prev => Math.max(0, prev - 50));
      setFlyCooldown(prev => Math.max(0, prev - 50));
      setLargeAttackCooldown(prev => Math.max(0, prev - 50));
      setAllOutAttackCooldown(prev => Math.max(0, prev - 50));
      
      // Helper timer
      if (maxLevelHelper && helperTimer > 0) {
        setHelperTimer(prev => Math.max(0, prev - 0.05));
        if (helperTimer <= 0) {
          setMaxLevelHelper(null);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, maxLevelHelper, helperTimer]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'b' && (gameState === 'playing' || gameState === 'boss')) {
        const newShopState = !showShop;
        setShowShop(newShopState);
        setIsInShop(newShopState);
      }
      if (e.key.toLowerCase() === 'f' && (gameState === 'playing' || gameState === 'boss')) {
        setShowForge(prev => !prev);
      }
      // Save progress on Ctrl+S
      if (e.ctrlKey && e.key.toLowerCase() === 's' && (gameState === 'playing' || gameState === 'boss')) {
        e.preventDefault();
        saveGameProgress();
        alert('进度已保存！');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, gameMode, currentFloor, checkpoint, score, coins, playerHealth, defeatedBosses, upgrades, selectedWeapon, hasCannonUpgrade, showShop]);

  // Auto-save every 30 seconds during gameplay
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'boss') return;
    
    const autoSaveInterval = setInterval(() => {
      saveGameProgress();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [gameState, gameMode, currentFloor, checkpoint, score, coins, playerHealth, defeatedBosses, upgrades, selectedWeapon, hasCannonUpgrade]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#87CEEB] via-[#5F9EA0] to-[#2F4F4F] overflow-hidden relative pb-12">
      {showEmailModal && gameState === 'start' && (
        <EmailSubscriptionModal 
          onClose={() => setShowEmailModal(false)}
          onSubscribe={() => setShowEmailModal(false)}
        />
      )}

      {(gameState === 'playing' || gameState === 'boss') && (
        <div className="absolute top-2 right-2 z-40">
          <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <StartScreen 
            onStart={startGame} 
            onStartTutorial={startTutorial}
            defeatedBosses={defeatedBosses} 
          />
        )}

        {gameState === 'busbreak_select' && !showXiaowangConfirm && (
          <BusBreakSelect
            onSelectBoss={handleBossSelect}
            onCancel={() => setGameState('start')}
            defeatedBosses={dailyBossesDefeated}
          />
        )}

        {showXiaowangConfirm && (
          <XiaowangConfirm
            onSelectTrue={handleXiaowangTrue}
            onSelectClone={handleXiaowangClone}
            onCancel={() => {
              setShowXiaowangConfirm(false);
              setGameState('busbreak_select');
            }}
          />
        )}
        
        {(gameState === 'playing' || gameState === 'boss') && (
          <>
            {showTutorial && (
              <Tutorial 
                onComplete={completeTutorial}
                onSkip={completeTutorial}
              />
            )}

            <VirtualKeyboard />

            <GameCanvas
              gameState={gameState}
              gameMode={gameMode}
              selectedWeapon={selectedWeapon}
              weaponLevel={weapons[selectedWeapon]?.level || 0}
              onPlayerDamage={handlePlayerDamage}
              onEnemyKill={handleEnemyKill}
              onBossDamage={handleBossDamage}
              onTriggerBoss={triggerBoss}
              shoot={shoot}
              heal={heal}
              fly={fly}
              largeAttack={largeAttack}
              allOutAttack={allOutAttack}
              meleeAttack={meleeAttack}
              isFlying={isFlying}
              isAllOutAttack={isAllOutAttack}
              isMeleeAttacking={isMeleeAttacking}
              currentBoss={currentBoss}
              defeatedBosses={defeatedBosses}
              score={score}
              upgrades={upgrades}
              difficultyMultiplier={difficultyMultiplier}
              hasCannonUpgrade={hasCannonUpgrade}
              hasHomingBullets={hasHomingBullets}
              hasPiercingShots={hasPiercingShots}
              hasExplosiveShots={hasExplosiveShots}
              weaponType={weaponType}
              playerColor={playerColor}
              bulletColor={bulletColor}
              currentFloor={currentFloor}
              towerSpecialFloor={towerSpecialFloor}
              onTowerSpecialFloor={setTowerSpecialFloor}
              gemDefeated={gemDefeated}
              onGemDefeated={setGemDefeated}
              maxLevelHelper={maxLevelHelper}
              helperTimer={helperTimer}
              isInShop={isInShop}
              towerKillCount={towerKillCount}
              towerRequiredKills={towerRequiredKills}
            />
            
            <GameUI
              health={playerHealth}
              maxHealth={maxHealth}
              score={score}
              coins={coins}
              shootCooldown={shootCooldown / SHOOT_CD}
              healCooldown={healCooldown / HEAL_CD}
              flyCooldown={flyCooldown / FLY_CD}
              largeAttackCooldown={largeAttackCooldown / LARGE_ATTACK_CD}
              allOutAttackCooldown={allOutAttackCooldown / ALL_OUT_ATTACK_CD}
              isFlying={isFlying}
              isAllOutAttack={isAllOutAttack}
              bossHealth={currentBoss ? bossHealth : null}
              bossMaxHealth={bossMaxHealth}
              bossName={currentBoss?.name}
              defeatedBosses={defeatedBosses.length}
              hasCannonUpgrade={hasCannonUpgrade}
              hasHomingBullets={hasHomingBullets}
              gameMode={gameMode}
              currentFloor={currentFloor}
              checkpoint={checkpoint}
              towerSpecialFloor={towerSpecialFloor}
              selectedWeapon={selectedWeapon}
              onBoostBoss={handleBoostBoss}
              maxLevelHelper={maxLevelHelper}
              helperTimer={helperTimer}
              towerKillCount={towerKillCount}
              towerRequiredKills={towerRequiredKills}
              weaponLevel={weapons[selectedWeapon]?.level || 0}
            />
            
            <AnimatePresence>
              {showBossIntro && currentBoss && (
                <BossIntro boss={currentBoss} />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showShop && (
                <Shop
                  coins={coins}
                  upgrades={upgrades}
                  hasHomingBullets={hasHomingBullets}
                  hasPiercingShots={hasPiercingShots}
                  hasExplosiveShots={hasExplosiveShots}
                  weaponType={weaponType}
                  playerColor={playerColor}
                  bulletColor={bulletColor}
                  onPurchase={handlePurchase}
                  onClose={() => {
                    setShowShop(false);
                    setIsInShop(false);
                  }}
                />
              )}

            {showForge && (
              <Forge
                weapons={weapons}
                templates={upgradeTemplates}
                onUpgrade={handleWeaponUpgrade}
                onClose={() => setShowForge(false)}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {showXiaowangConfirm && (
        <XiaowangConfirm
          onSelectTrue={handleXiaowangTrue}
          onSelectClone={handleXiaowangClone}
          onCancel={() => {
            setShowXiaowangConfirm(false);
            setGameState('busbreak_select');
          }}
        />
      )}

      {showWeaponSelect && (
        <WeaponSelect
          availableWeapons={weapons}
          onSelect={handleWeaponSelect}
          onClose={() => {
            setShowWeaponSelect(false);
            setGameState('start');
          }}
        />
      )}
        
        {(gameState === 'gameover' || gameState === 'victory') && (
          <GameOver
              victory={gameState === 'victory'}
              score={score}
              coins={coins}
              defeatedBosses={defeatedBosses.length}
              onRestart={startGame}
              gameMode={gameMode}
              currentFloor={currentFloor}
              checkpoint={checkpoint}
              hasTheHand={hasTheHand}
            />
        )}
        </AnimatePresence>

        {(gameState === 'playing' || gameState === 'boss') && (
          <BottomNav 
            onLanguageClick={() => {}}
            onShopClick={() => setShowShop(true)}
            onMiniGamesClick={() => window.location.href = createPageUrl('MiniGames')}
            showShop={true}
          />
        )}
        </div>
        );
        }