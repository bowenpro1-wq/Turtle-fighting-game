import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SocialButtons() {
  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      <Button
        onClick={() => window.location.href = createPageUrl('ChatRooms')}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        公共聊天室
      </Button>
      <Button
        onClick={() => window.location.href = createPageUrl('Friends')}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
      >
        <Users className="w-4 h-4 mr-2" />
        添加好友
      </Button>
    </div>
  );
}