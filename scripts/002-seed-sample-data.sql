-- Seed sample data for Cultural AI Concierge
-- This creates anonymized sample data for testing and demonstration

-- Insert sample sessions
INSERT INTO sessions (session_hash, preferences_count) VALUES
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 3),
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1', 4),
('c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2', 2);

-- Get session IDs for reference
DO $$
DECLARE
    session1_id UUID;
    session2_id UUID;
    session3_id UUID;
BEGIN
    SELECT id INTO session1_id FROM sessions WHERE session_hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
    SELECT id INTO session2_id FROM sessions WHERE session_hash = 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1';
    SELECT id INTO session3_id FROM sessions WHERE session_hash = 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2';

    -- Insert sample taste entities
    INSERT INTO taste_entities (session_id, entity_type, entity_id, category, confidence_score) VALUES
    (session1_id, 'film', 'pulp-fiction', 'entertainment', 0.95),
    (session1_id, 'cuisine', 'japanese', 'food', 0.90),
    (session1_id, 'destination', 'tokyo', 'travel', 0.85),
    
    (session2_id, 'film', 'spirited-away', 'entertainment', 0.92),
    (session2_id, 'cuisine', 'italian', 'food', 0.88),
    (session2_id, 'destination', 'paris', 'travel', 0.90),
    (session2_id, 'music', 'indie-rock', 'entertainment', 0.85),
    
    (session3_id, 'film', 'parasite', 'entertainment', 0.93),
    (session3_id, 'cuisine', 'korean', 'food', 0.91);

    -- Insert sample recommendation interactions
    INSERT INTO recommendation_interactions (session_id, recommendation_type, interaction_type, recommendation_data) VALUES
    (session1_id, 'restaurant', 'like', '{"name": "Nobu Tokyo", "type": "japanese", "match_score": 95}'),
    (session1_id, 'itinerary', 'save', '{"title": "Tokyo Cultural Experience", "duration": "2 days"}'),
    (session2_id, 'restaurant', 'like', '{"name": "Le Bernardin", "type": "french", "match_score": 88}'),
    (session3_id, 'venue', 'share', '{"name": "Dongdaemun Design Plaza", "type": "cultural", "match_score": 92}');

    -- Insert sample analytics events
    INSERT INTO analytics_events (event_type, event_data, session_hash) VALUES
    ('onboarding_completed', '{"preferences_selected": 3, "time_spent": 120}', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'),
    ('recommendation_requested', '{"type": "restaurant", "location": "tokyo"}', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'),
    ('itinerary_generated', '{"destination": "tokyo", "duration": "2_days"}', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'),
    ('voice_interaction', '{"duration": 45, "successful": true}', 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1'),
    ('share_itinerary', '{"method": "link", "destination": "paris"}', 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1');
END $$;
