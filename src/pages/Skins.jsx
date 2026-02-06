import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Check, Coins, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

const PLAYER_SKINS = [
  { id: 'default', name: '默认绿龟', color: '#22c55e', price: 0, unlocked: true, bonus: null },
  { id: 'gold', name: '黄金神龟', color: '#fbbf24', price: 5000, unlocked: false, bonus: '+5% 金币获取' },
  { id: 'crystal', name: '水晶圣龟', color: '#06b6d4', price: 8000, unlocked: false, bonus: '+10% 生命值' },
  { id: 'shadow', name: '暗影忍龟', color: '#6b7280', price: 10000, unlocked: false, bonus: '+5% 闪避' },
  { id: 'flame', name: '烈焰战龟', color: '#ef4444', price: 12000, unlocked: false, bonus: '+10% 伤害' },
  { id: 'rainbow', name: '彩虹传说龟', color: 'linear-gradient(45deg, #f43f5e, #a855f7, #3b82f6)', price: 20000, unlocked: false, bonus: '+5% 全属性' },
  { id: 'achievement_1', name: '英雄之龟', color: '#8b5cf6', price: 0, unlocked: false, requirement: '击败10个Boss', bonus: '+8% 攻速' },
  { id: 'achievement_2', name: '传奇龟王', color: '#ec4899', price: 0, unlocked: false, requirement: '通关20次', bonus: '+15% 经验' }
];

const WEAPON_SKINS = [
  { id: 'default', name: '标准武器', color: '#fbbf24', price: 0, unlocked: true, bonus: null },
  { id: 'laser_red', name: '红色激光', color: '#ef4444', price: 3000, unlocked: false, bonus: '+3% 暴击' },
  { id: 'laser_blue', name: '蓝色激光', color: '#3b82f6', price: 3000, unlocked: false, bonus: '+5% 穿透' },
  { id: 'plasma', name: '等离子炮', color: '#a855f7', price: 6000, unlocked: false, bonus: '+8% 伤害' },
  { id: 'holy', name: '神圣光束', color: '#fef08a', price: 10000, unlocked: false, bonus: '+10% 治疗效果' }
];

