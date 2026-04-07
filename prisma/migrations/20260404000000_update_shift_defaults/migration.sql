-- Update Settings defaults to logical shift times (07:15-15:23, 15:23-23:00)
UPDATE "Settings" SET
  "firstStart"  = '07:15',
  "firstEnd"    = '15:23',
  "secondStart" = '15:23',
  "secondEnd"   = '23:00'
WHERE id = 1;
