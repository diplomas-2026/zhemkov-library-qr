UPDATE reports
SET type = CASE id
    WHEN 1 THEN 'FUND_MOVEMENT'
    WHEN 2 THEN 'ISSUES_BY_PERIOD'
    ELSE type
END
WHERE id IN (1, 2);

UPDATE book_copies
SET status = CASE id
    WHEN 17 THEN 'LOST'
    WHEN 18 THEN 'WRITTEN_OFF'
    ELSE status
END
WHERE id IN (17, 18);

