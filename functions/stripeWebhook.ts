import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    const base44 = createClientFromRequest(req);
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const goldAmount = parseInt(session.metadata.gold_amount);
      const amountPaid = (session.amount_total / 100).toFixed(2);
      const customerEmail = session.customer_details?.email;
      
      console.log(`Payment successful! Gold awarded: ${goldAmount}`);

      if (customerEmail) {
        try {
          const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
          
          const emailContent = `From: Turtle Adventure Island <me>
To: ${customerEmail}
Subject: 购买成功 - ${goldAmount.toLocaleString()} 金币
Content-Type: text/html; charset=utf-8

<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #f59e0b, #d97706); padding: 30px; border-radius: 10px; text-align: center;">
    <h1 style="color: white; margin: 0;">🎮 龟龟冒险岛</h1>
    <p style="color: white; margin: 10px 0 0 0;">Turtle Adventure Island</p>
  </div>
  
  <div style="background: #f3f4f6; padding: 30px; margin-top: 20px; border-radius: 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">购买成功！</h2>
    <p style="color: #4b5563;">感谢您的购买！您的金币已添加到账户。</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>购买项目:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">💰 ${goldAmount.toLocaleString()} 金币</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>支付金额:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">$${amountPaid} USD</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>交易时间:</strong></td>
          <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleString('zh-CN')}</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">金币已自动添加到您的游戏账户。刷新游戏页面即可看到更新后的余额。</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>此为自动发送的收据邮件，请勿回复</p>
    <p>支付由 Stripe 安全处理</p>
  </div>
</body>
</html>`;

          const encodedMessage = btoa(unescape(encodeURIComponent(emailContent)));
          
          await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              raw: encodedMessage
            })
          });
          
          console.log(`Receipt email sent to ${customerEmail}`);
        } catch (emailError) {
          console.error('Failed to send receipt email:', emailError);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});