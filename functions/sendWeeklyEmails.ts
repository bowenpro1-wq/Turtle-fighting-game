import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all active subscribers
    const subscribers = await base44.asServiceRole.entities.EmailSubscription.filter({
      subscribed: true
    });

    if (!subscribers || subscribers.length === 0) {
      return Response.json({ message: 'No subscribers found', sent: 0 });
    }

    console.log(`Found ${subscribers.length} subscribers`);

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
    
    const gameUpdates = [
      '🎮 本周新增了3个全新小游戏！',
      '⚔️ Boss试炼模式新增两位强力Boss',
      '🏆 完成每日任务可获得双倍金币',
      '🔨 锻造系统升级，武器强化更容易',
      '🌟 新增成就系统，完成挑战获得奖励'
    ];

    const tips = [
      '💡 提示：使用飞行技能可以躲避大部分Boss攻击',
      '💡 提示：升级护甲可以大幅提升生存能力',
      '💡 提示：暴击和吸血属性是后期最强组合',
      '💡 提示：每周完成小游戏可获得大量金币'
    ];

    const randomUpdate = gameUpdates[Math.floor(Math.random() * gameUpdates.length)];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    let sentCount = 0;
    
    for (const subscriber of subscribers) {
      try {
        const emailContent = `From: Turtle Adventure Island <me>
To: ${subscriber.email}
Subject: 🐢 龟龟冒险岛 - 本周游戏更新
Content-Type: text/html; charset=utf-8

<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
  <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 30px; border-radius: 15px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 36px;">🐢 龟龟冒险岛</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">本周游戏更新</p>
  </div>
  
  <div style="background: white; padding: 30px; margin-top: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">📢 本周亮点</h2>
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
      <p style="color: #92400e; margin: 0; font-size: 18px; font-weight: bold;">${randomUpdate}</p>
    </div>
    
    <h2 style="color: #1f2937; margin-top: 30px; font-size: 24px;">🎯 游戏提示</h2>
    <div style="background: #e0f2fe; padding: 20px; border-radius: 10px; border-left: 4px solid #0ea5e9;">
      <p style="color: #075985; margin: 0; font-size: 16px;">${randomTip}</p>
    </div>
    
    <h2 style="color: #1f2937; margin-top: 30px; font-size: 24px;">🎁 本周小游戏</h2>
    <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 20px; border-radius: 10px;">
      <p style="color: #5b21b6; margin: 0; font-size: 16px; line-height: 1.6;">
        <strong>新游戏已解锁！</strong><br>
        访问小游戏中心，完成挑战获得丰厚奖励。每周都有全新内容等你来玩！
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://turtle.base44.app" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 18px;">
        🎮 立即开始游戏
      </a>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>感谢您订阅龟龟冒险岛更新！</p>
    <p style="margin-top: 10px;">不想再收到邮件？回复 "退订" 即可</p>
  </div>
</body>
</html>`;

        const encodedMessage = btoa(unescape(encodeURIComponent(emailContent)));
        
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage
          })
        });

        if (response.ok) {
          sentCount++;
          // Update last email sent timestamp
          await base44.asServiceRole.entities.EmailSubscription.update(subscriber.id, {
            last_email_sent: new Date().toISOString()
          });
          console.log(`Email sent to ${subscriber.email}`);
        } else {
          console.error(`Failed to send to ${subscriber.email}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (emailError) {
        console.error(`Error sending to ${subscriber.email}:`, emailError);
      }
    }

    return Response.json({ 
      message: 'Weekly emails sent',
      sent: sentCount,
      total: subscribers.length
    });
    
  } catch (error) {
    console.error('Weekly email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});