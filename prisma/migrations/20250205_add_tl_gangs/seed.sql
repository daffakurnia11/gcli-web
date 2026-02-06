-- Seed file for tl_gangs migration
-- Insert default gangs from qbx_core/shared/gangs.lua

INSERT INTO tl_gangs (name, label, off_duty_pay) VALUES
    ('none', 'No Gang', 0),
    ('sot', 'Shade Of Triads', 1),
    ('sotg', 'Shade Of Triads Guardian', 1)
ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    off_duty_pay = VALUES(off_duty_pay);

INSERT INTO tl_gang_grades (gang_name, grade, name, payment, isboss, bankauth) VALUES
    -- none (No Gang)
    ('none', 0, 'Civilian', 0, 0, 0),
    -- sot (Shade Of Triads)
    ('sot', 0, 'Member', 1000, 0, 0),
    ('sot', 1, 'Captain', 1500, 0, 0),
    ('sot', 2, 'Manager', 2000, 0, 0),
    ('sot', 3, 'Boss', 2500, 1, 1),
    -- sotg (Shade Of Triads Guardian)
    ('sotg', 0, 'Member', 1000, 0, 0),
    ('sotg', 1, 'Captain', 1500, 0, 0),
    ('sotg', 2, 'Manager', 2000, 0, 0),
    ('sotg', 3, 'Boss', 2500, 1, 1)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    payment = VALUES(payment),
    isboss = VALUES(isboss),
    bankauth = VALUES(bankauth);
