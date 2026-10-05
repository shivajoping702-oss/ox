-- OX APP DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'hi', -- 'hi' or 'en'
    cash_in_hand DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fund_transfers (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES workers(id),
    amount DECIMAL(10,2) NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES workers(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(20), -- 'CASH' or 'UPI'
    proof_type VARCHAR(20), -- 'LIVE_CAMERA' or 'UPI_SCREENSHOT'
    image_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    timestamp_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
