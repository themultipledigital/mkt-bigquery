-- Table: level-hope-462409-a8.utils.usd_accounts
-- Dataset: utils
--
-- Reference table for accounts and channels that use USD currency
-- Used to identify which accounts/channels need EUR conversion

CREATE TABLE IF NOT EXISTS `level-hope-462409-a8.utils.usd_accounts` (
  account_id STRING,
  currency STRING,
  channel STRING
)
OPTIONS(
  description="Reference table for USD accounts and channels. Used to identify which accounts need EUR conversion."
);

-- Insert Meta account IDs that use USD
INSERT INTO `level-hope-462409-a8.utils.usd_accounts` (account_id, currency, channel)
VALUES
  ('FRM-183768', 'USD', NULL),
  ('FRM-183205', 'USD', NULL),
  ('FRM-143326', 'USD', NULL),
  ('FRM-143576', 'USD', NULL),
  ('FRM-155237', 'USD', NULL),
  ('FRM-154296', 'USD', NULL);

-- Insert TrafficJunky channel (POPS) that uses USD
INSERT INTO `level-hope-462409-a8.utils.usd_accounts` (account_id, currency, channel)
VALUES
  (NULL, 'USD', 'TrafficJunky');

