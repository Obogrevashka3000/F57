# F57 — Supabase version

Эта версия больше НЕ использует localStorage для заказов. Клиент отправляет заявку в Supabase Postgres, а админ читает общую таблицу и получает новые заявки через Realtime.

## 1. Создай Supabase project

Создай проект в Supabase и открой **SQL Editor**.

Запусти целиком файл `supabase.sql`.

## 2. Создай администратора

В Supabase открой **Authentication → Users** и создай пользователя:

- Email: тот же, что указан в `supabase-config.js`
- Password: твой секретный код администратора

Затем в SQL Editor выполни:

```sql
insert into public.admins(user_id)
select id from auth.users where email = 'f57-admin@example.com';
```

Если поменял email в `supabase-config.js`, используй его в SQL.

## 3. Подключи ключи

Открой `supabase-config.js` и замени:

```js
window.F57_SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
window.F57_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
window.F57_ADMIN_EMAIL = 'f57-admin@example.com';
```

На значения из **Project Settings → API**.

Используй только `anon/public` key. `service_role` в сайт помещать нельзя.

## 4. GitHub / Vercel

Загрузи содержимое папки `F57_free` в репозиторий GitHub и импортируй репозиторий в Vercel.

Главная страница: `index.html`.

Админка: `/admin.html`.

## Что теперь работает

- Заказ создаётся в PostgreSQL.
- Заказ виден с любого устройства.
- Администратор видит заявки других игроков.
- Новые заявки приходят в админку практически сразу через Supabase Realtime.
- Точка хранится как нормализованные координаты карты, поэтому она корректно отображается у администратора.
- RLS запрещает обычным посетителям читать заказы.
- Только пользователи из `public.admins` могут читать/обновлять заказы.
