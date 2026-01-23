from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings
import requests
import logging
from .models import Order
from .services import ProductionAssignmentService

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Order)
def order_pre_save(sender, instance, **kwargs):
    """
    Store the old status on the instance to check for changes in post_save.
    """
    if instance.pk:
        try:
            old_order = Order.objects.get(pk=instance.pk)
            instance._old_status = old_order.status
        except Order.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    """
    1. Trigger auto-assignment if status -> 'in_production'.
    2. Send Telegram notification if status changed.
    """
    # 1. Auto-assignment
    if instance.status == 'in_production':
        ProductionAssignmentService.auto_assign_production_steps(instance)
    
    # 2. Telegram Notification
    old_status = getattr(instance, '_old_status', None)
    if old_status and old_status != instance.status:
        send_telegram_notification(instance)

def send_telegram_notification(order):
    """
    Sends a message to the client's Telegram ID if available.
    Using synchronous requests for simplicity in signal.
    """
    if not order.client or not order.client.telegram_id:
        return
        
    token = settings.TELEGRAM_BOT_TOKEN
    if not token or token == 'YOUR_BOT_TOKEN_HERE':
        return

    # Status translation
    status_labels = dict(Order.STATUS_CHOICES)
    status_text = status_labels.get(order.status, order.status)
    
    from django.utils import timezone
    current_time = timezone.now().strftime('%d.%m.%Y %H:%M')
    
    message = (
        f"📦 <b>Buyurtma holati o'zgardi!</b>\n\n"
        f"🆔 Buyurtma: #{order.order_number}\n"
        f"📊 Yangi holat: <b>{status_text}</b>\n"
        f"📅 Sana: {current_time}\n\n"
        f"<i>Batafsil ma'lumot uchun menejerga murojaat qiling.</i>"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": order.client.telegram_id,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code != 200:
            logger.error(f"Telegram notification failed: {response.text}")
    except Exception as e:
        logger.error(f"Telegram notification error: {e}")
