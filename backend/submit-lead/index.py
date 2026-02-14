import json
import os
import urllib.request
import urllib.parse
import psycopg2
from typing import Dict, Any

MAX_LEADS_PER_IP = 2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Отправка заявки с формы в Telegram группу
    Args: event с данными формы (firstName, lastName, email, phone, countryCode, countryName, ipAddress)
          context с request_id
    Returns: HTTP ответ с результатом отправки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    headers = event.get('headers', {})
    
    print(f"=== BACKEND VERSION 2025-12-22-20:50 ===")
    print(f"Received form data: {json.dumps(body_data, ensure_ascii=False)}")
    print(f"All headers: {json.dumps(dict(headers), ensure_ascii=False)}")
    
    first_name = body_data.get('firstName', '')
    last_name = body_data.get('lastName', '')
    email = body_data.get('email', '')
    phone = body_data.get('phone', '')
    experience = body_data.get('experience', 'Not specified')
    message = body_data.get('message', '')
    platform = body_data.get('platform', 'unknown')
    
    # Get IP from headers (case-sensitive!)
    ip_address = (
        headers.get('Ddg-Connecting-Ip') or
        headers.get('X-Real-Ip') or 
        headers.get('Cf-Connecting-Ip') or 
        headers.get('X-Forwarded-For', '').split(',')[0].strip() or
        'Unknown'
    )
    
    # Get country from Accept-Language header as fallback
    accept_language = headers.get('Accept-Language', '')
    country_code = body_data.get('countryCode', '')
    country_name = body_data.get('countryName', '')
    
    # If no country from body, try to extract from accept-language
    if not country_code and accept_language:
        # Handle both "ru" and "ru-RU" formats
        lang_part = accept_language.split(',')[0].strip()
        parts = lang_part.split('-')
        
        if len(parts) == 2:
            # Format: "th-TH" -> country code is "TH"
            country_code = parts[1].upper()
        elif len(parts) == 1:
            # Format: "ru" -> use as country code
            country_code = parts[0].upper()
        
        # Map language/country codes to full names
        country_map = {
            'TH': 'Thailand', 'RU': 'Russia', 'US': 'United States',
            'GB': 'United Kingdom', 'EN': 'United States', 'DE': 'Germany', 
            'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'JP': 'Japan', 
            'CN': 'China', 'KR': 'South Korea', 'BR': 'Brazil', 'MX': 'Mexico',
            'AR': 'Argentina', 'IN': 'India', 'AU': 'Australia', 'CA': 'Canada'
        }
        country_name = country_map.get(country_code, country_code)
    
    is_spam = body_data.get('isSpam', False)
    spam_reason = body_data.get('spamReason', '')
    honeypot = body_data.get('honeypot', '')
    
    # Check honeypot field - if filled, it's a bot
    if honeypot:
        print(f"Bot detected via honeypot field: {honeypot}")
        is_spam = True
        spam_reason = spam_reason + ', Honeypot filled' if spam_reason else 'Honeypot filled'
    
    if not all([first_name, last_name, email, phone]):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing required fields'})
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN_NEW')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID_NEW')
    
    print(f"Bot token exists: {bool(bot_token)}, Chat ID exists: {bool(chat_id)}")
    
    if not bot_token or not chat_id:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Telegram credentials not configured'})
        }
    
    # Check IP limit using database
    dsn = os.environ.get('DATABASE_URL')
    if dsn and ip_address != 'Unknown':
        try:
            conn = psycopg2.connect(dsn)
            conn.autocommit = True
            cur = conn.cursor()
            
            # Count leads from this IP
            cur.execute(
                "SELECT COUNT(*) FROM t_p37301575_site_mimic_creation.leads WHERE ip_address = '" + ip_address.replace("'", "''") + "'"
            )
            ip_count = cur.fetchone()[0]
            
            print(f"IP {ip_address} has {ip_count} leads already")
            
            if ip_count >= MAX_LEADS_PER_IP:
                cur.close()
                conn.close()
                print(f"IP limit exceeded for {ip_address}")
                return {
                    'statusCode': 429,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Too many requests from this IP address'})
                }
            
            cur.close()
            conn.close()
        except Exception as db_err:
            print(f"Database check error: {str(db_err)}")
            # Continue even if DB check fails
    
    full_name = f"{first_name} {last_name}"
    # Phone already includes country dial code from frontend
    phone_formatted = phone.lstrip('+')
    
    spam_marker = "⚠️ SPAM" if is_spam else ""
    telegram_message = f"""🚀 НОВАЯ ЗАЯВКА {spam_marker}

👤 Имя: `{first_name}`
👤 Фамилия: `{last_name}`
📧 Email: `{email}`
📱 Телефон: +`{phone_formatted}`
🌍 Страна: {country_name} ({country_code})
🌐 IP: `{ip_address}`
🌐 Platform: {platform}"""
    
    if is_spam and spam_reason:
        telegram_message += f"\n\n🚨 Причина спама: {spam_reason}"
    
    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': telegram_message,
        'parse_mode': 'Markdown'
    }).encode('utf-8')
    
    req = urllib.request.Request(telegram_url, data=data)
    
    try:
        print(f"Sending to Telegram: chat_id={chat_id}")
        with urllib.request.urlopen(req) as response:
            response_data = response.read()
            print(f"Telegram response: {response_data.decode('utf-8')}")
        
        # Save lead to database
        if dsn:
            try:
                conn = psycopg2.connect(dsn)
                conn.autocommit = True
                cur = conn.cursor()
                
                cur.execute(
                    "INSERT INTO t_p37301575_site_mimic_creation.leads (first_name, last_name, email, phone, country_code, country_name, ip_address, is_spam, spam_reason, created_at) VALUES ('" + 
                    first_name.replace("'", "''") + "', '" + 
                    last_name.replace("'", "''") + "', '" + 
                    email.replace("'", "''") + "', '" + 
                    phone.replace("'", "''") + "', '" + 
                    country_code.replace("'", "''") + "', '" + 
                    country_name.replace("'", "''") + "', '" + 
                    ip_address.replace("'", "''") + "', " + 
                    str(is_spam) + ", '" + 
                    spam_reason.replace("'", "''") + "', NOW())"
                )
                
                cur.close()
                conn.close()
                print("Lead saved to database")
            except Exception as db_err:
                print(f"Failed to save lead to DB: {str(db_err)}")
                # Don't fail the request if DB insert fails
            
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'message': 'Lead submitted successfully'})
        }
    except Exception as e:
        print(f"Telegram error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to send message: {str(e)}'})
        }