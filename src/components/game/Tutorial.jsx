import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: '欢迎来到游戏！',
    description: '让我们学习基本操作',
    task: 'WASD或方向键移动，试着走几步',
    instruction: '按 W/A/S/D 或方向键开始移动',
    checkComplete: (state) => state.hasMoved
  },
  {
    id: 2,
    title: '射击敌人',
    description: '消灭靠近的敌人',
    task: '按K键射击，击杀3个敌人',
    instruction: '瞄准敌人按 K 键射击',
    checkComplete: (state) => state.enemiesKilled >= 3
  },
  {
    id: 3,
    title: '治疗技能',
    description: '生命值低时使用治疗',
    task: '按H键使用治疗技能',
    instruction: '按 H 键恢复生命值（冷却5秒）',
    checkComplete: (state) => state.hasHealed
  },
  {
    id: 4,
    title: '飞行技能',
    description: '飞行时无敌',
    task: '按O键飞行躲避攻击',
    instruction: '按 O 键飞行3秒（冷却10秒）',
    checkComplete: (state) => state.hasFlown
  },
  {
    id: 5,
    title: '近战攻击',
    description: '360度范围伤害',
    task: '按J键使用近战攻击',
    instruction: '靠近敌人按 J 键近战',
    checkComplete: (state) => state.hasMelee
  },
  {
    id: 6,
    title: '大招技能',
    description: '全屏范围攻击',
    task: '按L键释放大招，击杀5个敌人',
    instruction: '按 L 键释放强力大招',
    checkComplete: (state) => state.largeAttackKills >= 5
  },
  {
    id: 7,
    title: '召唤战友',
    description: '召唤AI战友协助战斗',
    task: '按U键召唤战友（需装备武器）',
    instruction: '装备武器后按 U 键召唤助手',
    checkComplete: (state) => state.hasSummoned
  },
  {
    id: 8,
    title: '商店系统',
    description: '使用金币升级能力',
    task: '按B键打开商店，购买一个升级',
    instruction: '按 B 键打开/关闭商店',
    checkComplete: (state) => state.hasBoughtUpgrade
  },
  {
    id: 9,
    title: '教程完成！',
    description: '你已准备好开始冒险',
    task: '点击完成开始游戏',
    instruction: '现在你可以选择游戏模式开始战斗了！',
    checkComplete: () => true
  }
];

export default function Tutorial({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorialState, setTutorialState] = useState({
    hasMoved: false,
    enemiesKilled: 0,
    hasHealed: false,
    hasFlown: false,
    hasMelee: false,
    largeAttackKills: 0,
    hasSummoned: false,
    hasBoughtUpgrade: false
  });
  const [showHint, setShowHint] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];
  const isComplete = step.checkComplete(tutorialState);

  // Listen for game events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setTutorialState(prev => ({ ...prev, hasMoved: true }));
      }
      if (e.key.toLowerCase() === 'h') {
        setTutorialState(prev => ({ ...prev, hasHealed: true }));
      }
      if (e.key.toLowerCase() === 'o') {
        setTutorialState(prev => ({ ...prev, hasFlown: true }));
      }
      if (e.key.toLowerCase() === 'j') {
        setTutorialState(prev => ({ ...prev, hasMelee: true }));
      }
      if (e.key.toLowerCase() === 'u') {
        setTutorialState(prev => ({ ...prev, hasSummoned: true }));
      }
      if (e.key.toLowerCase() === 'b') {
        setShowHint(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto advance when complete
  useEffect(() => {
    if (isComplete && currentStep < TUTORIAL_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setShowHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, currentStep]);

  const handleNext = () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      onComplete();
    } else if (isComplete) {
      setCurrentStep(prev => prev + 1);
      setShowHint(true);
    }
  };

  // Public methods for game to update tutorial state
  useEffect(() => {
    window.tutorialUpdateState = (updates) => {
      setTutorialState(prev => ({ ...prev, ...updates }));
    };
    return () => {
      delete window.tutorialUpdateState;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Progress bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 pointer-events-auto">
        <div className="bg-black/80 rounded-full p-1 backdrop-blur-sm">
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentStep ? 'bg-green-500' :
                  i === currentStep ? 'bg-yellow-500' :
                  'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main tutorial card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 pointer-events-auto"
        >
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl border-2 border-purple-500/50 shadow-2xl p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-400">
                    步骤 {currentStep + 1}/{TUTORIAL_STEPS.length}
                  </span>
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">{step.title}</h3>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task */}
            <div className="bg-slate-950/50 rounded-lg p-3 mb-3 border border-purple-500/30">
              <p className="text-xs font-semibold text-yellow-400 mb-1">任务目标</p>
              <p className="text-sm text-white">{step.task}</p>
            </div>

            {/* Instruction with animation */}
            {showHint && !isComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-2.5 mb-3"
              >
                <p className="text-xs text-blue-300 flex items-center gap-2">
                  <span className="animate-pulse">💡</span>
                  {step.instruction}
                </p>
              </motion.div>
            )}

            {/* Progress indicator for kill tasks */}
            {step.id === 2 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>击杀进度</span>
                  <span>{tutorialState.enemiesKilled}/3</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(tutorialState.enemiesKilled / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {step.id === 6 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>大招击杀</span>
                  <span>{tutorialState.largeAttackKills}/5</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(tutorialState.largeAttackKills / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  上一步
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isComplete}
                className="flex-1 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                size="sm"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? '完成教程' : '继续'}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip button in corner */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 text-xs text-gray-400 hover:text-white transition-colors pointer-events-auto px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm"
      >
        跳过教程
      </button>
    </div>
  );
}