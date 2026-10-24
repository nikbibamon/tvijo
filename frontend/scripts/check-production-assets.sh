#!/bin/bash
# scripts/check-production-assets.sh
# Диагностика 400 ошибок на Next.js чанках

set -e

DOMAIN="${1:-https://tvijo.com}"
TEMP_DIR=$(mktemp -d)

echo "=== Диагностика Next.js чанков: $DOMAIN ==="
echo ""

# 1. Получаем HTML главной страницы
echo "1. Проверяем HTML главной страницы..."
curl -s "$DOMAIN/en" -o "$TEMP_DIR/page.html"

# 2. Извлекаем URL чанков из HTML
webpack_url=$(grep -oE '/_next/static/chunks/webpack-[a-z0-9]+\.js' "$TEMP_DIR/page.html" | head -1)
echo "   Найден webpack чанк: $webpack_url"

# 3. Проверяем доступность webpack чанка
echo ""
echo "2. Проверяем доступность webpack чанка..."
status=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$webpack_url")
echo "   URL: $DOMAIN$webpack_url"
echo "   HTTP Status: $status"

if [ "$status" = "200" ]; then
    echo "   ✅ Чанк доступен"
else
    echo "   ❌ Чанк недоступен (HTTP $status)"
fi

# 4. Проверяем несколько других чанков
echo ""
echo "3. Проверяем другие чанки..."
for chunk in "/_next/static/chunks/main-app-88b1c24bbf7dc96a.js" "/_next/static/chunks/framework-e0a13d709f80c095.js"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$chunk")
    if [ "$status" = "200" ]; then
        echo "   ✅ $chunk — HTTP $status"
    else
        echo "   ❌ $chunk — HTTP $status"
    fi
done

# 5. Проверяем Content-Type
echo ""
echo "4. Проверяем Content-Type для webpack чанка..."
content_type=$(curl -sI "$DOMAIN$webpack_url" | grep -i "content-type" | head -1 | tr -d '\r')
echo "   $content_type"

# 6. Проверка на числовые ID (старый билд)
echo ""
echo "5. Проверка на числовые chunk ID (должны быть именованные)..."
numeric_count=$(grep -oE '/_next/static/chunks/[0-9]+-[a-z0-9]+\.js' "$TEMP_DIR/page.html" | wc -l)
if [ "$numeric_count" -gt 0 ]; then
    echo "   ⚠️  Найдено $numeric_count числовых чанков (старый билд?)"
    echo "   Примеры:"
    grep -oE '/_next/static/chunks/[0-9]+-[a-z0-9]+\.js' "$TEMP_DIR/page.html" | head -3
else
    echo "   ✅ Числовые чанки не найдены (именованные чанки — правильно)"
fi

# 7. Локальная проверка .next/static/chunks
echo ""
echo "6. Локальная проверка .next/static/chunks/..."
if [ -d ".next/static/chunks" ]; then
    numeric_local=$(find .next/static/chunks -name "[0-9]*.js" -type f 2>/dev/null | wc -l)
    if [ "$numeric_local" -gt 0 ]; then
        echo "   ⚠️  В локальном билде $numeric_local числовых чанков"
        echo "   Нужен: rm -rf .next && npm run build"
    else
        echo "   ✅ Локальный билд с именованными чанками"
    fi
else
    echo "   ❌ .next/static/chunks не найден — нужен npm run build"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "=== Рекомендации ==="
if [ "$status" != "200" ]; then
    echo "1. Очистить кэш Cloudflare: Purge Cache → Purge Everything"
    echo "2. Пересобрать фронтенд: rm -rf .next && npm run build"
    echo "3. Перезапустить PM2: pm2 restart tvijo-web"
    echo "4. Если используется ModSecurity — добавить исключение для /_next/static/"
fi
