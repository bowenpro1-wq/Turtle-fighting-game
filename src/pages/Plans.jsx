import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Plans() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('generating');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('silver') !== null ? 'silver' : params.get('gold') !== null ? 'gold' : null;

    if (!plan) {
      window.location.href = 'https://youtube.com/@bowenliu-v2b';
      return;
    }

    generateKey(plan);
  }, []);

  const generateKey = async (planType) => {
    try {
      setTimeout(async () => {
        const keyLength = planType === 'silver' ? 8 : 20;
        const key = Array.from({ length: keyLength }, () => 
          Math.random().toString(36).substr(2, 1).toUpperCase()
        ).join('');

        const promoCode = `PROMO${Date.now().toString(36).toUpperCase()}`;
        const goldAmount = planType === 'silver' ? 10000 : 150000;

        await base44.entities.GoldPlanKey.create({
          key: key,
          plan_type: planType,
          promo_code: promoCode,
          gold_amount: goldAmount,
          used: false
        });

        const keyUrl = `${window.location.origin}${createPageUrl('Key')}?=${key}`;
        window.location.href = keyUrl;
      }, 10);
    } catch (error) {
      console.error('Key generation error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-xl">正在生成密钥...</p>
        {status === 'error' && (
          <p className="text-red-400 mt-4">生成失败，请重试</p>
        )}
      </div>
    </div>
  );
}