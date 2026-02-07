import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Shield, Users, X } from 'lucide-react';

export default function WeaponSelect({ availableWeapons, onSelect, onClose }) {
  const [selectedWeapon, setSelectedWeapon] = useState('none');
  const [clickedWeapon, setClickedWeapon] = useState(null);

  const weapons = {
    none: {
      id: 'none',
      name: '无武器',
      icon: X,
      color: 'from-gray-500 to-gray-600',
      description: '不使用任何特殊武器'
    },
    chichao: {
      id: 'chichao',
      name: '赤潮',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      description: '击败广智解锁',
      skills: [
        '火焰喷射 - 发射火焰弹',
        '火焰斩 - 近距离火焰攻击',
        '炎爆 - 喷发大量火焰',
        '广志真身 - 召唤广志攻击敌人'
      ],
      locked: !availableWeapons?.chichao?.unlocked
    },
    guigui: {
      id: 'guigui',
      name: '龟龟之手',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      description: '需要8个升级模板解锁',
      skills: [
        '光束 - 向前喷射龟光',
        '龟圈 - 散发致命光圈',
        '龟文诅咒 - 散发诅咒文字'
      ],
      locked: !availableWeapons?.guigui?.unlocked
    },
    dianchao: {
      id: 'dianchao',
      name: '电巢',
      icon: Zap,
      color: 'from-yellow-500 to-blue-500',
      description: '击败小黄龙解锁',
      skills: [
        '电流四射 - 四周释放电流',
        '雷暴 - 大量电气伤害'
      ],
      locked: !availableWeapons?.dianchao?.unlocked
    },
    totem: {
      id: 'totem',
      name: '中大林图腾',
      icon: Users,
      color: 'from-green-400 to-green-600',
      description: '击败中大林解锁',
      skills: [
        '图腾射击 - 每5次召唤中大林',
        '召唤军团 - 召唤强化中大林'
      ],
      locked: !availableWeapons?.totem?.unlocked
    }
  };

  const handleConfirm = () => {
    onSelect(selectedWeapon);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4 md:p-8 max-w-4xl w-full max-h-[90vh] border-2 border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          选择你的武器
        </h2>
        <p className="text-center text-gray-400 mb-4 md:mb-8">选择一个武器进入战斗</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 md:mb-8 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {Object.values(weapons).map((weapon) => {
            const Icon = weapon.icon;
            const isSelected = selectedWeapon === weapon.id;
            const isLocked = weapon.locked;

            return (
              <motion.button
                key={weapon.id}
                onClick={() => {
                  if (!isLocked) {
                    setSelectedWeapon(weapon.id);
                    setClickedWeapon(weapon.id);
                  }
                }}
                disabled={isLocked}
                whileHover={!isLocked ? { scale: 1.05 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                className={`relative bg-gradient-to-br ${weapon.color} p-1 rounded-xl ${
                  isSelected ? 'ring-4 ring-yellow-400' : ''
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="bg-slate-900 rounded-lg p-6">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${weapon.color} flex items-center justify-center`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{weapon.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{weapon.description}</p>
                  
                  {weapon.skills && (
                    <div className="text-left space-y-1">
                      {weapon.skills.map((skill, idx) => (
                        <p key={idx} className="text-xs text-cyan-300">• {skill}</p>
                      ))}
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/80 rounded-lg px-4 py-2">
                        <p className="text-yellow-400 font-bold">需要解锁</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-4 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-base md:text-lg py-4 md:py-6"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedWeapon}
            className="flex-1 text-base md:text-lg py-4 md:py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
          >
            确认选择
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}