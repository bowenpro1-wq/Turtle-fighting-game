import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Flame, Zap, Shield, Users, ArrowUpCircle, Star } from 'lucide-react';

export default function Forge({ weapons, templates, onUpgrade, onClose }) {
  const [selectedWeapon, setSelectedWeapon] = useState(null);

  const weaponData = {
    chichao: {
      id: 'chichao',
      name: '赤潮',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      maxLevel: 5,
      maxBenefit: '满级召唤广智助战1分钟'
    },
    guigui: {
      id: 'guigui',
      name: '龟龟之手',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      maxLevel: 8,
      special: true,
      maxBenefit: '满级召唤海星助战1分钟'
    },
    dianchao: {
      id: 'dianchao',
      name: '电巢',
      icon: Zap,
      color: 'from-yellow-500 to-blue-500',
      maxLevel: 5,
      maxBenefit: '满级召唤小黄龙助战1分钟'
    },
    totem: {
      id: 'totem',
      name: '中大林图腾',
      icon: Users,
      color: 'from-green-400 to-green-600',
      maxLevel: 5,
      maxBenefit: '满级召唤中大林助战1分钟'
    }
  };

  const handleUpgrade = (weaponId) => {
    if (templates > 0) {
      const weapon = weapons[weaponId];
      const data = weaponData[weaponId];
      if (weapon && weapon.level < data.maxLevel) {
        onUpgrade(weaponId);
      }
    }
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
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full border-2 border-orange-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
              锻造处
            </h2>
            <p className="text-yellow-400 text-xl mt-2">升级模板: {templates}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 h-12 w-12"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(weapons).map(([weaponId, weapon]) => {
            const data = weaponData[weaponId];
            if (!data) return null;

            const Icon = data.icon;
            const isMaxLevel = weapon.level >= data.maxLevel;
            const canUpgrade = templates > 0 && !isMaxLevel;

            return (
              <motion.div
                key={weaponId}
                whileHover={{ scale: 1.02 }}
                className={`bg-gradient-to-br ${data.color} p-1 rounded-xl`}
              >
                <div className="bg-slate-900 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${data.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{data.name}</h3>
                        {data.special && (
                          <span className="text-xs text-yellow-400">⭐ 特殊武器</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">等级</span>
                        <span className="text-white font-bold">
                          {weapon.level} / {data.maxLevel}
                        </span>
                      </div>
                      <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${data.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(weapon.level / data.maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">伤害</span>
                        <span className="text-orange-400">+{weapon.level * 20}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">效果</span>
                        <span className="text-cyan-400">+{weapon.level * 15}%</span>
                      </div>
                    </div>

                    {weapon.level >= data.maxLevel && data.maxBenefit && (
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                        <p className="text-yellow-400 text-sm font-bold">
                          ✨ MAX: {data.maxBenefit}
                        </p>
                      </div>
                    )}

                    {data.special && weapon.level < data.maxLevel && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                        <p className="text-yellow-400 text-xs">
                          需要 {data.maxLevel - weapon.level} 个模板解锁全部技能
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleUpgrade(weaponId)}
                      disabled={!canUpgrade}
                      className={`w-full ${
                        canUpgrade
                          ? `bg-gradient-to-r ${data.color} hover:opacity-90`
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isMaxLevel ? (
                        <>
                          <Star className="w-5 h-5 mr-2" />
                          已满级
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="w-5 h-5 mr-2" />
                          升级 (消耗1模板)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">升级说明</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-300">
              <span className="text-purple-400">• </span>
              每天挑战Boss获得模板
            </div>
            <div className="text-gray-300">
              <span className="text-purple-400">• </span>
              升级提升伤害和效果
            </div>
            <div className="text-gray-300">
              <span className="text-purple-400">• </span>
              龟龟之手需8级解锁
            </div>
            <div className="text-gray-300">
              <span className="text-purple-400">• </span>
              每次升级消耗1模板
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}