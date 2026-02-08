import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Key() {
  const [keyData, setKeyData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keys = Array.from(params.keys());
    const keyParam = keys.find(k => k.startsWith('='));
    
    if (!keyParam) {
      window.location.href = 'https://youtube.com/@bowenliu-v2b';
      return;
    }

    const key = keyParam.substring(1);
    validateKey(key);
  }, []);

  const validateKey = async (key) => {
    try {
      const results = await base44.entities.GoldPlanKey.filter({ key: key });
      
      if (results.length === 0 || results[0].used) {
        window.location.href = 'https://youtube.com/@bowenliu-v2b';
        return;
      }

      setKeyData(results[0]);
      setLoading(false);
    } catch (error) {
      console.error('Key validation error:', error);
      window.location.href = 'https://youtube.com/@bowenliu-v2b';
    }
  };

  const copyPromoCode = () => {
    if (keyData) {
      navigator.clipboard.writeText(keyData.promo_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">验证中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-amber-900 to-orange-900 p-4 flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border-4 border-yellow-400">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">恭喜！</h1>
          <p className="text-white">您已成功购买金币方案</p>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6">
          <p className="text-white text-sm mb-2">您的兑换码：</p>
          <div className="bg-black/40 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-2xl font-mono font-bold text-center break-all">
              {keyData?.promo_code}
            </p>
          </div>
          <Button
            onClick={copyPromoCode}
            className="w-full bg-white/20 hover:bg-white/30 text-white"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                复制兑换码
              </>
            )}
          </Button>
        </div>

        <div className="bg-green-600/20 border-2 border-green-400 rounded-lg p-4 mb-6">
          <p className="text-green-200 text-center font-bold">
            💰 金币数量: {keyData?.gold_amount.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-600/20 border border-blue-400 rounded-lg p-4 mb-6">
          <p className="text-blue-200 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            请在游戏中找到"优惠码"按钮，输入兑换码领取金币
          </p>
        </div>

        <Link to={createPageUrl('Game')}>
          <Button className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg font-bold">
            返回游戏
          </Button>
        </Link>
      </div>
    </div>
  );
}