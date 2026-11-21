-- ============================================================
-- 穗学伴 · 匿名访问日志  D1 数据库表结构
-- ------------------------------------------------------------
-- 在 Cloudflare 控制台 → Workers & Pages → D1 → 你的数据库 → Console
-- 粘贴本文件全部内容并执行。
--
-- 【隐私设计】
--  1. 不采集 IP、姓名、账号等任何可识别个人身份的信息；
--  2. visitor 字段是前端随机 ID 经服务端密钥哈希后的值，无法反推；
--  3. referrer 只保留域名，不保留具体 URL 与查询参数；
--  4. 仅统计「访问次数 / 匿名访客数 / 地区 / 设备 / 使用模块」等聚合信息。
-- ============================================================

CREATE TABLE IF NOT EXISTS visits (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        INTEGER NOT NULL,               -- 毫秒时间戳
  day       TEXT    NOT NULL,               -- 日期 YYYY-MM-DD（北京时间）
  visitor   TEXT    NOT NULL,               -- 匿名访客哈希（不可逆）
  ev        TEXT    NOT NULL DEFAULT 'visit', -- 事件类型：visit / action
  path      TEXT    NOT NULL DEFAULT '',    -- 页面路径（不含敏感参数）
  grade     TEXT    NOT NULL DEFAULT '',    -- 年级
  subject   TEXT    NOT NULL DEFAULT '',    -- 学科
  volume    TEXT    NOT NULL DEFAULT '',    -- 上/下册
  module    TEXT    NOT NULL DEFAULT '',    -- 学习模块
  country   TEXT    NOT NULL DEFAULT '',    -- 国家/地区（来自 CF-IPCountry）
  device    TEXT    NOT NULL DEFAULT '',    -- mobile / desktop / tablet
  browser   TEXT    NOT NULL DEFAULT '',    -- 浏览器大类
  refhost   TEXT    NOT NULL DEFAULT '',    -- 来源域名（仅域名）
  eid       TEXT    NOT NULL DEFAULT ''     -- 事件唯一ID，用于去重
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_eid ON visits(eid);
CREATE INDEX IF NOT EXISTS idx_visits_ts ON visits(ts);
CREATE INDEX IF NOT EXISTS idx_visits_day ON visits(day);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor);
