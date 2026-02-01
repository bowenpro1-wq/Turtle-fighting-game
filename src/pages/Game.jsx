import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
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
  { id: 20, name: "广智", health: 2500, damage: 120, speed: 2, size: 220, color: "#ff4500", pattern: "flame" }
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
  const [difficulty, setDifficulty] = useState('adaptive');
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1);
  const [performanceTracker, setPerformanceTracker] = useState({
    damagesTaken: [],
    timesCompleted: [],
    winsCount: 0,
    lossesCount: 0
  });
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
  const [waveNumber, setWaveNumber] = useState(1);
  const [survivalTime, setSurvivalTime] = useState(0);
  
  // Weapon system
  const [selectedWeapon, setSelectedWeapon] = useState('none');
  const [upgradeTemplates, setUpgradeTemplates] = useState(0);
  const [weapons, setWeapons] = useState({
    chichao: { level: 0, unlocked: false },
    guigui: { level: 0, unlocked: false },
    dianchao: { level: 0, unlocked: false },
    totem: { level: 0, unlocked: false }
  });
  const [dailyBossesDefeated, setDailyBossesDefeated] = useState({
    zhongdalin: false,
    guangzhi: false,
    xiaowang: false,
    longhaixing: false,
    qigong: false
  });
  const [selectedBusBreakBoss, setSelectedBusBreakBoss] = useState(null);
  
  // Tower mode state
  const [currentFloor, setCurrentFloor] = useState(1);
  const [checkpoint, setCheckpoint] = useState(1);
  const [hasTheHand, setHasTheHand] = useState(false);
  const [towerSpecialFloor, setTowerSpecialFloor] = useState(null);
  const [gemDefeated, setGemDefeated] = useState(false);

  // Profile and difficulty
  const [playerProfile, setPlayerProfile] = useState(null);
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1);
  const [gameStartTime, setGameStartTime] = useState(null);
  
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

  const continueGameAfterWeaponSelect = (mode, fromCheckpoint = false) => {
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
    
    if (mode === 'tower') {
      if (fromCheckpoint) {
        setCurrentFloor(checkpoint);
      } else {
        setCurrentFloor(1);
        setCheckpoint(1);
      }
      setGemDefeated(false);
      setTowerSpecialFloor(null);
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
        name: '小黄龙',
        health: 2500,
        damage: 35,
        speed: 3.0,
        size: 100,
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
        health: 5000,
        damage: 60,
        speed: 2.2,
        size: 150,
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
    setSelectedBusBreakBoss(bossId);
    setGameState('start');
    setShowWeaponSelect(true);
  };

  const handleWeaponUpgrade = (weaponId) => {
    if (upgradeTemplates > 0) {
      setUpgradeTemplates(prev => prev - 1);
      setWeapons(prev => ({
        ...prev,
        [weaponId]: {
          ...prev[weaponId],
          level: prev[weaponId].level + 1,
          unlocked: weaponId === 'guigui' ? prev[weaponId].level + 1 >= 8 : true
        }
      }));
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
        xiaowang: 'dianchao',
        longhaixing: null,
        qigong: null,
        guangzhi: 'chichao'
      };
      
      const weaponToUnlock = bossWeaponMap[bossName];
      if (weaponToUnlock) {
        setWeapons(prev => ({
          ...prev,
          [weaponToUnlock]: {
            ...prev[weaponToUnlock],
            unlocked: true,
            level: Math.max(prev[weaponToUnlock].level, 1)
          }
        }));
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
      
      const bonusCoins = difficultyMultiplier >= 1.4 ? 200 : difficultyMultiplier >= 1.0 ? 100 : 150;
      setCoins(prev => {
        const newCoins = prev + bonusCoins;
        localStorage.setItem('gameCoins', newCoins.toString());
        return newCoins;
      });
      setPlayerHealth(prev => Math.min(maxHealth, prev + 50));
      
      if (playerProfile) {
        updateProfileStats({
          bosses_defeated: playerProfile.bosses_defeated + 1,
          total_gold_earned: playerProfile.total_gold_earned + bonusCoins
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
          setGameState('playing');
        }
      } else {
        setGameState('playing');
        
        // Unlock cannon after 5 bosses
        if (newDefeatedCount >= 5 && !hasCannonUpgrade) {
          setHasCannonUpgrade(true);
        }
        
        if (newDefeatedCount >= 20) {
          setGameState('victory');
        }
      }
    }
  }, [currentBoss, defeatedBosses.length, maxHealth, hasCannonUpgrade, gameMode, currentFloor, handleBusBreakBossDefeat, difficultyMultiplier, playerProfile]);

  const handlePlayerDamage = useCallback((damage) => {
    if (isFlying) return;
    const adjustedDamage = damage * difficultyMultiplier;
    setPlayerHealth(prev => {
      const newHealth = prev - adjustedDamage;
      if (newHealth <= 0) {
        if (playerProfile) {
          const playtime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 60000) : 0;
          updateProfileStats({
            games_played: playerProfile.games_played + 1,
            deaths: playerProfile.deaths + 1,
            current_win_streak: 0,
            total_playtime_minutes: playerProfile.total_playtime_minutes + playtime,
            performance_score: Math.max(0, playerProfile.performance_score - 5)
          });
        }
        setGameState('gameover');
        return 0;
      }
      return newHealth;
    });
  }, [isFlying, difficultyMultiplier, playerProfile, gameStartTime]);

  const handleEnemyKill = useCallback((enemyType) => {
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
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'b' && (gameState === 'playing' || gameState === 'boss')) {
        setShowShop(prev => !prev);
      }
      if (e.key.toLowerCase() === 'f' && (gameState === 'playing' || gameState === 'boss')) {
        setShowForge(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

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
          <StartScreen onStart={startGame} defeatedBosses={defeatedBosses} />
        )}

        {gameState === 'busbreak_select' && (
          <BusBreakSelect
            onSelectBoss={handleBossSelect}
            onCancel={() => setGameState('start')}
            defeatedBosses={dailyBossesDefeated}
          />
        )}
        
        {(gameState === 'playing' || gameState === 'boss') && (
          <>
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
                  onClose={() => setShowShop(false)}
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
          <>
            {gameState === 'victory' && playerProfile && (() => {
              const playtime = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 60000) : 0;
              updateProfileStats({
                games_played: playerProfile.games_played + 1,
                wins: playerProfile.wins + 1,
                current_win_streak: playerProfile.current_win_streak + 1,
                best_win_streak: Math.max(playerProfile.best_win_streak, playerProfile.current_win_streak + 1),
                highest_score: Math.max(playerProfile.highest_score, score),
                total_playtime_minutes: playerProfile.total_playtime_minutes + playtime,
                performance_score: Math.min(100, playerProfile.performance_score + 3)
              });
              checkAchievements();
              return null;
            })()}
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
          </>
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