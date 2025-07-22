-- Cultural AI Concierge Database Schema
-- Zero-PII compliant schema for storing taste preferences and session data

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (hashed session IDs only)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_hash VARCHAR(64) UNIQUE NOT NULL, -- Hashed session identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences_count INTEGER DEFAULT 0
);

-- Taste entities (anonymized cultural preferences)
CREATE TABLE taste_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'film', 'cuisine', 'destination', etc.
    entity_id VARCHAR(100) NOT NULL, -- anonymized identifier
    category VARCHAR(50) NOT NULL, -- 'entertainment', 'food', 'travel'
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation interactions (for improving suggestions)
CREATE TABLE recommendation_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'dislike', 'share', 'save'
    recommendation_data JSONB, -- anonymized recommendation details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation context (temporary, for session continuity)
CREATE TABLE conversation_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    context_data JSONB NOT NULL, -- anonymized conversation state
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics (privacy-safe metrics)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    session_hash VARCHAR(64), -- Optional, for session-based analytics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_hash ON sessions(session_hash);
CREATE INDEX idx_taste_entities_session ON taste_entities(session_id);
CREATE INDEX idx_taste_entities_type ON taste_entities(entity_type);
CREATE INDEX idx_recommendation_interactions_session ON recommendation_interactions(session_id);
CREATE INDEX idx_conversation_context_session ON conversation_context(session_id);
CREATE INDEX idx_conversation_context_expires ON conversation_context(expires_at);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Remove expired conversation context
    DELETE FROM conversation_context WHERE expires_at < NOW();
    
    -- Remove old sessions (older than 30 days with no activity)
    DELETE FROM sessions WHERE last_active < NOW() - INTERVAL '30 days';
    
    -- Remove old analytics events (older than 90 days)
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');
