-- Create IP blacklist table
CREATE TABLE IF NOT EXISTS ip_blacklist (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(50) NOT NULL UNIQUE,
    reason VARCHAR(255) NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts_count INTEGER DEFAULT 1
);

CREATE INDEX idx_ip_blacklist_ip ON ip_blacklist(ip_address);