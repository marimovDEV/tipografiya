#!/bin/bash

# Create 10 product templates via API
TOKEN="d07a88d1a363820b5f0ea3a8d77744d529008fbf"
API_URL="http://localhost:8000/api/product-templates/"

echo "🚀 Creating 10 Product Templates..."
echo ""

# Template 1
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Standart dori qutisi",
  "category": "medicine_box_1layer",
  "layer_count": 1,
  "default_waste_percent": 5.0,
  "description": "1 qatlamli oddiy dori qutisi, eng kop ishlatiladigan standart olcham",
  "default_width": 10.0,
  "default_height": 15.0,
  "default_depth": 3.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 2
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Katta pizza qutisi",
  "category": "pizza_box",
  "layer_count": 1,
  "default_waste_percent": 8.0,
  "description": "32 sm pizza uchun standart quti",
  "default_width": 32.0,
  "default_height": 32.0,
  "default_depth": 4.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 3
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Orta pizza qutisi",
  "category": "pizza_box",
  "layer_count": 1,
  "default_waste_percent": 7.0,
  "description": "26 sm pizza uchun quti",
  "default_width": 26.0,
  "default_height": 26.0,
  "default_depth": 3.5,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 4
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Premium quti 2 qatlam",
  "category": "box_2layer",
  "layer_count": 2,
  "default_waste_percent": 10.0,
  "description": "Yuqori sifatli 2 qatlamli gofrokarton quti",
  "default_width": 30.0,
  "default_height": 20.0,
  "default_depth": 15.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 5
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Mustahkam quti 3 qatlam",
  "category": "box_3layer",
  "layer_count": 3,
  "default_waste_percent": 12.0,
  "description": "Ogir yuklarni kotarish uchun 3 qatlamli quti",
  "default_width": 40.0,
  "default_height": 30.0,
  "default_depth": 25.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 6
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Pecheniye qutisi kichik",
  "category": "cookie_box",
  "layer_count": 1,
  "default_waste_percent": 6.0,
  "description": "250g pecheniye uchun quti",
  "default_width": 15.0,
  "default_height": 10.0,
  "default_depth": 5.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 7
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Pecheniye qutisi katta",
  "category": "cookie_box",
  "layer_count": 1,
  "default_waste_percent": 7.0,
  "description": "500g pecheniye uchun quti",
  "default_width": 20.0,
  "default_height": 15.0,
  "default_depth": 6.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 8
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Sovga sumka orta",
  "category": "gift_bag",
  "layer_count": 1,
  "default_waste_percent": 9.0,
  "description": "Orta hajmli sovga sumka dastakli",
  "default_width": 25.0,
  "default_height": 30.0,
  "default_depth": 10.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 9
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Fast food qutisi",
  "category": "food_box",
  "layer_count": 1,
  "default_waste_percent": 8.0,
  "description": "Burger va kartoshka uchun quti",
  "default_width": 18.0,
  "default_height": 18.0,
  "default_depth": 8.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

# Template 10
curl -X POST "$API_URL" -H "Content-Type: application/json" -H "Authorization: Token $TOKEN" -d '{
  "name": "Maxsus individual quti",
  "category": "custom",
  "layer_count": 2,
  "default_waste_percent": 15.0,
  "description": "Mijoz talabiga kora maxsus ishlab chiqilgan quti",
  "default_width": 25.0,
  "default_height": 25.0,
  "default_depth": 12.0,
  "is_active": true
}' -s | jq -r '"✅ Created: \(.name) (\(.category_display))"'

echo ""
echo "🎉 10 ta shablon yaratildi!"
echo "📊 Brauzerni yangilang: http://localhost:3000/templates"
