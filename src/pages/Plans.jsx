import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Plans() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('generating');
  const [goldAmount, setGoldAmount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('silver') !== null ? 'silver' : params.get('gold') !== null ? 'gold' : null;

    if (!plan) {
      return;
    }

    generateAndGiveCredits(plan);
  }, []);

  const generateAndGiveCredits = async (planType) => {
    try {
      console.log('Starting generation for plan:', planType);
      
      // Wait 1 second before generating
      await new Promise(resolve => setTimeout(resolve, 1000));

      const keyLength = planType === 'silver' ? 8 : 20;
      const key = Array.from({ length: keyLength }, () => 
        Math.random().toString(36).substr(2, 1).toUpperCase()
      ).join('');

      console.log('Generated key:', key);

      const promoCode = `PROMO${Date.now().toString(36).toUpperCase()}`;
      const goldAmount = planType === 'silver' ? 10000 : 150000;

      console.log('Creating database entry...');
      const created = await base44.entities.GoldPlanKey.create({
        key: key,
        plan_type: planType,
        promo_code: promoCode,
        gold_amount: goldAmount,
        used: false
      });
      console.log('Created:', created);

      console.log('Navigating to Key page with key:', key);
      navigate(`${createPageUrl('Key')}?=${key}`);
    } catch (error) {
      console.error('Credit generation error:', error);
      alert('Error: ' + error.message);
      setStatus('error');
    }
  };

  if (status === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">正在处理...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-amber-900 to-orange-900 p-4 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border-4 border-yellow-400 text-center">
          <Check className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">成功！</h1>
          <div className="bg-green-600/20 border-2 border-green-400 rounded-lg p-6 mb-6">
            <p className="text-green-200 text-2xl font-bold">
              💰 +{goldAmount.toLocaleString()} 金币
            </p>
          </div>
          <p className="text-white mb-6">金币已自动添加到您的账户</p>
          <Link to={createPageUrl('Game')}>
            <Button className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg font-bold">
              返回游戏
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black p-4 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border-4 border-red-400 text-center">
          <p className="text-red-400 text-xl mb-6">处理失败，请重试</p>
          <Link to={createPageUrl('Game')}>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              返回游戏
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}