export default function SkinsPage() {
  const [playerSkins, setPlayerSkins] = useState([]);
  const [weaponSkins, setWeaponSkins] = useState([]);
  const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('gameCoins') || '0'));
  const [activeTab, setActiveTab] = useState('player');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadSkins();
  }, []);

  const loadSkins = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user.email);

      const userSkins = await base44.entities.Skin.filter({ user_email: user.email });
      
      // Initialize player skins
      const playerSkinsData = PLAYER_SKINS.map(skin => {
        const userSkin = userSkins.find(s => s.skin_id === skin.id && s.skin_type === 'player');
        return {
          ...skin,
          unlocked: skin.id === 'default' || (userSkin?.unlocked || false),
          equipped: userSkin?.equipped || (skin.id === 'default' && !userSkins.some(s => s.skin_type === 'player' && s.equipped)),
          dbId: userSkin?.id
        };
      });

      // Initialize weapon skins
      const weaponSkinsData = WEAPON_SKINS.map(skin => {
        const userSkin = userSkins.find(s => s.skin_id === skin.id && s.skin_type === 'weapon');
        return {
          ...skin,
          unlocked: skin.id === 'default' || (userSkin?.unlocked || false),
          equipped: userSkin?.equipped || (skin.id === 'default' && !userSkins.some(s => s.skin_type === 'weapon' && s.equipped)),
          dbId: userSkin?.id
        };
      });

      setPlayerSkins(playerSkinsData);
      setWeaponSkins(weaponSkinsData);
    } catch (error) {
      console.error('Failed to load skins:', error);
    }
    setLoading(false);
  };

  const purchaseSkin = async (skin, type) => {
    if (coins < skin.price) {
      alert('金币不足！');
      return;
    }

    try {
      const newCoins = coins - skin.price;
      setCoins(newCoins);
      localStorage.setItem('gameCoins', newCoins.toString());

      await base44.entities.Skin.create({
        user_email: currentUser,
        skin_id: skin.id,
        skin_type: type,
        unlocked: true,
        equipped: false
      });

      await loadSkins();
      alert(`成功解锁 ${skin.name}！`);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('购买失败，请重试');
    }
  };

  const equipSkin = async (skin, type) => {
    try {
      const skins = type === 'player' ? playerSkins : weaponSkins;
      
      // Unequip all skins of this type
      for (const s of skins) {
        if (s.equipped && s.dbId) {
          await base44.entities.Skin.update(s.dbId, { equipped: false });
        }
      }

      // Equip selected skin or create if doesn't exist
      if (skin.dbId) {
        await base44.entities.Skin.update(skin.dbId, { equipped: true });
      } else {
        await base44.entities.Skin.create({
          user_email: currentUser,
          skin_id: skin.id,
          skin_type: type,
          unlocked: true,
          equipped: true
        });
      }

      await loadSkins();
      alert(`已装备 ${skin.name}！`);
    } catch (error) {
      console.error('Equip failed:', error);
      alert('装备失败，请重试');
    }
  };

  const renderSkinCard = (skin, type) => (
    <motion.div
      key={skin.id}
      whileHover={{ scale: 1.05 }}
      className={`bg-slate-800 rounded-xl p-4 border-2 ${
        skin.equipped ? 'border-yellow-400' : 'border-slate-700'
      } relative`}
    >
      {skin.equipped && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Check className="w-3 h-3" /> 已装备
        </div>
      )}

      <div
        className="w-full h-32 rounded-lg mb-3 flex items-center justify-center text-6xl"
        style={{
          background: skin.color.includes('gradient') ? skin.color : skin.color,
          backgroundColor: !skin.color.includes('gradient') ? skin.color : undefined
        }}
      >
        🐢
      </div>

      <h3 className="text-white font-bold mb-1">{skin.name}</h3>
      {skin.bonus && (
        <p className="text-green-400 text-xs mb-2">✨ {skin.bonus}</p>
      )}
      {skin.requirement && (
        <p className="text-cyan-400 text-xs mb-2">🏆 {skin.requirement}</p>
      )}

      {!skin.unlocked ? (
        <Button
          onClick={() => purchaseSkin(skin, type)}
          disabled={skin.price > 0 && coins < skin.price}
          className="w-full bg-yellow-600 hover:bg-yellow-700 mt-2"
        >
          {skin.price === 0 ? (
            <><Lock className="w-4 h-4 mr-1" /> 未解锁</>
          ) : (
            <><Coins className="w-4 h-4 mr-1" /> {skin.price}</>
          )}
        </Button>
      ) : skin.equipped ? (
        <Button disabled className="w-full bg-green-600 mt-2">
          <Check className="w-4 h-4 mr-1" /> 已装备
        </Button>
      ) : (
        <Button
          onClick={() => equipSkin(skin, type)}
          className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
        >
          装备
        </Button>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={createPageUrl('Game')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-yellow-400">{coins}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          皮肤商店
        </h1>
        <p className="text-center text-gray-400 mb-6">自定义你的角色和武器外观！</p>

        <div className="flex gap-2 mb-6 justify-center">
          <Button
            onClick={() => setActiveTab('player')}
            variant={activeTab === 'player' ? 'default' : 'outline'}
            className={activeTab === 'player' ? 'bg-purple-600' : ''}
          >
            角色皮肤
          </Button>
          <Button
            onClick={() => setActiveTab('weapon')}
            variant={activeTab === 'weapon' ? 'default' : 'outline'}
            className={activeTab === 'weapon' ? 'bg-purple-600' : ''}
          >
            武器皮肤
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeTab === 'player' && playerSkins.map(skin => renderSkinCard(skin, 'player'))}
          {activeTab === 'weapon' && weaponSkins.map(skin => renderSkinCard(skin, 'weapon'))}
        </div>
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