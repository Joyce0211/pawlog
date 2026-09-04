-- =============================================
-- PawLog 宠物健康日记 - Supabase 数据库设置
-- =============================================
-- 请在 Supabase 的 SQL Editor 中运行此脚本
-- 路径：Supabase Dashboard > SQL Editor > New Query > 粘贴此脚本 > Run
-- =============================================

-- 1. 创建宠物表
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT,
  birthday DATE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建健康记录表
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  pet_id TEXT REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建支出记录表
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  pet_id TEXT REFERENCES pets(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  pet_id TEXT REFERENCES pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. 启用行级安全策略（RLS）
-- =============================================

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. 创建安全策略（允许所有操作）
-- =============================================

-- 宠物表策略
DROP POLICY IF EXISTS "允许所有操作 pets" ON pets;
CREATE POLICY "允许所有操作 pets"
ON pets FOR ALL
USING (true)
WITH CHECK (true);

-- 日志表策略
DROP POLICY IF EXISTS "允许所有操作 logs" ON logs;
CREATE POLICY "允许所有操作 logs"
ON logs FOR ALL
USING (true)
WITH CHECK (true);

-- 支出表策略
DROP POLICY IF EXISTS "允许所有操作 expenses" ON expenses;
CREATE POLICY "允许所有操作 expenses"
ON expenses FOR ALL
USING (true)
WITH CHECK (true);

-- 提醒表策略
DROP POLICY IF EXISTS "允许所有操作 reminders" ON reminders;
CREATE POLICY "允许所有操作 reminders"
ON reminders FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- 7. 创建索引（提升查询性能）
-- =============================================

CREATE INDEX IF NOT EXISTS idx_logs_pet_id ON logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(date);
CREATE INDEX IF NOT EXISTS idx_expenses_pet_id ON expenses(pet_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_reminders_pet_id ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);

-- =============================================
-- 8. 启用实时订阅（可选，用于多设备实时同步）
-- =============================================

-- 注意：如果不需要实时同步功能，可以注释掉以下行
ALTER PUBLICATION supabase_realtime ADD TABLE pets;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE reminders;

-- =============================================
-- 设置完成！
-- =============================================

-- 验证表是否创建成功
SELECT
  table_name,
  table_type
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
ORDER BY
  table_name;
